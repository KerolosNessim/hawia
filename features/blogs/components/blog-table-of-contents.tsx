"use client";

import {
  extractTocTitle,
  parseTocEntries,
  type TocEntry,
} from "@/features/blogs/lib/parse-toc-entries";
import { cn } from "@/lib/utils";
import { useCallback, useMemo } from "react";

type BlogTableOfContentsProps = {
  html: string;
  className?: string;
};

const SCROLL_OFFSET_PX = 96;

function scrollToAnchor(hash: string) {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  if (!id) return;

  const target = document.getElementById(id);
  if (!target) return;

  const top = target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET_PX;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  window.history.replaceState(null, "", `#${encodeURIComponent(id)}`);
}

function TocLink({ entry }: { entry: TocEntry }) {
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      scrollToAnchor(entry.href);
    },
    [entry.href],
  );

  return (
    <li
      className={cn(
        "my-1",
        entry.level > 1 && "list-none",
        entry.level === 2 && "ps-4",
        entry.level === 3 && "ps-8",
        entry.level >= 4 && "ps-10",
      )}
    >
      <a
        href={entry.href}
        onClick={onClick}
        className="inline-block py-0.5 font-semibold text-brand underline-offset-2 transition-colors hover:text-brand/80 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {entry.label}
      </a>
    </li>
  );
}

/** Renders CMS table-of-contents as clickable in-page anchor links. */
export function BlogTableOfContents({ html, className }: BlogTableOfContentsProps) {
  const trimmed = html.trim();
  const entries = useMemo(() => parseTocEntries(trimmed), [trimmed]);
  const title = useMemo(() => extractTocTitle(trimmed), [trimmed]);

  if (!entries.length) return null;

  return (
    <nav
      aria-label={title ?? "Table of contents"}
      className={cn(
        "editor-toc cms-toc rounded-xl border border-neutral-200 bg-neutral-50 p-4",
        className,
      )}
    >
      {title ? (
        <p className="mb-2 font-bold text-gray-900">
          <strong>{title}</strong>
        </p>
      ) : null}
      <ul className="mt-2 list-disc space-y-0 ps-6 marker:text-brand">
        {entries.map((entry) => (
          <TocLink key={`${entry.href}-${entry.label}`} entry={entry} />
        ))}
      </ul>
    </nav>
  );
}
