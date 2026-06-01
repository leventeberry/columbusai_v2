import type { Client } from "@/data/entities";
import { dbSnapshot, dbSubscribe } from "@/data/mock/db";

export function list(): Client[] {
  return dbSnapshot().clients;
}

export function get(id: string | null | undefined): Client | undefined {
  if (!id) return undefined;
  return dbSnapshot().clients.find((c) => c.id === id);
}

export const subscribe = dbSubscribe;
