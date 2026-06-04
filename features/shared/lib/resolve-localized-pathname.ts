import {
  jobOpeningMatchesSegment,
  jobOpeningPath,
  pickJobOpeningSlug,
} from "@/features/careers/lib/job-slug";
import type { JobOpening } from "@/features/careers/types/jobs";
import { pickServiceSlug, servicePostPath } from "@/features/services/lib/services-routes";
import type { Service } from "@/features/services/types";
import { decodePathSegment } from "@/features/shared/lib/decode-path-segment";

const SERVICES_DETAIL_RE = /^\/services\/([^/?#]+)$/;
const CAREERS_DETAIL_RE = /^\/careers\/([^/?#]+)$/;

function serviceSlugVariants(
  service: Pick<Service, "slug"> & { slug_local?: { ar?: string; en?: string } },
): string[] {
  return [service.slug, service.slug_local?.ar, service.slug_local?.en]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => decodePathSegment(value.trim()));
}

function findServiceBySlug(services: Service[], slugInUrl: string): Service | undefined {
  const decoded = decodePathSegment(slugInUrl);
  return services.find((service) => serviceSlugVariants(service).includes(decoded));
}

function findJobOpeningBySlug(openings: JobOpening[], slugInUrl: string): JobOpening | undefined {
  const decoded = decodePathSegment(slugInUrl);
  return openings.find((opening) => jobOpeningMatchesSegment(opening, decoded));
}

/** Maps the current pathname to the equivalent path in `nextLocale` when slugs differ per language. */
export function resolveLocalizedPathname(
  pathname: string,
  nextLocale: string,
  options?: { services?: Service[]; jobOpenings?: JobOpening[] },
): string {
  const servicesMatch = pathname.match(SERVICES_DETAIL_RE);
  if (servicesMatch && options?.services?.length) {
    const service = findServiceBySlug(options.services, servicesMatch[1]);
    if (service) {
      const nextSlug = pickServiceSlug(service, nextLocale);
      if (nextSlug) return servicePostPath(nextSlug);
    }
  }

  const careersMatch = pathname.match(CAREERS_DETAIL_RE);
  if (careersMatch && options?.jobOpenings?.length) {
    const opening = findJobOpeningBySlug(options.jobOpenings, careersMatch[1]);
    if (opening) {
      const nextSlug = pickJobOpeningSlug(opening, nextLocale);
      if (nextSlug) return jobOpeningPath(nextSlug);
    }
  }

  return pathname;
}
