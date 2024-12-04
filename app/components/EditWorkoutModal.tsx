'use client';

import { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { updateWorkout } from '../lib/api/workouts';
import { getWorkoutExercises, addExerciseToWorkout, removeExerciseFromWorkout, updateExercisesOrder } from '../lib/api/workout-exercises';
import { getExercises } from '../lib/api/exercises';
import type { Workout, Exercise, WorkoutExercise } from '../types/database';
import SortableExercise from './SortableExercise';

interface EditWorkoutModalProps {
  workout: Workout;
  onSuccess: (workout: Workout) => void;
  onCancel: () => void;
}

export default function EditWorkoutModal({ workout, onSuccess, onCancel }: EditWorkoutModalProps) {
  const [name, setName] = useState(workout.name);
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [workoutExercises, allExercises] = await Promise.all([
          getWorkoutExercises(workout.id),
          getExercises()
        ]);

        setSelectedExercises(workoutExercises);

        // Filter out exercises that are already in the workout
        const selectedIds = new Set(workoutExercises.map(we => we.exercise_id));
        setAvailableExercises(allExercises.filter(exercise => !selectedIds.has(exercise.id)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workout details');
      } finally {
        setInitialLoad(false);
      }
    }

    fetchData();
  }, [workout.id]);

  const handleExerciseSelect = async (exerciseId: string) => {
    const exercise = availableExercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    try {
      const workoutExercise = await addExerciseToWorkout({
        workout_id: workout.id,
        exercise_id: exercise.id,
        sets: exercise.default_sets,
        reps: exercise.default_reps,
        weight: exercise.default_weight
      });

      setSelectedExercises(prev => [...prev, workoutExercise]);
      setAvailableExercises(prev => prev.filter(e => e.id !== exerciseId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add exercise');
    }
  };

  const handleExerciseRemove = async (workoutExerciseId: string) => {
    const workoutExercise = selectedExercises.find(we => we.id === workoutExerciseId);
    if (!workoutExercise?.exercise) return;

    try {
      await removeExerciseFromWorkout(workoutExerciseId);
      setSelectedExercises(prev => prev.filter(we => we.id !== workoutExerciseId));
      setAvailableExercises(prev => [...prev, workoutExercise.exercise!].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove exercise');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = selectedExercises.findIndex(item => item.id === active.id);
      const newIndex = selectedExercises.findIndex(item => item.id === over.id);
      
      const newOrder = arrayMove(selectedExercises, oldIndex, newIndex);
      setSelectedExercises(newOrder);

      try {
        await updateExercisesOrder(
          workout.id,
          newOrder.map(exercise => exercise.id)
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update exercise order');
        // Revert the order if the update fails
        setSelectedExercises(selectedExercises);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const updatedWorkout = await updateWorkout(workout.id, name);
      onSuccess(updatedWorkout);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update workout');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-black rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-black rounded-lg w-full max-w-2xl shadow-xl">
        <form onSubmit={handleSubmit} className="divide-y divide-gray-100 dark:divide-gray-900">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Edit Workout</h2>
              <button
                type="button"
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Workout Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors"
                required
              />
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Exercises</h3>
                <div className="border border-gray-100 dark:border-gray-900 rounded-lg p-2 h-[300px] overflow-y-auto">
                  {availableExercises.map((exercise) => (
                    <button
                      key={exercise.id}
                      type="button"
                      onClick={() => handleExerciseSelect(exercise.id)}
                      className="w-full flex items-center justify-between p-2 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-md transition-colors"
                    >
                      <span>{exercise.name}</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Exercises</h3>
                <div className="border border-gray-100 dark:border-gray-900 rounded-lg p-2 h-[300px] overflow-y-auto">
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={selectedExercises}
                      strategy={verticalListSortingStrategy}
                    >
                      {selectedExercises.map((workoutExercise) => (
                        <SortableExercise
                          key={workoutExercise.id}
                          id={workoutExercise.id}
                          exercise={workoutExercise.exercise!}
                          onRemove={() => handleExerciseRemove(workoutExercise.id)}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="px-6 py-4">
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {error}
              </div>
            </div>
          )}

          <div className="px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 text-sm font-medium text-white dark:text-black bg-black dark:bg-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}