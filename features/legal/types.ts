export interface LegalPageData {
  id: number;
  type: string;
  image: string | null;
  description: string;
  slug: string;
  meta_title: string;
  meta_description: string;
}

export interface LegalResponse {
  status: string;
  message: string;
  data: LegalPageData;
}
