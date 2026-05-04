export const MediumType = {
  OIL: "OIL",
  ACRYLIC: "ACRYLIC",
  WATERCOLOR: "WATERCOLOR",
  DIGITAL: "DIGITAL",
  PENCIL: "PENCIL",
  CHARCOAL: "CHARCOAL",
  INK: "INK",
  MIXED_MEDIA: "MIXED_MEDIA",
  PHOTOGRAPHY: "PHOTOGRAPHY",
  SCULPTURE: "SCULPTURE",
  TEXTILE: "TEXTILE",
  OTHER: "OTHER",
} as const;
export type MediumType = (typeof MediumType)[keyof typeof MediumType];

export const StyleType = {
  ABSTRACT: "ABSTRACT",
  REALISM: "REALISM",
  PORTRAIT: "PORTRAIT",
  LANDSCAPE: "LANDSCAPE",
  STILL_LIFE: "STILL_LIFE",
  SURREALISM: "SURREALISM",
  EXPRESSIONISM: "EXPRESSIONISM",
  CONTEMPORARY: "CONTEMPORARY",
  TRADITIONAL: "TRADITIONAL",
  POP_ART: "POP_ART",
  OTHER: "OTHER",
} as const;
export type StyleType = (typeof StyleType)[keyof typeof StyleType];

export const ArtworkStatus = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SOLD: "SOLD",
  ARCHIVED: "ARCHIVED",
} as const;
export type ArtworkStatus = (typeof ArtworkStatus)[keyof typeof ArtworkStatus];

export const Role = {
  BUYER: "BUYER",
  ARTIST: "ARTIST",
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof Role)[keyof typeof Role];
