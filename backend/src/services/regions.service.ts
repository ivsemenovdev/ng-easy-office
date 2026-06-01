import type { Pool } from 'pg';
import type { z } from 'zod';

import { NotFoundError } from '../errors.js';
import type { GeoRegion, ListResult } from '../types.js';
import type { regionCreateSchema, regionUpdateSchema } from '../validation.js';

type RegionCreate = z.infer<typeof regionCreateSchema>;
type RegionUpdate = z.infer<typeof regionUpdateSchema>;

export interface RegionListParams {
  limit: number;
  offset: number;
  country_id?: number;
  country_iso?: string;
  parent_id?: number;
  level?: string;
  is_active?: boolean;
}

const SELECT_COLUMNS = `
  r.id, r.country_id, r.parent_id, r.level, r.code, r.okato,
  r.name_ru, r.name_short_ru, r.name_en, r.region_type, r.sort_order,
  r.is_active, r.created_at, r.updated_at
`;

export class RegionsService {
  constructor(private readonly db: Pool) {}

  async list(params: RegionListParams): Promise<ListResult<GeoRegion>> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let join = '';

    if (params.country_iso) {
      join = 'JOIN geo_countries c ON c.id = r.country_id';
      values.push(params.country_iso);
      conditions.push(`c.iso_alpha2 = $${values.length}`);
    }

    if (params.country_id !== undefined) {
      values.push(params.country_id);
      conditions.push(`r.country_id = $${values.length}`);
    }
    if (params.parent_id !== undefined) {
      values.push(params.parent_id);
      conditions.push(`r.parent_id = $${values.length}`);
    }
    if (params.level !== undefined) {
      values.push(params.level);
      conditions.push(`r.level = $${values.length}`);
    }
    if (params.is_active !== undefined) {
      values.push(params.is_active);
      conditions.push(`r.is_active = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM geo_regions r ${join} ${where}`,
      values,
    );
    const total = Number.parseInt(countResult.rows[0]?.count ?? '0', 10);

    values.push(params.limit, params.offset);
    const limitIdx = values.length - 1;
    const offsetIdx = values.length;

    const { rows } = await this.db.query<GeoRegion>(
      `SELECT ${SELECT_COLUMNS}
       FROM geo_regions r
       ${join}
       ${where}
       ORDER BY r.sort_order NULLS LAST, r.name_ru
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      values,
    );

    return { items: rows, total, limit: params.limit, offset: params.offset };
  }

  async getById(id: number): Promise<GeoRegion> {
    const { rows } = await this.db.query<GeoRegion>(
      `SELECT ${SELECT_COLUMNS} FROM geo_regions r WHERE r.id = $1`,
      [id],
    );
    const row = rows[0];
    if (!row) {
      throw new NotFoundError('Region', id);
    }
    return row;
  }

  async create(data: RegionCreate): Promise<GeoRegion> {
    const { rows } = await this.db.query<GeoRegion>(
      `INSERT INTO geo_regions (
         country_id, parent_id, level, code, okato,
         name_ru, name_short_ru, name_en, region_type, sort_order, is_active
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, country_id, parent_id, level, code, okato,
         name_ru, name_short_ru, name_en, region_type, sort_order,
         is_active, created_at, updated_at`,
      [
        data.country_id,
        data.parent_id ?? null,
        data.level,
        data.code,
        data.okato ?? null,
        data.name_ru,
        data.name_short_ru ?? null,
        data.name_en ?? null,
        data.region_type ?? null,
        data.sort_order ?? null,
        data.is_active ?? true,
      ],
    );
    return rows[0]!;
  }

  async update(id: number, data: RegionUpdate): Promise<GeoRegion> {
    const existing = await this.getById(id);
    const merged = {
      country_id: data.country_id ?? existing.country_id,
      parent_id:
        data.parent_id !== undefined ? data.parent_id : existing.parent_id,
      level: data.level ?? existing.level,
      code: data.code ?? existing.code,
      okato: data.okato !== undefined ? data.okato : existing.okato,
      name_ru: data.name_ru ?? existing.name_ru,
      name_short_ru:
        data.name_short_ru !== undefined
          ? data.name_short_ru
          : existing.name_short_ru,
      name_en: data.name_en !== undefined ? data.name_en : existing.name_en,
      region_type:
        data.region_type !== undefined ? data.region_type : existing.region_type,
      sort_order:
        data.sort_order !== undefined ? data.sort_order : existing.sort_order,
      is_active: data.is_active ?? existing.is_active,
    };

    const { rows } = await this.db.query<GeoRegion>(
      `UPDATE geo_regions
       SET country_id = $2,
           parent_id = $3,
           level = $4,
           code = $5,
           okato = $6,
           name_ru = $7,
           name_short_ru = $8,
           name_en = $9,
           region_type = $10,
           sort_order = $11,
           is_active = $12,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, country_id, parent_id, level, code, okato,
         name_ru, name_short_ru, name_en, region_type, sort_order,
         is_active, created_at, updated_at`,
      [
        id,
        merged.country_id,
        merged.parent_id,
        merged.level,
        merged.code,
        merged.okato,
        merged.name_ru,
        merged.name_short_ru,
        merged.name_en,
        merged.region_type,
        merged.sort_order,
        merged.is_active,
      ],
    );
    return rows[0]!;
  }

  async remove(id: number): Promise<void> {
    const result = await this.db.query(`DELETE FROM geo_regions WHERE id = $1`, [
      id,
    ]);
    if (result.rowCount === 0) {
      throw new NotFoundError('Region', id);
    }
  }
}
