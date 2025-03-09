'use client';

import ExerciseInput from './ExerciseInput';
import SaveButton from './SaveButton';
import DeleteButton from './DeleteButton';
import ExerciseHistory from './ExerciseHistory';
import type { WorkoutExercise } from '@/app/types/database';

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  exerciseData: {
    sets: number;
    reps: number;
    weight: number;
    isUpdated: boolean;
    isLoading: boolean;
  };
  onInputChange: (field: 'sets' | 'reps' | 'weight', value: number) => void;
  onSave: () => void;
  onDelete: () => void;
}

export default function ExerciseCard({
  exercise,
  exerciseData,
  onInputChange,
  onSave,
  onDelete
}: ExerciseCardProps) {
  return (
    <div className="group bg-gray-50 dark:bg-gray-900/50 rounded-lg sm:rounded-xl p-4 sm:p-6 transition-all duration-200 hover:shadow-md">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
            {exercise.exercise?.name}
          </h3>
          <div className="flex items-center gap-2">
            <SaveButton 
              onClick={onSave}
              isLoading={exerciseData.isLoading}
              isSaved={exerciseData.isUpdated}
            />
            <DeleteButton onClick={onDelete} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <ExerciseInput
            label="Sets"
            value={exerciseData.sets}
            onChange={(value) => onInputChange('sets', value)}
          />
          <ExerciseInput
            label="Reps"
            value={exerciseData.reps}
            onChange={(value) => onInputChange('reps', value)}
          />
          <ExerciseInput
            label="Weight (kg)"
            value={exerciseData.weight}
            onChange={(value) => onInputChange('weight', value)}
            min={0}
            step={0.5}
          />
        </div>

        <ExerciseHistory 
          previousWeight={exercise.previous_weight}
          lastUsedAt={exercise.last_used_at}
        />
      </div>
    </div>
  );
}