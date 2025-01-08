import { formatDistanceStrict, formatDistanceToNow, isSameYear } from 'date-fns';

// All db times are UTC. Add the Z to make this execution (local CF edge point or user's device)
// parse it as UTC and therefore make the Date object correct.
// ⚠️ This MUST be done on all date strings coming from the db ⚠️
export function parseDbDateStr(dbDate: string): Date {
  return new Date(dbDate + 'Z');
}

export function getTimeAgo(time: Date) {
  const timeAgo = formatDistanceToNow(time, { addSuffix: false });
  return timeAgo.replace('about ', '').trim();
}

export function getTimeAgoShort(time: Date, includeSpace = true) {
  const timeAgo = formatDistanceStrict(new Date(), time);
  if (timeAgo.includes('second')) {
    return 'now';
  }
  if (timeAgo.includes('minute')) {
    return includeSpace
      ? timeAgo.replace('minutes', 'min').replace('minute', 'min')
      : timeAgo.replace(' minutes', 'min').replace(' minute', 'min');
  }

  if (includeSpace) {
    return timeAgo
      .replace('days', 'd')
      .replace('day', 'd')
      .replace('hours', 'hr')
      .replace('hour', 'hr')
      .replace('months', 'mo')
      .replace('month', 'mo')
      .replace('years', 'yr')
      .replace('year', 'yr');
  }

  return timeAgo
    .replace(' days', 'd')
    .replace(' day', 'd')
    .replace(' hours', 'hr')
    .replace(' hour', 'hr')
    .replace(' months', 'mo')
    .replace(' month', 'mo')
    .replace(' years', 'yr')
    .replace(' year', 'yr');
}

export function formatContributionDate(date: Date) {
  const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
  const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);

  if (isSameYear(date, new Date())) {
    return `${mo} ${da}`;
  }

  const yearTwoDigits = new Intl.DateTimeFormat('en', { year: '2-digit' }).format(date);
  return `${mo} ${da}, ${yearTwoDigits}`;
}
