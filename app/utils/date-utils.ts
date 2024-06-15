import { formatDistanceStrict, formatDistanceToNow } from 'date-fns';

export function getTimeAgo(time: string) {
  const timeAgo = formatDistanceToNow(new Date(time), {
    addSuffix: false,
  });

  return timeAgo;
}

export function getTimeAgoShort(time: string, includeSpace = true) {
  const localTime = UTCTimeStrToLocalDate(time);
  const timeAgo = formatDistanceStrict(new Date(), localTime);
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

export function UTCTimeStrToLocalDate(utcTimeStr: string): Date {
  return new Date(utcTimeStr + 'Z');
}

export function localDateToUTCTimeStr(date: Date): string {
  return date.toISOString().replace('T', ' ').replace('Z', '');
}
