"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SectionHeader from "@/features/shared/components/section-header";
import { Clock, Mail, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { FaLocationDot } from "react-icons/fa6";

export default function ContactSection({
  withLocation = false,
}: {
  withLocation?: boolean;
}) {
  const t = useTranslations("contactSection");
  const f = useTranslations("contact");
  const locations = f.raw("offices") as { title: string; location: string }[];

  return (
    <section className="py-16 bg-linear-to-t from-brand/50 to-transparent">
      <div className="container  space-y-8">
        <SectionHeader
          title={t("title")}
          subtitle={t("subtitle")}
          subtitleColor="text-gray-700"
          titleColor="text-gray-900"
        />

        <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-white flex flex-col md:flex-row border border-gray-100">
          {/* Contact Details (Dark Panel) */}
          <div className="md:w-5/12 bg-gray-900 text-white p-4 md:p-8 relative overflow-hidden flex flex-col justify-center ">
            <h3 className="text-2xl font-bold mb-8 text-center md:text-start relative z-10">
              {t("stayConnected")}
            </h3>

            <div className="flex flex-col gap-2 relative z-10">
              {/* Phone Block */}
              <div className=" p-4 rounded-2xl border border-brand ">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-6 h-6 text-brand" />
                  <h4 className="font-bold text-lg">{t("phoneLabel")}</h4>
                </div>
                <div className="space-y-2 text-gray-300 text-sm ">
                  <p>(+90) 75 67 031 536</p>
                  <p>(+968) 4555 9520</p>
                  <p>(+968) 1971 9525</p>
                </div>
              </div>

              {/* Email Block */}
              <div className=" p-4 rounded-2xl border border-brand ">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-6 h-6 text-brand" />
                  <h4 className="font-bold text-lg">{t("emailLabel")}</h4>
                </div>
                <div className="text-gray-300 text-sm ">
                  <p>info@howeyah.com</p>
                </div>
              </div>
              {/* Locations Block */}
              {withLocation && (
                <div className=" p-4 rounded-2xl border border-brand ">
                  <div className="flex items-center gap-2 mb-2">
                    <FaLocationDot className="w-6 h-6 text-brand" />
                    <h4 className="font-bold text-lg">{f("our_offices")}</h4>
                  </div>
                  <div className="text-gray-300 text-sm  space-y-2">
                    {locations?.map((location, index) => (
                      <div key={index} className="space-y-1">
                        <p className="font-bold text-brand">{location.title}</p>
                        <p className="text-gray-300">{location.location}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Working Hours Block */}
              <div className=" p-4 rounded-2xl border border-brand ">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-6 h-6 text-brand" />
                  <h4 className="font-bold text-lg">
                    {t("workingHoursLabel")}
                  </h4>
                </div>
                <div className="text-gray-300 text-sm ">
                  <p>{t("workingHoursText")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form (Light Panel) */}
          <div className="md:w-7/12 p-4 md:p-8 bg-white relative">
            <h3 className="text-2xl font-bold mb-8 text-gray-900">
              {t("leaveMessage")}
            </h3>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2 text-start">
                <label className="text-sm font-medium text-gray-700 mx-1 block">
                  {t("form.name")}
                </label>
                <Input
                  type="text"
                  className="h-12 rounded-xl  focus-visible:ring-brand/30"
                />
              </div>

              <div className="space-y-2 text-start">
                <label className="text-sm font-medium text-gray-700 mx-1 block">
                  {t("form.email")}
                </label>
                <Input
                  type="email"
                  className="h-12 rounded-xl  focus-visible:ring-brand/30"
                />
              </div>

              <div className="space-y-2 text-start">
                <label className="text-sm font-medium text-gray-700 mx-1 block">
                  {t("form.phone")}
                </label>
                <Input
                  type="tel"
                  className="h-12 rounded-xl  focus-visible:ring-brand/30"
                />
              </div>

              <div className="space-y-2 text-start">
                <label className="text-sm font-medium text-gray-700 mx-1 block">
                  {t("form.message")}
                </label>
                <Textarea className="min-h-40 rounded-xl  focus-visible:ring-brand/30 resize-none" />
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-brand text-white hover:bg-brand/90 font-bold text-lg transition-all shadow-md hover:shadow-xl mt-4"
              >
                {t("form.submit")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
