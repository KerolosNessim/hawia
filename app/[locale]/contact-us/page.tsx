import ContactSection from "@/features/home/component/contact-section";
import PageHeader from "@/features/shared/components/page-header";
import { useTranslations } from "next-intl";
import React from "react";

export default function ContactUsPage() {
  const t = useTranslations("contact");
  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <ContactSection withLocation />
    </div>
  );
}
