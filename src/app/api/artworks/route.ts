import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { artworkSchema } from "@/lib/validations/artwork";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { ArtworkStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Math.min(Number(searchParams.get("limit") ?? 24), 48);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { status: ArtworkStatus.APPROVED };

  const category = searchParams.get("category");
  if (category) where.category = { slug: category };

  const medium = searchParams.get("medium");
  if (medium) where.medium = medium;

  const style = searchParams.get("style");
  if (style) where.style = style;

  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  if (minPrice || maxPrice) {
    where.price = {
      ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
      ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
    };
  }

  const q = searchParams.get("q");
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { tags: { some: { tag: { contains: q, mode: "insensitive" } } } },
    ];
    delete where.status;
    (where as Record<string, unknown>).status = ArtworkStatus.APPROVED;
  }

  const [artworks, total] = await Promise.all([
    prisma.artwork.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        artist: { select: { name: true, username: true, avatarUrl: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.artwork.count({ where }),
  ]);

  return NextResponse.json({
    artworks,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user.role !== "ARTIST" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = artworkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { images, tags, ...data } = parsed.data;
  const id = crypto.randomUUID().slice(0, 8);
  const slug = generateUniqueSlug(data.title, id);

  const submit = body.submit === true;

  const artwork = await prisma.artwork.create({
    data: {
      ...data,
      slug,
      artistId: session.user.id,
      status: submit ? "PENDING" : "DRAFT",
      submittedAt: submit ? new Date() : null,
      images: {
        create: images.map((img, i) => ({
          ...img,
          isPrimary: i === 0,
          sortOrder: i,
        })),
      },
      tags: {
        create: tags.map((tag) => ({ tag: tag.toLowerCase() })),
      },
    },
    include: { images: true },
  });

  return NextResponse.json(artwork, { status: 201 });
}
