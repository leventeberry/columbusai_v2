import type { DNSZoneApi } from "hostinger-api-sdk";
import { callApi } from "./client";

const DNS_A_HOSTS = ["@", "www", "api", "admin", "portal", "n8n"] as const;

type DnsRecord = {
  name: string;
  type: string;
  records?: Array<{ content: string }>;
};

function isDnsZoneMissingError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("not found") ||
    lower.includes("zone") ||
    lower.includes("404")
  );
}

function aRecordsForHost(
  existing: DnsRecord[],
  name: string
): Array<{ content: string }> {
  return existing
    .filter((r) => r.name === name && r.type === "A")
    .flatMap((r) => r.records ?? []);
}

function hasCname(existing: DnsRecord[], name: string): boolean {
  return existing.some((r) => r.name === name && r.type === "CNAME");
}

function buildZoneUpdates(
  existing: DnsRecord[],
  vpsIp: string
): Array<{
  name: string;
  type: "A";
  ttl: number;
  records: Array<{ content: string }>;
}> {
  const zone: Array<{
    name: string;
    type: "A";
    ttl: number;
    records: Array<{ content: string }>;
  }> = [];

  for (const name of DNS_A_HOSTS) {
    if (name === "www" && hasCname(existing, "www")) {
      console.log(
        "  Skipping www A record (www is CNAME; update @ A and www follows apex)"
      );
      continue;
    }

    const currentA = aRecordsForHost(existing, name);
    const ips = currentA.map((r) => r.content);
    const hasCorrect = ips.includes(vpsIp);
    const hasStale = ips.some((ip) => ip !== vpsIp);

    if (hasCorrect && !hasStale) {
      console.log(`  ${name}: A already → ${vpsIp}`);
      continue;
    }

    if (hasStale) {
      console.log(
        `  ${name}: replacing A ${ips.join(", ")} → ${vpsIp}`
      );
    } else {
      console.log(`  ${name}: creating A → ${vpsIp}`);
    }

    zone.push({
      name,
      type: "A",
      ttl: 14400,
      records: [{ content: vpsIp }],
    });
  }

  return zone;
}

export async function provisionDns(
  dns: DNSZoneApi,
  domain: string,
  vpsIp: string
): Promise<void> {
  console.log(`Provisioning DNS A records for ${domain} → ${vpsIp}...`);

  let existing: DnsRecord[];
  try {
    existing = await callApi(
      () => dns.getDNSRecordsV1(domain),
      "getDNSRecords"
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (isDnsZoneMissingError(message)) {
      console.warn(
        `  Skipping DNS: zone for ${domain} not managed by Hostinger API (${message}).`
      );
      console.warn("  Add A records manually at your DNS provider.");
      return;
    }
    throw err;
  }

  const zone = buildZoneUpdates(existing, vpsIp);

  if (zone.length === 0) {
    console.log("  No DNS A changes needed.");
    return;
  }

  const hostsToReplace = zone
    .map((z) => z.name)
    .filter((name) =>
      aRecordsForHost(existing, name).some((r) => r.content !== vpsIp)
    );

  if (hostsToReplace.length > 0) {
    console.log(
      `  Removing stale A records for: ${hostsToReplace.join(", ")}`
    );
    await callApi(
      () =>
        dns.deleteDNSRecordsV1(domain, {
          filters: hostsToReplace.map((name) => ({ name, type: "A" })),
        }),
      "deleteDNSRecords"
    );
  }

  console.log("  Validating DNS update...");
  await callApi(
    () =>
      dns.validateDNSRecordsV1(domain, {
        overwrite: false,
        zone,
      }),
    "validateDNSRecords"
  );

  console.log("  Applying DNS update...");
  await callApi(
    () =>
      dns.updateDNSRecordsV1(domain, {
        overwrite: false,
        zone,
      }),
    "updateDNSRecords"
  );

  console.log("DNS provisioned (propagation may take a few minutes).");
}
