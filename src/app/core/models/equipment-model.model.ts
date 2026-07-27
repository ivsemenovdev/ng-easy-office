/** Модель медтехники из глобального справочника (`equipment_models`). */
export interface EquipmentModel {
  id: number;
  equipment_type_id: number;
  equipment_type_name: string;
  manufacturer: string;
  model: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Ответ `GET /api/equipment-models`. */
export interface EquipmentModelListResponse {
  items: EquipmentModel[];
  total: number;
  limit: number;
  offset: number;
}

/** Тело `POST /api/equipment-models`. */
export interface EquipmentModelCreateRequest {
  equipment_type_id: number;
  manufacturer: string;
  model: string;
  is_active?: boolean;
}

/** Тело `PUT/PATCH /api/equipment-models/:id`. */
export interface EquipmentModelUpdateRequest {
  equipment_type_id?: number;
  manufacturer?: string;
  model?: string;
  is_active?: boolean;
}
