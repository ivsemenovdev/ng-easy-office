/** Единица оборудования (`equipment`). */
export interface Equipment {
  id: number;
  department_id: number;
  equipment_type_id: number;
  name: string;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  inventory_number: string | null;
  manufacture_year: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Ответ `GET /api/departments/:departmentId/equipment`. */
export interface EquipmentListResponse {
  items: Equipment[];
  total: number;
  limit: number;
  offset: number;
}

/** Тело `POST /api/departments/:departmentId/equipment`. */
export interface EquipmentCreateRequest {
  equipment_type_id: number;
  name: string;
  manufacturer?: string | null;
  model?: string | null;
  serial_number?: string | null;
  inventory_number?: string | null;
  manufacture_year?: number | null;
  is_active?: boolean;
}

/** Тело `PUT/PATCH /api/departments/:departmentId/equipment/:id`. */
export interface EquipmentUpdateRequest {
  equipment_type_id?: number;
  name?: string;
  manufacturer?: string | null;
  model?: string | null;
  serial_number?: string | null;
  inventory_number?: string | null;
  manufacture_year?: number | null;
  is_active?: boolean;
}
