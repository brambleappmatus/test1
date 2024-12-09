'use client';

import { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { updateWorkout } from '../lib/api/workouts';
import { getWorkoutExercises, addExerciseToWorkout, removeExerciseFromWorkout, updateExercisesOrder } from '../lib/api/workout-exercises';
import { getExercises } from '../lib/api/exercises';
import type { Exercise, Workout } from '../types/database';
import SortableExercise from './SortableExercise';

interface EditWorkoutModalProps {
  workout: Workout;
  onSuccess: (workout: Workout) => void;
  onCancel: () => void;
}

export default function EditWorkoutModal({ workout, onSuccess, onCancel }: EditWorkoutModalProps) {
  const [name, setName] = useState(workout.name);
  const [workoutExercises, setWorkoutExercises] = useState<any[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [exercises, allExercises] = await Promise.all([
          getWorkoutExercises(workout.id),
          getExercises()
        ]);
        setWorkoutExercises(exercises);

        // Filter out exercises that are already in the workout
        let selectedIds = new Set(exercises.map(e => e.exercise_id));
        setAvailableExercises(allExercises.filter(e => !selectedIds.has(e.id)));
      } catch (err) {
        setError('Failed to load workout details');
      } finally {
        setInitialLoading(false);
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

      setWorkoutExercises(prev => [...prev, workoutExercise]);
      setAvailableExercises(prev => prev.filter(e => e.id !== exerciseId));
    } catch (err) {
      setError('Failed to add exercise');
    }
  };

  const handleExerciseRemove = async (workoutExerciseId: string) => {
    const workoutExercise = workoutExercises.find(we => we.id === workoutExerciseId);
    if (!workoutExercise?.exercise) return;

    try {
      await removeExerciseFromWorkout(workoutExerciseId);
      setWorkoutExercises(prev => prev.filter(we => we.id !== workoutExerciseId));
      setAvailableExercises(prev => [...prev, workoutExercise.exercise].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      setError('Failed to remove exercise');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = workoutExercises.findIndex(we => we.id === active.id);
      const newIndex = workoutExercises.findIndex(we => we.id === over.id);
      const newOrder = arrayMove(workoutExercises, oldIndex, newIndex);
      setWorkoutExercises(newOrder);

      try {
        await updateExercisesOrder(workout.id, newOrder.map(we => we.id));
      } catch (err) {
        setError('Failed to update exercise order');
        // Revert the order if the update fails
        setWorkoutExercises(workoutExercises);
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

  const filteredExercises = availableExercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (initialLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-black rounded-xl p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 dark:border-emerald-400 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-black rounded-xl p-6 w-full max-w-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Edit Workout</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Workout Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Exercises</h3>
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg">
                <div className="p-2 border-b border-gray-200 dark:border-gray-800">
                  <input
                    type="text"
                    placeholder="Search exercises..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div className="p-2 h-[calc(24rem-44px)] overflow-y-auto">
                  {filteredExercises.map((exercise) => (
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
                  {filteredExercises.length === 0 && (
                    <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                      No exercises found
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Exercises</h3>
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 h-96 overflow-y-auto">
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={workoutExercises}
                    strategy={verticalListSortingStrategy}
                  >
                    {workoutExercises.map((workoutExercise) => (
                      <SortableExercise
                        key={workoutExercise.id}
                        id={workoutExercise.id}
                        exercise={workoutExercise.exercise}
                        onRemove={() => handleExerciseRemove(workoutExercise.id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white dark:text-black bg-black dark:bg-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}