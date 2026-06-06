import {
  BadgeDollarSign,
  CodeXml,
  FileImage,
  Megaphone,
  MonitorPlay,
  Search,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";

export const SECTION_CARD_ICON_OPTIONS = [
  { value: "search", Icon: Search },
  { value: "megaphone", Icon: Megaphone },
  { value: "users", Icon: Users },
  { value: "store", Icon: Store },
  { value: "file-image", Icon: FileImage },
  { value: "monitor-play", Icon: MonitorPlay },
  { value: "code-xml", Icon: CodeXml },
  { value: "badge-dollar-sign", Icon: BadgeDollarSign },
] as const;

export type SectionCardIconKey = (typeof SECTION_CARD_ICON_OPTIONS)[number]["value"];

export function resolveSectionCardIcon(
  key: string | null | undefined,
): LucideIcon | null {
  const normalized = key?.trim().toLowerCase();
  if (!normalized) return null;
  return SECTION_CARD_ICON_OPTIONS.find((o) => o.value === normalized)?.Icon ?? null;
}
