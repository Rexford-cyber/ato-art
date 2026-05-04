import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Providers from "@/components/layout/Providers";
import { LayoutDashboard, Image, Users, ShoppingBag, Shield } from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/artworks", label: "Moderation Queue", icon: Image },
  { href: "/admin/artists", label: "Artists", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/unauthorized");

  return (
    <Providers>
      <div className="flex min-h-screen">
        <aside className="w-56 shrink-0 border-r bg-muted/40 px-4 py-6 hidden md:flex flex-col gap-1">
          <div className="mb-6 flex items-center gap-2 px-2">
            <Shield className="h-5 w-5" />
            <span className="text-lg font-bold">Admin</span>
          </div>
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
