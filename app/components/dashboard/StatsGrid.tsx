'use client';

interface Stat {
  label: string;
  value: string | number;
  change?: number;
  icon: (props: { className?: string }) => JSX.Element;
}

interface StatsGridProps {
  stats: Stat[];
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white dark:bg-black rounded-lg border border-gray-100 dark:border-gray-900 p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
              <stat.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                {stat.change !== undefined && (
                  <span className={`ml-2 text-sm ${
                    stat.change >= 0 
                      ? 'text-emerald-600 dark:text-emerald-500' 
                      : 'text-red-600 dark:text-red-500'
                  }`}>
                    {stat.change >= 0 ? '+' : ''}{stat.change}%
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