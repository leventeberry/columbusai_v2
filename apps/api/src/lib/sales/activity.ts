import type { Prisma } from "@columbusai/db";
import { prisma } from "../prisma.js";

export type LeadActivityRow = {
  id: string;
  createdAt: string;
  leadId: string;
  type: string;
  title: string;
  detail: string | null;
  metadata: Record<string, unknown> | null;
};

export type LeadActivityInput = {
  leadId: string;
  type: string;
  title: string;
  detail?: string | null;
  metadata?: Record<string, unknown> | null;
};

function rowToDto(row: {
  id: string;
  createdAt: Date;
  leadId: string;
  type: string;
  title: string;
  detail: string | null;
  metadata: Prisma.JsonValue;
}): LeadActivityRow {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    leadId: row.leadId,
    type: row.type,
    title: row.title,
    detail: row.detail,
    metadata:
      row.metadata != null && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : null,
  };
}

export async function recordLeadActivity(input: LeadActivityInput): Promise<LeadActivityRow> {
  const row = await prisma.salesLeadActivity.create({
    data: {
      leadId: input.leadId,
      type: input.type,
      title: input.title,
      detail: input.detail ?? null,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
  return rowToDto(row);
}

export async function listLeadActivity(leadId: string, limit = 50): Promise<LeadActivityRow[]> {
  const rows = await prisma.salesLeadActivity.findMany({
    where: { leadId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(rowToDto);
}

export async function listRecentActivity(limit = 30): Promise<LeadActivityRow[]> {
  const rows = await prisma.salesLeadActivity.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(rowToDto);
}
