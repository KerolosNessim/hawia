export interface SearchItem {
  id: number;
  title: string;
  slug: string;
  image: string | null;
}

export interface SearchResults {
  blogs?: SearchItem[];
  services?: SearchItem[];
  solutions?: SearchItem[];
  courses?: SearchItem[];
  faqs?: SearchItem[];
}

export interface SearchResponse {
  status: string;
  message: string;
  data: SearchResults;
}
