import type { N8nEnv } from "./env";

export type N8nWorkflow = Record<string, unknown> & {
  id?: string;
  name?: string;
  active?: boolean;
  updatedAt?: string;
  nodes?: unknown[];
  connections?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  staticData?: unknown;
  pinData?: unknown;
};

export type WorkflowsListResponse = {
  data: N8nWorkflow[];
  nextCursor?: string | null;
};

async function parseErrorBody(res: Response): Promise<string> {
  try {
    const text = await res.text();
    if (!text) return res.statusText || "Request failed";
    try {
      const json = JSON.parse(text) as { message?: string };
      if (json.message) return json.message;
    } catch {
      /* not JSON */
    }
    return text.slice(0, 500);
  } catch {
    return res.statusText || "Request failed";
  }
}

/** Authenticated request to n8n Public API v1. Never logs the API key. */
export async function n8nRequest<T>(
  env: N8nEnv,
  method: string,
  apiPath: string,
  body?: unknown
): Promise<T> {
  const url = `${env.apiUrl}${apiPath.startsWith("/") ? apiPath : `/${apiPath}`}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-N8N-API-KEY": env.apiKey,
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const detail = await parseErrorBody(res);
    throw new Error(`n8n API ${method} ${apiPath} failed (${res.status}): ${detail}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

/** Fetch all workflows (cursor pagination). */
export async function listAllWorkflows(env: N8nEnv): Promise<N8nWorkflow[]> {
  const all: N8nWorkflow[] = [];
  let cursor: string | undefined;

  for (;;) {
    const params = new URLSearchParams({ limit: "250" });
    if (cursor) params.set("cursor", cursor);
    const page = await n8nRequest<WorkflowsListResponse>(
      env,
      "GET",
      `/api/v1/workflows?${params.toString()}`
    );
    all.push(...(page.data ?? []));
    cursor = page.nextCursor ?? undefined;
    if (!cursor) break;
  }

  return all;
}

/** Update workflow: PATCH (newer API) with PUT fallback (local Docker n8n). */
export async function updateWorkflow(
  env: N8nEnv,
  id: string,
  body: Record<string, unknown>
): Promise<N8nWorkflow> {
  const path = `/api/v1/workflows/${id}`;
  try {
    return await n8nRequest<N8nWorkflow>(env, "PATCH", path, body);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes("(405)")) throw err;
    return await n8nRequest<N8nWorkflow>(env, "PUT", path, body);
  }
}
