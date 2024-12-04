'use client';

import { formatWeight } from '@/app/lib/utils/formatWeight';

interface Metric {
  icon: (props: { className?: string }) => JSX.Element;
  label: string;
  value: string | number;
  change?: number;
}

interface CompactMetricsMobileProps {
  metrics: Metric[];
}

export default function CompactMetricsMobile({ metrics }: CompactMetricsMobileProps) {
  const formatMetricValue = (metric: Metric) => {
    if (metric.label === 'Total Weight') {
      return formatWeight(typeof metric.value === 'string' ? parseInt(metric.value) : metric.value);
    }
    return metric.value;
  };

  return (
    <div className="lg:hidden space-y-2">
      {metrics.map((metric, index) => (
        <div 
          key={index}
          className="bg-white dark:bg-black rounded-lg border border-gray-100 dark:border-gray-900 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <metric.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {metric.label}
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {formatMetricValue(metric)}
                </p>
                {metric.change !== undefined && (
                  <span className={`text-xs font-medium ${
                    metric.change >= 0 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {metric.change >= 0 ? '+' : ''}{metric.change}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}