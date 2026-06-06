import { cn } from "@/lib/utils";

export type SectionTone = "dark" | "light";

export function sectionToneAt(index: number): SectionTone {
  return index % 2 === 0 ? "dark" : "light";
}

export function sectionShellClassName(tone: SectionTone): string {
  return cn(
    "w-full py-16 md:py-20",
    tone === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900",
  );
}

export function sectionSubtitleColor(tone: SectionTone): string {
  return tone === "dark" ? "text-gray-300" : "text-muted-foreground";
}

export function sectionItemCardClassName(tone: SectionTone): string {
  return tone === "dark"
    ? "rounded-xl border border-brand bg-gray-800/80 p-4 text-white"
    : "rounded-xl border-2 border-brand bg-white p-6 text-gray-900 shadow-sm";
}
