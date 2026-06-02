import { Configuration, VPSVirtualMachineApi } from "hostinger-api-sdk";
import type { HostingerEnv } from "./env";

export async function assertHostingerApiAuth(env: HostingerEnv): Promise<void> {
  const response = await fetch(
    "https://developers.hostinger.com/api/vps/v1/virtual-machines",
    {
      headers: {
        Authorization: `Bearer ${env.apiToken}`,
        Accept: "application/json",
      },
    }
  );

  if (response.ok) {
    return;
  }

  let correlationId = "";
  try {
    const body = (await response.json()) as {
      message?: string;
      correlation_id?: string;
    };
    correlationId = body.correlation_id ?? "";
  } catch {
    // ignore parse errors
  }

  if (response.status === 401) {
    console.error("Hostinger API authentication failed (401 Unauthenticated).");
    if (correlationId) {
      console.error(`Correlation ID (for Hostinger support): ${correlationId}`);
    }
    console.error("");
    console.error("Your token is present in .env but Hostinger rejected it. Common causes:");
    console.error("  • Token was deleted or expired in hPanel");
    console.error("  • Token copied from a different Hostinger account");
    console.error("  • Old token left in .env after creating a new one");
    console.error("");
    console.error("Fix:");
    console.error("  1. Open https://hpanel.hostinger.com/profile/api");
    console.error("  2. Create a new API token (copy it immediately — shown once)");
    console.error("  3. Set HOSTINGER_API_TOKEN=<paste> in repo-root .env (no quotes, no Bearer prefix)");
    console.error("  4. Run: npm run hostinger:check-auth");
    process.exit(1);
  }

  console.error(`Hostinger API error: HTTP ${response.status}`);
  process.exit(1);
}
