'use client';

import { useState } from 'react';
import ExerciseSelector from '../ExerciseSelector';
import type { Exercise } from '@/app/types/database';
import { format } from 'date-fns';

interface PersonalBest {
  exerciseName: string;
  value: number;
  metric: 'weight_per_rep' | 'max_reps' | 'max_weight';
  date: string;
}

interface PersonalBestsProps {
  exercises: Exercise[];
  personalBests: PersonalBest[];
  onExerciseSelect: (exerciseIds: string[]) => void;
  selectedExercises: string[];
}

export default function PersonalBests({ 
  exercises,
  personalBests,
  onExerciseSelect,
  selectedExercises
}: PersonalBestsProps) {
  const [showAll, setShowAll] = useState(false);

  const formatValue = (pb: PersonalBest) => {
    switch (pb.metric) {
      case 'max_reps':
        return `${pb.value} reps`;
      case 'weight_per_rep':
        return `${pb.value.toFixed(1)}kg/rep`;
      default:
        return `${pb.value}kg`;
    }
  };

  // Sort personal bests by value (descending)
  const sortedBests = [...personalBests].sort((a, b) => b.value - a.value);
  const displayBests = showAll ? sortedBests : sortedBests.slice(0, 3);

  return (
    <div className="bg-white dark:bg-black rounded-lg border border-gray-100 dark:border-gray-900 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium text-gray-900 dark:text-white">Personal Bests</h3>
        <ExerciseSelector
          exercises={exercises}
          selectedExercises={selectedExercises}
          onExerciseChange={onExerciseSelect}
        />
      </div>

      {personalBests.length === 0 ? (
        <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
          Select exercises to view personal bests
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {displayBests.map((pb, index) => (
              <div 
                key={index}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/75 transition-colors"
              >
                <div className="min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {pb.exerciseName}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(pb.date), 'MMM d')}
                  </p>
                </div>
                <div className="ml-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  {formatValue(pb)}
                </div>
              </div>
            ))}
          </div>
          
          {personalBests.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-2 w-full py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {showAll ? 'Show Less' : `Show ${personalBests.length - 3} More`}
            </button>
          )}
        </>
      )}
    </div>
  );
}