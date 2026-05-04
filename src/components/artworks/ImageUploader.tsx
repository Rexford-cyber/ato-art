"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
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
  artistId: string;
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxFiles?: number;
}

export default function ImageUploader({
  artistId,
  value,
  onChange,
  maxFiles = 8,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(
    async (files: File[]) => {
      if (value.length + files.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} images allowed`);
        return;
      }

      setUploading(true);
      try {
        const signRes = await fetch("/api/upload/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: `artworks/${artistId}` }),
        });
        if (!signRes.ok) throw new Error("Failed to get upload signature");
        const { signature, timestamp, cloudName, apiKey, folder, eager } = await signRes.json();

        const uploaded: UploadedImage[] = [];
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("api_key", apiKey);
          formData.append("signature", signature);
          formData.append("timestamp", String(timestamp));
          formData.append("folder", folder);
          formData.append("eager", eager);

          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: "POST", body: formData }
          );
          if (!res.ok) throw new Error("Upload failed");
          const data = await res.json();
          uploaded.push({
            url: data.secure_url,
            publicId: data.public_id,
            width: data.width,
            height: data.height,
            format: data.format,
            bytes: data.bytes,
          });
        }
        onChange([...value, ...uploaded]);
      } catch (err) {
        toast.error("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [value, onChange, artistId, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxSize: 20 * 1024 * 1024,
    onDrop: upload,
    disabled: uploading || value.length >= maxFiles,
  });

  function remove(publicId: string) {
    onChange(value.filter((img) => img.publicId !== publicId));
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        } ${value.length >= maxFiles || uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground" />
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          {uploading
            ? "Uploading…"
            : isDragActive
            ? "Drop images here"
            : "Drag & drop or click to upload"}
        </p>
        <p className="text-xs text-muted-foreground">JPG, PNG, WebP up to 20MB</p>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {value.map((img, i) => (
            <div key={img.publicId} className="group relative aspect-square overflow-hidden rounded-md bg-muted">
              <Image src={img.url} alt={`Upload ${i + 1}`} fill className="object-cover" sizes="120px" />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-xs text-white">
                  Primary
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(img.publicId)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
