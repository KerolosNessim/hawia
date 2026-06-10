"use client";

import { useEffect } from "react";

const RELOAD_KEY = "chunk_reload";

function isChunkLoadError(reason: unknown): boolean {
  if (!reason) return false;
  const message =
    reason instanceof Error
      ? reason.message
      : typeof reason === "string"
        ? reason
        : "";
  return /ChunkLoadError|Loading chunk [\w-]+ failed/i.test(message);
}

/**
 * After a dev-server restart or deploy, the browser may still reference old
 * Turbopack chunk hashes. One hard reload usually fixes it.
 */
export default function ChunkLoadRecovery() {
  useEffect(() => {
    const reloadOnce = () => {
      if (sessionStorage.getItem(RELOAD_KEY) === "1") return;
      sessionStorage.setItem(RELOAD_KEY, "1");
      window.location.reload();
    };

    const onError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error ?? event.message)) {
        reloadOnce();
      }
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) {
        reloadOnce();
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
