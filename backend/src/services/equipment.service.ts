import type { Pool } from 'pg';
import type { z } from 'zod';

import { NotFoundError } from '../errors.js';
import type { Equipment, ListResult } from '../types.js';
import type { equipmentCreateSchema, equipmentUpdateSchema } from '../validation.js';

type EquipmentCreate = z.infer<typeof equipmentCreateSchema>;
type EquipmentUpdate = z.infer<typeof equipmentUpdateSchema>;

export interface EquipmentListParams {
  limit: number;
  offset: number;
  is_active?: boolean;
}

const SELECT_COLUMNS = `
  e.id,
  e.department_id,
  e.equipment_model_id,
  em.equipment_type_id,
  et.name AS equipment_type_name,
  em.manufacturer,
  em.model,
  e.serial_number,
  e.inventory_number,
  e.manufacture_year,
  e.is_active,
  e.created_at,
  e.updated_at
`;

const FROM_JOIN = `
  FROM equipment e
  JOIN equipment_models em ON em.id = e.equipment_model_id
  JOIN equipment_types et ON et.id = em.equipment_type_id
`;

export class EquipmentService {
  constructor(private readonly db: Pool) {}

  async listByDepartment(
    departmentId: number,
    params: EquipmentListParams,
  ): Promise<ListResult<Equipment>> {
    const conditions: string[] = ['e.department_id = $1'];
    const values: unknown[] = [departmentId];

    if (params.is_active !== undefined) {
      values.push(params.is_active);
      conditions.push(`e.is_active = $${values.length}`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count ${FROM_JOIN} ${where}`,
      values,
    );
    const total = Number.parseInt(countResult.rows[0]?.count ?? '0', 10);

    values.push(params.limit, params.offset);
    const limitIdx = values.length - 1;
    const offsetIdx = values.length;

    const { rows } = await this.db.query<Equipment>(
      `SELECT ${SELECT_COLUMNS}
       ${FROM_JOIN}
       ${where}
       ORDER BY em.manufacturer, em.model, e.serial_number
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      values,
    );

    return { items: rows, total, limit: params.limit, offset: params.offset };
  }

  async getById(departmentId: number, id: number): Promise<Equipment> {
    const { rows } = await this.db.query<Equipment>(
      `SELECT ${SELECT_COLUMNS}
       ${FROM_JOIN}
       WHERE e.id = $1 AND e.department_id = $2`,
      [id, departmentId],
    );
    const row = rows[0];
    if (!row) {
      throw new NotFoundError('Equipment', id);
    }
    return row;
  }

  async create(departmentId: number, data: EquipmentCreate): Promise<Equipment> {
    const { rows } = await this.db.query<{ id: number }>(
      `INSERT INTO equipment (
         department_id, equipment_model_id, serial_number,
         inventory_number, manufacture_year, is_active
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        departmentId,
        data.equipment_model_id,
        data.serial_number ?? null,
        data.inventory_number ?? null,
        data.manufacture_year ?? null,
        data.is_active ?? true,
      ],
    );
    return this.getById(departmentId, rows[0]!.id);
  }

  async update(
    departmentId: number,
    id: number,
    data: EquipmentUpdate,
  ): Promise<Equipment> {
    const existing = await this.getById(departmentId, id);
    const merged = {
      equipment_model_id: data.equipment_model_id ?? existing.equipment_model_id,
      serial_number:
        data.serial_number !== undefined ? data.serial_number : existing.serial_number,
      inventory_number:
        data.inventory_number !== undefined
          ? data.inventory_number
          : existing.inventory_number,
      manufacture_year:
        data.manufacture_year !== undefined
          ? data.manufacture_year
          : existing.manufacture_year,
      is_active: data.is_active ?? existing.is_active,
    };

    await this.db.query(
      `UPDATE equipment
       SET equipment_model_id = $3,
           serial_number = $4,
           inventory_number = $5,
           manufacture_year = $6,
           is_active = $7,
           updated_at = NOW()
       WHERE id = $1 AND department_id = $2`,
      [
        id,
        departmentId,
        merged.equipment_model_id,
        merged.serial_number,
        merged.inventory_number,
        merged.manufacture_year,
        merged.is_active,
      ],
    );
    return this.getById(departmentId, id);
  }

  async remove(departmentId: number, id: number): Promise<void> {
    const result = await this.db.query(
      `DELETE FROM equipment WHERE id = $1 AND department_id = $2`,
      [id, departmentId],
    );
    if (result.rowCount === 0) {
      throw new NotFoundError('Equipment', id);
    }
  }
}
