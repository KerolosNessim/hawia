import { pickServiceSlug, servicePostPath } from "@/features/services/lib/services-routes";
import type { Service } from "@/features/services/types";

const SERVICES_DETAIL_RE = /^\/services\/([^/?#]+)$/;

function decodeSlug(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function serviceSlugVariants(
  service: Pick<Service, "slug"> & { slug_local?: { ar?: string; en?: string } },
): string[] {
  return [service.slug, service.slug_local?.ar, service.slug_local?.en]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => decodeSlug(value.trim()));
}

function findServiceBySlug(services: Service[], slugInUrl: string): Service | undefined {
  const decoded = decodeSlug(slugInUrl);
  return services.find((service) => serviceSlugVariants(service).includes(decoded));
}

/** Maps the current pathname to the equivalent path in `nextLocale` when slugs differ per language. */
export function resolveLocalizedPathname(
  pathname: string,
  nextLocale: string,
  options?: { services?: Service[] },
): string {
  const servicesMatch = pathname.match(SERVICES_DETAIL_RE);
  if (servicesMatch && options?.services?.length) {
    const service = findServiceBySlug(options.services, servicesMatch[1]);
    if (service) {
      const nextSlug = pickServiceSlug(service, nextLocale);
      if (nextSlug) return servicePostPath(nextSlug);
    }
  }

  return pathname;
}
