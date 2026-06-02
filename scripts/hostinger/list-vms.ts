import { createApis, createHostingerConfig } from "./lib/client";
import { loadHostingerEnv } from "./lib/env";
import { listVirtualMachines } from "./lib/vm";

function formatIpv4(vm: { ipv4?: unknown }): string {
  const ipv4 = vm.ipv4;
  if (!ipv4 || !Array.isArray(ipv4)) return "-";
  return ipv4
    .map((e) =>
      typeof e === "object" && e !== null && "address" in e
        ? String((e as { address?: string }).address ?? "")
        : ""
    )
    .filter(Boolean)
    .join(", ");
}

async function main() {
  const env = loadHostingerEnv();
  const config = createHostingerConfig(env);
  const { vms } = createApis(config);

  const machines = await listVirtualMachines(vms);
  if (machines.length === 0) {
    console.log("No virtual machines found.");
    return;
  }

  const idW = Math.max(2, ...machines.map((m) => String(m.id).length));
  console.log(
    `${"id".padEnd(idW)}  ${"state".padEnd(12)}  ${"hostname".padEnd(28)}  ipv4  template`
  );
  for (const vm of machines) {
    const template = vm.template?.name ?? "-";
    console.log(
      `${String(vm.id).padEnd(idW)}  ${String(vm.state).padEnd(12)}  ${String(vm.hostname ?? "").padEnd(28)}  ${formatIpv4(vm)}  ${template}`
    );
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
