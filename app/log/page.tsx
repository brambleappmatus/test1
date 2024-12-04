'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getWorkouts } from '../lib/api/workouts';
import { getWorkoutExercises } from '../lib/api/workout-exercises';
import { finishWorkout } from '../lib/api/workout-history';
import type { Workout, WorkoutExercise } from '../types/database';
import WorkoutSelector from '../components/WorkoutSelector';
import ExerciseLogger from '../components/ExerciseLogger';
import FinishWorkoutDialog from '../components/FinishWorkoutDialog';

export default function LogWorkoutPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [currentExercises, setCurrentExercises] = useState<WorkoutExercise[]>([]);

  useEffect(() => {
    async function fetchWorkouts() {
      try {
        const data = await getWorkouts();
        setWorkouts(data);
      } catch (err) {
        setError('Failed to fetch workouts');
      } finally {
        setLoading(false);
      }
    }

    fetchWorkouts();
  }, []);

  useEffect(() => {
    if (selectedWorkout) {
      async function fetchWorkoutExercises() {
        try {
          const data = await getWorkoutExercises(selectedWorkout.id);
          setWorkoutExercises(data);
          setCurrentExercises(data);
        } catch (err) {
          setError('Failed to fetch workout exercises');
        }
      }

      fetchWorkoutExercises();
    } else {
      setWorkoutExercises([]);
      setCurrentExercises([]);
    }
  }, [selectedWorkout]);

  const handleFinishWorkout = async (score: number) => {
    if (!selectedWorkout) return;

    try {
      await finishWorkout(selectedWorkout, currentExercises, score);
      router.push('/history');
    } catch (err) {
      setError('Failed to finish workout');
      setShowFinishDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Log Workout</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track your progress and record your achievements
          </p>
        </div>
        {selectedWorkout && workoutExercises.length > 0 && (
          <button
            onClick={() => setShowFinishDialog(true)}
            className="w-full sm:w-auto inline-flex items-center px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
            Finish Workout
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-black rounded-lg border border-gray-100 dark:border-gray-900">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Select Workout</h2>
            <WorkoutSelector
              workouts={workouts}
              selectedWorkout={selectedWorkout}
              onSelect={setSelectedWorkout}
            />
          </div>

          {selectedWorkout ? (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Exercise Progress</h2>
              <ExerciseLogger
                workoutExercises={workoutExercises}
                onError={setError}
                onExerciseUpdate={setCurrentExercises}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No workout selected</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose a workout to start logging your progress.</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-start">
              <svg className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
        </div>
      </div>

      <FinishWorkoutDialog
        isOpen={showFinishDialog}
        onConfirm={handleFinishWorkout}
        onCancel={() => setShowFinishDialog(false)}
      />
    </div>
  );
}