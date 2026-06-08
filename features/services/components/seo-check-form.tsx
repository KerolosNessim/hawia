"use client";

import type { ApplicationSeoFormCopy } from "@/features/services/types/application-seo";
import {
  ApplicationSeoApiError,
  submitApplicationSeo,
} from "@/features/services/services/application-seo-api";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  serviceId: number;
  copy: ApplicationSeoFormCopy;
  /** When nested inside a page section band (e.g. single service section 2). */
  embedded?: boolean;
};

export default function SeoCheckForm({ serviceId, copy, embedded = false }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const consentId = `application-seo-consent-${serviceId}`;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const website_url = String(formData.get("website_url") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();

    try {
      setSubmitting(true);
      const message = await submitApplicationSeo({
        service_id: serviceId,
        website_url,
        email,
        consent: true,
      });
      toast.success(message);
      form.reset();
      setConsent(false);
    } catch (error) {
      if (error instanceof ApplicationSeoApiError && error.validationErrors) {
        const first = Object.values(error.validationErrors).flat()[0];
        toast.error(typeof first === "string" ? first : error.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className={cn(
        "finger-print-background relative overflow-hidden rounded-3xl bg-[#F8FDF1] px-4 py-10",
        embedded ? "container" : "container relative my-16",
      )}
    >
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <h2 className="mx-auto mb-8 max-w-3xl text-2xl font-bold leading-normal text-gray-800 md:text-3xl">
          {copy.heading}
        </h2>

        <form className="mx-auto flex max-w-2xl flex-col gap-4" onSubmit={onSubmit}>
          <input type="hidden" name="service_id" value={serviceId} />

          <input
            type="url"
            name="website_url"
            placeholder={copy.website_placeholder}
            className="w-full rounded-xl border border-transparent bg-white px-6 py-4 text-gray-800 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            required
          />

          <input
            type="email"
            name="email"
            placeholder={copy.email_placeholder}
            className="w-full rounded-xl border border-transparent bg-white px-6 py-4 text-gray-800 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            required
          />

          <div className="flex items-start gap-3 px-2 text-start">
            <input
              type="checkbox"
              id={consentId}
              name="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 size-4 shrink-0 accent-brand"
              required
            />
            <label
              htmlFor={consentId}
              className="cursor-pointer select-none text-sm font-medium leading-relaxed text-gray-600"
            >
              {copy.consent_text}
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl border-b-4 border-black/10 bg-brand py-4 text-lg font-bold text-white shadow-md transition-colors hover:bg-brand/90 active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <Loader2 className="mx-auto size-5 animate-spin" aria-hidden />
            ) : (
              copy.submit_button_text
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
