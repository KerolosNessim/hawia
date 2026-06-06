export type PublicBlogTag = {
  label: string;
  index: boolean;
  follow: boolean;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function parseBool(v: unknown, fallback: boolean): boolean {
  if (v === true || v === 1 || v === "1") return true;
  if (v === false || v === 0 || v === "0") return false;
  return fallback;
}

function hasExplicitFollowField(rec: Record<string, unknown>): boolean {
  return (
    rec.follow !== undefined ||
    rec.is_followable !== undefined ||
    rec.allow_follow !== undefined
  );
}

/** Resolves index/follow from API tag objects (legacy `is_searchable`, `no_index`, or explicit flags). */
export function parseTagIndexAndFollow(rec: Record<string, unknown>): {
  index: boolean;
  follow: boolean;
} {
  if (rec.is_searchable !== undefined) {
    const searchable = parseBool(rec.is_searchable, true);
    return { index: searchable, follow: searchable };
  }

  const noIndex = rec.no_index ?? rec.noindex ?? rec.is_noindex;
  let index: boolean;
  if (noIndex === true || noIndex === 1 || noIndex === "1") {
    index = false;
  } else if (rec.allow_indexing === false || rec.indexable === false) {
    index = false;
  } else {
    index = parseBool(rec.index ?? rec.is_indexable ?? rec.allow_index, true);
  }

  if (hasExplicitFollowField(rec)) {
    return {
      index,
      follow: parseBool(rec.follow ?? rec.is_followable ?? rec.allow_follow, true),
    };
  }

  // API often omits `follow` when indexing is disabled — default to nofollow, not follow.
  return { index, follow: index };
}

/** Normalizes API tag entries (string legacy or `{ name, index, follow }`). */
export function normalizePublicBlogTag(raw: unknown): PublicBlogTag | null {
  if (typeof raw === "string") {
    const label = raw.trim();
    if (!label) return null;
    return { label, index: true, follow: true };
  }

  const rec = asRecord(raw);
  if (!rec) return null;

  const label = String(rec.name ?? rec.label ?? rec.tag ?? "").trim();
  if (!label) return null;

  const { index, follow } = parseTagIndexAndFollow(rec);
  return { label, index, follow };
}

export function normalizePublicBlogTags(raw: unknown): PublicBlogTag[] {
  if (raw == null) return [];
  if (typeof raw === "string") {
    return raw
      .split(/[,،]/)
      .map((s) => normalizePublicBlogTag(s.trim()))
      .filter((t): t is PublicBlogTag => t != null);
  }
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizePublicBlogTag(item)).filter((t): t is PublicBlogTag => t != null);
}

export type PublicBlogTagMeta = PublicBlogTag;

export function tagRobotsFromMeta(tag: Pick<PublicBlogTag, "index" | "follow">): {
  index: boolean;
  follow: boolean;
  googleBot?: { index: boolean; follow: boolean };
} {
  if (tag.index && tag.follow) {
    return { index: true, follow: true };
  }
  return {
    index: tag.index,
    follow: tag.follow,
    googleBot: { index: tag.index, follow: tag.follow },
  };
}

function extractTagRecordFromPayload(raw: unknown): Record<string, unknown> | null {
  const root = asRecord(raw);
  if (!root) return null;
  const direct = asRecord(root.tag);
  if (direct) return direct;
  const data = asRecord(root.data);
  if (data) {
    const nested = asRecord(data.tag);
    if (nested) return nested;
  }
  return null;
}

/** Reads tag SEO meta from list/show API envelopes once backend adds `tag` on filtered responses. */
export function parseTagMetaFromApiPayload(
  raw: unknown,
  fallbackLabel: string,
): PublicBlogTagMeta {
  const rec = extractTagRecordFromPayload(raw);
  const fromRec = rec ? normalizePublicBlogTag(rec) : null;
  if (fromRec) return fromRec;
  return { label: fallbackLabel, index: true, follow: true };
}
