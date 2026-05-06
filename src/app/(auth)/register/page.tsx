"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterInput } from "@/lib/validations/user";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterInput) {
    setLoading(true);
    const res = await fetch("/api/auth/register", {
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
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <p className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-ink-soft">Join</p>
      <h1 className="font-display mt-3 text-[34px] font-semibold leading-[1.08] tracking-[-0.018em] text-ink">
        Start collecting.
      </h1>
      <p className="mt-3 text-[14.5px] text-ink-muted">
        Buy original work directly from named artists across the continent.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-9 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-[12.5px] text-ink-muted">Full name</Label>
            <Input id="name" placeholder="Kofi Mensah" className="h-11" autoComplete="name" {...register("name")} />
            {errors.name && <p className="text-[12px] text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-[12.5px] text-ink-muted">Username</Label>
            <Input id="username" placeholder="kofi_art" className="h-11" autoComplete="username" {...register("username")} />
            {errors.username && <p className="text-[12px] text-destructive">{errors.username.message}</p>}
          </div>
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
          <p className="text-[11.5px] text-ink-soft">At least 8 characters.</p>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-10 text-[13.5px] text-ink-muted">
        Want to sell your work?{" "}
        <Link href="/register/artist" className="text-ink underline decoration-1 underline-offset-[3px] decoration-ink-soft transition-colors hover:decoration-accent">
          Apply as an artist
        </Link>
        . Already have an account?{" "}
        <Link href="/login" className="text-ink underline decoration-1 underline-offset-[3px] decoration-ink-soft transition-colors hover:decoration-accent">
          Sign in
        </Link>
        .
      </p>
    </div>
  );
}
