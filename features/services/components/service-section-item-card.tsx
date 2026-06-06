"use client";

import { SectionLinkShell } from "@/features/services/components/section-link-shell";
import { resolveSectionCardIcon } from "@/features/services/lib/section-card-icons";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  link?: string | null;
  icon?: string | null;
  children: ReactNode;
  className?: string;
};

export function ServiceSectionItemCard({ link, icon, children, className }: Props) {
  const Icon = resolveSectionCardIcon(icon);
  const href = link?.trim();

  const inner = (
    <div
      className={cn(
        "flex h-full flex-col space-y-4",
        href && "cursor-pointer",
        className,
      )}
    >
      {Icon ? (
        <Icon
          className="size-10 shrink-0 text-brand transition-colors group-hover:text-white"
          aria-hidden
        />
      ) : null}
      {children}
    </div>
  );

  return <SectionLinkShell link={href}>{inner}</SectionLinkShell>;
}
