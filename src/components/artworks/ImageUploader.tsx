"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus, X, Loader2 } from "lucide-react";
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
  // Kept for backward compatibility with the upload page. Not used anymore;
  // the API route reads the artist id from the session.
  artistId?: string;
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxFiles?: number;
}

const ACCEPTED = "image/jpeg,image/png,image/webp,image/avif,image/gif";

export default function ImageUploader({
  value,
  onChange,
  maxFiles = 8,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const upload = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;

      const remaining = maxFiles - value.length;
      if (list.length > remaining) {
        toast.error(`You can add ${remaining} more (max ${maxFiles}).`);
        return;
      }

      setUploading(true);
      const uploaded: UploadedImage[] = [];

      try {
        for (const file of list) {
          const form = new FormData();
          form.append("file", file);

          const res = await fetch("/api/upload", { method: "POST", body: form });
          const json = await res.json().catch(() => ({}));

          if (!res.ok) {
            toast.error(json.error ?? `Upload failed: ${file.name}`);
            continue;
          }
          uploaded.push(json as UploadedImage);
        }
      } catch (err) {
        console.error(err);
        toast.error("Upload failed. Check your connection and try again.");
      } finally {
        setUploading(false);
      }

      if (uploaded.length > 0) {
        onChange([...value, ...uploaded]);
      }
      if (inputRef.current) inputRef.current.value = "";
    },
    [maxFiles, value, onChange]
  );

  function remove(publicId: string) {
    onChange(value.filter((img) => img.publicId !== publicId));
  }

  const atLimit = value.length >= maxFiles;
  const remaining = maxFiles - value.length;

  return (
    <div className="space-y-3">
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          if (!atLimit) setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (atLimit || uploading) return;
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            upload(e.dataTransfer.files);
          }
        }}
        onClick={() => {
          if (!atLimit && !uploading) inputRef.current?.click();
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !atLimit && !uploading) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`flex flex-col items-center justify-center rounded-md border border-dashed px-6 py-10 text-center transition-colors duration-[180ms] ${
          atLimit || uploading
            ? "cursor-not-allowed border-border bg-muted/40 opacity-60"
            : dragOver
            ? "cursor-pointer border-accent bg-accent-soft"
            : "cursor-pointer border-border bg-surface hover:border-ink-muted/40"
        }`}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-ink-soft" strokeWidth={1.6} />
        ) : (
          <Plus className="h-6 w-6 text-ink-soft" strokeWidth={1.6} />
        )}
        <p className="mt-3 text-[14px] font-medium text-ink">
          {uploading
            ? "Uploading..."
            : atLimit
            ? `You've reached the ${maxFiles} image limit`
            : dragOver
            ? "Drop to upload"
            : "Drop images, or click to choose"}
        </p>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
          JPG / PNG / WebP / AVIF / GIF, up to 8 MB each
        </p>
        {!atLimit && !uploading && (
          <p className="mt-1 text-[11.5px] text-ink-soft">
            {remaining} more allowed
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        className="sr-only"
        onChange={(e) => {
          if (e.target.files) upload(e.target.files);
        }}
      />

      {value.length > 0 && (
        <ul className="grid grid-cols-4 gap-2">
          {value.map((img, i) => (
            <li
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
                <span className="absolute bottom-1 left-1 rounded-sm bg-ink/85 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-background">
                  Primary
                </span>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove image"
                className="absolute right-1 top-1 h-7 w-7 rounded-full bg-background/85 text-ink opacity-0 backdrop-blur transition-opacity duration-[180ms] hover:bg-background group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(img.publicId);
                }}
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.8} />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
