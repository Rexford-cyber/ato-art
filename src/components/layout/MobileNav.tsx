"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Image, ShoppingBag, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/artist/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/artist/artworks", label: "Artworks", icon: Image },
  { href: "/artist/orders", label: "Sales", icon: ShoppingBag },
  { href: "/artist/messages", label: "Messages", icon: MessageSquare },
];

export default function MobileBottomNav() {
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
