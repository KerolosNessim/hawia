import { redirect } from "@/i18n/navigation";

/** Navigate to the branded 404 route (avoids `not-found.tsx` streaming on every page). */
export function redirectToNotFound(): never {
  redirect({ href: "/404" });
}
