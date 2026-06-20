export function parseRuDate(value: string | null | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }

  const match = value.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
  if (!match) {
    return null;
  }

  const day = Number.parseInt(match[1]!, 10);
  const month = Number.parseInt(match[2]!, 10);
  let year = Number.parseInt(match[3]!, 10);
  if (year < 100) {
    year += 2000;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const iso = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return iso;
}

export function formatRuDate(isoDate: string | Date | null): string | null {
  if (!isoDate) {
    return null;
  }

  if (isoDate instanceof Date) {
    const day = String(isoDate.getDate()).padStart(2, '0');
    const month = String(isoDate.getMonth() + 1).padStart(2, '0');
    const year = isoDate.getFullYear();
    return `${day}.${month}.${year}`;
  }

  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return isoDate;
  }

  return `${match[3]}.${match[2]}.${match[1]}`;
}
