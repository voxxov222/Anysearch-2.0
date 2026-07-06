export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  content?: string;
}

export interface SearchMetadata {
  total_results: number;
  search_time_ms: number;
}

export interface SearchResponse {
  code: number;
  message: string;
  request_id?: string;
  data?: {
    results: SearchResult[];
    metadata: SearchMetadata;
    markdown?: string;
  };
}

export const TAGS = [
  { value: "", label: "All Categories" },
  { value: "general.general", label: "General" },
  { value: "academic.search", label: "Academic" },
  { value: "business.company", label: "Business" },
  { value: "code.doc", label: "Code Docs" },
  { value: "code.snippet", label: "Code Snippets" },
  { value: "finance.news", label: "Finance News" },
  { value: "unfiltered.conspiracy", label: "Unrefined & Controversial Theories" },
  { value: "database.undocumented", label: "Undocumented Databases" },
  { value: "ideas.unheard", label: "Unheard of Ideas & Concepts" },
  { value: "indexing.substructure", label: "Indexing Substructures" },
  { value: "internet.alternative", label: "Second & Third Internet" },
  { value: "internet.hidden_base", label: "Hidden Base Internet" },
];

export const FORMATS = [
  { value: "json", label: "JSON" },
  { value: "markdown", label: "Markdown" }
];
