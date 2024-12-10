'use client';

import { useState, useEffect } from 'react';
import { updateWorkoutExercise } from '../lib/api/workout-exercises';
import type { WorkoutExercise } from '../types/database';

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
}

export default function ExerciseLogger({ 
  workoutExercises, 
  onError, 
  onExerciseUpdate,
  onDeleteExercise
}: ExerciseLoggerProps) {
  const [exerciseData, setExerciseData] = useState<Record<string, ExerciseState>>({});

  // Initialize exercise data when workoutExercises changes
  useEffect(() => {
    const initialData = workoutExercises.reduce((acc, exercise) => {
      acc[exercise.id] = {
        sets: exercise.sets || exercise.exercise?.default_sets || 3,
        reps: exercise.reps || exercise.exercise?.default_reps || 10,
        weight: exercise.weight || exercise.exercise?.default_weight || 20,
        previousWeight: exercise.previous_weight,
        lastUsedAt: exercise.last_used_at,
        isUpdated: false
      };
      return acc;
    }, {} as Record<string, ExerciseState>);

    setExerciseData(initialData);
  }, [workoutExercises]);

  // Notify parent of updates
  useEffect(() => {
    const updatedExercises = workoutExercises.map(exercise => ({
      ...exercise,
      sets: exerciseData[exercise.id]?.sets ?? exercise.sets,
      reps: exerciseData[exercise.id]?.reps ?? exercise.reps,
      weight: exerciseData[exercise.id]?.weight ?? exercise.weight
    }));

    // Only update if the values have actually changed
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

    try {
      await updateWorkoutExercise(exerciseId, {
        sets: data.sets,
        reps: data.reps,
        weight: data.weight
      });
      
      setExerciseData(prev => ({
        ...prev,
        [exerciseId]: {
          ...prev[exerciseId],
          isUpdated: true,
          previousWeight: data.weight,
          lastUsedAt: new Date().toISOString()
        }
      }));
      
      onError(null);

      const timer = setTimeout(() => {
        setExerciseData(prev => ({
          ...prev,
          [exerciseId]: {
            ...prev[exerciseId],
            isUpdated: false
          }
        }));
      }, 2000);

      return () => clearTimeout(timer);
    } catch (err) {
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
        [field]: value
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
                  <button
                    onClick={() => handleUpdate(workoutExercise.id)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      data.isUpdated
                        ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {data.isUpdated ? (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Saved
                      </span>
                    ) : 'Save'}
                  </button>
                  <button
                    onClick={() => onDeleteExercise(workoutExercise.id)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Remove exercise"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Sets
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={data.sets}
                    onChange={(e) => handleInputChange(
                      workoutExercise.id,
                      'sets',
                      parseInt(e.target.value) || 0
                    )}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Reps
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={data.reps}
                    onChange={(e) => handleInputChange(
                      workoutExercise.id,
                      'reps',
                      parseInt(e.target.value) || 0
                    )}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={data.weight}
                    onChange={(e) => handleInputChange(
                      workoutExercise.id,
                      'weight',
                      parseFloat(e.target.value) || 0
                    )}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors"
                  />
                </div>
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