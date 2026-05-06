import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-12">
          <div className="col-span-2 md:col-span-5">
            <p className="font-display text-[22px] font-semibold tracking-tight text-ink">
              Ato&rsquo;s Art
            </p>
            <p className="mt-3 max-w-[36ch] text-[14px] leading-relaxed text-ink-muted">
              Original work, made by named African artists, sold directly. We do not
              take ownership of the pieces; we set the table.
            </p>
          </div>

          <div className="hidden md:col-span-1 md:block" />

          <div className="col-span-1 md:col-span-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-soft">Browse</p>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              <FooterLink href="/artworks">All works</FooterLink>
              <FooterLink href="/artists">Artists</FooterLink>
              <FooterLink href="/artworks?style=ABSTRACT">Abstract</FooterLink>
              <FooterLink href="/artworks?style=PORTRAIT">Portrait</FooterLink>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-soft">Artists</p>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              <FooterLink href="/register/artist">Apply to sell</FooterLink>
              <FooterLink href="/artist/dashboard">Artist dashboard</FooterLink>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-soft">House</p>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="/privacy">Privacy</FooterLink>
              <FooterLink href="/terms">Terms</FooterLink>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-[12px] text-ink-soft sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} Ato&rsquo;s Art. Accra and elsewhere.</p>
          <p className="font-mono text-[11px] tracking-wide">made on the continent</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-ink-muted transition-colors duration-[180ms] hover:text-ink">
        {children}
      </Link>
    </li>
  );
}
