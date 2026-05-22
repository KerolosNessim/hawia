/** Serializable shape consumed by client `BlogCard` (translations + CMS data). */
export type BlogCardPayload = {
  title: string;
  /** Trusted CMS excerpt HTML (localized). Render with `RichHtml`. */
  description: string;
  date: string;
  image: string;
  link: string;
};
