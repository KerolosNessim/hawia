"use client";

import { setLenisInstance, NAVBAR_SCROLL_OFFSET } from "@/lib/lenis/scroll";
import Lenis from "lenis";
import { useEffect } from "react";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.08,
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
      syncTouch: true,
      syncTouchLerp: 0.075,
      anchors: {
        offset: -NAVBAR_SCROLL_OFFSET,
      },
      prevent: (node) => Boolean(node.closest("[data-lenis-prevent]")),
    });

    setLenisInstance(lenis);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => {
      if (motionQuery.matches) {
        lenis.destroy();
        setLenisInstance(null);
      }
    };
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      motionQuery.removeEventListener("change", onMotionChange);
      lenis.destroy();
      setLenisInstance(null);
    };
  }, []);

  return children;
}
