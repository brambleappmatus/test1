'use client';

import { format } from 'date-fns';

interface Activity {
  id: string;
  name: string;
  date: string;
  score?: number;
}

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const emojis = ['😫', '😕', '😐', '🙂', '🤩'];

  if (activities.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div 
          key={activity.id}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
        >
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              {activity.name}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {format(new Date(activity.date), 'MMM d, h:mm a')}
            </p>
          </div>
          {activity.score && (
            <div className="text-lg" title={`Rating: ${activity.score}/5`}>
              {emojis[activity.score - 1]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}