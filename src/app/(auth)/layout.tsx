import Link from "next/link";
import Providers from "@/components/layout/Providers";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-[100dvh] bg-background">
        <header className="px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="font-display text-[18px] font-semibold tracking-tight text-ink">
            Ato&rsquo;s Art
          </Link>
        </header>
        <main className="mx-auto flex w-full max-w-md flex-col px-4 pt-8 pb-16 sm:px-6 sm:pt-16">
          {children}
        </main>
      </div>
    </Providers>
  );
}
