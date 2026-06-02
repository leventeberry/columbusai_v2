import { createApis, createHostingerConfig } from "./lib/client";
import { loadHostingerEnv } from "./lib/env";
import { provisionFirewall } from "./lib/firewall";
import { resolveVirtualMachineId } from "./lib/vm";

async function main() {
  const env = loadHostingerEnv();
  const config = createHostingerConfig(env);
  const apis = createApis(config);

  const vmId = await resolveVirtualMachineId(apis.vms, env.vpsIp);
  console.log(`Target VM: id=${vmId} ip=${env.vpsIp}`);

  await provisionFirewall(apis.firewall, apis.actions, vmId, env.firewallName);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
