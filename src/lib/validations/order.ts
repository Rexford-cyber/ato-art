import { z } from "zod";

export const shippingSchema = z.object({
  shippingName: z.string().min(2).max(100),
  shippingEmail: z.string().email(),
  shippingPhone: z.string().max(20).optional(),
  shippingAddress: z.string().min(5).max(300),
  shippingCity: z.string().min(2).max(100),
  shippingCountry: z.string().length(2),
  buyerNote: z.string().max(500).optional(),
});

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      artworkId: z.string().cuid(),
      quantity: z.number().int().positive().default(1),
    })
  ).min(1),
  ...shippingSchema.shape,
});

export type ShippingInput = z.infer<typeof shippingSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
