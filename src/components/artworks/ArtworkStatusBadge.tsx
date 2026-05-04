import { Badge } from "@/components/ui/badge";
import type { ArtworkStatus } from "@/constants/enums";

const config: Record<ArtworkStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT:    { label: "Draft",          variant: "outline" },
  PENDING:  { label: "Pending Review", variant: "secondary" },
  APPROVED: { label: "Approved",       variant: "default" },
  REJECTED: { label: "Rejected",       variant: "destructive" },
  SOLD:     { label: "Sold",           variant: "secondary" },
  ARCHIVED: { label: "Archived",       variant: "outline" },
};

export default function ArtworkStatusBadge({ status }: { status: ArtworkStatus }) {
  const { label, variant } = config[status] ?? { label: status, variant: "outline" };
  return <Badge variant={variant}>{label}</Badge>;
}
