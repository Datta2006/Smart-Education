declare module "serp" {
  interface GoogleSearchResult {
    position: number;
    title: string;
    link: string;
    snippet: string;
    displayed_link: string;
    thumbnail?: string;
  }

  interface GoogleSearchOptions {
    q: string;
    num?: number;
    start?: number;
    hl?: string;
    gl?: string;
    device?: string;
  }

  export function search(
    options: GoogleSearchOptions
  ): Promise<GoogleSearchResult[]>;
}
