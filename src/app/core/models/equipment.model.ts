/** Единица оборудования в отделении (`equipment`). */
export interface Equipment {
  id: number;
  department_id: number;
  equipment_model_id: number;
  equipment_type_id: number;
  equipment_type_name: string;
  manufacturer: string;
  model: string;
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
  equipment_model_id: number;
  serial_number?: string | null;
  inventory_number?: string | null;
  manufacture_year?: number | null;
  is_active?: boolean;
}

/** Тело `PUT/PATCH /api/departments/:departmentId/equipment/:id`. */
export interface EquipmentUpdateRequest {
  equipment_model_id?: number;
  serial_number?: string | null;
  inventory_number?: string | null;
  manufacture_year?: number | null;
  is_active?: boolean;
}
