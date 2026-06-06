import type { SettingsData } from "@/features/settings/types";

export function resolveWhatsappContactPhone(
  contact?: SettingsData["contact"],
): string | null {
  const phones = contact?.phones ?? [];
  const whatsapp = phones.find((p) => p.type === "whatsapp" && p.number?.trim());
  if (whatsapp) return whatsapp.number.trim();
  const any = phones.find((p) => p.number?.trim());
  return any?.number.trim() ?? null;
}

export function buildWhatsappSendHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://api.whatsapp.com/send?phone=${digits}`;
}
