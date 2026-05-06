import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Providers from "@/components/layout/Providers";
import MobileBottomNav from "@/components/layout/MobileNav";
import { LayoutDashboard, Image, ShoppingBag, MessageSquare, ArrowUpRight } from "lucide-react";

const navItems = [
  { href: "/artist/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/artist/artworks", label: "Artworks", icon: Image },
  { href: "/artist/orders", label: "Sales", icon: ShoppingBag },
  { href: "/artist/messages", label: "Messages", icon: MessageSquare },
];


export default async function ArtistLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user.role !== "ARTIST" && session.user.role !== "ADMIN")) {
    redirect("/login");
  }

  return (
    <Providers>
      <div className="flex min-h-screen bg-background">
        {/* Desktop sidebar */}
        <aside className="hidden w-52 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 md:flex">
          <Link
            href="/"
            className="mb-8 flex items-center gap-1 px-2 font-display text-[17px] font-semibold tracking-tight text-ink transition-colors hover:text-accent"
          >
            Ato&apos;s Art
            <ArrowUpRight className="h-3.5 w-3.5 text-ink-soft" strokeWidth={1.6} />
          </Link>

          <p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
            Artist
          </p>

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
              href="/artworks"
              className="flex items-center gap-2 px-2 py-1.5 text-[12.5px] text-ink-soft transition-colors hover:text-ink"
            >
              Back to store
            </Link>
          </div>
        </aside>

        {/* Mobile: thin top header */}
        <div className="fixed left-0 right-0 top-0 z-30 flex items-center border-b border-border bg-surface/90 px-4 py-3 backdrop-blur md:hidden">
          <Link href="/" className="font-display text-[17px] font-semibold text-ink">
            Ato&apos;s Art
          </Link>
          <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
            / artist
          </span>
        </div>

        {/* Mobile bottom nav */}
        <MobileBottomNav />

        {/* Main */}
        <main className="flex-1 overflow-y-auto px-4 py-8 pt-20 pb-24 sm:px-6 md:px-8 md:pt-8 md:pb-8">
          {children}
        </main>
      </div>
    </Providers>
  );
}
