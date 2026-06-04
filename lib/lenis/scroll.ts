import type Lenis from "lenis";

/** Fixed navbar offset — matches `scroll-mt-24` on in-page anchors. */
export const NAVBAR_SCROLL_OFFSET = 96;

let lenisInstance: Lenis | null = null;

export function setLenisInstance(instance: Lenis | null) {
  lenisInstance = instance;
}

export function getLenisInstance() {
  return lenisInstance;
}

export function scrollToElement(
  target: HTMLElement,
  options?: { offset?: number; immediate?: boolean },
) {
  const offset = options?.offset ?? -NAVBAR_SCROLL_OFFSET;

  if (lenisInstance) {
    lenisInstance.scrollTo(target, {
      offset,
      immediate: options?.immediate,
    });
    return;
  }

  const top =
    target.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: options?.immediate ? "auto" : "smooth",
  });
}

export function scrollToHash(
  hash: string,
  options?: { offset?: number; immediate?: boolean },
) {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  if (!id) return;

  const target = document.getElementById(id);
  if (!target) return;

  scrollToElement(target, options);
  window.history.replaceState(null, "", `#${encodeURIComponent(id)}`);
}
