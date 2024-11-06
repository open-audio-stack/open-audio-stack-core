export function pathGetExt(path: string, sep: string = '.') {
  return path.substring(path.lastIndexOf(sep) + 1);
}

export function pathGetDirectory(path: string, sep: string = '/') {
  return path.substring(0, path.lastIndexOf(sep));
}

export function pathGetFilename(path: string, sep: string = '/') {
  return path.substring(path.lastIndexOf(sep) + 1);
}

export function pathGetSlug(path: string, sep: string = '/') {
  const parts: string[] = path.split(sep);
  return parts[0] + '/' + parts[1];
}

export function pathGetVersion(path: string, sep: string = '/') {
  const parts: string[] = path.split(sep);
  return parts[parts.length - 2];
}
