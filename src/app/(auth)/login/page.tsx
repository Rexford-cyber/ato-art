"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validations/user";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setLoading(true);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      toast.error("Invalid email or password");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div>
      <p className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-ink-soft">Sign in</p>
      <h1 className="font-display mt-3 text-[34px] font-semibold leading-[1.08] tracking-[-0.018em] text-ink">
        Welcome back.
      </h1>
      <p className="mt-3 text-[14.5px] text-ink-muted">
        Enter your email and password to continue.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-9 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[12.5px] text-ink-muted">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" className="h-11" {...register("email")} />
          {errors.email && <p className="text-[12px] text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-[12.5px] text-ink-muted">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" className="h-11" {...register("password")} />
          {errors.password && <p className="text-[12px] text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-10 text-[13.5px] text-ink-muted">
        New here?{" "}
        <Link href="/register" className="text-ink underline decoration-1 underline-offset-[3px] decoration-ink-soft transition-colors hover:decoration-accent">
          Create an account
        </Link>
        , or{" "}
        <Link href="/register/artist" className="text-ink underline decoration-1 underline-offset-[3px] decoration-ink-soft transition-colors hover:decoration-accent">
          apply to sell
        </Link>
        .
      </p>
    </div>
  );
}
