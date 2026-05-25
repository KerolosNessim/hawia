"use client";

import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";

type Props = {
  link?: string | null;
  children: ReactNode;
  className?: string;
};

export function SectionLinkShell({ link, children, className }: Props) {
  const href = link?.trim();
  if (!href) {
    return className ? <div className={className}>{children}</div> : <>{children}</>;
  }

  const external = /^https?:\/\//i.test(href);

  if (external) {
    return (
      <a
        href={href}
        className={className ?? "block"}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  const path = href.startsWith("/") ? href : `/${href}`;

  return (
    <Link href={path} className={className ?? "block"}>
      {children}
    </Link>
  );
}
