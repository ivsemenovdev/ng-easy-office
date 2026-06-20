import type { Pool } from 'pg';
import type { z } from 'zod';

import { NotFoundError } from '../errors.js';
import type { DiagnosticAct, ListResult } from '../types.js';
import { formatRuDate, parseRuDate } from '../utils/ru-date.js';
import type { diagnosticActCreateSchema } from '../validation.js';

type DiagnosticActCreate = z.infer<typeof diagnosticActCreateSchema>;

export interface DiagnosticActListParams {
  limit: number;
  offset: number;
  hospital_id: number;
}

const SELECT_COLUMNS = `
  a.id, a.hospital_id, a.act_number, a.act_date, a.act_title,
  a.equipment_name, a.equipment_model, a.serial_number,
  a.customer, a.customer_address, a.work_type, a.basis,
  a.equipment_condition, a.completed_works, a.conclusion,
  a.created_at, a.updated_at
`;

const RETURNING_COLUMNS = `
  id, hospital_id, act_number, act_date, act_title,
  equipment_name, equipment_model, serial_number,
  customer, customer_address, work_type, basis,
  equipment_condition, completed_works, conclusion,
  created_at, updated_at
`;

function mapActRow(row: DiagnosticAct): DiagnosticAct {
  return {
    ...row,
    act_date: formatRuDate(row.act_date),
  };
}

export class DiagnosticActsService {
  constructor(private readonly db: Pool) {}

  async list(params: DiagnosticActListParams): Promise<ListResult<DiagnosticAct>> {
    const values: unknown[] = [params.hospital_id];

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM diagnostic_acts a WHERE a.hospital_id = $1`,
      values,
    );
    const total = Number.parseInt(countResult.rows[0]?.count ?? '0', 10);

    values.push(params.limit, params.offset);

    const { rows } = await this.db.query<DiagnosticAct>(
      `SELECT ${SELECT_COLUMNS}
       FROM diagnostic_acts a
       WHERE a.hospital_id = $1
       ORDER BY a.created_at DESC, a.id DESC
       LIMIT $2 OFFSET $3`,
      values,
    );

    return {
      items: rows.map(mapActRow),
      total,
      limit: params.limit,
      offset: params.offset,
    };
  }

  async getById(id: number): Promise<DiagnosticAct> {
    const { rows } = await this.db.query<DiagnosticAct>(
      `SELECT ${SELECT_COLUMNS} FROM diagnostic_acts a WHERE a.id = $1`,
      [id],
    );
    const row = rows[0];
    if (!row) {
      throw new NotFoundError('DiagnosticAct', id);
    }
    return mapActRow(row);
  }

  async create(
    data: DiagnosticActCreate,
  ): Promise<{ act: DiagnosticAct; warnings: string[] }> {
    const warnings: string[] = [];
    const parsedDate = parseRuDate(data.act_date);
    if (data.act_date?.trim() && !parsedDate) {
      warnings.push(`Не удалось распознать дату акта: «${data.act_date}»`);
    }

    const { rows } = await this.db.query<DiagnosticAct>(
      `INSERT INTO diagnostic_acts (
         hospital_id, act_number, act_date, act_title,
         equipment_name, equipment_model, serial_number,
         customer, customer_address, work_type, basis,
         equipment_condition, completed_works, conclusion
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING ${RETURNING_COLUMNS}`,
      [
        data.hospital_id,
        data.act_number ?? null,
        parsedDate,
        data.act_title ?? null,
        data.equipment_name ?? null,
        data.equipment_model ?? null,
        data.serial_number ?? null,
        data.customer ?? null,
        data.customer_address ?? null,
        data.work_type ?? null,
        data.basis ?? null,
        data.equipment_condition ?? [],
        data.completed_works ?? [],
        data.conclusion ?? [],
      ],
    );

    return { act: mapActRow(rows[0]!), warnings };
  }
}
