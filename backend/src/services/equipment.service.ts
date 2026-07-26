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

const RETURNING_COLUMNS = `
  id, department_id, equipment_type_id, name, manufacturer, model,
  serial_number, inventory_number, manufacture_year, is_active,
  created_at, updated_at
`;

export class EquipmentService {
  constructor(private readonly db: Pool) {}

  async listByDepartment(
    departmentId: number,
    params: EquipmentListParams,
  ): Promise<ListResult<Equipment>> {
    const conditions: string[] = ['department_id = $1'];
    const values: unknown[] = [departmentId];

    if (params.is_active !== undefined) {
      values.push(params.is_active);
      conditions.push(`is_active = $${values.length}`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM equipment ${where}`,
      values,
    );
    const total = Number.parseInt(countResult.rows[0]?.count ?? '0', 10);

    values.push(params.limit, params.offset);
    const limitIdx = values.length - 1;
    const offsetIdx = values.length;

    const { rows } = await this.db.query<Equipment>(
      `SELECT ${RETURNING_COLUMNS}
       FROM equipment
       ${where}
       ORDER BY name
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      values,
    );

    return { items: rows, total, limit: params.limit, offset: params.offset };
  }

  async getById(departmentId: number, id: number): Promise<Equipment> {
    const { rows } = await this.db.query<Equipment>(
      `SELECT ${RETURNING_COLUMNS}
       FROM equipment
       WHERE id = $1 AND department_id = $2`,
      [id, departmentId],
    );
    const row = rows[0];
    if (!row) {
      throw new NotFoundError('Equipment', id);
    }
    return row;
  }

  async create(departmentId: number, data: EquipmentCreate): Promise<Equipment> {
    const { rows } = await this.db.query<Equipment>(
      `INSERT INTO equipment (
         department_id, equipment_type_id, name, manufacturer, model,
         serial_number, inventory_number, manufacture_year, is_active
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${RETURNING_COLUMNS}`,
      [
        departmentId,
        data.equipment_type_id,
        data.name,
        data.manufacturer ?? null,
        data.model ?? null,
        data.serial_number ?? null,
        data.inventory_number ?? null,
        data.manufacture_year ?? null,
        data.is_active ?? true,
      ],
    );
    return rows[0]!;
  }

  async update(
    departmentId: number,
    id: number,
    data: EquipmentUpdate,
  ): Promise<Equipment> {
    const existing = await this.getById(departmentId, id);
    const merged = {
      equipment_type_id: data.equipment_type_id ?? existing.equipment_type_id,
      name: data.name ?? existing.name,
      manufacturer:
        data.manufacturer !== undefined ? data.manufacturer : existing.manufacturer,
      model: data.model !== undefined ? data.model : existing.model,
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

    const { rows } = await this.db.query<Equipment>(
      `UPDATE equipment
       SET equipment_type_id = $3,
           name = $4,
           manufacturer = $5,
           model = $6,
           serial_number = $7,
           inventory_number = $8,
           manufacture_year = $9,
           is_active = $10,
           updated_at = NOW()
       WHERE id = $1 AND department_id = $2
       RETURNING ${RETURNING_COLUMNS}`,
      [
        id,
        departmentId,
        merged.equipment_type_id,
        merged.name,
        merged.manufacturer,
        merged.model,
        merged.serial_number,
        merged.inventory_number,
        merged.manufacture_year,
        merged.is_active,
      ],
    );
    return rows[0]!;
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
