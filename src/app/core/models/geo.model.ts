export type GeoRegionLevel = 'country' | 'federal_subject' | 'administrative';

export interface GeoRegion {
  id: number;
  country_id: number;
  parent_id: number | null;
  level: GeoRegionLevel;
  code: string;
  okato: string | null;
  name_ru: string;
  name_short_ru: string | null;
  name_en: string | null;
  region_type: string | null;
  sort_order: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeoRegionListResponse {
  items: GeoRegion[];
  total: number;
  limit: number;
  offset: number;
}
