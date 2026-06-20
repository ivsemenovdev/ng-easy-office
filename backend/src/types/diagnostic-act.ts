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
