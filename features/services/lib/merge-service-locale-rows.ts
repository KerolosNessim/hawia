import { plainTextFromServiceHtml } from "./service-display-title";

/** Prefer primary locale HTML; if empty, use the other locale's title HTML. */
export function mergeServiceTitleFields(
  primary: Record<string, unknown>,
  fallback?: Record<string, unknown>,
): Record<string, unknown> {
  const title = pickRichField(primary.title, fallback?.title);
  const subtitle = pickRichField(primary.subtitle, fallback?.subtitle);
  const description = pickRichField(primary.description, fallback?.description);
  const highlight_description = pickRichField(
    primary.highlight_description,
    fallback?.highlight_description,
  );
  const meta_title = pickRichField(primary.meta_title, fallback?.meta_title);
  const meta_description = pickRichField(
    primary.meta_description,
    fallback?.meta_description,
  );

  return {
    ...primary,
    title,
    subtitle,
    description,
    highlight_description,
    meta_title,
    meta_description,
  };
}

function pickRichField(primary: unknown, fallback: unknown): unknown {
  const primaryHtml = typeof primary === "string" ? primary : "";
  if (plainTextFromServiceHtml(primaryHtml)) return primary;

  const fallbackHtml = typeof fallback === "string" ? fallback : "";
  if (plainTextFromServiceHtml(fallbackHtml)) return fallback;

  return primary ?? fallback ?? "";
}

export function mergeServiceListsByLocale(
  activeRows: unknown[],
  otherRows: unknown[],
): Record<string, unknown>[] {
  const otherById = new Map<number, Record<string, unknown>>();
  for (const row of otherRows) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const id = Number(r.id);
    if (Number.isFinite(id)) otherById.set(id, r);
  }

  return activeRows
    .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
    .map((row) => {
      const id = Number(row.id);
      const other = Number.isFinite(id) ? otherById.get(id) : undefined;
      return mergeServiceTitleFields(row, other);
    });
}
