"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, artistProfileSchema } from "@/lib/validations/user";

const artistRegisterSchema = registerSchema.merge(
  artistProfileSchema.pick({ displayName: true, tagline: true, phone: true })
);
type ArtistRegisterInput = z.infer<typeof artistRegisterSchema>;

export default function ArtistRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ArtistRegisterInput>({ resolver: zodResolver(artistRegisterSchema) });

  async function onSubmit(data: ArtistRegisterInput) {
    setLoading(true);
    const res = await fetch("/api/auth/register/artist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(json.error ?? "Registration failed");
      return;
    }

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    router.push("/artist/dashboard");
    router.refresh();
  }

  return (
    <div>
      <p className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-ink-soft">For artists</p>
      <h1 className="font-display mt-3 text-[34px] font-semibold leading-[1.08] tracking-[-0.018em] text-ink">
        Apply to <em className="text-accent">sell</em>.
      </h1>
      <p className="mt-3 max-w-[42ch] text-[14.5px] text-ink-muted">
        Tell us a little about your practice. We review applications within five working days.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-9 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-[12.5px] text-ink-muted">Full name</Label>
            <Input id="name" placeholder="Ato Mensah" className="h-11" autoComplete="name" {...register("name")} />
            {errors.name && <p className="text-[12px] text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-[12.5px] text-ink-muted">Username</Label>
            <Input id="username" placeholder="ato_art" className="h-11" autoComplete="username" {...register("username")} />
            {errors.username && <p className="text-[12px] text-destructive">{errors.username.message}</p>}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="displayName" className="text-[12.5px] text-ink-muted">Artist or studio name</Label>
          <Input id="displayName" placeholder="Ato Art Studio" className="h-11" {...register("displayName")} />
          {errors.displayName && <p className="text-[12px] text-destructive">{errors.displayName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tagline" className="text-[12.5px] text-ink-muted">
            Tagline <span className="text-ink-soft">(optional)</span>
          </Label>
          <Input id="tagline" placeholder="Abstract painter, Accra" className="h-11" {...register("tagline")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-[12.5px] text-ink-muted">
            Phone number for buyers
          </Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            placeholder="+233 24 123 4567"
            autoComplete="tel"
            className="h-11"
            {...register("phone")}
          />
          {errors.phone && <p className="text-[12px] text-destructive">{errors.phone.message}</p>}
          <p className="text-[11.5px] text-ink-soft">
            Shown on your public profile so buyers can reach you. Use a number you actually answer.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[12.5px] text-ink-muted">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" className="h-11" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-[12px] text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-[12.5px] text-ink-muted">Password</Label>
          <Input id="password" type="password" className="h-11" autoComplete="new-password" {...register("password")} />
          {errors.password && <p className="text-[12px] text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : "Submit application"}
        </Button>
        <p className="text-[12px] text-ink-soft">
          By submitting, you agree to our terms. We will email you within five working days.
        </p>
      </form>

      <p className="mt-10 text-[13.5px] text-ink-muted">
        Already in?{" "}
        <Link href="/login" className="text-ink underline decoration-1 underline-offset-[3px] decoration-ink-soft transition-colors hover:decoration-accent">
          Sign in
        </Link>
        .
      </p>
    </div>
  );
}
