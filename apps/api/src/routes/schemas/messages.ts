import { z } from "zod";

const uuidSchema = z.string().uuid();

export const postMessagesBodySchema = z.object({
  conversationId: uuidSchema.optional(),
  content: z.string().min(1),
  role: z.literal("user").optional(),
});

export const getMessagesQuerySchema = z.object({
  conversationId: uuidSchema,
});

export type PostMessagesBody = z.infer<typeof postMessagesBodySchema>;
export type GetMessagesQuery = z.infer<typeof getMessagesQuerySchema>;
