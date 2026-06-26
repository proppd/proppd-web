/**
 * Minimal RFC 4180-style CSV parser.
 *
 * Agency CRM and spreadsheet export tools hand out CSV with quoted fields,
 * embedded commas, embedded newlines, and escaped double quotes. This parser
 * handles those cases without a third-party dependency. The first non-empty row
 * is treated as the header.
 */

export type CsvRecord = Record<string, string>;

export function parseCsv(input: string): CsvRecord[] {
  const rows = parseCsvRows(input);
  if (rows.length === 0) return [];

  const header = rows[0].map((cell) => cell.trim());
  const records: CsvRecord[] = [];

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    // Skip fully empty rows (trailing newline artefacts).
    if (row.length === 1 && row[0].trim() === '') continue;

    const record: CsvRecord = {};
    header.forEach((key, index) => {
      if (!key) return;
      record[key] = (row[index] ?? '').trim();
    });
    records.push(record);
  }

  return records;
}

/** Split raw CSV text into an array of cell arrays, respecting quotes. */
function parseCsvRows(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  const text = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  // Flush the final cell/row if the file did not end on a newline.
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}
