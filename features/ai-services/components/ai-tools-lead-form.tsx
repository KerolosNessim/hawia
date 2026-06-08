"use client";

import { AI_TOOLS_URL } from "@/features/ai-services/constants";
import {
  AiToolsLeadApiError,
  submitAiToolsLead,
} from "@/features/ai-services/services/ai-tools-lead-api";
import type { AiToolsLeadFormCopy } from "@/features/ai-services/types/tools-lead-form";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  copy: AiToolsLeadFormCopy;
  serviceId?: number;
  /** When nested inside a page section band (e.g. `/ai-services` section 2). */
  embedded?: boolean;
};

export default function AiToolsLeadForm({ copy, serviceId, embedded = false }: Props) {
  const locale = useLocale();
  const [submitting, setSubmitting] = useState(false);
  const [agreedToUpdates, setAgreedToUpdates] = useState(false);
  const agreementFieldId = serviceId
    ? `ai-tools-agreement-${serviceId}`
    : "ai-tools-agreement";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agreedToUpdates) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const challenge = String(formData.get("challenge") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();

    try {
      setSubmitting(true);
      const message = await submitAiToolsLead(
        {
          challenge,
          email,
          accepts_updates: true,
        },
        locale,
      );
      toast.success(message);
      form.reset();
      setAgreedToUpdates(false);
    } catch (error) {
      if (error instanceof AiToolsLeadApiError && error.validationErrors) {
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
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className={cn(
        "finger-print-background relative overflow-hidden rounded-3xl bg-[#F8FDF1] px-4 py-10 md:py-12",
        embedded ? "container" : "container relative my-8 md:my-16",
      )}
    >
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <h2 className="mx-auto mb-8 max-w-3xl text-2xl font-bold leading-normal text-gray-800 md:text-3xl">
          {copy.title}
        </h2>

        <form className="mx-auto flex max-w-2xl flex-col gap-4" onSubmit={onSubmit}>
          <input
            type="text"
            name="challenge"
            placeholder={copy.challenge_placeholder}
            className="w-full rounded-full border border-transparent bg-white px-6 py-4 text-gray-800 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            required
          />

          <input
            type="email"
            name="email"
            placeholder={copy.email_placeholder}
            className="w-full rounded-full border border-transparent bg-white px-6 py-4 text-gray-800 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            required
          />

          <div className="flex items-start gap-3 px-2 text-start">
            <input
              type="checkbox"
              id={agreementFieldId}
              name="accepts_updates"
              checked={agreedToUpdates}
              onChange={(event) => setAgreedToUpdates(event.target.checked)}
              className="mt-1 size-4 shrink-0 accent-brand"
              required
            />
            <label
              htmlFor={agreementFieldId}
              className="cursor-pointer select-none text-sm font-medium leading-relaxed text-gray-600"
            >
              {copy.consent_text}
            </label>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full border-b-4 border-black/10 bg-brand py-4 text-lg font-bold text-white shadow-md transition-colors hover:bg-brand/90 active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <Loader2 className="mx-auto size-5 animate-spin" aria-hidden />
              ) : (
                copy.submit_button_text
              )}
            </button>

            <a
              href={AI_TOOLS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full border-2 border-brand bg-white py-4 text-lg font-bold text-brand shadow-sm transition-colors hover:bg-brand/5"
            >
              {copy.ai_tools_button_text}
            </a>
          </div>
        </form>
      </div>
    </motion.section>
  );
}
