export type ApiResponse<T> = {
  status: "true" | "false" | boolean;
  message: string;
  data: T | null;
  errors?: Record<string, string[]>;
};

export type ValidationErrors = Record<string, string[]>;

export type JobHeader = {
  id: number;
  content: {
    title: string;
    description: string;
  };
  media: {
    image: string | null;
    image_alt: string | null;
  };
  seo: {
    meta_title: string | null;
    meta_description: string | null;
  };
};

export type JobSectionItem = {
  sort_order?: number;
  title: string;
  description?: string | null;
  image?: string | null;
  images?: { ar: string | null; en: string | null };
  image_alt?: string | null;
};

export type JobSection = {
  id: number;
  section_type: string;
  name: string;
  items: JobSectionItem[];
};

export type JobOpening = {
  id: number;
  title: string;
  description: string;
  job_type: string | null;
  media: {
    image: string | null;
    image_alt: string | null;
  };
};

export type ApplyJobPayload = {
  job_opening_id: number;
  name: string;
  email: string;
  age: string;
  cv_file: File | null;
};

