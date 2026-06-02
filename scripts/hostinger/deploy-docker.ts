import { createApis, createHostingerConfig } from "./lib/client";
import {
  deployDockerProject,
  printDockerProjectLogs,
  printDockerProjectStatus,
} from "./lib/deploy";
import { loadHostingerEnv } from "./lib/env";
import {
  assertDockerOsTemplate,
  getVirtualMachine,
  resolveVirtualMachineId,
} from "./lib/vm";

function parseArgs(argv: string[]) {
  return {
    status: argv.includes("--status"),
    logs: argv.includes("--logs"),
    deploy: !argv.includes("--status") && !argv.includes("--logs"),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = loadHostingerEnv();
  const config = createHostingerConfig(env);
  const apis = createApis(config);

  const vmId = await resolveVirtualMachineId(apis.vms, env.vpsIp);
  const vm = await getVirtualMachine(apis.vms, vmId);
  console.log(`Target VM: id=${vmId} state=${vm.state}`);

  if (args.status) {
    await printDockerProjectStatus(
      apis.docker,
      vmId,
      env.dockerProjectName
    );
    return;
  }

  if (args.logs) {
    await printDockerProjectLogs(apis.docker, vmId, env.dockerProjectName);
    return;
  }

  assertDockerOsTemplate(vm);
  await deployDockerProject(
    apis.docker,
    apis.actions,
    vmId,
    env.dockerProjectName,
    env.githubComposeUrl
  );

  console.log("\nAfter deploy:");
  console.log("  npm run hostinger:deploy -- --status");
  console.log("  npm run hostinger:deploy -- --logs");
  console.log(
    "  On VPS (if migrate did not run): docker compose run --rm migrate"
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
