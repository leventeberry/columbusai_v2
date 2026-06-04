/** Parse session token from API login Set-Cookie headers (no sessionToken in JSON). */
export function extractSessionTokenFromSetCookie(
  res: Response,
  cookieName: string,
): string | null {
  const headers = res.headers;
  const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  const raw: string[] =
    typeof getSetCookie === "function" ? getSetCookie.call(headers) : [];
  if (raw.length === 0) {
    const single = headers.get("set-cookie");
    if (single) raw.push(single);
  }
  for (const line of raw) {
    const first = line.split(";")[0]?.trim();
    if (!first) continue;
    const eq = first.indexOf("=");
    if (eq <= 0) continue;
    if (first.slice(0, eq) === cookieName) {
      return decodeURIComponent(first.slice(eq + 1));
    }
  }
  return null;
}
