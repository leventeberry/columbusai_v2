import crypto from "node:crypto";
import {
  AppUserRole,
  AppUserStatus,
  ClientSource,
  PortalClientRole,
  PortalWorkPriority,
  PortalWorkStatus,
  PortalWorkType,
  type SalesClient,
  type SalesLead,
  type SalesOpportunity,
} from "@columbusai/db";
import { hashPassword } from "../auth/password.js";
import { prisma } from "../prisma.js";
import type { SalesClientDto } from "../sales/dto.js";
import { serializeSalesClient } from "../sales/serialize.js";
import {
  cancelDemoFollowupForEmail,
  emitOnboardingWebhookEvent,
  recordOnboardingAuditEvent,
  resolveAgencyActorId,
} from "./followup.js";
import { createPortalNotification, notifyAgencyStaff } from "./notifications.js";
import { defaultStackTemplateId, isValidStackTemplateId } from "./stack-templates.js";
import { AgencyEmailConflictError } from "./errors.js";
import { isAgencyRole } from "../portal/roles.js";

export type ProvisionOptions = {
  stackTemplateId?: string;
  actorUserId?: string;
};

export type ProvisionResult = {
  client: SalesClientDto;
  portalClientId: string;
  onboardingWorkItemId: string;
  clientUserId: string;
  tempPassword?: string;
  alreadyProvisioned: boolean;
};

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  return slug || "client";
}

function generatePortalClientId(company: string, email: string): string {
  const base = slugify(company || (email.split("@")[0] ?? "client"));
  return `c-${base}-${crypto.randomUUID().slice(0, 6)}`;
}

function generateWorkItemId(): string {
  return `WI-${Date.now()}`;
}

function generateTempPassword(): string {
  return crypto.randomBytes(9).toString("base64url");
}

type OppWithRelations = SalesOpportunity & {
  lead: SalesLead | null;
  client: SalesClient | null;
};

