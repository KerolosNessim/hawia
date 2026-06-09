"use client";

import ContactForm from "@/features/contact/components/contact-form";
import { useContactCountryId } from "@/features/contact/hooks/use-contact-country-id";
import { useContactHeaders } from "@/features/contact/hooks/use-contact-headers";
import type { ContactHeader } from "@/features/contact/types";
import { useSettings } from "@/features/settings/hooks/use-settings";
import SectionHeader from "@/features/shared/components/section-header";
import { Clock, Mail, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { FaLocationDot } from "react-icons/fa6";

function ContactHeadersList({ headers }: { headers: ContactHeader[] }) {
  if (headers.length <= 1) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {headers.slice(1).map((header) => (
        <SectionHeader
          key={header.id}
          titleHtml={header.title}
          subtitleHtml={header.description}
          subtitleColor="text-gray-700"
          titleColor="text-gray-900"
        />
      ))}
    </div>
  );
}

export default function ContactSection({
  withLocation = false,
  countryId,
  showSectionHeader = true,
}: {
  withLocation?: boolean;
  countryId?: number;
  showSectionHeader?: boolean;
}) {
  const t = useTranslations("contactSection");
  const f = useTranslations("contact");
  const { data: settings } = useSettings();
  const resolvedCountryId = useContactCountryId(countryId);
  const { data: headers = [] } = useContactHeaders(resolvedCountryId);
  const primaryHeader = headers[0];

  const offices = settings?.offices || [];
  const phones = settings?.contact?.phones || [];
  const email = settings?.contact?.email || "info@howeyah.com";
  const workingHours = settings?.working_hours;

  return (
    <section className="bg-linear-to-t from-brand/50 to-transparent py-16">
      <div className="container space-y-8">
        {showSectionHeader ? (
          <SectionHeader
            title={primaryHeader?.title ? undefined : t("title")}
            titleHtml={primaryHeader?.title}
            subtitle={primaryHeader?.description ? undefined : t("subtitle")}
            subtitleHtml={primaryHeader?.description}
            subtitleColor="text-gray-700"
            titleColor="text-gray-900"
          />
        ) : null}

        <ContactHeadersList headers={headers} />

        <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl md:flex-row">
          <div className="relative flex flex-col justify-center overflow-hidden bg-gray-900 p-4 text-white md:w-5/12 md:p-8">
            <h3 className="relative z-10 mb-8 text-center text-2xl font-bold md:text-start">
              {t("stayConnected")}
            </h3>

            <div className="relative z-10 flex flex-col gap-2">
              <div className="rounded-2xl border border-brand p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Phone className="h-6 w-6 text-brand" />
                  <h4 className="text-lg font-bold">{t("phoneLabel")}</h4>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  {phones.map((phone, idx) => (
                    <p key={idx}>
                      {typeof phone === "string" ? phone : phone.number}
                    </p>
                  ))}
                  {phones.length === 0 && <p>(+966) 123 456 789</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-brand p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Mail className="h-6 w-6 text-brand" />
                  <h4 className="text-lg font-bold">{t("emailLabel")}</h4>
                </div>
                <div className="text-sm text-gray-300">
                  <p>{email}</p>
                </div>
              </div>

              {withLocation ? (
                <div className="rounded-2xl border border-brand p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <FaLocationDot className="h-6 w-6 text-brand" />
                    <h4 className="text-lg font-bold">{f("our_offices")}</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-300">
                    {offices.map((office, index) => (
                      <div key={index} className="space-y-1">
                        <p className="font-bold text-brand">{office.title}</p>
                        <p className="text-gray-300">
                          {office.address || (office as { location?: string }).location}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="rounded-2xl border border-brand p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-brand" />
                  <h4 className="text-lg font-bold">{t("workingHoursLabel")}</h4>
                </div>
                <div className="text-sm text-gray-300">
                  {workingHours ? (
                    <p>
                      {workingHours.from_day} - {workingHours.to_day}: {workingHours.from_hour} -{" "}
                      {workingHours.to_hour}
                    </p>
                  ) : (
                    <p>{t("workingHoursText")}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="relative bg-white p-4 md:w-7/12 md:p-8">
            <h3 className="mb-8 text-2xl font-bold text-gray-900">{t("leaveMessage")}</h3>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
