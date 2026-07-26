import type { Pool } from 'pg';
import type { z } from 'zod';

import { NotFoundError } from '../errors.js';
import type { HospitalRequisites } from '../types.js';
import type { hospitalRequisitesUpsertSchema } from '../validation.js';

type HospitalRequisitesUpsert = z.infer<typeof hospitalRequisitesUpsertSchema>;

const SELECT_COLUMNS = `
  id, hospital_id,
  legal_address, postal_address, phone,
  inn, kpp, ogrn,
  bank_account, bik, bank_name,
  ktm, okpo, email,
  created_at, updated_at
`;

const UPSERT_COLUMNS = [
  'legal_address',
  'postal_address',
  'phone',
  'inn',
  'kpp',
  'ogrn',
  'bank_account',
  'bik',
  'bank_name',
  'ktm',
  'okpo',
  'email',
] as const;

export class HospitalRequisitesService {
  constructor(private readonly db: Pool) {}

  async getByHospitalId(hospitalId: number): Promise<HospitalRequisites> {
    await this.assertHospitalExists(hospitalId);

    const { rows } = await this.db.query<HospitalRequisites>(
      `SELECT ${SELECT_COLUMNS}
       FROM hospital_requisites
       WHERE hospital_id = $1`,
      [hospitalId],
    );
    const row = rows[0];
    if (!row) {
      throw new NotFoundError('HospitalRequisites', hospitalId);
    }
    return row;
  }

  async upsert(
    hospitalId: number,
    data: HospitalRequisitesUpsert,
  ): Promise<HospitalRequisites> {
    await this.assertHospitalExists(hospitalId);

    const values = UPSERT_COLUMNS.map((column) => data[column] ?? null);
    const insertPlaceholders = UPSERT_COLUMNS.map((_, index) => `$${index + 2}`).join(', ');
    const updateAssignments = UPSERT_COLUMNS.map(
      (column) => `${column} = EXCLUDED.${column}`,
    ).join(',\n           ');

    const { rows } = await this.db.query<HospitalRequisites>(
      `INSERT INTO hospital_requisites (hospital_id, ${UPSERT_COLUMNS.join(', ')})
       VALUES ($1, ${insertPlaceholders})
       ON CONFLICT (hospital_id) DO UPDATE SET
           ${updateAssignments},
           updated_at = NOW()
       RETURNING ${SELECT_COLUMNS}`,
      [hospitalId, ...values],
    );
    return rows[0]!;
  }

  private async assertHospitalExists(hospitalId: number): Promise<void> {
    const { rows } = await this.db.query<{ id: number }>(
      `SELECT id FROM hospitals WHERE id = $1`,
      [hospitalId],
    );
    if (!rows[0]) {
      throw new NotFoundError('Hospital', hospitalId);
    }
  }
}
