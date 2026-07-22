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
// it changes continuously in the real, live registry these tests sync against, and is only ever
// set when > 0 (omitted otherwise). Because it can be entirely absent, an asymmetric matcher like
// `expect.any(Number)` can't stand in for it - vitest's toEqual still requires the key to exist on
// both sides before consulting a matcher. So exclude it from both the actual result and the
// expected fixture before comparing, rather than asserting a point-in-time snapshot of it.
export function omitDownloads<T>(value: T): T {
  return omitKeysDeep(value, ['downloads']);
}
