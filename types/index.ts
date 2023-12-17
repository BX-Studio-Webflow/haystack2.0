export interface Insight {
  itemsReceived: number;
  curPage: number;
  nextPage: number;
  prevPage: number;
  offset: number;
  items: {
    id: number;
    created_at: number;
    name: string;
    slug: string;
    company_id: number;
    description: string;
    "insight-detail": string;
    curated: Date | null;
    source_author: string;
    source: string;
    "source-url": string;
    "source-publication-date": Date | null;
    source_category_id: number[];
    company_type_id: number[];
    insight_classification_id: number[];
    line_of_business_id: number[];
    technology_category_id: number[];
    "companies-mentioned": number[];
    people_id: number[];
    event_id: number;
    published: boolean;
  };
}
