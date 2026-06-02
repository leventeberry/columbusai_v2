import type { Request, Response } from "express";
import { SalesOpportunityStage } from "@columbusai/db";
import { z } from "zod";
import * as sales from "../../lib/sales/repository.js";

const stageSchema = z.nativeEnum(SalesOpportunityStage);

export async function getOpportunities(_req: Request, res: Response): Promise<void> {
  const opportunities = await sales.listOpportunities();
  res.json({ opportunities });
}

export async function getOpportunity(req: Request, res: Response): Promise<void> {
  const opportunity = await sales.getOpportunityById(req.params.id);
  if (!opportunity) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }
  res.json({ opportunity });
}

export async function patchOpportunity(req: Request, res: Response): Promise<void> {
  const body = z
    .object({
      stage: stageSchema.optional(),
      pipelineStage: stageSchema.optional(),
      title: z.string().min(1).optional(),
      estimatedValue: z.number().int().nonnegative().optional(),
      closeDate: z.string().nullable().optional(),
      owner: z.string().nullable().optional(),
      notes: z.string().nullable().optional(),
    })
    .safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body", details: body.error.flatten() });
    return;
  }
  const stage = body.data.stage ?? body.data.pipelineStage;
  const opportunity = await sales.updateOpportunity(req.params.id, {
    stage,
    title: body.data.title,
    estimatedValue: body.data.estimatedValue,
    closeDate: body.data.closeDate ?? undefined,
    owner: body.data.owner ?? undefined,
    notes: body.data.notes ?? undefined,
  });
  if (!opportunity) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }
  res.json({ opportunity });
}

export async function postConvertOpportunity(req: Request, res: Response): Promise<void> {
  const client = await sales.convertOpportunityToClient(req.params.id);
  if (!client) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }
  res.status(201).json({ client });
}
