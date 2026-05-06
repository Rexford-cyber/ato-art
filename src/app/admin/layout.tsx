import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Providers from "@/components/layout/Providers";
import MobileBottomNav from "@/components/layout/MobileNav";
import { LayoutDashboard, Image, Users, ShoppingBag, Shield, ArrowUpRight } from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/artworks", label: "Queue", icon: Image },
  { href: "/admin/artists", label: "Artists", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/unauthorized");

  return (
    <Providers>
      <div className="flex min-h-screen bg-background">
        {/* Desktop sidebar */}
        <aside className="hidden w-52 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 md:flex">
          <div className="mb-8 flex items-center gap-2 px-2">
            <Shield className="h-4 w-4 text-ink-soft" strokeWidth={1.6} />
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              Admin
            </span>
          </div>

          <nav className="flex flex-col gap-0.5">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-2.5 rounded px-2 py-2 text-[13.5px] text-ink-muted transition-colors duration-[180ms] hover:bg-muted hover:text-ink"
              >
                <Icon
                  className="h-4 w-4 shrink-0 text-ink-soft transition-colors duration-[180ms] group-hover:text-ink-muted"
                  strokeWidth={1.6}
                />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t border-border pt-4">
            <Link
              href="/"
              className="flex items-center gap-1 px-2 py-1.5 text-[12.5px] text-ink-soft transition-colors hover:text-ink"
            >
              Back to store
              <ArrowUpRight className="h-3 w-3" strokeWidth={1.6} />
            </Link>
          </div>
        </aside>

        {/* Mobile top header */}
        <div className="fixed left-0 right-0 top-0 z-30 flex items-center border-b border-border bg-surface/90 px-4 py-3 backdrop-blur md:hidden">
          <Shield className="h-4 w-4 text-ink-soft" strokeWidth={1.6} />
          <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">
            Admin
          </span>
        </div>

        {/* Mobile bottom nav */}
        <MobileBottomNav items={navItems} />

        <main className="flex-1 overflow-y-auto px-4 py-8 pt-20 pb-24 sm:px-6 md:px-8 md:pt-8 md:pb-8">
          {children}
        </main>
      </div>
    </Providers>
  );
}
