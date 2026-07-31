import { vi } from 'vitest';
import * as apiHelpers from '../src/helpers/api.js';
import { RegistryInterface } from '../src/types/Registry.js';

// Deep-clones `value`, dropping any key in `keys` at any depth. Used to compare fixtures against
// real results while excluding fields that are inherently non-reproducible - see `omitDownloads`.
export function omitKeysDeep<T>(value: T, keys: string[]): T {
  if (Array.isArray(value)) return value.map(item => omitKeysDeep(item, keys)) as T;
  if (value && typeof value === 'object') {
    const result: any = {};
    for (const [key, val] of Object.entries(value)) {
      if (keys.includes(key)) continue;
      result[key] = omitKeysDeep(val, keys);
    }
    return result;
  }
  return value;
}

// `downloads` is computed fresh at build time from live GitHub release download counts (see
// registry's enrichDownloads()) - unlike every other field on these fixtures (hash, size, date),
// it would change continuously against a live registry, and is only ever set when > 0 (omitted
// otherwise). Because it can be entirely absent, an asymmetric matcher like `expect.any(Number)`
// can't stand in for it - vitest's toEqual still requires the key to exist on both sides before
// consulting a matcher. So exclude it from both the actual result and the expected fixture before
// comparing, rather than asserting a point-in-time snapshot of it. Most sync()-driving tests now
// use mockRegistrySync() below instead of the live registry, so this is largely defensive at this
// point, but still applies to the handful of tests that intentionally still sync against the real
// registry (see their own comments) and to any future fixture that does carry a `downloads` field.
export function omitDownloads<T>(value: T): T {
  return omitKeysDeep(value, ['downloads']);
}

// Stubs sync()'s registry fetch (apiJson) to resolve with a fixed local payload instead of making
// a live network call - keeps tests deterministic and fast regardless of the real registry's
// current content or uptime (previously almost every sync()-driving test synced against the real,
// live registry - see the "hermetic tests" item in review.md). Caller must restore the mock once
// done, e.g. via `afterEach(() => vi.restoreAllMocks())`.
//
// structuredClone()s the payload on every call rather than resolving the same object reference -
// PackageVersion objects get mutated in place downstream (e.g. ManagerLocal.install()/uninstall()
// set/delete `installed` directly on the object stored in Package.versions), so a real apiJson()
// response - a fresh object graph from JSON.parse every time - never leaks a mutation from one
// sync() call into another the way resolving one shared fixture object repeatedly would.
export function mockRegistrySync(registry: RegistryInterface) {
  return vi.spyOn(apiHelpers, 'apiJson').mockImplementation(async () => structuredClone(registry));
}
