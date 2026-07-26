import type { Pool } from 'pg';
import type { z } from 'zod';

import { NotFoundError } from '../errors.js';
import type { Department, ListResult } from '../types.js';
import type { departmentCreateSchema, departmentUpdateSchema } from '../validation.js';

type DepartmentCreate = z.infer<typeof departmentCreateSchema>;
type DepartmentUpdate = z.infer<typeof departmentUpdateSchema>;

export interface DepartmentListParams {
  limit: number;
  offset: number;
  is_active?: boolean;
}

const RETURNING_COLUMNS =
  'id, hospital_id, name, code, is_active, created_at, updated_at';

export class DepartmentsService {
  constructor(private readonly db: Pool) {}

  async listByHospital(
    hospitalId: number,
    params: DepartmentListParams,
  ): Promise<ListResult<Department>> {
    const conditions: string[] = ['hospital_id = $1'];
    const values: unknown[] = [hospitalId];

    if (params.is_active !== undefined) {
      values.push(params.is_active);
      conditions.push(`is_active = $${values.length}`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM departments ${where}`,
      values,
    );
    const total = Number.parseInt(countResult.rows[0]?.count ?? '0', 10);

    values.push(params.limit, params.offset);
    const limitIdx = values.length - 1;
    const offsetIdx = values.length;

    const { rows } = await this.db.query<Department>(
      `SELECT ${RETURNING_COLUMNS}
       FROM departments
       ${where}
       ORDER BY name
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      values,
    );

    return { items: rows, total, limit: params.limit, offset: params.offset };
  }

  async getById(hospitalId: number, id: number): Promise<Department> {
    const { rows } = await this.db.query<Department>(
      `SELECT ${RETURNING_COLUMNS}
       FROM departments
       WHERE id = $1 AND hospital_id = $2`,
      [id, hospitalId],
    );
    const row = rows[0];
    if (!row) {
      throw new NotFoundError('Department', id);
    }
    return row;
  }

  async create(hospitalId: number, data: DepartmentCreate): Promise<Department> {
    const { rows } = await this.db.query<Department>(
      `INSERT INTO departments (hospital_id, name, code, is_active)
       VALUES ($1, $2, $3, $4)
       RETURNING ${RETURNING_COLUMNS}`,
      [hospitalId, data.name, data.code ?? null, data.is_active ?? true],
    );
    return rows[0]!;
  }

  async update(
    hospitalId: number,
    id: number,
    data: DepartmentUpdate,
  ): Promise<Department> {
    const existing = await this.getById(hospitalId, id);
    const merged = {
      name: data.name ?? existing.name,
      code: data.code !== undefined ? data.code : existing.code,
      is_active: data.is_active ?? existing.is_active,
    };

    const { rows } = await this.db.query<Department>(
      `UPDATE departments
       SET name = $3,
           code = $4,
           is_active = $5,
           updated_at = NOW()
       WHERE id = $1 AND hospital_id = $2
       RETURNING ${RETURNING_COLUMNS}`,
      [id, hospitalId, merged.name, merged.code, merged.is_active],
    );
    return rows[0]!;
  }

  async remove(hospitalId: number, id: number): Promise<void> {
    const result = await this.db.query(
      `DELETE FROM departments WHERE id = $1 AND hospital_id = $2`,
      [id, hospitalId],
    );
    if (result.rowCount === 0) {
      throw new NotFoundError('Department', id);
    }
  }
}
