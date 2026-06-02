import { createApis, createHostingerConfig } from "./lib/client";
import { loadHostingerEnv, readSshPublicKey } from "./lib/env";
import { provisionSshKey } from "./lib/ssh-key";
import { resolveVirtualMachineId } from "./lib/vm";

async function main() {
  const env = loadHostingerEnv();
  const config = createHostingerConfig(env);
  const apis = createApis(config);
  const publicKey = readSshPublicKey(env.sshPublicKeyPath);

  const vmId = await resolveVirtualMachineId(apis.vms, env.vpsIp);
  console.log(`Target VM: id=${vmId} ip=${env.vpsIp}`);

  await provisionSshKey(
    apis.publicKeys,
    apis.vms,
    apis.actions,
    vmId,
    env.sshPublicKeyPath,
    publicKey
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
