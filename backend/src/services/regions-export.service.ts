import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Docxtemplater from 'docxtemplater';
import type { Pool } from 'pg';
import PizZip from 'pizzip';

import { RegionsService } from './regions.service.js';

const REGION_TYPE_LABELS: Record<string, string> = {
  republic: 'Республика',
  krai: 'Край',
  oblast: 'Область',
  city_federal: 'Город федерального значения',
  autonomous_oblast: 'Автономная область',
  autonomous_okrug: 'Автономный округ',
};

function backendRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
}

function templatePath(): string {
  return path.join(backendRoot(), 'templates', 'regions-export.docx');
}

function formatRegionType(value: string | null): string {
  if (!value) {
    return '—';
  }
  return REGION_TYPE_LABELS[value] ?? value;
}

function formatActive(active: boolean): string {
  return active ? 'Да' : 'Нет';
}

function formatGeneratedAt(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

export class RegionsExportService {
  private readonly regions: RegionsService;

  constructor(db: Pool) {
    this.regions = new RegionsService(db);
  }

  async generateDocx(): Promise<Buffer> {
    const templateFile = templatePath();
    if (!fs.existsSync(templateFile)) {
      throw new Error(
        `Шаблон не найден: ${templateFile}. Запустите: node scripts/build-regions-template.mjs`,
      );
    }

    const { items, total } = await this.regions.list({
      country_iso: 'RU',
      limit: 500,
      offset: 0,
    });

    const content = fs.readFileSync(templateFile);
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.render({
      total: String(total),
      generatedAt: formatGeneratedAt(new Date()),
      regions: items.map((row, i) => ({
        index: String(row.sort_order ?? i + 1),
        code: row.code,
        name_ru: row.name_ru,
        name_short_ru: row.name_short_ru ?? '—',
        region_type: formatRegionType(row.region_type),
        is_active: formatActive(row.is_active),
      })),
    });

    return doc.toBuffer() as Buffer;
  }
}
