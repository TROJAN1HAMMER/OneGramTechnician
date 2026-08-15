export const parseDate = (dateStr: string | Date | undefined | null): Date => {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  
  // If the date string doesn't end with Z and doesn't have a timezone offset (+/-), append Z
  // This handles naive datetime strings returned by APIs like SQLite backends
  if (!dateStr.endsWith('Z') && !dateStr.match(/[+-]\d{2}:\d{2}$/)) {
    const isoStr = dateStr.replace(' ', 'T');
    return new Date(`${isoStr}Z`);
  }
  return new Date(dateStr);
};
