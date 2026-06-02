import {
  VPSV1FirewallRulesStoreRequestProtocolEnum,
  VPSV1FirewallRulesStoreRequestSourceEnum,
  type VPSActionsApi,
  type VPSFirewallApi,
  type VPSV1FirewallFirewallResource,
} from "hostinger-api-sdk";
import { callApi, pollAction } from "./client";

const REQUIRED_RULES: Array<{
  protocol: (typeof VPSV1FirewallRulesStoreRequestProtocolEnum)[keyof typeof VPSV1FirewallRulesStoreRequestProtocolEnum];
  port: string;
}> = [
  { protocol: VPSV1FirewallRulesStoreRequestProtocolEnum.Ssh, port: "22" },
  { protocol: VPSV1FirewallRulesStoreRequestProtocolEnum.Http, port: "80" },
  {
    protocol: VPSV1FirewallRulesStoreRequestProtocolEnum.Https,
    port: "443",
  },
];

async function listAllFirewalls(
  firewall: VPSFirewallApi
): Promise<VPSV1FirewallFirewallResource[]> {
  const all: VPSV1FirewallFirewallResource[] = [];
  let page = 1;
  while (true) {
    const response = await callApi(
      () => firewall.getFirewallListV1(page),
      "getFirewallList"
    );
    const batch = response.data ?? [];
    all.push(...batch);
    const total = response.meta?.total ?? batch.length;
    if (all.length >= total || batch.length === 0) break;
    page++;
  }
  return all;
}

function hasRule(
  fw: VPSV1FirewallFirewallResource,
  protocol: string,
  port: string
): boolean {
  return (fw.rules ?? []).some(
    (rule) =>
      rule.protocol === protocol &&
      rule.port === port &&
      rule.action === "accept"
  );
}

export async function provisionFirewall(
  firewall: VPSFirewallApi,
  actions: VPSActionsApi,
  virtualMachineId: number,
  firewallName: string
): Promise<void> {
  console.log("Provisioning VPS firewall...");

  let fw = (await listAllFirewalls(firewall)).find((f) => f.name === firewallName);

  if (!fw) {
    console.log(`  Creating firewall "${firewallName}"`);
    fw = await callApi(
      () => firewall.createNewFirewallV1({ name: firewallName }),
      "createNewFirewall"
    );
  } else {
    console.log(`  Using existing firewall id=${fw.id} "${fw.name}"`);
    fw = await callApi(
      () => firewall.getFirewallDetailsV1(fw!.id),
      "getFirewallDetails"
    );
  }

  const firewallId = fw.id;

  for (const rule of REQUIRED_RULES) {
    if (hasRule(fw, rule.protocol, rule.port)) {
      console.log(`  Rule ${rule.protocol}:${rule.port} already present`);
      continue;
    }
    console.log(`  Adding rule ${rule.protocol}:${rule.port}`);
    await callApi(
      () =>
        firewall.createFirewallRuleV1(firewallId, {
          protocol: rule.protocol,
          port: rule.port,
          source: VPSV1FirewallRulesStoreRequestSourceEnum.Any,
          source_detail: "any",
        }),
      "createFirewallRule"
    );
    fw = await callApi(
      () => firewall.getFirewallDetailsV1(firewallId),
      "getFirewallDetails"
    );
  }

  console.log(`  Activating firewall ${firewallId} on VM ${virtualMachineId}`);
  const activate = await callApi(
    () => firewall.activateFirewallV1(firewallId, virtualMachineId),
    "activateFirewall"
  );
  if (activate.id) {
    await pollAction(actions, virtualMachineId, activate.id);
  }

  console.log("  Syncing firewall rules to VM");
  const sync = await callApi(
    () => firewall.syncFirewallV1(firewallId, virtualMachineId),
    "syncFirewall"
  );
  if (sync.id) {
    await pollAction(actions, virtualMachineId, sync.id);
  }

  console.log("Firewall provisioned.");
}
