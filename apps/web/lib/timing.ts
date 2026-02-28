/**
 * Phase 6: Lightweight timing helper for observability.
 * withTimer(name, fn) runs fn and returns { result, ms }.
 */

export async function withTimer<T>(
  _name: string,
  fn: () => Promise<T>
): Promise<{ result: T; ms: number }> {
  const start = Date.now();
  const result = await fn();
  const ms = Date.now() - start;
  return { result, ms };
}
