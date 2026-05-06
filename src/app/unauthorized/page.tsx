import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <ShieldX className="h-7 w-7 text-brick" strokeWidth={1.4} />
      </div>
      <div>
        <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-soft">
          Error 403
        </p>
        <h1 className="font-display mt-3 text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold leading-[1.06] tracking-[-0.018em] text-ink">
          Access denied.
        </h1>
        <p className="mt-3 max-w-[40ch] text-[14.5px] text-ink-muted">
          You don&apos;t have permission to view this page.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
