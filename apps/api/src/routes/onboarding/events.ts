import type { Response } from "express";
import { z } from "zod";
import type { RequestWithAuth } from "../../middleware/requireSession.js";

const eventSchema = z.object({
  event: z.string().min(1),
  salesClientId: z.string().uuid().optional(),
  portalClientId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/** Optional webhook receiver for n8n / external onboarding automations. */
export async function postOnboardingEvent(req: RequestWithAuth, res: Response): Promise<void> {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  console.info(
    JSON.stringify({
      level: "info",
      message: "onboarding_event_received",
      event: parsed.data.event,
      salesClientId: parsed.data.salesClientId,
      portalClientId: parsed.data.portalClientId,
      actorUserId: req.auth?.user.id,
    }),
  );

  res.status(202).json({ ok: true, received: parsed.data.event });
}
