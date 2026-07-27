import type { Pool } from 'pg';
import type { z } from 'zod';

import { NotFoundError } from '../errors.js';
import type { EquipmentModelWithType, ListResult } from '../types.js';
import type {
  equipmentModelCreateSchema,
  equipmentModelUpdateSchema,
} from '../validation.js';

type EquipmentModelCreate = z.infer<typeof equipmentModelCreateSchema>;
type EquipmentModelUpdate = z.infer<typeof equipmentModelUpdateSchema>;

export interface EquipmentModelListParams {
  limit: number;
  offset: number;
  is_active?: boolean;
  equipment_type_id?: number;
}

const RETURNING_COLUMNS = `
  em.id,
  em.equipment_type_id,
  em.manufacturer,
  em.model,
  em.is_active,
  em.created_at,
  em.updated_at,
  et.name AS equipment_type_name
`;

const FROM_JOIN = `
  FROM equipment_models em
  JOIN equipment_types et ON et.id = em.equipment_type_id
`;

export class EquipmentModelsService {
  constructor(private readonly db: Pool) {}

  async list(
    params: EquipmentModelListParams,
  ): Promise<ListResult<EquipmentModelWithType>> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (params.is_active !== undefined) {
      values.push(params.is_active);
      conditions.push(`em.is_active = $${values.length}`);
    }

    if (params.equipment_type_id !== undefined) {
      values.push(params.equipment_type_id);
      conditions.push(`em.equipment_type_id = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count ${FROM_JOIN} ${where}`,
      values,
    );
    const total = Number.parseInt(countResult.rows[0]?.count ?? '0', 10);

    values.push(params.limit, params.offset);
    const limitIdx = values.length - 1;
    const offsetIdx = values.length;

    const { rows } = await this.db.query<EquipmentModelWithType>(
      `SELECT ${RETURNING_COLUMNS}
       ${FROM_JOIN}
       ${where}
       ORDER BY et.name, em.manufacturer, em.model
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      values,
    );

    return { items: rows, total, limit: params.limit, offset: params.offset };
  }

  async getById(id: number): Promise<EquipmentModelWithType> {
    const { rows } = await this.db.query<EquipmentModelWithType>(
      `SELECT ${RETURNING_COLUMNS}
       ${FROM_JOIN}
       WHERE em.id = $1`,
      [id],
    );
    const row = rows[0];
    if (!row) {
      throw new NotFoundError('EquipmentModel', id);
    }
    return row;
  }

  async create(data: EquipmentModelCreate): Promise<EquipmentModelWithType> {
    const { rows } = await this.db.query<{ id: number }>(
      `INSERT INTO equipment_models (equipment_type_id, manufacturer, model, is_active)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        data.equipment_type_id,
        data.manufacturer,
        data.model,
        data.is_active ?? true,
      ],
    );
    return this.getById(rows[0]!.id);
  }

  async update(
    id: number,
    data: EquipmentModelUpdate,
  ): Promise<EquipmentModelWithType> {
    const existing = await this.getById(id);
    const merged = {
      equipment_type_id: data.equipment_type_id ?? existing.equipment_type_id,
      manufacturer: data.manufacturer ?? existing.manufacturer,
      model: data.model ?? existing.model,
      is_active: data.is_active ?? existing.is_active,
    };

    await this.db.query(
      `UPDATE equipment_models
       SET equipment_type_id = $2,
           manufacturer = $3,
           model = $4,
           is_active = $5,
           updated_at = NOW()
       WHERE id = $1`,
      [
        id,
        merged.equipment_type_id,
        merged.manufacturer,
        merged.model,
        merged.is_active,
      ],
    );
    return this.getById(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.db.query(
      `DELETE FROM equipment_models WHERE id = $1`,
      [id],
    );
    if (result.rowCount === 0) {
      throw new NotFoundError('EquipmentModel', id);
    }
  }
}
