import { AppUserRole, FollowupState } from "@columbusai/db";
import { prisma } from "../prisma.js";

/** Stop demo follow-up sequences for the lead email once they become a paying client. */
export async function cancelDemoFollowupForEmail(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;

  await prisma.client.updateMany({
    where: { primary_email: { equals: normalized, mode: "insensitive" } },
    data: {
      followup_state: FollowupState.completed,
      followup_stop_reason: "converted_to_client",
      next_followup_at: null,
    },
  });
}

export async function recordOnboardingAuditEvent(input: {
  actorUserId?: string;
  salesClientId: string;
  portalClientId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await prisma.auditEvent.create({
    data: {
      actor_user_id: input.actorUserId ?? null,
      action: "client.provisioned",
      resource_type: "sales_client",
      resource_id: input.salesClientId,
      metadata: {
        portalClientId: input.portalClientId,
        ...input.metadata,
      },
    },
  });
}

export async function emitOnboardingWebhookEvent(input: {
  salesClientId: string;
  portalClientId: string;
  opportunityId: string;
  email: string;
  stackTemplateId: string | null;
}): Promise<void> {
  const url = process.env.ONBOARDING_WEBHOOK_URL?.trim();
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "client.onboarded",
        ...input,
        emittedAt: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.warn(
      JSON.stringify({
        level: "warn",
        message: "onboarding_webhook_failed",
        error: err instanceof Error ? err.message : String(err),
      }),
    );
  }
}

export async function resolveAgencyActorId(preferredUserId?: string): Promise<string> {
  if (preferredUserId) {
    const preferred = await prisma.appUser.findUnique({
      where: { id: preferredUserId },
      select: { id: true, role: true },
    });
    if (
      preferred &&
      (preferred.role === AppUserRole.SUPER_ADMIN ||
        preferred.role === AppUserRole.ADMIN ||
        preferred.role === AppUserRole.STAFF)
    ) {
      return preferred.id;
    }
  }

  const fallback = await prisma.appUser.findFirst({
    where: { role: { in: [AppUserRole.SUPER_ADMIN, AppUserRole.ADMIN, AppUserRole.STAFF] } },
    orderBy: { created_at: "asc" },
    select: { id: true },
  });
  if (!fallback) throw new Error("No agency user available for onboarding");
  return fallback.id;
}
