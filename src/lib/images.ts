/**
 * Resolve a stored image reference to a url this site can display.
 *
 * - Absolute http(s) urls pass through (rare external files).
 * - Legacy old-backend storage (`.../storage/images/<name>`) is translated to
 *   the equivalent self-hosted file — the migration downloads images under
 *   their original filename, so the translation is lossless.
 * - Everything else (self-hosted `/api/files/...`, local `/images/...`,
 *   data-uris) is already local and returned unchanged.
 */
export function resolveImage(src?: string | null): string {
  if (!src) return "";
  const s = String(src);
  if (/^https?:\/\//i.test(s)) {
    const m = s.match(/\/storage\/images\/([^/?#]+)/i);
    return m ? `/api/files/${encodeURIComponent(m[1])}` : s;
  }
  if (/^\/storage\/images\//i.test(s)) {
    return `/api/files/${encodeURIComponent(s.split("/").pop() ?? "")}`;
  }
  return s;
}
