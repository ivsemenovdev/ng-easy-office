/** Отделение больницы (`departments`). */
export interface Department {
  id: number;
  hospital_id: number;
  name: string;
  code: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Ответ `GET /api/hospitals/:hospitalId/departments`. */
export interface DepartmentListResponse {
  items: Department[];
  total: number;
  limit: number;
  offset: number;
}

/** Тело `POST /api/hospitals/:hospitalId/departments`. */
export interface DepartmentCreateRequest {
  name: string;
  code?: string | null;
  is_active?: boolean;
}

/** Тело `PUT/PATCH /api/hospitals/:hospitalId/departments/:id`. */
export interface DepartmentUpdateRequest {
  name?: string;
  code?: string | null;
  is_active?: boolean;
}
