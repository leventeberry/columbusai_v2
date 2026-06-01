import type { User } from "@/data/entities";
import { dbSnapshot, dbSubscribe } from "@/data/mock/db";

export function list(): User[] {
  return dbSnapshot().users;
}

export function get(id: string | null | undefined): User | undefined {
  if (!id) return undefined;
  return dbSnapshot().users.find((u) => u.id === id);
}

export function listByClient(clientId: string): User[] {
  return dbSnapshot().users.filter((u) => u.clientId === clientId);
}

export function listAgency(): User[] {
  return dbSnapshot().users.filter((u) => u.kind === "agency");
}

export const subscribe = dbSubscribe;
