import { execFileSync } from 'child_process';
import { mkdirSync } from 'fs';
import os from 'os';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import sudoPrompt from '@vscode/sudo-prompt';
import { ZodIssueCode, ZodParsedType, ZodIssue } from 'zod';
import { PluginFile } from '../types/Plugin.js';
import { PresetFile } from '../types/Preset.js';
import { ProjectFile } from '../types/Project.js';
import { log } from './utils.js';
import { dirRead, fileHash, fileSize } from './fs.js';

// Privileged installer execution (fileInstall) and the admin-elevation bridge (runCliAsAdmin) -
// the two concerns that actually need to run something with elevated permissions, as opposed to
// fs.ts's unprivileged file operations.

export function isAdmin(): boolean {
  if (process.platform === 'win32') {
    try {
      execFileSync('net', ['session'], { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  } else {
    return process && process.getuid ? process.getuid() === 0 : false;
  }
}

// Mounts to an explicit, freshly created mountpoint (rather than scanning /Volumes for
// whatever showed up) so a concurrently mounted, unrelated disk image can't be picked up
// instead, and so we know exactly what to detach afterwards.
function installDmg(filePath: string) {
  const mountPoint = path.join(os.tmpdir(), `oas-dmg-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(mountPoint, { recursive: true });
  try {
    log('⎋', `hdiutil attach -nobrowse -mountpoint "${mountPoint}" "${filePath}"`);
    execFileSync('hdiutil', ['attach', '-nobrowse', '-mountpoint', mountPoint, filePath]);
    const pkgs = dirRead(path.join(mountPoint, '**', '*.pkg'));
    if (pkgs.length === 0) throw new Error(`No .pkg found inside ${filePath}`);
    log('⎋', `sudo installer -pkg "${pkgs[0]}" -target /`);
    return execFileSync('sudo', ['installer', '-pkg', pkgs[0], '-target', '/'], { stdio: 'inherit' });
  } finally {
    try {
      execFileSync('hdiutil', ['detach', mountPoint, '-force']);
    } catch {
      /* best-effort unmount */
    }
  }
}

// Every branch below uses execFileSync (no shell) rather than building a command string for
// execSync. This is the actual fix, not just a hardening pass: file paths here are derived
// from community-submitted registry metadata (file.url), so a shell string built via template
// literal is a command injection vector regardless of how strictly the url is validated
// upstream - execFileSync passes each argument as its own argv entry, so shell metacharacters
// in filePath (`$(...)`, backticks, `;`, `|`, `&&`, ...) can never be interpreted.
export function fileInstall(filePath: string) {
  if (process.env.CI) return Buffer.from('');
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.dmg':
      return installDmg(filePath);
    case '.pkg':
      log('⎋', `sudo installer -pkg "${filePath}" -target /`);
      return execFileSync('sudo', ['installer', '-pkg', filePath, '-target', '/'], { stdio: 'inherit' });
    case '.deb':
      log('⎋', `sudo dpkg -i "${filePath}" || sudo apt-get install -f -y`);
      try {
        return execFileSync('sudo', ['dpkg', '-i', filePath], { stdio: 'inherit' });
      } catch {
        return execFileSync('sudo', ['apt-get', 'install', '-f', '-y'], { stdio: 'inherit' });
      }
    case '.rpm':
      log(
        '⎋',
        `sudo rpm -i --nodigest --nofiledigest --nosignature --force "${filePath}" || sudo dnf install -y "${filePath}" || sudo yum install -y "${filePath}"`,
      );
      try {
        return execFileSync(
          'sudo',
          ['rpm', '-i', '--nodigest', '--nofiledigest', '--nosignature', '--force', filePath],
          { stdio: 'inherit' },
        );
      } catch {
        try {
          return execFileSync('sudo', ['dnf', 'install', '-y', filePath], { stdio: 'inherit' });
        } catch {
          return execFileSync('sudo', ['yum', 'install', '-y', filePath], { stdio: 'inherit' });
        }
      }
    case '.exe':
      // Run the downloaded installer directly - no shell/`start` wrapper needed at all.
      log('⎋', `"${filePath}" /quiet /norestart`);
      return execFileSync(filePath, ['/quiet', '/norestart'], { stdio: 'inherit' });
    case '.msi':
      log('⎋', `msiexec /i "${filePath}" /quiet /norestart`);
      return execFileSync('msiexec', ['/i', filePath, '/quiet', '/norestart'], { stdio: 'inherit' });
    default:
      throw new Error(`Unsupported file format: ${ext}`);
  }
}

export async function fileValidateMetadata(filePath: string, fileMetadata: PluginFile | PresetFile | ProjectFile) {
  const errors: ZodIssue[] = [];
  const hash = await fileHash(filePath);
  if (fileMetadata.sha256 !== hash) {
    errors.push({
      code: ZodIssueCode.invalid_type,
      expected: fileMetadata.sha256 as ZodParsedType,
      message: 'Required',
      path: ['sha256'],
      received: hash as ZodParsedType,
    });
  }
  if (fileMetadata.size !== fileSize(filePath)) {
    errors.push({
      code: ZodIssueCode.invalid_type,
      expected: String(fileMetadata.size) as ZodParsedType,
      message: 'Required',
      path: ['size'],
      received: String(fileSize(filePath)) as ZodParsedType,
    });
  }
  return errors;
}

export interface AdminPayload {
  appDir: string;
  operation: string;
  type: string;
  id: string;
  version?: string;
  log?: boolean;
}

// sudo-prompt's exec() only accepts a single command string run through a shell - there is no
// argv-array form to escape into. `appDir`/`id`/`version` ultimately come from registry
// metadata or local project files, so building `--flag "${value}"` text here would be the same
// command-injection surface as fileInstall. Instead, base64url-encode the dynamic payload: its
// alphabet is only [A-Za-z0-9_-], so whatever the payload contains, the shell only ever sees
// characters that can't be interpreted as shell syntax.
export function runCliAsAdmin(payload: AdminPayload): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const filename: string = fileURLToPath(import.meta.url).replace('src/', 'build/');
    const dirPathClean: string = dirname(filename).replace('app.asar', 'app.asar.unpacked');
    const script: string = path.join(dirPathClean, 'admin.js');
    const encodedPayload: string = Buffer.from(JSON.stringify(payload)).toString('base64url');

    log(`Running as admin: node "${script}" --payload <encoded>`);

    const cmd = `node ${JSON.stringify(script)} --payload ${encodedPayload}`;

    sudoPrompt.exec(
      cmd,
      { name: 'Open Audio Stack' },
      (error?: Error | undefined, stdout?: string | Buffer | undefined, stderr?: string | Buffer | undefined) => {
        // Convert stdout/stderr buffers to strings for inspection
        const stdoutStr = stdout ? (typeof stdout === 'string' ? stdout : stdout.toString()) : '';
        const stderrStr = stderr ? (typeof stderr === 'string' ? stderr : stderr.toString()) : '';

        const out = stdoutStr + stderrStr;
        log(out);

        // Try to parse structured JSON output from the admin script first.
        // Admin script outputs JSON on its own line after a newline, so look for the last JSON object.
        const lines = out.split('\n');
        let jsonPayload = null;
        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i].trim();
          if (!line) continue; // Skip empty lines
          try {
            jsonPayload = JSON.parse(line);
            break; // Found valid JSON, stop searching backwards
          } catch {
            // This line is not JSON, continue searching
          }
        }

        // If we found JSON output from admin script, prioritize it over sudoPrompt error
        if (jsonPayload) {
          if (jsonPayload && (jsonPayload.status === 'ok' || jsonPayload.code === 0)) {
            return resolve();
          }
          const errMsg = jsonPayload && jsonPayload.message ? jsonPayload.message : JSON.stringify(jsonPayload);
          return reject(new Error(`runCliAsAdmin: admin command reported error: ${errMsg}`));
        }

        // If no JSON found, check for sudoPrompt error
        if (error) {
          const msg = `runCliAsAdmin: admin command failed: ${error && error.message ? error.message : String(error)}${
            stderrStr ? `\nstderr: ${stderrStr}` : ''
          }`;
          const err: any = new Error(msg);
          err.code = (error as any) && (error as any).code ? (error as any).code : undefined;
          return reject(err);
        }

        return reject(
          new Error(
            `runCliAsAdmin: admin command did not report completion. stdout: ${stdoutStr} stderr: ${stderrStr}`,
          ),
        );
      },
    );
  });
}
