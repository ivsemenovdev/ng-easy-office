import type { Pool } from 'pg';
import type { z } from 'zod';

import { NotFoundError } from '../errors.js';
import type { Hospital, ListResult } from '../types.js';
import type { hospitalCreateSchema, hospitalUpdateSchema } from '../validation.js';

type HospitalCreate = z.infer<typeof hospitalCreateSchema>;
type HospitalUpdate = z.infer<typeof hospitalUpdateSchema>;

export interface HospitalListParams {
  limit: number;
  offset: number;
  region_id?: number;
  is_active?: boolean;
}

const SELECT_COLUMNS = `
  h.id, h.region_id, h.name, h.address, h.is_active, h.created_at, h.updated_at
`;

const RETURNING_COLUMNS =
  'id, region_id, name, address, is_active, created_at, updated_at';

export class HospitalsService {
  constructor(private readonly db: Pool) {}

  async list(params: HospitalListParams): Promise<ListResult<Hospital>> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (params.region_id !== undefined) {
      values.push(params.region_id);
      conditions.push(`h.region_id = $${values.length}`);
    }
    if (params.is_active !== undefined) {
      values.push(params.is_active);
      conditions.push(`h.is_active = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM hospitals h ${where}`,
      values,
    );
    const total = Number.parseInt(countResult.rows[0]?.count ?? '0', 10);

    values.push(params.limit, params.offset);
    const limitIdx = values.length - 1;
    const offsetIdx = values.length;

    const { rows } = await this.db.query<Hospital>(
      `SELECT ${SELECT_COLUMNS}
       FROM hospitals h
       ${where}
       ORDER BY h.name
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      values,
    );

    return { items: rows, total, limit: params.limit, offset: params.offset };
  }

  async getById(id: number): Promise<Hospital> {
    const { rows } = await this.db.query<Hospital>(
      `SELECT ${SELECT_COLUMNS} FROM hospitals h WHERE h.id = $1`,
      [id],
    );
    const row = rows[0];
    if (!row) {
      throw new NotFoundError('Hospital', id);
    }
    return row;
  }

  async create(data: HospitalCreate): Promise<Hospital> {
    const { rows } = await this.db.query<Hospital>(
      `INSERT INTO hospitals (region_id, name, address, is_active)
       VALUES ($1, $2, $3, $4)
       RETURNING ${RETURNING_COLUMNS}`,
      [data.region_id, data.name, data.address ?? null, data.is_active ?? true],
    );
    return rows[0]!;
  }

  async update(id: number, data: HospitalUpdate): Promise<Hospital> {
    const existing = await this.getById(id);
    const merged = {
      region_id: data.region_id ?? existing.region_id,
      name: data.name ?? existing.name,
      address: data.address !== undefined ? data.address : existing.address,
      is_active: data.is_active ?? existing.is_active,
    };

    const { rows } = await this.db.query<Hospital>(
      `UPDATE hospitals
       SET region_id = $2,
           name = $3,
           address = $4,
           is_active = $5,
           updated_at = NOW()
       WHERE id = $1
       RETURNING ${RETURNING_COLUMNS}`,
      [id, merged.region_id, merged.name, merged.address, merged.is_active],
    );
    return rows[0]!;
  }

  async remove(id: number): Promise<void> {
    const result = await this.db.query(`DELETE FROM hospitals WHERE id = $1`, [id]);
    if (result.rowCount === 0) {
      throw new NotFoundError('Hospital', id);
    }
  }
}
