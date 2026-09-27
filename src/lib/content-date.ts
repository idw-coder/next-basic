const DATE_ONLY_PATTERN = /^(\d{4})[-/](\d{2})[-/](\d{2})(?:T.*)?$/;

function parseDateOnly(value: string) {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

/** Asia/Tokyo の今日を日付だけのISO形式で返す。 */
export function getTodayInTokyo() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${values.year}-${values.month}-${values.day}`;
}

/** 対象日が今日から暦上の1か月以内なら true。未来日は含めない。 */
export function isWithinOneMonth(date: string, today: string) {
  const targetDate = parseDateOnly(date);
  const currentDate = parseDateOnly(today);
  if (!targetDate || !currentDate) return false;

  const previousMonthLastDay = new Date(
    Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 0),
  ).getUTCDate();
  const oneMonthAgo = new Date(
    Date.UTC(
      currentDate.getUTCFullYear(),
      currentDate.getUTCMonth() - 1,
      Math.min(currentDate.getUTCDate(), previousMonthLastDay),
    ),
  );

  return targetDate >= oneMonthAgo && targetDate <= currentDate;
}
