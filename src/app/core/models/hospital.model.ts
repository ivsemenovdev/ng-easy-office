/** Больница, привязанная к региону (`hospitals`). */
export interface Hospital {
  id: number;
  region_id: number;
  name: string;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Ответ `GET /api/hospitals`. */
export interface HospitalListResponse {
  items: Hospital[];
  total: number;
  limit: number;
  offset: number;
}

/** Тело `POST /api/hospitals`. */
export interface HospitalCreateRequest {
  region_id: number;
  name: string;
  address?: string | null;
  is_active?: boolean;
}
