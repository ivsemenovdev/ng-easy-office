/** Вид медицинского оборудования (`equipment_types`). */
export interface EquipmentType {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Ответ `GET /api/equipment-types`. */
export interface EquipmentTypeListResponse {
  items: EquipmentType[];
  total: number;
  limit: number;
  offset: number;
}

/** Тело `POST /api/equipment-types`. */
export interface EquipmentTypeCreateRequest {
  name: string;
  is_active?: boolean;
}

/** Тело `PUT/PATCH /api/equipment-types/:id`. */
export interface EquipmentTypeUpdateRequest {
  name?: string;
  is_active?: boolean;
}
