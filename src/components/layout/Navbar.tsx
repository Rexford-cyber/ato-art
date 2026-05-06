"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBag, Menu, User, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCartStore } from "@/store/cartStore";
import CartDrawer from "@/components/cart/CartDrawer";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const totalItems = useCartStore((s) => s.totalItems)();
  const [cartOpen, setCartOpen] = useState(false);
  const [bumpKey, setBumpKey] = useState(0);

  useEffect(() => {
    if (totalItems === 0) return;
    setBumpKey((k) => k + 1);
  }, [totalItems]);

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="font-display text-[19px] font-semibold tracking-tight text-ink">
            Ato&rsquo;s Art
          </Link>

          <div className="hidden items-center gap-7 text-[13.5px] md:flex">
            <Link href="/artworks" className="text-ink-muted transition-colors duration-[180ms] hover:text-ink">
              Browse
            </Link>
            <Link href="/artists" className="text-ink-muted transition-colors duration-[180ms] hover:text-ink">
              Artists
            </Link>
            {!session && (
              <Link href="/register/artist" className="text-ink-muted transition-colors duration-[180ms] hover:text-ink">
                Sell your work
              </Link>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Cart, ${totalItems} item${totalItems === 1 ? "" : "s"}`}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded text-ink-muted transition-[transform,background-color,color] duration-[180ms] hover:bg-muted hover:text-ink active:scale-[0.94]"
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.6} />
              {totalItems > 0 && (
                <span
                  key={bumpKey}
                  className="absolute -right-0.5 -top-0.5 inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-medium leading-none text-primary-foreground [animation:cart-bump_320ms_cubic-bezier(0.16,1,0.3,1)_both]"
                >
                  {totalItems}
                </span>
              )}
            </button>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image ?? undefined} />
                    <AvatarFallback className="bg-muted text-[11px] text-ink-muted">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1.5 text-[13px] font-medium text-ink">{session.user.name}</div>
                  <div className="px-2 pb-2 text-[11.5px] text-ink-soft">{session.user.email}</div>
                  <DropdownMenuSeparator />
                  {(session.user.role === "ARTIST" || session.user.role === "ADMIN") && (
                    <DropdownMenuItem render={<Link href="/artist/dashboard" />}>
                      <LayoutDashboard className="mr-2 h-4 w-4" strokeWidth={1.6} />
                      Artist dashboard
                    </DropdownMenuItem>
                  )}
                  {session.user.role === "ADMIN" && (
                    <DropdownMenuItem render={<Link href="/admin/dashboard" />}>
                      <Shield className="mr-2 h-4 w-4" strokeWidth={1.6} />
                      Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem render={<Link href="/buyer/orders" />}>
                    <User className="mr-2 h-4 w-4" strokeWidth={1.6} />
                    My orders
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => signOut({ callbackUrl: "/" })}>
                    <LogOut className="mr-2 h-4 w-4" strokeWidth={1.6} />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-1 md:flex">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Join</Link>
                </Button>
              </div>
            )}

            <Sheet>
              <SheetTrigger
                render={
                  <button
                    aria-label="Open menu"
                    className="inline-flex h-9 w-9 items-center justify-center rounded text-ink-muted transition-colors duration-[180ms] hover:bg-muted hover:text-ink active:scale-[0.94] md:hidden"
                  />
                }
              >
                <Menu className="h-[18px] w-[18px]" strokeWidth={1.6} />
              </SheetTrigger>
              <SheetContent side="right" className="w-72 sm:w-80">
                <div className="flex flex-col gap-1 px-2 pt-8">
                  <Link href="/artworks" className="rounded px-3 py-2.5 text-[15px] font-medium text-ink hover:bg-muted">
                    Browse
                  </Link>
                  <Link href="/artists" className="rounded px-3 py-2.5 text-[15px] font-medium text-ink hover:bg-muted">
                    Artists
                  </Link>
                  {!session && (
                    <>
                      <Link href="/register/artist" className="rounded px-3 py-2.5 text-[15px] font-medium text-ink hover:bg-muted">
                        Sell your work
                      </Link>
                      <div className="my-2 h-px bg-border" />
                      <Link href="/login" className="rounded px-3 py-2.5 text-[15px] font-medium text-ink hover:bg-muted">
                        Sign in
                      </Link>
                      <Button asChild className="mt-2 mx-2">
                        <Link href="/register">Join</Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <style jsx global>{`
        @keyframes cart-bump {
          0% { transform: scale(0.6); opacity: 0; }
          55% { transform: scale(1.18); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
