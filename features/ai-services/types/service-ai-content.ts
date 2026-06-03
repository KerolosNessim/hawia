export type ServiceAiContentItem = {
  video: string;
  previewImage: string;
  subtitle: string;
  description: string;
  sort_order: number;
};

export type ServiceAiContent = {
  id: number;
  title: string;
  description: string;
  meta_title: string;
  meta_description: string;
  image: string | null;
  image_alt: string;
  items: ServiceAiContentItem[];
  is_active: boolean;
};
