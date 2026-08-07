// When the app is served under a sub-path (e.g. /playground), Next prefixes
// links and navigation automatically — but NOT fetch(). Prefix API calls here.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function apiUrl(path: string): string {
  return `${BASE_PATH}${path}`;
}
