import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { notifyUnsubscribeWebhook } from "../unsubscribe/notifyUnsubscribeWebhook.server";

export const processUnsubscribe = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string() }))
  .handler(async ({ data }) => {
    await notifyUnsubscribeWebhook(data.token);
    return { ok: true };
  });
