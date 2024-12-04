'use client';

import { useState, useEffect } from 'react';
import { getWorkouts } from '../lib/api/workouts';
import { getExercises } from '../lib/api/exercises';
import type { Workout, Exercise } from '../types/database';
import NewWorkoutModal from '../components/NewWorkoutModal';
import EditWorkoutModal from '../components/EditWorkoutModal';
import WorkoutCard from '../components/WorkoutCard';

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewWorkoutModal, setShowNewWorkoutModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [workoutsData, exercisesData] = await Promise.all([
          getWorkouts(),
          getExercises()
        ]);
        setWorkouts(workoutsData);
        setExercises(exercisesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleWorkoutAdded = (newWorkout: Workout) => {
    setWorkouts(prev => [newWorkout, ...prev]);
    setShowNewWorkoutModal(false);
  };

  const handleWorkoutUpdated = (updatedWorkout: Workout) => {
    setWorkouts(prev => prev.map(workout => 
      workout.id === updatedWorkout.id ? updatedWorkout : workout
    ));
    setEditingWorkout(null);
  };

  const handleWorkoutDeleted = (deletedId: string) => {
    setWorkouts(prev => prev.filter(workout => workout.id !== deletedId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Workouts</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and track your workout routines
          </p>
        </div>
        <button
          onClick={() => setShowNewWorkoutModal(true)}
          className="inline-flex items-center px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          Create Workout
        </button>
      </div>

      {workouts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-black rounded-lg border border-gray-100 dark:border-gray-900">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No workouts</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new workout.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onEdit={setEditingWorkout}
              onDelete={handleWorkoutDeleted}
            />
          ))}
        </div>
      )}

      {showNewWorkoutModal && (
        <NewWorkoutModal
          exercises={exercises}
          onSuccess={handleWorkoutAdded}
          onCancel={() => setShowNewWorkoutModal(false)}
        />
      )}

      {editingWorkout && (
        <EditWorkoutModal
          workout={editingWorkout}
          onSuccess={handleWorkoutUpdated}
          onCancel={() => setEditingWorkout(null)}
        />
      )}
    </div>
  );
}