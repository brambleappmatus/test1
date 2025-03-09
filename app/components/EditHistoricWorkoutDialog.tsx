'use client';

import { useState } from 'react';
import { updateArchivedWorkout } from '../lib/api/workout-history';
import type { ArchivedWorkout, WorkoutExercise } from '../types/database';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface EditHistoricWorkoutDialogProps {
  workout: ArchivedWorkout & {
    workout_exercises: (WorkoutExercise & { exercise: { name: string } })[];
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditHistoricWorkoutDialog({
  workout,
  onClose,
  onSuccess
}: EditHistoricWorkoutDialogProps) {
  const [date, setDate] = useState(new Date(workout.date));
  const [exercises, setExercises] = useState(workout.workout_exercises.map(we => ({
    id: we.id,
    exercise_id: we.exercise_id,
    sets: we.sets,
    reps: we.reps,
    weight: we.weight,
    exercise: we.exercise
  })));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateArchivedWorkout(workout.id, {
        name: workout.name, // Always use original name
        date: date.toISOString(),
        exercises: exercises.map(e => ({
          id: e.id,
          exercise_id: e.exercise_id,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight
        }))
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update workout');
    } finally {
      setLoading(false);
    }
  };

  const updateExercise = (id: string, field: 'sets' | 'reps' | 'weight', value: number) => {
    setExercises(prev => prev.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-black rounded-lg border border-gray-100 dark:border-gray-900 w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-gray-900">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Workout</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Workout Name
              </label>
              <input
                type="text"
                value={workout.name}
                disabled
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date & Time
              </label>
              <DatePicker
                selected={date}
                onChange={(date) => date && setDate(date)}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Exercise Progress</h3>
              {exercises.map((exercise) => (
                <div 
                  key={exercise.id}
                  className="group bg-gray-50 dark:bg-gray-900/50 rounded-lg sm:rounded-xl p-4 sm:p-6 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                        {exercise.exercise.name}
                      </h4>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                          Sets
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value) || 0)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                          Reps
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={exercise.reps}
                          onChange={(e) => updateExercise(exercise.id, 'reps', parseInt(e.target.value) || 0)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={exercise.weight}
                          onChange={(e) => updateExercise(exercise.id, 'weight', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {error}
              </div>
            )}
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-900">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white dark:text-black bg-black dark:bg-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}