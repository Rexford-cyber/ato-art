"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, Menu, User, LogOut, LayoutDashboard, Shield } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import CartDrawer from "@/components/cart/CartDrawer";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const totalItems = useCartStore((s) => s.totalItems)();
  const [cartOpen, setCartOpen] = useState(false);

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold tracking-tight">
            Ato&apos;s Art
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-6 text-sm md:flex">
            <Link href="/artworks" className="text-muted-foreground hover:text-foreground transition-colors">
              Browse
            </Link>
            <Link href="/artists" className="text-muted-foreground hover:text-foreground transition-colors">
              Artists
            </Link>
            {!session && (
              <Link href="/register/artist" className="text-muted-foreground hover:text-foreground transition-colors">
                Sell Art
              </Link>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-xs">
                  {totalItems}
                </Badge>
              )}
            </Button>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="relative rounded-full focus-visible:ring-2 focus-visible:ring-ring outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image ?? undefined} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium">{session.user.name}</div>
                  <div className="px-2 pb-1.5 text-xs text-muted-foreground">{session.user.email}</div>
                  <DropdownMenuSeparator />
                  {(session.user.role === "ARTIST" || session.user.role === "ADMIN") && (
                    <DropdownMenuItem render={<Link href="/artist/dashboard" />}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Artist Dashboard
                    </DropdownMenuItem>
                  )}
                  {session.user.role === "ADMIN" && (
                    <DropdownMenuItem render={<Link href="/admin/dashboard" />}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem render={<Link href="/buyer/orders" />}>
                    <User className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Get started</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger render={<button className="inline-flex items-center justify-center rounded-md p-2 text-sm hover:bg-muted md:hidden" />}>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 pt-6">
                  <Link href="/artworks" className="text-sm font-medium">Browse Art</Link>
                  <Link href="/artists" className="text-sm font-medium">Artists</Link>
                  {!session && (
                    <>
                      <Link href="/register/artist" className="text-sm font-medium">Sell Art</Link>
                      <Link href="/login" className="text-sm font-medium">Sign in</Link>
                      <Button asChild><Link href="/register">Get started</Link></Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
