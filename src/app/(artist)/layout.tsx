import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Providers from "@/components/layout/Providers";
import { LayoutDashboard, Image, ShoppingBag, MessageSquare, User } from "lucide-react";

const navItems = [
  { href: "/artist/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/artist/artworks", label: "My Artworks", icon: Image },
  { href: "/artist/orders", label: "Sales", icon: ShoppingBag },
  { href: "/artist/messages", label: "Messages", icon: MessageSquare },
  { href: "/artist/profile", label: "Profile", icon: User },
];

export default async function ArtistLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user.role !== "ARTIST" && session.user.role !== "ADMIN")) {
    redirect("/login");
  }

  return (
    <Providers>
      <div className="flex min-h-screen">
        <aside className="w-56 shrink-0 border-r bg-muted/40 px-4 py-6 hidden md:flex flex-col gap-1">
          <Link href="/" className="mb-6 text-lg font-bold px-2">Ato&apos;s Art</Link>
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </aside>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </Providers>
  );
}
