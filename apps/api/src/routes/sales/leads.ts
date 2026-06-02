import type { Request, Response } from "express";
import { SalesLeadStatus } from "@columbusai/db";
import { routeParam } from "../../lib/route-params.js";
import { z } from "zod";
import * as sales from "../../lib/sales/repository.js";

const statusSchema = z.nativeEnum(SalesLeadStatus);

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

export async function patchLeadStatus(req: Request, res: Response): Promise<void> {
  const body = z
    .object({
      status: statusSchema.optional(),
      pipelineStage: z.string().optional(),
    })
    .refine((d) => d.status ?? d.pipelineStage, { message: "status or pipelineStage required" })
    .safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body", details: body.error.flatten() });
    return;
  }

  const id = routeParam(req.params.id);
  const result = body.data.pipelineStage
    ? await sales.updateLeadPipelineStage(id, body.data.pipelineStage)
    : await sales.updateLeadStatus(id, body.data.status!);

  if (!result) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }
  res.json({ lead: result });
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
