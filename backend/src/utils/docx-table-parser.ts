function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function extractCellText(cellXml: string): string {
  const parts = [...cellXml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) =>
    m[1]!.replace(/\s+/g, ' '),
  );
  return normalizeText(parts.join(''));
}

export function extractTableRows(tableXml: string): string[][] {
  const rows = [...tableXml.matchAll(/<w:tr[\s>]([\s\S]*?)<\/w:tr>/g)];
  return rows.map((row) => {
    const cells = [...row[1]!.matchAll(/<w:tc[\s>]([\s\S]*?)<\/w:tc>/g)];
    return cells.map((cell) => extractCellText(cell[1]!));
  });
}

export function extractTables(documentXml: string): string[][][] {
  const tables = [...documentXml.matchAll(/<w:tbl>([\s\S]*?)<\/w:tbl>/g)];
  return tables.map((table) => extractTableRows(table[1]!));
}

export function extractParagraphTexts(documentXml: string): string[] {
  const bodyMatch = documentXml.match(/<w:body>([\s\S]*)<\/w:body>/);
  if (!bodyMatch) {
    return [];
  }

  const body = bodyMatch[1]!;
  const paragraphs = [...body.matchAll(/<w:p[\s>]([\s\S]*?)<\/w:p>/g)];
  return paragraphs
    .filter((paragraph) => !paragraph[1]!.includes('<w:tbl>'))
    .map((paragraph) => {
      const parts = [...paragraph[1]!.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(
        (m) => m[1]!.replace(/\s+/g, ' '),
      );
      return normalizeText(parts.join(''));
    })
    .filter(Boolean);
}

export function cellHasVMergeRestart(cellXml: string): boolean {
  return /<w:vMerge w:val="restart"\/>/.test(cellXml);
}

export function cellIsVMergeContinue(cellXml: string): boolean {
  return /<w:vMerge\/>/.test(cellXml) && !cellHasVMergeRestart(cellXml);
}

export interface TableRowMeta {
  cells: string[];
  firstCellVMergeRestart: boolean;
  firstCellVMergeContinue: boolean;
}

export function extractTableRowsWithMeta(tableXml: string): TableRowMeta[] {
  const rows = [...tableXml.matchAll(/<w:tr[\s>]([\s\S]*?)<\/w:tr>/g)];
  return rows.map((row) => {
    const cellMatches = [...row[1]!.matchAll(/<w:tc[\s>]([\s\S]*?)<\/w:tc>/g)];
    const cells = cellMatches.map((cell) => extractCellText(cell[1]!));
    const firstCellXml = cellMatches[0]?.[1] ?? '';
    return {
      cells,
      firstCellVMergeRestart: cellHasVMergeRestart(firstCellXml),
      firstCellVMergeContinue: cellIsVMergeContinue(firstCellXml),
    };
  });
}

export function findMainDataTableXml(documentXml: string): string | null {
  const tables = [...documentXml.matchAll(/<w:tbl>([\s\S]*?)<\/w:tbl>/g)];
  for (const table of tables) {
    if (table[1]!.includes('Наименование оборудования:')) {
      return table[1]!;
    }
  }
  return null;
}
