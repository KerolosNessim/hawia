import type { SolutionSingleItem } from "../types";

function isStepLike(x: unknown): boolean {
  if (typeof x !== "object" || x === null) return false;
  const c = (x as Record<string, unknown>).content;
  return typeof c === "object" && c !== null && ("title" in c || "description" in c);
}

/**
 * `/v1/help-you` may return `data` as a bare array or as an object with nested lists
 * (e.g. `{ singles: [...] }`, `{ help_you: [...] }`). Coerce to a safe array for UI mapping.
 */
export function normalizeHelpYouSteps(data: unknown): SolutionSingleItem[] {
  if (data == null) return [];
  if (Array.isArray(data)) {
    return data.length === 0 || isStepLike(data[0]) ? (data as SolutionSingleItem[]) : [];
  }

  if (typeof data === "object") {
    const o = data as Record<string, unknown>;
    const keys = [
      "items",
      "singles",
      "help_you",
      "helpYou",
      "helpYouItems",
      "list",
      "steps",
      "records",
      "rows",
    ] as const;
    for (const key of keys) {
      const v = o[key];
      if (Array.isArray(v) && (v.length === 0 || isStepLike(v[0]))) {
        return v as SolutionSingleItem[];
      }
    }
    for (const v of Object.values(o)) {
      if (Array.isArray(v) && v.length > 0 && isStepLike(v[0])) {
        return v as SolutionSingleItem[];
      }
    }
  }

  return [];
}
