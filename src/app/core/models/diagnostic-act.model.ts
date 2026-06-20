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

export interface DiagnosticActParseResponse {
  data: DiagnosticActData;
  warnings?: string[];
}

export interface DiagnosticFieldRow {
  label: string;
  value: string;
}

export interface DiagnosticSectionRow {
  label: string;
  items: string[];
}

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

export interface DiagnosticActListResponse {
  items: DiagnosticActRecord[];
  total: number;
  limit: number;
  offset: number;
}

export interface DiagnosticActSaveResponse {
  act: DiagnosticActRecord;
  warnings: string[];
}

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
