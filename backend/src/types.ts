export type GeoRegionLevel = 'country' | 'federal_subject' | 'administrative';

export interface GeoCountry {
  id: number;
  iso_alpha2: string;
  iso_alpha3: string | null;
  name_ru: string;
  name_en: string | null;
  is_active: boolean;
}

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

export interface ListResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface Hospital {
  id: number;
  region_id: number;
  name: string;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HospitalRequisites {
  id: number;
  hospital_id: number;
  legal_address: string | null;
  postal_address: string | null;
  phone: string | null;
  inn: string | null;
  kpp: string | null;
  ogrn: string | null;
  bank_account: string | null;
  bik: string | null;
  bank_name: string | null;
  ktm: string | null;
  okpo: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiagnosticAct {
  id: number;
  hospital_id: number;
  act_number: string | null;
  act_date: string | null;
  act_title: string | null;
  equipment_name: string | null;
  equipment_model: string | null;
  serial_number: string | null;
  customer: string | null;
  customer_address: string | null;
  work_type: string | null;
  basis: string | null;
  equipment_condition: string[];
  completed_works: string[];
  conclusion: string[];
  created_at: string;
  updated_at: string;
}
