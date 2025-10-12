import { format } from 'date-fns';
import { useMemo } from 'react';
import { LineChart, XAxis, YAxis, Line, Tooltip } from 'recharts';
import { useUIPreferences } from '~/utils/theme-provider';
import useWindowSize from '~/utils/useWindowSize';

export default function AdClickStats({
  clickStats,
}: {
  clickStats: { clicks: number; date: Date }[];
}) {
  const { theme } = useUIPreferences();
  const { width, isMobile } = useWindowSize();

  const processedData = useMemo(() => {
    return clickStats.map(click => ({
      date: click.date.getTime(),
      clicks: click.clicks,
    }));
  }, [clickStats]);

  const graphWidth = isMobile ? 340 : width && width < 1030 ? 500 : 800;

  return (
    <LineChart
      width={graphWidth}
      height={400}
      data={processedData}
      className="mt-2 -ml-10"
    >
      <XAxis
        dataKey="date"
        type="number"
        allowDataOverflow={false}
        domain={['dataMin', 'dataMax']}
        stroke={theme === 'light' ? '#000' : '#ddd'}
        tickFormatter={date => format(date, 'MMM d')}
      />

      <YAxis
        dataKey="clicks"
        type="number"
        domain={[0, 'max']}
        stroke={theme === 'light' ? '#000' : '#ddd'}
      />

      <Line type="monotone" dataKey="clicks" stroke="#08ccc2" strokeWidth={2} />

      <Tooltip
        content={({ payload }) => {
          if (!payload || payload.length === 0) return null;
          const firstPayload = payload[0];
          return (
            <div className="p-2 bg-white dark:bg-gray-100 dark:border-gray-600">
              <div>
                {format(firstPayload.payload.date, 'PP')}: {firstPayload.value} clicks
              </div>
            </div>
          );
        }}
      />
    </LineChart>
  );
}
