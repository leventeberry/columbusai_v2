import type { VPSVirtualMachineApi } from "hostinger-api-sdk";
import type { VPSV1VirtualMachineVirtualMachineResource } from "hostinger-api-sdk";
import { callApi } from "./client";

function vmIpv4Addresses(
  vm: VPSV1VirtualMachineVirtualMachineResource
): string[] {
  const ipv4 = vm.ipv4;
  if (!ipv4) return [];
  if (Array.isArray(ipv4)) {
    return ipv4
      .map((entry) =>
        typeof entry === "object" && entry !== null && "address" in entry
          ? String((entry as { address?: string }).address ?? "")
          : ""
      )
      .filter(Boolean);
  }
  return [];
}

export async function listVirtualMachines(
  vms: VPSVirtualMachineApi
): Promise<VPSV1VirtualMachineVirtualMachineResource[]> {
  return callApi(() => vms.getVirtualMachinesV1(), "getVirtualMachines");
}

export async function resolveVirtualMachineId(
  vms: VPSVirtualMachineApi,
  targetIp: string
): Promise<number> {
  const machines = await listVirtualMachines(vms);

  if (machines.length === 0) {
    throw new Error("No virtual machines found on this Hostinger account");
  }

  const byIp = machines.filter((vm) =>
    vmIpv4Addresses(vm).includes(targetIp)
  );
  if (byIp.length === 1) {
    return byIp[0].id;
  }
  if (byIp.length > 1) {
    throw new Error(
      `Multiple VMs match IP ${targetIp}: ${byIp.map((v) => v.id).join(", ")}`
    );
  }

  if (machines.length === 1) {
    const only = machines[0];
    const ips = vmIpv4Addresses(only);
    console.warn(
      `No VM with IP ${targetIp}; using sole VM id=${only.id} (${ips.join(", ") || "no ipv4"})`
    );
    return only.id;
  }

  const summary = machines
    .map(
      (vm) =>
        `id=${vm.id} hostname=${vm.hostname} state=${vm.state} ipv4=${vmIpv4Addresses(vm).join("|") || "-"}`
    )
    .join("\n  ");
  throw new Error(
    `Could not resolve VM for IP ${targetIp}. Available:\n  ${summary}`
  );
}

export async function getVirtualMachine(
  vms: VPSVirtualMachineApi,
  virtualMachineId: number
): Promise<VPSV1VirtualMachineVirtualMachineResource> {
  return callApi(
    () => vms.getVirtualMachineDetailsV1(virtualMachineId),
    `getVirtualMachineDetails(${virtualMachineId})`
  );
}

export function assertDockerOsTemplate(
  vm: VPSV1VirtualMachineVirtualMachineResource
): void {
  const templateName = vm.template?.name?.toLowerCase() ?? "";
  const looksLikeDocker =
    templateName.includes("docker") ||
    templateName.includes("compose") ||
    templateName.includes("container");
  if (!looksLikeDocker) {
    console.warn(
      `Warning: VM template "${vm.template?.name ?? "unknown"}" may not support Docker Manager.`
    );
    console.warn(
      "Hostinger Docker Manager requires a Docker-capable OS template on the VPS."
    );
  }
}
