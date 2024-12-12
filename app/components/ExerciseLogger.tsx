'use client';

import { useState, useEffect } from 'react';
import { updateWorkoutExercise } from '../lib/api/workout-exercises';
import type { WorkoutExercise } from '../types/database';
import ExerciseInput from './exercise/ExerciseInput';
import SaveButton from './exercise/SaveButton';
import DeleteButton from './exercise/DeleteButton';

interface ExerciseLoggerProps {
  workoutExercises: WorkoutExercise[];
  onError: (error: string | null) => void;
  onExerciseUpdate: (exercises: WorkoutExercise[]) => void;
  onDeleteExercise: (exerciseId: string) => void;
}

interface ExerciseState {
  sets: number;
  reps: number;
  weight: number;
  previousWeight?: number;
  lastUsedAt?: string;
  isUpdated: boolean;
  isLoading: boolean;
}

export default function ExerciseLogger({ 
  workoutExercises, 
  onError, 
  onExerciseUpdate,
  onDeleteExercise
}: ExerciseLoggerProps) {
  const [exerciseData, setExerciseData] = useState<Record<string, ExerciseState>>({});

  useEffect(() => {
    const initialData = workoutExercises.reduce((acc, exercise) => {
      acc[exercise.id] = {
        sets: exercise.sets || exercise.exercise?.default_sets || 3,
        reps: exercise.reps || exercise.exercise?.default_reps || 10,
        weight: exercise.weight || exercise.exercise?.default_weight || 20,
        previousWeight: exercise.previous_weight,
        lastUsedAt: exercise.last_used_at,
        isUpdated: false,
        isLoading: false
      };
      return acc;
    }, {} as Record<string, ExerciseState>);

    setExerciseData(initialData);
  }, [workoutExercises]);

  useEffect(() => {
    const updatedExercises = workoutExercises.map(exercise => ({
      ...exercise,
      sets: exerciseData[exercise.id]?.sets ?? exercise.sets,
      reps: exerciseData[exercise.id]?.reps ?? exercise.reps,
      weight: exerciseData[exercise.id]?.weight ?? exercise.weight
    }));

    const hasChanges = updatedExercises.some((exercise, index) => {
      const original = workoutExercises[index];
      return exercise.sets !== original.sets ||
             exercise.reps !== original.reps ||
             exercise.weight !== original.weight;
    });

    if (hasChanges) {
      onExerciseUpdate(updatedExercises);
    }
  }, [exerciseData, workoutExercises, onExerciseUpdate]);

  const handleUpdate = async (exerciseId: string) => {
    const data = exerciseData[exerciseId];
    if (!data) return;

    setExerciseData(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        isLoading: true
      }
    }));

    try {
      await updateWorkoutExercise(exerciseId, {
        sets: data.sets,
        reps: data.reps,
        weight: data.weight
      });

      // Artificial delay for loading state
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setExerciseData(prev => ({
        ...prev,
        [exerciseId]: {
          ...prev[exerciseId],
          isLoading: false,
          isUpdated: true,
          previousWeight: data.weight,
          lastUsedAt: new Date().toISOString()
        }
      }));
      
      onError(null);
    } catch (err) {
      setExerciseData(prev => ({
        ...prev,
        [exerciseId]: {
          ...prev[exerciseId],
          isLoading: false,
          isUpdated: false
        }
      }));
      onError('Failed to update exercise');
    }
  };

  const handleInputChange = (
    exerciseId: string,
    field: keyof Pick<ExerciseState, 'sets' | 'reps' | 'weight'>,
    value: number
  ) => {
    setExerciseData(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value,
        isUpdated: false
      }
    }));
  };

  const calculateSuggestedWeight = (currentWeight: number | undefined): number => {
    if (typeof currentWeight !== 'number') return 0;
    return Math.round((currentWeight + 2.5) * 2) / 2;
  };

  return (
    <div className="space-y-4">
      {workoutExercises.map((workoutExercise) => {
        const data = exerciseData[workoutExercise.id];
        if (!data) return null;

        return (
          <div 
            key={workoutExercise.id}
            className="group bg-gray-50 dark:bg-gray-900/50 rounded-lg sm:rounded-xl p-4 sm:p-6 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                  {workoutExercise.exercise?.name}
                </h3>
                <div className="flex items-center gap-2">
                  <SaveButton 
                    onClick={() => handleUpdate(workoutExercise.id)}
                    isLoading={data.isLoading}
                    isSaved={data.isUpdated}
                  />
                  <DeleteButton 
                    onClick={() => onDeleteExercise(workoutExercise.id)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <ExerciseInput
                  label="Sets"
                  value={data.sets}
                  onChange={(value) => handleInputChange(workoutExercise.id, 'sets', value)}
                />
                <ExerciseInput
                  label="Reps"
                  value={data.reps}
                  onChange={(value) => handleInputChange(workoutExercise.id, 'reps', value)}
                />
                <ExerciseInput
                  label="Weight (kg)"
                  value={data.weight}
                  onChange={(value) => handleInputChange(workoutExercise.id, 'weight', value)}
                  min={0}
                  step={0.5}
                />
              </div>

              {data.previousWeight && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="text-gray-600 dark:text-gray-400">
                    Previous: {data.previousWeight}kg
                    {data.lastUsedAt && (
                      <span className="ml-1 text-gray-500">
                        ({new Date(data.lastUsedAt).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Suggested: {calculateSuggestedWeight(data.previousWeight)}kg
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}