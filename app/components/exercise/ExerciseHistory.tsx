'use client';

import { calculateSuggestedWeight, formatExerciseDate } from '@/app/lib/utils/exercise';

interface ExerciseHistoryProps {
  previousWeight?: number;
  lastUsedAt?: string;
}

export default function ExerciseHistory({ previousWeight, lastUsedAt }: ExerciseHistoryProps) {
  if (!previousWeight) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
      <div className="text-gray-600 dark:text-gray-400">
        Previous: {previousWeight}kg
        {lastUsedAt && (
          <span className="ml-1 text-gray-500">
            ({formatExerciseDate(lastUsedAt)})
          </span>
        )}
      </div>
      <div className="text-emerald-600 dark:text-emerald-400 font-medium">
        Suggested: {calculateSuggestedWeight(previousWeight)}kg
      </div>
    </div>
  );
}