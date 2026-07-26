/** Реквизиты больницы (`hospital_requisites`, 1:1 с `hospitals`). */
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

/** Тело `PUT /api/hospitals/:id/requisites`. */
export type HospitalRequisitesUpsertRequest = Omit<
  HospitalRequisites,
  'id' | 'hospital_id' | 'created_at' | 'updated_at'
>;

export const EMPTY_HOSPITAL_REQUISITES: HospitalRequisitesUpsertRequest = {
  legal_address: null,
  postal_address: null,
  phone: null,
  inn: null,
  kpp: null,
  ogrn: null,
  bank_account: null,
  bik: null,
  bank_name: null,
  ktm: null,
  okpo: null,
  email: null,
};
