import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_-]+$/, "Only lowercase letters, numbers, - and _ allowed"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const artistProfileSchema = z.object({
  displayName: z.string().min(2).max(100),
  tagline: z.string().max(200).optional(),
  bio: z.string().max(1000).optional(),
  phone: z
    .string()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(/^[+0-9 ()\-]+$/, "Use digits, spaces, +, -, ( and ) only"),
  website: z.string().url().optional().or(z.literal("")),
  instagramHandle: z.string().max(50).optional(),
  twitterHandle: z.string().max(50).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ArtistProfileInput = z.infer<typeof artistProfileSchema>;
