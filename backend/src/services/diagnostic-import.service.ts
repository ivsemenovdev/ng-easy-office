import PizZip from 'pizzip';

import type { DiagnosticActData, DiagnosticActParseResponse } from '../types/diagnostic-act.js';
import { AppError } from '../errors.js';
import {
  extractParagraphTexts,
  extractTableRowsWithMeta,
  findMainDataTableXml,
} from '../utils/docx-table-parser.js';

const SIMPLE_FIELD_LABELS: Record<string, keyof DiagnosticActData> = {
  'Наименование оборудования:': 'equipmentName',
  'Модель оборудования:': 'equipmentModel',
  'Заводской номер:': 'serialNumber',
  'Заказчик:': 'customer',
  'Адрес заказчика:': 'customerAddress',
  'Тип работ:': 'workType',
  'Основание:': 'basis',
};

const SECTION_FIELD_LABELS: Record<
  string,
  'equipmentCondition' | 'completedWorks' | 'conclusion'
> = {
  'Состояние оборудования, выявленные дефекты:': 'equipmentCondition',
  'Перечень выполненных работ:': 'completedWorks',
  'Заключение:': 'conclusion',
};

type SectionFieldKey = (typeof SECTION_FIELD_LABELS)[keyof typeof SECTION_FIELD_LABELS];

const ACT_TITLE_MARKER = 'технического обслуживания / ремонта';

function emptyToNull(value: string): string | null {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length > 0 ? normalized : null;
}

function createEmptyData(): DiagnosticActData {
  return {
    actNumber: null,
    actDate: null,
    actTitle: null,
    equipmentName: null,
    equipmentModel: null,
    serialNumber: null,
    customer: null,
    customerAddress: null,
    workType: null,
    basis: null,
    equipmentCondition: [],
    completedWorks: [],
    conclusion: [],
  };
}

function parseActHeader(paragraphs: string[], data: DiagnosticActData): void {
  const actIndex = paragraphs.findIndex((p) => p === 'АКТ' || p.startsWith('АКТ '));
  if (actIndex === -1) {
    return;
  }

  const headerParts = paragraphs.slice(actIndex, actIndex + 8);
  const joined = headerParts.join(' ');

  const numberMatch = joined.match(/АКТ\s*№?\s*(\S+)/i);
  if (numberMatch) {
    data.actNumber = numberMatch[1]!.replace(/[.,]$/, '');
  }

  const titleIndex = paragraphs.findIndex((p) => p.includes(ACT_TITLE_MARKER));
  if (titleIndex !== -1) {
    data.actTitle = paragraphs[titleIndex]!;

    const dateParts: string[] = [];
    for (let i = titleIndex + 1; i < paragraphs.length; i++) {
      const part = paragraphs[i]!;
      if (
        part.includes('Наименование оборудования') ||
        part.includes('оборудования:')
      ) {
        break;
      }
      dateParts.push(part);
    }

    const dateRaw = dateParts.join('').replace(/\s+/g, '');
    const dateMatch = dateRaw.match(/(\d{1,2}\.\d{1,2}\.\d{2,4})г?\.?/);
    if (dateMatch) {
      data.actDate = dateMatch[1]!;
    }
  }
}

function getValueCell(cells: string[]): string {
  if (cells.length <= 1) {
    return '';
  }
  return cells.slice(1).join(' ').replace(/\s+/g, ' ').trim();
}

function parseMainTable(tableXml: string, data: DiagnosticActData): void {
  const rows = extractTableRowsWithMeta(tableXml);
  let currentSection: SectionFieldKey | null = null;

  for (const row of rows) {
    const label = row.cells[0] ?? '';
    const value = getValueCell(row.cells);

    const simpleField = SIMPLE_FIELD_LABELS[label];
    if (simpleField) {
      currentSection = null;
      (data[simpleField] as string | null) = emptyToNull(value);
      continue;
    }

    const sectionField = SECTION_FIELD_LABELS[label];
    if (sectionField || row.firstCellVMergeRestart) {
      const resolvedSection: SectionFieldKey | null =
        sectionField ?? currentSection;
      if (!resolvedSection) {
        continue;
      }

      currentSection = resolvedSection;
      const text = emptyToNull(value);
      if (text) {
        data[resolvedSection].push(text);
      }
      continue;
    }

    if (currentSection && (row.firstCellVMergeContinue || !label)) {
      const text = emptyToNull(value);
      if (text) {
        data[currentSection].push(text);
      }
    }
  }
}

export class DiagnosticImportService {
  parseDocx(buffer: Buffer): DiagnosticActParseResponse {
    let zip: PizZip;
    try {
      zip = new PizZip(buffer);
    } catch {
      throw new AppError('Файл не является DOCX', 400, 'INVALID_DOCX');
    }

    const documentFile = zip.file('word/document.xml');
    if (!documentFile) {
      throw new AppError('Файл не является DOCX', 400, 'INVALID_DOCX');
    }

    const documentXml = documentFile.asText();
    const mainTableXml = findMainDataTableXml(documentXml);
    if (!mainTableXml) {
      throw new AppError(
        'Документ не соответствует шаблону акта',
        400,
        'INVALID_ACT_TEMPLATE',
      );
    }

    const data = createEmptyData();
    parseActHeader(extractParagraphTexts(documentXml), data);
    parseMainTable(mainTableXml, data);

    return { data };
  }
}
