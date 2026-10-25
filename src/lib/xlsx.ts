import * as XLSX from 'xlsx';
import type { Row } from '@/types';

export interface ParsedSheet {
  columns: string[];
  rows: Row[];
}

/** Reads the first sheet. The first row is treated as headers. */
export async function parseSpreadsheet(file: File): Promise<ParsedSheet> {
  const wb = XLSX.read(await file.arrayBuffer());
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) throw new Error('This file has no sheets.');

  const rows = XLSX.utils.sheet_to_json<Row>(sheet, { defval: '', raw: false });
  const header = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 })[0] ?? [];
  const columns = header.map((h) => String(h)).filter(Boolean);

  if (!columns.length || !rows.length) throw new Error('No data rows found.');
  return { columns, rows };
}
