import type { Request, Response } from "express";
import { routeParam } from "../../lib/route-params.js";
import { z } from "zod";
import * as sales from "../../lib/sales/repository.js";
import { isValidStackTemplateId, STACK_TEMPLATES } from "../../lib/onboarding/stack-templates.js";
import type { RequestWithAuth } from "../../middleware/requireSession.js";

export async function getSalesClients(_req: RequestWithAuth, res: Response): Promise<void> {
  const clients = await sales.listSalesClients();
  res.json({ clients });
}

export async function getSalesClient(req: RequestWithAuth, res: Response): Promise<void> {
  const client = await sales.getSalesClientById(routeParam(req.params.id));
  if (!client) {
    res.status(404).json({ error: "Sales client not found" });
    return;
  }
  res.json({ client });
}

export async function getStackTemplates(_req: RequestWithAuth, res: Response): Promise<void> {
  res.json({ templates: STACK_TEMPLATES });
}

export async function postRetryProvision(req: RequestWithAuth, res: Response): Promise<void> {
  const parsed = z
    .object({ stackTemplateId: z.string().min(1).optional() })
    .safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const stackTemplateId =
    parsed.data.stackTemplateId && isValidStackTemplateId(parsed.data.stackTemplateId)
      ? parsed.data.stackTemplateId
      : undefined;

  try {
    const result = await sales.retrySalesClientProvision(routeParam(req.params.id), {
      stackTemplateId,
      actorUserId: req.auth?.user.id,
    });
    if (!result) {
      res.status(404).json({ error: "Sales client not found" });
      return;
    }
    res.json(result);
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "AGENCY_EMAIL_CONFLICT") {
      res.status(409).json({
        error: e instanceof Error ? e.message : "Email belongs to an agency account",
        code: "AGENCY_EMAIL_CONFLICT",
      });
      return;
    }
    throw e;
  }
}
