/** Структура акта после разбора DOCX (camelCase, как в ответе parse). */
export interface DiagnosticActData {
  actNumber: string | null;
  actDate: string | null;
  actTitle: string | null;
  equipmentName: string | null;
  equipmentModel: string | null;
  serialNumber: string | null;
  customer: string | null;
  customerAddress: string | null;
  workType: string | null;
  basis: string | null;
  equipmentCondition: string[];
  completedWorks: string[];
  conclusion: string[];
}

/** Ответ `POST /api/diagnostic/parse`. */
export interface DiagnosticActParseResponse {
  data: DiagnosticActData;
  warnings?: string[];
}

/** Строка таблицы реквизитов на экране импорта. */
export interface DiagnosticFieldRow {
  label: string;
  value: string;
}

/** Блок списка (дефекты, работы, заключение) на экране импорта. */
export interface DiagnosticSectionRow {
  label: string;
  items: string[];
}

/** Элемент групповой загрузки: один файл из выбранной папки. */
export type DiagnosticBatchItemStatus = 'pending' | 'parsed' | 'error' | 'saved';

export interface DiagnosticBatchItem {
  fileName: string;
  relativePath: string;
  status: DiagnosticBatchItemStatus;
  data?: DiagnosticActData;
  error?: string;
  actId?: number;
  warnings?: string[];
}

/** Запись акта в БД (`diagnostic_acts`, snake_case). */
export interface DiagnosticActRecord {
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

/** Ответ `GET /api/diagnostic/acts`. */
export interface DiagnosticActListResponse {
  items: DiagnosticActRecord[];
  total: number;
  limit: number;
  offset: number;
}

/** Ответ `POST /api/diagnostic/acts`. */
export interface DiagnosticActSaveResponse {
  act: DiagnosticActRecord;
  warnings: string[];
}

/** Тело `POST /api/diagnostic/acts`. */
export interface DiagnosticActCreateRequest {
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
}
