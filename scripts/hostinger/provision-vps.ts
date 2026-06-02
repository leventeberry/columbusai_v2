import { createApis, createHostingerConfig } from "./lib/client";
import { loadHostingerEnv, readSshPublicKey } from "./lib/env";
import { provisionDns } from "./lib/dns";
import { provisionFirewall } from "./lib/firewall";
import { provisionSshKey } from "./lib/ssh-key";
import {
  assertDockerOsTemplate,
  getVirtualMachine,
  resolveVirtualMachineId,
} from "./lib/vm";

async function main() {
  const env = loadHostingerEnv();
  const config = createHostingerConfig(env);
  const apis = createApis(config);

  const vmId = await resolveVirtualMachineId(apis.vms, env.vpsIp);
  const vm = await getVirtualMachine(apis.vms, vmId);
  console.log(
    `Target VM: id=${vmId} ip=${env.vpsIp} state=${vm.state} template=${vm.template?.name ?? "-"}`
  );
  assertDockerOsTemplate(vm);

  await provisionFirewall(apis.firewall, apis.actions, vmId, env.firewallName);
  await provisionSshKey(
    apis.publicKeys,
    apis.vms,
    apis.actions,
    vmId,
    env.sshPublicKeyPath,
    readSshPublicKey(env.sshPublicKeyPath)
  );
  await provisionDns(apis.dns, env.domain, env.vpsIp);

  console.log("\nProvision complete. Next:");
  console.log("  npm run hostinger:deploy");
  console.log("  npm run n8n:push:demo && npm run n8n:activate:demo");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
