import { formatDistanceStrict, formatDistanceToNow } from 'date-fns';

export function getTimeAgo(time: string) {
  const timeAgo = formatDistanceToNow(new Date(time), {
    addSuffix: false,
  });

  return timeAgo;
}

export function getTimeAgoShort(time: string, includeSpace = true) {
  const timeAgo = formatDistanceStrict(new Date(), new Date(time));
  if (timeAgo.includes('second') || timeAgo.includes('minute')) {
    return '0hr';
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
