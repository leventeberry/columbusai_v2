import { z } from "zod";

const uuidSchema = z.string().uuid();

export const postChatBodySchema = z.object({
  conversationId: uuidSchema.optional(),
  message: z.string().min(1),
  stream: z.boolean().optional(),
});

export type PostChatBody = z.infer<typeof postChatBodySchema>;
