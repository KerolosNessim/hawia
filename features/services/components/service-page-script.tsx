"use client";

import { useEffect, useRef } from "react";

type Props = {
  scriptHtml: string;
};

/**
 * Runs admin-provided HTML/JS on the single service page only.
 * Trusted CMS content — injected once per navigation.
 */
export default function ServicePageScript({ scriptHtml }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    const trimmed = scriptHtml.trim();
    if (!trimmed || ranRef.current) return;
    ranRef.current = true;

    const host = containerRef.current;
    if (!host) return;

    host.innerHTML = trimmed;

    const scripts = host.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const next = document.createElement("script");
      for (const attr of oldScript.attributes) {
        next.setAttribute(attr.name, attr.value);
      }
      if (oldScript.textContent) {
        next.textContent = oldScript.textContent;
      }
      oldScript.replaceWith(next);
    });
  }, [scriptHtml]);

  if (!scriptHtml.trim()) return null;

  return <div ref={containerRef} className="hidden" aria-hidden data-service-page-script />;
}
