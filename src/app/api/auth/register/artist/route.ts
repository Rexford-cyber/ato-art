import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, artistProfileSchema } from "@/lib/validations/user";

const artistRegisterSchema = registerSchema.merge(
  artistProfileSchema.pick({ displayName: true, tagline: true })
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = artistRegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });
  }

  const { name, email, password, username, displayName, tagline } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    const field = existing.email === email ? "Email" : "Username";
    return NextResponse.json({ error: `${field} already in use` }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      username,
      passwordHash,
      role: "ARTIST",
      artistProfile: {
        create: { displayName, tagline },
      },
    },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
