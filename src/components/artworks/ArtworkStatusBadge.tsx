import type { ArtworkStatus } from "@/constants/enums";

const config: Record<ArtworkStatus, { label: string; className: string }> = {
  DRAFT:    { label: "Draft",          className: "border-border text-ink-soft bg-transparent" },
  PENDING:  { label: "Pending review", className: "border-ochre/50 text-ochre bg-ochre/8" },
  APPROVED: { label: "Approved",       className: "border-moss/40 text-moss bg-moss/8" },
  REJECTED: { label: "Rejected",       className: "border-brick/40 text-brick bg-brick/8" },
  SOLD:     { label: "Sold",           className: "border-ink-soft/40 text-ink-soft bg-muted/50" },
  ARCHIVED: { label: "Archived",       className: "border-border text-ink-soft bg-transparent" },
};

export default function ArtworkStatusBadge({ status }: { status: ArtworkStatus }) {
  const { label, className } = config[status] ?? { label: status, className: "border-border text-ink-soft" };
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${className}`}
    >
      {label}
    </span>
  );
}
