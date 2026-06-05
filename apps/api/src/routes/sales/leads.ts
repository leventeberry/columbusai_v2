import type { Request, Response } from "express";
import { SalesLeadStatus } from "@columbusai/db";
import { manualLeadSchema } from "@columbusai/leads/validation";
import { routeParam } from "../../lib/route-params.js";
import { z } from "zod";
import * as sales from "../../lib/sales/repository.js";
import {
  recordLeadActivity,
  listLeadActivity,
  listRecentActivity,
} from "../../lib/sales/activity.js";

const statusSchema = z.enum(SalesLeadStatus);

export async function getLeads(_req: Request, res: Response): Promise<void> {
  const leads = await sales.listLeads();
  res.json({ leads });
}

export async function getLead(req: Request, res: Response): Promise<void> {
  const lead = await sales.getLeadById(routeParam(req.params.id));
  if (!lead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }
  res.json({ lead });
}

const createLeadSchema = manualLeadSchema;

export async function postCreateLead(req: Request, res: Response): Promise<void> {
  const body = createLeadSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body", details: z.flattenError(body.error) });
    return;
  }
  const lead = await sales.createManualLead(body.data);
  await recordLeadActivity({
    leadId: lead.id,
    type: "lead_created",
    title: "Lead created",
    detail: `${lead.contact} — ${lead.service}`,
    metadata: { source: "manual" },
  });
  res.status(201).json({ lead });
}

export async function patchLeadStatus(req: Request, res: Response): Promise<void> {
  const body = z
    .object({
      status: statusSchema.optional(),
      pipelineStage: z.string().optional(),
    })
    .refine((d) => d.status ?? d.pipelineStage, { message: "status or pipelineStage required" })
    .safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body", details: z.flattenError(body.error) });
    return;
  }

  const id = routeParam(req.params.id);
  const before = await sales.getLeadById(id);
  const result = body.data.pipelineStage
    ? await sales.updateLeadPipelineStage(id, body.data.pipelineStage)
    : await sales.updateLeadStatus(id, body.data.status!);

  if (!result) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  const afterStatus = "status" in result ? result.status : (result as { stage?: string }).stage;
  if (before && afterStatus && afterStatus !== before.status) {
    await recordLeadActivity({
      leadId: id,
      type: "status_changed",
      title: "Status changed",
      detail: `${before.status} → ${afterStatus}`,
      metadata: { from: before.status, to: afterStatus },
    });
  }

  res.json({ lead: result });
}

export async function patchLeadNotes(req: Request, res: Response): Promise<void> {
  const body = z.object({ notes: z.string().max(10000) }).safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body", details: z.flattenError(body.error) });
    return;
  }
  const id = routeParam(req.params.id);
  const lead = await sales.updateLeadNotes(id, body.data.notes);
  if (!lead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }
  await recordLeadActivity({
    leadId: id,
    type: "note_updated",
    title: "Notes updated",
    detail: body.data.notes.slice(0, 120) || null,
  });
  res.json({ lead });
}

export async function getLeadActivity(req: Request, res: Response): Promise<void> {
  const id = routeParam(req.params.id);
  const activity = await listLeadActivity(id);
  res.json({ activity });
}

export async function getRecentActivity(_req: Request, res: Response): Promise<void> {
  const activity = await listRecentActivity();
  res.json({ activity });
}

export async function postConvertLead(req: Request, res: Response): Promise<void> {
  const body = z
    .object({
      stage: z.enum(["qualified", "proposal", "negotiation", "won", "lost"]).optional(),
      estimatedValue: z.number().int().positive().optional(),
    })
    .safeParse(req.body ?? {});
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const opportunity = await sales.convertLeadToOpportunity(routeParam(req.params.id), {
    stage: body.data.stage,
    estimatedValue: body.data.estimatedValue,
  });
  if (!opportunity) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }
  res.status(201).json({ opportunity });
}

export async function getPipeline(_req: Request, res: Response): Promise<void> {
  const cards = await sales.getPipelineBoard();
  res.json({ cards });
}

export async function getSalesStats(_req: Request, res: Response): Promise<void> {
  const stats = await sales.getSalesStats();
  res.json({ stats });
}
