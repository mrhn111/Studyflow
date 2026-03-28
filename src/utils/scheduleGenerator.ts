import type { Topic, DayEntry } from '../types';

/** Format a Date to "YYYY-MM-DD" using local time (avoids UTC shift). */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse "YYYY-MM-DD" to a local midnight Date. */
function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Return "YYYY-MM-DD" for tomorrow (local time). */
export function getTomorrow(): string {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return formatLocalDate(t);
}

/** Format a "YYYY-MM-DD" string to a human-readable label like "Mon, Jun 3". */
export function formatDisplayDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Distribute topics evenly across days from tomorrow to deadline (inclusive).
 * Returns only DayEntry items that have at least one topic.
 */
export function generateSchedule(topics: Topic[], deadline: string): DayEntry[] {
  if (!topics.length || !deadline) return [];

  const start = parseLocalDate(getTomorrow());
  const end = parseLocalDate(deadline);

  if (end < start) return [];

  // Build array of date strings from start to end
  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(formatLocalDate(cur));
    cur.setDate(cur.getDate() + 1);
  }

  if (dates.length === 0) return [];

  // Map from date string → topics list
  const dayMap: Record<string, { id: string; name: string; completed: boolean }[]> = {};

  if (topics.length >= dates.length) {
    // Round-robin: topic[i] → day[i % dates.length]
    topics.forEach((topic, i) => {
      const date = dates[i % dates.length];
      if (!dayMap[date]) dayMap[date] = [];
      dayMap[date].push({ id: topic.id, name: topic.name, completed: false });
    });
  } else {
    // Space them out: topic[j] → day[j * spacing]
    const spacing = Math.floor(dates.length / topics.length);
    topics.forEach((topic, j) => {
      const date = dates[Math.min(j * spacing, dates.length - 1)];
      if (!dayMap[date]) dayMap[date] = [];
      dayMap[date].push({ id: topic.id, name: topic.name, completed: false });
    });
  }

  // Return DayEntry[] only for populated days, sorted by date
  return Object.entries(dayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, topicsArr]) => ({ date, topics: topicsArr }));
}
