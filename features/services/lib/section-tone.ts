import { cn } from "@/lib/utils";

export type SectionTone = "dark" | "light";
export type ServicePageSurface = "default" | "ai-services";

export function sectionToneAt(index: number): SectionTone {
  return index % 2 === 0 ? "dark" : "light";
}

/** AI services page starts with a white section, then alternates dark/light. */
export function sectionToneAtForAiServices(index: number): SectionTone {
  return index % 2 === 0 ? "light" : "dark";
}

export function resolveSectionTone(
  index: number,
  surface: ServicePageSurface = "default",
): SectionTone {
  if (surface === "ai-services") return sectionToneAtForAiServices(index);
  return sectionToneAt(index);
}

export function sectionShellClassName(
  tone: SectionTone,
  surface: ServicePageSurface = "default",
): string {
  if (surface === "ai-services") {
    return tone === "dark"
      ? cn(
          "relative w-full background-dark-img-section py-16 text-white md:py-20",
        )
      : cn(
          "relative w-full finger-print-background bg-white py-16 text-gray-900 md:py-20",
        );
  }

  if (tone === "dark") {
    return cn(
      "relative w-full background-dark-img py-16 text-white md:py-20",
    );
  }

  return cn("w-full bg-white py-16 text-gray-900 md:py-20");
}

export function sectionSubtitleColor(tone: SectionTone): string {
  return tone === "dark" ? "text-gray-300" : "text-muted-foreground";
}

export {
  sectionHeaderProps,
  sectionHeaderSubtitleColor,
  sectionHeaderTitleColor,
} from "@/features/shared/lib/section-header-tone";

export function sectionItemCardClassName(tone: SectionTone): string {
  return tone === "dark"
    ? "rounded-xl border border-brand bg-gray-800/80 p-4 text-white"
    : "rounded-xl border-2 border-brand bg-white p-6 text-gray-900 shadow-sm";
}

export function sectionSplitItemCardClassName(tone: SectionTone): string {
  return tone === "dark"
    ? "rounded-2xl bg-gray-800/70 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    : "rounded-2xl border border-gray-200 bg-white p-5 text-gray-900 shadow-sm";
}
