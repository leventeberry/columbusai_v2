import type { VPSActionsApi, VPSPublicKeysApi, VPSVirtualMachineApi } from "hostinger-api-sdk";
import { callApi, pollAction } from "./client";

async function listAllPublicKeys(publicKeys: VPSPublicKeysApi) {
  const all: Array<{ id: number; name: string; key: string }> = [];
  let page = 1;
  while (true) {
    const response = await callApi(
      () => publicKeys.getPublicKeysV1(page),
      "getPublicKeys"
    );
    const batch = response.data ?? [];
    for (const entry of batch) {
      all.push({ id: entry.id, name: entry.name, key: entry.key });
    }
    const total = response.meta?.total ?? batch.length;
    if (all.length >= total || batch.length === 0) break;
    page++;
  }
  return all;
}

async function isKeyAttachedToVm(
  vms: VPSVirtualMachineApi,
  virtualMachineId: number,
  keyId: number
): Promise<boolean> {
  const response = await callApi(
    () => vms.getAttachedPublicKeysV1(virtualMachineId, 1),
    "getAttachedPublicKeys"
  );
  return (response.data ?? []).some((k) => k.id === keyId);
}

export async function provisionSshKey(
  publicKeys: VPSPublicKeysApi,
  vms: VPSVirtualMachineApi,
  actions: VPSActionsApi,
  virtualMachineId: number,
  publicKeyPath: string,
  publicKeyContent: string
): Promise<void> {
  console.log(`Provisioning SSH key from ${publicKeyPath}...`);

  const existing = await listAllPublicKeys(publicKeys);
  let keyId = existing.find((k) => k.key.trim() === publicKeyContent)?.id;

  if (!keyId) {
    const name =
      process.env.HOSTINGER_SSH_KEY_NAME?.trim() || "columbusai-deploy";
    console.log(`  Creating public key "${name}"`);
    const created = await callApi(
      () =>
        publicKeys.createPublicKeyV1({
          name,
          key: publicKeyContent,
        }),
      "createPublicKey"
    );
    keyId = created.id;
  } else {
    console.log(`  Reusing existing public key id=${keyId}`);
  }

  if (await isKeyAttachedToVm(vms, virtualMachineId, keyId)) {
    console.log(`  Key id=${keyId} already attached to VM ${virtualMachineId}`);
    return;
  }

  console.log(`  Attaching key id=${keyId} to VM ${virtualMachineId}`);
  const attach = await callApi(
    () =>
      publicKeys.attachPublicKeyV1(virtualMachineId, {
        ids: [keyId],
      }),
    "attachPublicKey"
  );
  if (attach.id) {
    await pollAction(actions, virtualMachineId, attach.id);
  }

  console.log("SSH key provisioned.");
}
