/**
 * Generates backend/templates/regions-export.docx for docxtemplater.
 * Run: node scripts/build-regions-template.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import PizZip from 'pizzip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, '../templates/regions-export.docx');

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const documentRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>
`;

function cell(text) {
  return `<w:tc><w:tcPr><w:tcW w:w="2000" w:type="dxa"/></w:tcPr><w:p><w:r><w:t xml:space="preserve">${text}</w:t></w:r></w:p></w:tc>`;
}

function row(cells) {
  return `<w:tr>${cells.map((c) => cell(c)).join('')}</w:tr>`;
}

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t xml:space="preserve">Справочник субъектов Российской Федерации</w:t></w:r></w:p>
    <w:p><w:r><w:t xml:space="preserve">Всего записей: {total}</w:t></w:r></w:p>
    <w:p><w:r><w:t xml:space="preserve">Дата формирования: {generatedAt}</w:t></w:r></w:p>
    <w:tbl>
      <w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      </w:tblBorders></w:tblPr>
      ${row(['№', 'Код', 'Наименование', 'Кратко', 'Тип', 'Активен'])}
      ${row(['{#regions}{index}', '{code}', '{name_ru}', '{name_short_ru}', '{region_type}', '{is_active}{/regions}'])}
    </w:tbl>
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;

const zip = new PizZip();
zip.file('[Content_Types].xml', contentTypes);
zip.file('_rels/.rels', rels);
zip.file('word/_rels/document.xml.rels', documentRels);
zip.file('word/document.xml', documentXml);

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }));
console.log(`Wrote ${outPath}`);
