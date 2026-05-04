"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploader, { type UploadedImage } from "@/components/artworks/ImageUploader";
import { artworkSchema, type ArtworkInput } from "@/lib/validations/artwork";
import { MediumType, StyleType } from "@prisma/client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function UploadArtworkPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { data: categoriesData } = useSWR("/api/categories", fetcher);
  const categories = categoriesData ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ArtworkInput>({
    resolver: zodResolver(artworkSchema),
    defaultValues: { currency: "GHS", isOriginal: true, isDigital: false, stockCount: 1, tags: [] },
  });

  async function save(data: ArtworkInput, submit: boolean) {
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    submit ? setSubmitting(true) : setSaving(true);
    const payload = { ...data, images, submit };

    const res = await fetch("/api/artworks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    submit ? setSubmitting(false) : setSaving(false);

    if (!res.ok) {
      toast.error(json.error ?? "Failed to save artwork");
      return;
    }

    toast.success(submit ? "Artwork submitted for review!" : "Draft saved");
    router.push("/artist/artworks");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Upload Artwork</h1>

      <form className="space-y-5">
        <div className="space-y-1">
          <Label>Images <span className="text-destructive">*</span></Label>
          <ImageUploader
            artistId={session?.user?.id ?? ""}
            value={images}
            onChange={setImages}
          />
          {images.length === 0 && (
            <p className="text-xs text-muted-foreground">First image will be the primary display image</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
          <Input id="title" {...register("title")} placeholder="The Red River" />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
          <Textarea id="description" {...register("description")} rows={4} placeholder="Describe your artwork…" />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="price">Price <span className="text-destructive">*</span></Label>
            <Input id="price" type="number" step="0.01" {...register("price")} placeholder="150.00" />
            {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Currency</Label>
            <Select defaultValue="GHS" onValueChange={(v) => setValue("currency", v as "GHS")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="GHS">GHS</SelectItem>
                <SelectItem value="NGN">NGN</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Category <span className="text-destructive">*</span></Label>
            <Select onValueChange={(v) => setValue("categoryId", v)}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c: { id: string; name: string }) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Medium <span className="text-destructive">*</span></Label>
            <Select onValueChange={(v) => setValue("medium", v as MediumType)}>
              <SelectTrigger><SelectValue placeholder="Select medium" /></SelectTrigger>
              <SelectContent>
                {Object.values(MediumType).map((m) => (
                  <SelectItem key={m} value={m}>{m.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.medium && <p className="text-xs text-destructive">{errors.medium.message}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <Label>Style <span className="text-destructive">*</span></Label>
          <Select onValueChange={(v) => setValue("style", v as StyleType)}>
            <SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger>
            <SelectContent>
              {Object.values(StyleType).map((s) => (
                <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.style && <p className="text-xs text-destructive">{errors.style.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="width">Width (cm)</Label>
            <Input id="width" type="number" step="0.1" {...register("width")} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="height">Height (cm)</Label>
            <Input id="height" type="number" step="0.1" {...register("height")} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="year">Year</Label>
            <Input id="year" type="number" {...register("year")} placeholder={String(new Date().getFullYear())} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={handleSubmit((d) => save(d, false))}
          >
            {saving ? "Saving…" : "Save as Draft"}
          </Button>
          <Button
            type="button"
            disabled={submitting}
            onClick={handleSubmit((d) => save(d, true))}
          >
            {submitting ? "Submitting…" : "Submit for Review"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Submitted artworks will be reviewed by our team before going live.
        </p>
      </form>
    </div>
  );
}
