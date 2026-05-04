import { z } from "zod";
import { MediumType, StyleType } from "@/constants/enums";

export const artworkSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  price: z.coerce.number().positive().max(1_000_000),
  currency: z.enum(["GHS", "NGN", "USD"]).default("GHS"),
  categoryId: z.string().min(1),
  medium: z.enum(Object.values(MediumType) as [string, ...string[]]),
  style: z.enum(Object.values(StyleType) as [string, ...string[]]),
  width: z.coerce.number().positive().optional(),
  height: z.coerce.number().positive().optional(),
  year: z.coerce.number().int().min(1800).max(new Date().getFullYear()).optional(),
  isOriginal: z.boolean().default(true),
  stockCount: z.coerce.number().int().positive().default(1),
  isDigital: z.boolean().default(false),
  tags: z.array(z.string().min(1).max(30)).max(10).default([]),
  images: z.array(
    z.object({
      url: z.string().url(),
      publicId: z.string(),
      width: z.number(),
      height: z.number(),
      format: z.string(),
      bytes: z.number(),
      isPrimary: z.boolean().default(false),
      altText: z.string().optional(),
    })
  ).min(1).max(8),
});

export const artworkStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "ARCHIVED"]),
  moderationNote: z.string().max(1000).optional(),
}).refine(
  (data) => data.status !== "REJECTED" || (data.moderationNote && data.moderationNote.trim().length > 0),
  { message: "A reason is required when rejecting artwork", path: ["moderationNote"] }
);

export type ArtworkInput = z.infer<typeof artworkSchema>;
export type ArtworkStatusInput = z.infer<typeof artworkStatusSchema>;
