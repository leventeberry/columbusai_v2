/** When true in dev, portal work center uses in-memory mock data instead of the API. */
export function isPortalMockEnabled(): boolean {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_DEV_MOCK_PORTAL === "true") {
    return true;
  }
  return process.env.DEV_MOCK_PORTAL === "true";
}
