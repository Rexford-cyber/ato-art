import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const newConversationSchema = z.object({
  recipientId: z.string().cuid(),
  initialMessage: z.string().min(1).max(2000),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type NewConversationInput = z.infer<typeof newConversationSchema>;
