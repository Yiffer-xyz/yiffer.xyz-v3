import { formatDistanceStrict, formatDistanceToNow } from 'date-fns';

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
      ? timeAgo.replace('minutes', 'm').replace('minute', 'm')
      : timeAgo.replace(' minutes', 'm');
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
