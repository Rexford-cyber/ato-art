"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Image, Users, ShoppingBag } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/artworks", label: "Queue", icon: Image },
  { href: "/admin/artists", label: "Artists", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
];

export default function AdminMobileNav() {
  const pathname = usePathname();
  const items = navItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80 md:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10.5px] transition-colors duration-[180ms] ${
              active ? "text-ink" : "text-ink-soft hover:text-ink-muted"
            }`}
          >
            <Icon
              className={`h-5 w-5 transition-colors duration-[180ms] ${
                active ? "text-accent" : "text-ink-soft"
              }`}
              strokeWidth={active ? 2 : 1.6}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
