/** Уровень записи в иерархии geo_regions. */
export type GeoRegionLevel = 'country' | 'federal_subject' | 'administrative';

/** Регион / субъект из таблицы `geo_regions`. */
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

/** Ответ `GET /api/regions` с пагинацией. */
export interface GeoRegionListResponse {
  items: GeoRegion[];
  total: number;
  limit: number;
  offset: number;
}
