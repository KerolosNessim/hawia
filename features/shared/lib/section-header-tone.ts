import { cn } from "@/lib/utils";

export type SectionHeaderTone = "dark" | "light";

export function sectionHeaderSubtitleColor(tone: SectionHeaderTone): string {
  return tone === "dark" ? "text-gray-300" : "text-muted-foreground";
}

export function sectionHeaderTitleColor(tone: SectionHeaderTone): string {
  return tone === "dark" ? "text-white" : "text-gray-900";
}

export function sectionHeaderProps(tone: SectionHeaderTone) {
  return {
    align: "start" as const,
    tone,
    titleColor: sectionHeaderTitleColor(tone),
    subtitleColor: sectionHeaderSubtitleColor(tone),
  };
}

/** Neutralizes CMS inline `color` / `text-align` on section titles and subtitles. */
export function sectionHeaderRichClass(
  tone: SectionHeaderTone,
  align: "center" | "start",
): string {
  return cn(
    "[&_*]:!text-inherit [&_p]:mb-2 [&_p:last-child]:mb-0 [&_a]:!text-brand [&_strong]:!font-bold",
    tone === "dark" && "[&_strong]:!text-white",
    align === "center" ? "[&_*]:!text-center" : "[&_*]:!text-start",
  );
}
