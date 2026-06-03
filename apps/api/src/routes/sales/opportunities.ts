import type { Request, Response } from "express";
import { SalesOpportunityStage } from "@columbusai/db";
import { routeParam } from "../../lib/route-params.js";
import { z } from "zod";
import * as sales from "../../lib/sales/repository.js";
import { isValidStackTemplateId } from "../../lib/onboarding/stack-templates.js";
import type { RequestWithAuth } from "../../middleware/requireSession.js";

const stageSchema = z.enum(SalesOpportunityStage);

export async function getOpportunities(_req: Request, res: Response): Promise<void> {
  const opportunities = await sales.listOpportunities();
  res.json({ opportunities });
}

export async function getOpportunity(req: Request, res: Response): Promise<void> {
  const opportunity = await sales.getOpportunityById(routeParam(req.params.id));
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
    res.status(400).json({ error: "Invalid body", details: z.flattenError(body.error) });
    return;
  }
  const stage = body.data.stage ?? body.data.pipelineStage;
  const opportunity = await sales.updateOpportunity(routeParam(req.params.id), {
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

const convertBodySchema = z.object({
  stackTemplateId: z.string().min(1).optional(),
});

export async function postConvertOpportunity(req: RequestWithAuth, res: Response): Promise<void> {
  const parsed = convertBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: z.flattenError(parsed.error) });
    return;
  }
  const stackTemplateId =
    parsed.data.stackTemplateId && isValidStackTemplateId(parsed.data.stackTemplateId)
      ? parsed.data.stackTemplateId
      : undefined;

  const result = await sales.convertOpportunityToClient(routeParam(req.params.id), {
    stackTemplateId,
    actorUserId: req.auth?.user.id,
  });
  if (!result) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }
  res.status(result.alreadyProvisioned ? 200 : 201).json(result);
}
