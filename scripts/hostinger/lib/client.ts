import type { AxiosError, AxiosResponse } from "axios";
import {
  Configuration,
  DNSZoneApi,
  VPSActionsApi,
  VPSDockerManagerApi,
  VPSFirewallApi,
  VPSPublicKeysApi,
  VPSVirtualMachineApi,
} from "hostinger-api-sdk";
import type { HostingerEnv } from "./env";

const DEFAULT_POLL_MS = 5_000;
const DEFAULT_POLL_TIMEOUT_MS = 600_000;

export function createHostingerConfig(env: HostingerEnv): Configuration {
  return new Configuration({
    accessToken: env.apiToken,
  });
}

export function createApis(config: Configuration) {
  return {
    vms: new VPSVirtualMachineApi(config),
    firewall: new VPSFirewallApi(config),
    publicKeys: new VPSPublicKeysApi(config),
    dns: new DNSZoneApi(config),
    docker: new VPSDockerManagerApi(config),
    actions: new VPSActionsApi(config),
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryAfterMs(error: AxiosError): number | undefined {
  const header = error.response?.headers?.["retry-after"];
  if (typeof header === "string") {
    const seconds = Number.parseInt(header, 10);
    if (!Number.isNaN(seconds)) return seconds * 1000;
  }
  return undefined;
}

/** Call Hostinger API with 429 exponential backoff. */
export async function callApi<T>(
  fn: () => Promise<AxiosResponse<T>>,
  label = "request"
): Promise<T> {
  let attempt = 0;
  const maxAttempts = 6;

  while (true) {
    try {
      const response = await fn();
      return response.data;
    } catch (err) {
      const axiosErr = err as AxiosError;
      const status = axiosErr.response?.status;
      if (status === 429 && attempt < maxAttempts - 1) {
        const wait =
          retryAfterMs(axiosErr) ?? Math.min(60_000, 1000 * 2 ** attempt);
        console.warn(
          `Rate limited on ${label}; retrying in ${Math.round(wait / 1000)}s...`
        );
        await sleep(wait);
        attempt++;
        continue;
      }
      const body = axiosErr.response?.data;
      const message =
        typeof body === "object" && body !== null && "message" in body
          ? String((body as { message: unknown }).message)
          : axiosErr.message;
      throw new Error(`${label} failed (${status ?? "network"}): ${message}`);
    }
  }
}

export async function pollAction(
  actions: VPSActionsApi,
  virtualMachineId: number,
  actionId: number,
  options?: { intervalMs?: number; timeoutMs?: number }
): Promise<void> {
  const intervalMs = options?.intervalMs ?? DEFAULT_POLL_MS;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_POLL_TIMEOUT_MS;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const action = await callApi(
      () => actions.getActionDetailsV1(virtualMachineId, actionId),
      `getActionDetails(${actionId})`
    );
    const state = action.state;
    console.log(`  action ${actionId} (${action.name}): ${state}`);
    if (state === "success") return;
    if (state === "error") {
      throw new Error(`Action ${actionId} (${action.name}) failed`);
    }
    await sleep(intervalMs);
  }
  throw new Error(`Action ${actionId} timed out after ${timeoutMs}ms`);
}
