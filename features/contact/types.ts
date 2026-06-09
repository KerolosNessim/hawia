export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface ContactResponse {
  status: boolean;
  message: string;
  data?: unknown;
}

export interface ContactHeader {
  id: number;
  title: string;
  description: string;
  meta_title: string | null;
  meta_description: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ContactHeadersResponse {
  status: string | boolean;
  message: string;
  data: ContactHeader[];
}
