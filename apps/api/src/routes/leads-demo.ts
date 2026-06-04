import type { Request, Response } from "express";
import { processDemoLead } from "@columbusai/leads";
import { applyRateLimitPreset } from "../lib/rateLimit.js";

export async function postLeadsDemo(req: Request, res: Response): Promise<void> {
  if (!(await applyRateLimitPreset(req, res, "leadsDemo"))) return;

  const requestId = (req as Request & { id?: string }).id;

  let body: Record<string, unknown>;
  try {
    body =
      req.body && typeof req.body === "object" && !Array.isArray(req.body)
        ? (req.body as Record<string, unknown>)
        : {};
  } catch {
    res.status(400).json({
      ok: false,
      errors: { _form: "Invalid JSON" },
    });
    return;
  }

  const result = await processDemoLead(body, {
    requestId,
    log: (event, data) => {
      console.info(JSON.stringify({ message: event, ...data }));
    },
  });

  if (!result.ok) {
    const status = result.errors._form ? 500 : 400;
    if (status === 500) {
      console.error(
        JSON.stringify({
          message: "lead_api_error",
          request_id: requestId,
        })
      );
    }
    res.status(status).json(result);
    return;
  }

  res.status(200).json({ ok: true, id: result.id });
}
