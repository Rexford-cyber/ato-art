"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

interface ImageUploaderProps {
  // artistId is no longer needed but kept for backwards compatibility
  // with the call site so we don't have to touch the upload page.
  artistId?: string;
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxFiles?: number;
}

function isLikelyImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function formatFromUrl(url: string): string {
  const match = url.match(/\.(jpe?g|png|webp|gif|avif|svg)(\?|$)/i);
  return match ? match[1].toLowerCase().replace("jpeg", "jpg") : "url";
}

export default function ImageUploader({
  value,
  onChange,
  maxFiles = 8,
}: ImageUploaderProps) {
  const [draft, setDraft] = useState("");

  function addUrl() {
    const url = draft.trim();
    if (!url) return;
    if (!isLikelyImageUrl(url)) {
      toast.error("Please paste a valid http(s) image URL");
      return;
    }
    if (value.length >= maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }
    if (value.some((img) => img.url === url)) {
      toast.error("That image is already added");
      return;
    }

    const next: UploadedImage = {
      url,
      // We don't have a CDN public id without an upload step, so we use
      // the URL itself as a stable unique identifier.
      publicId: url,
      width: 0,
      height: 0,
      format: formatFromUrl(url),
      bytes: 0,
    };
    onChange([...value, next]);
    setDraft("");
  }

  function remove(publicId: string) {
    onChange(value.filter((img) => img.publicId !== publicId));
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="url"
          inputMode="url"
          placeholder="Paste image URL — https://..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
          disabled={value.length >= maxFiles}
        />
        <Button
          type="button"
          onClick={addUrl}
          disabled={!draft.trim() || value.length >= maxFiles}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Host your image somewhere (Imgur, Postimage, your own site) and paste the direct link.
        First image is used as the primary display.
      </p>

      {value.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {value.map((img, i) => (
            <div
              key={img.publicId}
              className="group relative aspect-square overflow-hidden rounded-md bg-muted"
            >
              <Image
                src={img.url}
                alt={`Image ${i + 1}`}
                fill
                className="object-cover"
                sizes="120px"
                unoptimized
              />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-xs text-white">
                  Primary
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(img.publicId)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 text-center text-muted-foreground">
          <ImageIcon className="h-8 w-8" />
          <p className="mt-2 text-sm">No images yet</p>
          <p className="text-xs">Add at least one image link to continue</p>
        </div>
      )}
    </div>
  );
}
