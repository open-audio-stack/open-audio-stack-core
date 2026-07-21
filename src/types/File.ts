import { Architecture } from './Architecture.js';
import { FileType } from './FileType.js';
import { System } from './System.js';

export interface FileInterface {
  architectures: Architecture[];
  // Whether this exact file (identified by its sha256) has a GitHub Artifact Attestation
  // linking it back to the CI run/commit that built it. Computed once at import time (the
  // hash/url/release this is tied to never changes for a published version), not recomputed
  // on every build - see registry/src/fetch.ts.
  attested?: boolean;
  // Cumulative download count for this exact file, sourced from the GitHub Releases API.
  // Recomputed at registry build time (unlike attested, this changes continuously) - see
  // registry/src/downloads.ts. Not authored/committed metadata.
  downloads?: number;
  open?: string;
  sha256: string;
  size: number;
  systems: System[];
  type: FileType;
  url: string;
}
