import type { Pool } from 'pg';
import type { z } from 'zod';

import { NotFoundError } from '../errors.js';
import type { EquipmentType, ListResult } from '../types.js';
import type {
  equipmentTypeCreateSchema,
  equipmentTypeUpdateSchema,
} from '../validation.js';

type EquipmentTypeCreate = z.infer<typeof equipmentTypeCreateSchema>;
type EquipmentTypeUpdate = z.infer<typeof equipmentTypeUpdateSchema>;

export interface EquipmentTypeListParams {
  limit: number;
  offset: number;
  is_active?: boolean;
}

const RETURNING_COLUMNS = 'id, name, is_active, created_at, updated_at';

export class EquipmentTypesService {
  constructor(private readonly db: Pool) {}

  async list(params: EquipmentTypeListParams): Promise<ListResult<EquipmentType>> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (params.is_active !== undefined) {
      values.push(params.is_active);
      conditions.push(`is_active = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM equipment_types ${where}`,
      values,
    );
    const total = Number.parseInt(countResult.rows[0]?.count ?? '0', 10);

    values.push(params.limit, params.offset);
    const limitIdx = values.length - 1;
    const offsetIdx = values.length;

    const { rows } = await this.db.query<EquipmentType>(
      `SELECT ${RETURNING_COLUMNS}
       FROM equipment_types
       ${where}
       ORDER BY name
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      values,
    );

    return { items: rows, total, limit: params.limit, offset: params.offset };
  }

  async getById(id: number): Promise<EquipmentType> {
    const { rows } = await this.db.query<EquipmentType>(
      `SELECT ${RETURNING_COLUMNS} FROM equipment_types WHERE id = $1`,
      [id],
    );
    const row = rows[0];
    if (!row) {
      throw new NotFoundError('EquipmentType', id);
    }
    return row;
  }

  async create(data: EquipmentTypeCreate): Promise<EquipmentType> {
    const { rows } = await this.db.query<EquipmentType>(
      `INSERT INTO equipment_types (name, is_active)
       VALUES ($1, $2)
       RETURNING ${RETURNING_COLUMNS}`,
      [data.name, data.is_active ?? true],
    );
    return rows[0]!;
  }

  async update(id: number, data: EquipmentTypeUpdate): Promise<EquipmentType> {
    const existing = await this.getById(id);
    const merged = {
      name: data.name ?? existing.name,
      is_active: data.is_active ?? existing.is_active,
    };

    const { rows } = await this.db.query<EquipmentType>(
      `UPDATE equipment_types
       SET name = $2,
           is_active = $3,
           updated_at = NOW()
       WHERE id = $1
       RETURNING ${RETURNING_COLUMNS}`,
      [id, merged.name, merged.is_active],
    );
    return rows[0]!;
  }

  async remove(id: number): Promise<void> {
    const result = await this.db.query(`DELETE FROM equipment_types WHERE id = $1`, [id]);
    if (result.rowCount === 0) {
      throw new NotFoundError('EquipmentType', id);
    }
  }
}
