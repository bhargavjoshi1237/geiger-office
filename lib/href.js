// Internal navigation helper.
//
// In production geiger-office is served under the /office prefix by geiger-dash
// (which rewrites /office/:path* -> the office deployment). The app itself runs
// at the root of its own deployment and does NOT use Next's `basePath`, so
// <Link href="/home"> would resolve to geiger.studio/home (unproxied -> 404).
//
// Use appHref() for links that point at office's OWN routes so they get the
// /office prefix in production. Do NOT use it for cross-app/apex links
// (e.g. /flow, /notes, /forms, /pricing) — those are proxied by dash at the
// root and must stay bare. Anchors (#...) and absolute URLs pass through
// untouched.
const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || "";

export function appHref(path = "/") {
  if (!path) return path;
  if (path.startsWith("#") || /^[a-z]+:/i.test(path) || path.startsWith("//")) {
    return path;
  }
  return `${assetPrefix}${path}`;
}
