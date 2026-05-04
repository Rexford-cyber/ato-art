import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";

const ALLOWED_FOLDERS = ["artworks", "avatars", "banners"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const folder = body.folder as string;

  const baseFolder = folder?.split("/")[0];
  if (!ALLOWED_FOLDERS.includes(baseFolder)) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = {
    timestamp,
    folder: `atos-art/${folder}`,
    eager: "w_1200,q_auto,f_webp|w_600,q_auto,f_webp|w_300,q_auto,f_webp",
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: paramsToSign.folder,
    eager: paramsToSign.eager,
  });
}
