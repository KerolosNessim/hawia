import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import type { SettingsData } from "@/features/settings/types";
import type { Locale } from "next-intl";
import {
  logoId,
  organizationId,
  schemaOrigin,
  servicesCatalogId,
  websiteId,
} from "./ids";
import { absoluteUrlFromPath, schemaMediaUrl } from "./urls";
import type { JsonLd } from "./types";

const ORGANIZATION_NAME = "هُوِيَّة للحلول الرقمية | Howeyah";
const ORGANIZATION_ALT = ["هُوِيَّة", "Howeyah"];
const WEBSITE_NAME = "Howeyah | هُوِيَّة";

const DEFAULT_KNOWS_ABOUT = [
  "Search Engine Optimization",
  "Google Ads",
  "Meta Ads",
  "Social Media Marketing",
  "Brand Identity Design",
  "Web Development",
  "Content Marketing",
];

const DAY_MAP: Record<string, string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  الأحد: "Sunday",
  الاثنين: "Monday",
  الثلاثاء: "Tuesday",
  الأربعاء: "Wednesday",
  الخميس: "Thursday",
  الجمعة: "Friday",
  السبت: "Saturday",
};

function mapDayOfWeek(day: string): string | undefined {
  const key = day.trim().toLowerCase();
  return DAY_MAP[key] ?? DAY_MAP[day.trim()];
}

function openingHoursFromSettings(settings: SettingsData): JsonLd[] | undefined {
  const wh = settings.working_hours;
  if (!wh?.show_on_site) return undefined;
  const opens = wh.from_hour?.trim();
  const closes = wh.to_hour?.trim();
  if (!opens || !closes) return undefined;

  const fromDay = mapDayOfWeek(wh.from_day ?? "");
  const toDay = mapDayOfWeek(wh.to_day ?? "");
  const days: string[] = [];
  if (fromDay && toDay) {
    const order = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const start = order.indexOf(fromDay);
    const end = order.indexOf(toDay);
    if (start >= 0 && end >= 0) {
      for (let i = start; ; i = (i + 1) % 7) {
        days.push(order[i]!);
        if (i === end) break;
      }
    } else {
      days.push(fromDay);
      if (toDay !== fromDay) days.push(toDay);
    }
  }

  if (!days.length) return undefined;

  return [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days,
      opens,
      closes,
    },
  ];
}

function postalAddressFromSettings(settings: SettingsData, locale: Locale): JsonLd | undefined {
  const raw =
    locale === "ar"
      ? settings.contact.address_ar?.trim()
      : settings.contact.address_en?.trim();
  if (!raw) return undefined;
  return {
    "@type": "PostalAddress",
    streetAddress: raw,
    addressCountry: "EG",
  };
}

function contactPointsFromSettings(settings: SettingsData): JsonLd[] {
  const points: JsonLd[] = [];
  for (const phone of settings.contact.phones ?? []) {
    const number = phone.number?.trim();
    if (!number) continue;
    points.push({
      "@type": "ContactPoint",
      telephone: number,
      contactType: phone.type === "whatsapp" ? "customer support" : "customer service",
      availableLanguage: ["Arabic", "English"],
    });
  }
  return points;
}

export type GlobalSchemaInput = {
  settings: SettingsData;
  locale: Locale;
  organizationDescription: string;
  websiteDescription: string;
  origin?: string;
};

export function buildGlobalSchemaGraph(input: GlobalSchemaInput): JsonLd[] {
  const origin = schemaOrigin(input.origin);
  const orgId = organizationId(origin);
  const siteId = websiteId(origin);
  const logo = schemaMediaUrl(resolveMediaUrl(input.settings.general.logo), origin)
    ?? absoluteUrlFromPath("/logo.webp", origin);

  const primaryPhone = input.settings.contact.phones?.find((p) => p.type === "phone")?.number
    ?? input.settings.contact.phones?.[0]?.number;

  const sameAs = (input.settings.social_media ?? [])
    .map((s) => s.link?.trim())
    .filter((link): link is string => Boolean(link));

  const organization: JsonLd = {
    "@type": ["ProfessionalService", "Organization"],
    "@id": orgId,
    name: input.settings.general.site_name?.trim() || ORGANIZATION_NAME,
    alternateName: ORGANIZATION_ALT,
    url: origin,
    knowsLanguage: ["ar", "en"],
    logo: {
      "@type": "ImageObject",
      "@id": logoId(origin),
      url: logo,
      contentUrl: logo,
      caption: WEBSITE_NAME,
      width: "512",
      height: "512",
    },
    image: { "@id": logoId(origin) },
    description: input.organizationDescription,
    foundingDate: "2018-01-01",
    founder: {
      "@type": "Person",
      name: "Mahmoud Qaneeta",
      jobTitle: "CEO",
    },
    email: input.settings.contact.email?.trim() || undefined,
    knowsAbout: DEFAULT_KNOWS_ABOUT,
    sameAs: sameAs.length ? sameAs : undefined,
    contactPoint: contactPointsFromSettings(input.settings).length
      ? contactPointsFromSettings(input.settings)
      : undefined,
  };

  if (primaryPhone) organization.telephone = primaryPhone;
  const address = postalAddressFromSettings(input.settings, input.locale);
  if (address) organization.address = address;

  const hours = openingHoursFromSettings(input.settings);
  if (hours) organization.openingHoursSpecification = hours;

  const website: JsonLd = {
    "@type": "WebSite",
    "@id": siteId,
    url: origin,
    name: input.settings.general.site_name?.trim() || WEBSITE_NAME,
    description: input.websiteDescription,
    publisher: { "@id": orgId },
    inLanguage: input.locale === "ar" ? "ar" : "en",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${origin}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return [organization, website];
}

export function buildOfferCatalogFromServices(
  services: { name: string; url: string }[],
  origin?: string,
): JsonLd {
  return {
    "@type": "OfferCatalog",
    "@id": servicesCatalogId(origin),
    name: "خدمات هوية",
    itemListElement: services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.name,
        url: service.url,
      },
    })),
  };
}