export async function provisionPortalForSalesClient(
  salesClientId: string,
  opts: ProvisionOptions = {},
): Promise<ProvisionResult | null> {
  const salesClient = await prisma.salesClient.findUnique({
    where: { id: salesClientId },
    include: { opportunity: { include: { lead: true } } },
  });
  if (!salesClient) return null;

  if (salesClient.portalClientId && salesClient.onboardingWorkItemId) {
    const client = serializeSalesClient(salesClient);
    const membership = await prisma.clientUser.findFirst({
      where: {
        client_id: salesClient.portalClientId,
        client_source: ClientSource.PORTAL,
      },
    });
    return {
      client,
      portalClientId: salesClient.portalClientId,
      onboardingWorkItemId: salesClient.onboardingWorkItemId,
      clientUserId: membership?.user_id ?? "",
      alreadyProvisioned: true,
    };
  }

  const stackTemplateId =
    opts.stackTemplateId && isValidStackTemplateId(opts.stackTemplateId)
      ? opts.stackTemplateId
      : salesClient.stackTemplateId && isValidStackTemplateId(salesClient.stackTemplateId)
        ? salesClient.stackTemplateId
        : defaultStackTemplateId();

  const opp = salesClient.opportunity;
  const lead = opp.lead;
  const email = salesClient.email.trim().toLowerCase();
  const contactName = opp.contactName || salesClient.name;
  const agencyActorId = await resolveAgencyActorId(opts.actorUserId);
  const portalClientId = generatePortalClientId(salesClient.company || salesClient.name, email);
  const workItemId = generateWorkItemId();
  const tempPassword = generateTempPassword();

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.portalClient.create({
        data: {
          id: portalClientId,
          name: salesClient.name,
          industry: lead?.industry ?? null,
        },
      });

      const existingUser = await tx.appUser.findUnique({ where: { email } });
      let clientUserId: string;
      let issuedTempPassword: string | undefined;

      if (existingUser) {
        if (
          existingUser.role !== AppUserRole.CLIENT &&
          isAgencyRole(existingUser.role)
        ) {
          throw new AgencyEmailConflictError();
        }
        clientUserId = existingUser.id;
      } else {
        clientUserId = (
          await tx.appUser.create({
            data: {
              email,
              password_hash: await hashPassword(tempPassword),
              role: AppUserRole.CLIENT,
              status: AppUserStatus.ACTIVE,
              display_name: contactName,
            },
          })
        ).id;
        issuedTempPassword = tempPassword;
      }

      await tx.clientUser.upsert({
        where: {
          user_id_client_id_client_source: {
            user_id: clientUserId,
            client_id: portalClientId,
            client_source: ClientSource.PORTAL,
          },
        },
        update: { role: PortalClientRole.OWNER },
        create: {
          user_id: clientUserId,
          client_id: portalClientId,
          client_source: ClientSource.PORTAL,
          role: PortalClientRole.OWNER,
        },
      });

      await tx.portalWorkItem.create({
        data: {
          id: workItemId,
          client_id: portalClientId,
          title: `Welcome — ${salesClient.name} onboarding`,
          description:
            "Your Columbus AI workspace is ready. Complete onboarding tasks here and reach out if you need help.",
          type: PortalWorkType.onboarding,
          status: PortalWorkStatus.in_progress,
          priority: PortalWorkPriority.high,
          created_by_user_id: agencyActorId,
          primary_assignee_id: agencyActorId,
          assignee_ids: [agencyActorId],
          tags: ["onboarding"],
        },
      });

      await tx.portalWorkActivity.create({
        data: {
          work_item_id: workItemId,
          actor_id: agencyActorId,
          kind: "created",
        },
      });

      const updated = await tx.salesClient.update({
        where: { id: salesClient.id },
        data: {
          portalClientId,
          onboardingWorkItemId: workItemId,
          stackTemplateId,
          provisioningStatus: "portal_ready",
          provisioningError: null,
        },
        include: { opportunity: { include: { lead: true } } },
      });

      return { updated, clientUserId, issuedTempPassword };
    });

    await createPortalNotification({
      userId: result.clientUserId,
      kind: "onboarding_welcome",
      title: "Your portal is ready",
      body: `Welcome to Columbus AI, ${salesClient.name}. Your onboarding checklist is waiting in the work center.`,
      href: `/work/${workItemId}`,
    });

    await notifyAgencyStaff({
      kind: "client_onboarded",
      title: "New client onboarded",
      body: `${salesClient.name} has been provisioned in the client portal.`,
      href: `/sales/clients/${salesClient.id}`,
      excludeUserId: opts.actorUserId,
    });

    await recordOnboardingAuditEvent({
      actorUserId: opts.actorUserId,
      salesClientId: salesClient.id,
      portalClientId,
      metadata: { stackTemplateId, workItemId },
    });

    await cancelDemoFollowupForEmail(email);

    void emitOnboardingWebhookEvent({
      salesClientId: salesClient.id,
      portalClientId,
      opportunityId: opp.id,
      email,
      stackTemplateId,
    });

    return {
      client: serializeSalesClient(result.updated),
      portalClientId,
      onboardingWorkItemId: workItemId,
      clientUserId: result.clientUserId,
      tempPassword: result.issuedTempPassword,
      alreadyProvisioned: false,
    };
  } catch (err) {
    if (err instanceof AgencyEmailConflictError) {
      await recordOnboardingAuditEvent({
        actorUserId: opts.actorUserId,
        salesClientId: salesClient.id,
        portalClientId: salesClient.portalClientId ?? "",
        metadata: { email, code: err.code, conflict: true },
      });
      throw err;
    }
    const message = err instanceof Error ? err.message : String(err);
    await prisma.salesClient.update({
      where: { id: salesClient.id },
      data: {
        provisioningStatus: "failed",
        provisioningError: message,
      },
    });
    throw err;
  }
}

export async function provisionClientFromOpportunity(
  opportunityId: string,
  opts: ProvisionOptions = {},
): Promise<ProvisionResult | null> {
  const opp = await prisma.salesOpportunity.findUnique({
    where: { id: opportunityId },
    include: { lead: true, client: true },
  });
  if (!opp) return null;

  let salesClient = opp.client;
  if (!salesClient) {
    salesClient = await createSalesClientRecord(opp, opts.stackTemplateId);
  } else if (opts.stackTemplateId && isValidStackTemplateId(opts.stackTemplateId)) {
    salesClient = await prisma.salesClient.update({
      where: { id: salesClient.id },
      data: { stackTemplateId: opts.stackTemplateId },
    });
  }

  return provisionPortalForSalesClient(salesClient.id, opts);
}

async function createSalesClientRecord(
  opp: OppWithRelations,
  stackTemplateId?: string,
): Promise<SalesClient> {
  const templateId =
    stackTemplateId && isValidStackTemplateId(stackTemplateId)
      ? stackTemplateId
      : defaultStackTemplateId();

  return prisma.$transaction(async (tx) => {
    const client = await tx.salesClient.create({
      data: {
        opportunityId: opp.id,
        name: opp.company || opp.contactName,
        email: opp.email,
        company: opp.company,
        owner: opp.owner,
        notes: opp.notes,
        status: "onboarding",
        stackTemplateId: templateId,
        provisioningStatus: "pending",
      },
    });
    await tx.salesOpportunity.update({
      where: { id: opp.id },
      data: { stage: "won" },
    });
    return client;
  });
}

export async function retryProvisionSalesClient(
  salesClientId: string,
  opts: ProvisionOptions = {},
): Promise<ProvisionResult | null> {
  return provisionPortalForSalesClient(salesClientId, opts);
}
