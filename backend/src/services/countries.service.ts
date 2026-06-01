import type { Pool } from 'pg';

import { NotFoundError } from '../errors.js';
import type { GeoCountry, ListResult } from '../types.js';
import type { countryCreateSchema, countryUpdateSchema } from '../validation.js';
import type { z } from 'zod';

type CountryCreate = z.infer<typeof countryCreateSchema>;
type CountryUpdate = z.infer<typeof countryUpdateSchema>;

export interface CountryListParams {
  limit: number;
  offset: number;
  is_active?: boolean;
}

export class CountriesService {
  constructor(private readonly db: Pool) {}

  async list(params: CountryListParams): Promise<ListResult<GeoCountry>> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (params.is_active !== undefined) {
      values.push(params.is_active);
      conditions.push(`is_active = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM geo_countries ${where}`,
      values,
    );
    const total = Number.parseInt(countResult.rows[0]?.count ?? '0', 10);

    values.push(params.limit, params.offset);
    const limitIdx = values.length - 1;
    const offsetIdx = values.length;

    const { rows } = await this.db.query<GeoCountry>(
      `SELECT id, iso_alpha2, iso_alpha3, name_ru, name_en, is_active
       FROM geo_countries
       ${where}
       ORDER BY name_ru
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      values,
    );

    return { items: rows, total, limit: params.limit, offset: params.offset };
  }

  async getById(id: number): Promise<GeoCountry> {
    const { rows } = await this.db.query<GeoCountry>(
      `SELECT id, iso_alpha2, iso_alpha3, name_ru, name_en, is_active
       FROM geo_countries WHERE id = $1`,
      [id],
    );
    const row = rows[0];
    if (!row) {
      throw new NotFoundError('Country', id);
    }
    return row;
  }

  async create(data: CountryCreate): Promise<GeoCountry> {
    const { rows } = await this.db.query<GeoCountry>(
      `INSERT INTO geo_countries (iso_alpha2, iso_alpha3, name_ru, name_en, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, iso_alpha2, iso_alpha3, name_ru, name_en, is_active`,
      [
        data.iso_alpha2,
        data.iso_alpha3 ?? null,
        data.name_ru,
        data.name_en ?? null,
        data.is_active ?? true,
      ],
    );
    return rows[0]!;
  }

  async update(id: number, data: CountryUpdate): Promise<GeoCountry> {
    const existing = await this.getById(id);
    const merged = { ...existing, ...data };

    const { rows } = await this.db.query<GeoCountry>(
      `UPDATE geo_countries
       SET iso_alpha2 = $2,
           iso_alpha3 = $3,
           name_ru = $4,
           name_en = $5,
           is_active = $6
       WHERE id = $1
       RETURNING id, iso_alpha2, iso_alpha3, name_ru, name_en, is_active`,
      [
        id,
        merged.iso_alpha2,
        merged.iso_alpha3,
        merged.name_ru,
        merged.name_en,
        merged.is_active,
      ],
    );
    return rows[0]!;
  }

  async remove(id: number): Promise<void> {
    const result = await this.db.query(
      `DELETE FROM geo_countries WHERE id = $1`,
      [id],
    );
    if (result.rowCount === 0) {
      throw new NotFoundError('Country', id);
    }
  }
}
