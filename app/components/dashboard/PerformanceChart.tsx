'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { useTheme } from '@/app/providers/ThemeProvider';

interface ChartData {
  date: string;
  totalWeight: number;
}

interface PerformanceChartProps {
  data: ChartData[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const { theme } = useTheme();

  return (
    <div className="bg-white dark:bg-black rounded-lg border border-gray-100 dark:border-gray-900 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-medium text-gray-900 dark:text-white">Performance Trend</h3>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1f2937' : '#f3f4f6'} opacity={0.5} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => format(new Date(value), 'MMM d')}
              stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'}
              tickFormatter={(value) => `${value}kg`}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                padding: '12px'
              }}
              labelFormatter={(value) => format(new Date(value), 'PPP')}
            />
            <Line
              type="monotone"
              dataKey="totalWeight"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}