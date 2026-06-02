import { CONFIG } from "@/config";
import { apiClient, ApiError } from "@/lib/api";
import type {
  ApiResponse,
  ApplyJobPayload,
  JobHeader,
  JobOpening,
  JobSection,
  ValidationErrors,
} from "@/features/careers/types/jobs";

const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL || CONFIG.BACK_URL;
const API_ORIGIN = RAW_API_BASE.replace(/\/+$/, "").replace(/\/api$/, "");

function buildV1Url(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN}/api/v1${normalizedPath}`;
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function asText(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asNumber(v: unknown): number {
  return typeof v === "number" ? v : Number(v || 0);
}

function resolveListData(payload: unknown): unknown[] {
  const root = asRecord(payload);
  if (Array.isArray(root.data)) return root.data;
  const data = asRecord(root.data);
  if (Array.isArray(data.data)) return data.data;
  return [];
}

function normalizeHeader(payload: unknown): JobHeader | null {
  const row = asRecord(asRecord(payload).data ?? payload);
  if (!row || Object.keys(row).length === 0) return null;
  const content = asRecord(row.content);
  const media = asRecord(row.media);
  const seo = asRecord(row.seo);
  const id = asNumber(row.id);
  if (!Number.isFinite(id)) return null;
  return {
    id,
    content: {
      title: asText(content.title),
      description: asText(content.description),
    },
    media: {
      image: asText(media.image) || null,
      image_alt: asText(media.image_alt) || null,
    },
    seo: {
      meta_title: asText(seo.meta_title) || null,
      meta_description: asText(seo.meta_description) || null,
    },
  };
}

function normalizeSection(rowValue: unknown): JobSection | null {
  const row = asRecord(rowValue);
  const id = asNumber(row.id);
  if (!Number.isFinite(id)) return null;

  const items = (Array.isArray(row.items) ? row.items : [])
    .map((itemValue) => {
      const item = asRecord(itemValue);
      return {
        sort_order: item.sort_order != null ? asNumber(item.sort_order) : undefined,
        title: asText(item.title),
        description: asText(item.description) || null,
        image: asText(item.image) || null,
        images: (() => {
          const images = asRecord(item.images);
          if (!Object.keys(images).length) return undefined;
          return {
            ar: asText(images.ar) || null,
            en: asText(images.en) || null,
          };
        })(),
        image_alt: asText(item.image_alt) || null,
      };
    })
    .sort((a, b) => {
      if (a.sort_order == null && b.sort_order == null) return 0;
      if (a.sort_order == null) return 1;
      if (b.sort_order == null) return -1;
      return a.sort_order - b.sort_order;
    });

  return {
    id,
    section_type: asText(row.section_type),
    name: asText(row.name),
    items,
  };
}

function normalizeOpening(rowValue: unknown): JobOpening | null {
  const row = asRecord(rowValue);
  const id = asNumber(row.id);
  if (!Number.isFinite(id)) return null;
  const media = asRecord(row.media);
  return {
    id,
    title: asText(row.title),
    description: asText(row.description),
    job_type: asText(row.job_type) || null,
    media: {
      image: asText(media.image) || null,
      image_alt: asText(media.image_alt) || null,
    },
  };
}

export async function getJobsHeaderPublic(): Promise<JobHeader | null> {
  const response = await apiClient.get("/v1/jobs/header");
  return normalizeHeader(response);
}

export async function getJobsHeaderPublicByLocale(locale: "ar" | "en"): Promise<JobHeader | null> {
  const response = await fetch(buildV1Url("/jobs/header"), {
    headers: {
      Accept: "application/json",
      "Accept-Language": locale,
    },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const data = await response.json().catch(() => ({}));
  return normalizeHeader(data);
}

export async function getJobsSectionsPublic(): Promise<JobSection[]> {
  const response = await apiClient.get("/v1/jobs/sections");
  return resolveListData(response).map(normalizeSection).filter((row): row is JobSection => row != null);
}

export async function getJobOpeningsPublic(): Promise<JobOpening[]> {
  const response = await apiClient.get("/v1/jobs/openings");
  return resolveListData(response).map(normalizeOpening).filter((row): row is JobOpening => row != null);
}

export async function applyToJobPublic(
  payload: ApplyJobPayload,
  locale: "ar" | "en"
): Promise<ApiResponse<unknown>> {
  const formData = new FormData();
  formData.append("job_opening_id", String(payload.job_opening_id));
  formData.append("name", payload.name.trim());
  formData.append("email", payload.email.trim());
  formData.append("age", payload.age.trim());
  if (payload.cv_file) formData.append("cv_file", payload.cv_file);

  const response = await fetch(buildV1Url("/jobs/apply"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Language": locale,
    },
    body: formData,
  });

  const data = (await response.json().catch(() => ({}))) as ApiResponse<unknown>;
  if (!response.ok || data?.status === "false" || data?.status === false) {
    const error = new ApiError(data?.message || "Apply request failed");
    error.validationErrors = (data?.errors || {}) as ValidationErrors;
    throw error;
  }
  return data;
}

