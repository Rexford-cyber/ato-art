import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/40 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <p className="text-lg font-bold">Ato&apos;s Art</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Africa&apos;s marketplace for original artwork.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Discover</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/artworks" className="hover:text-foreground">Browse Art</Link></li>
              <li><Link href="/artists" className="hover:text-foreground">Artists</Link></li>
              <li><Link href="/artworks?style=ABSTRACT" className="hover:text-foreground">Abstract</Link></li>
              <li><Link href="/artworks?style=PORTRAIT" className="hover:text-foreground">Portraits</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Sell</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/register/artist" className="hover:text-foreground">Become an Artist</Link></li>
              <li><Link href="/artist/dashboard" className="hover:text-foreground">Artist Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">About</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Ato&apos;s Art. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
