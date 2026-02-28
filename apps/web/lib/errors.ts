/**
 * Parse response body as JSON or throw with a descriptive error.
 * Use for API responses when you expect application/json.
 */
export async function parseJsonOrThrow(res: Response): Promise<unknown> {
  const text = await res.text();
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      `Server returned ${res.status} (expected JSON). ${text.slice(0, 200)}${text.length > 200 ? "…" : ""}`
    );
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(
      `Invalid JSON from server (status ${res.status}). Check API and env (e.g. OPENAI_API_KEY, DB).`
    );
  }
}
