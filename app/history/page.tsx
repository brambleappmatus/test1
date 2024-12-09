'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getWorkoutHistory, deleteArchivedWorkout } from '../lib/api/workout-history';
import type { ArchivedWorkout, WorkoutExercise } from '../types/database';
import ConfirmDialog from '../components/ConfirmDialog';
import EditHistoricWorkoutDialog from '../components/EditHistoricWorkoutDialog';
import CompactDateRange from '../components/dashboard/CompactDateRange';
import TimeFrameSelector from '../components/dashboard/TimeFrameSelector';
import { useDateRange } from '../hooks/useDateRange';

interface WorkoutHistoryEntry extends ArchivedWorkout {
  workout_exercises: (WorkoutExercise & { exercise: { name: string } })[];
}

export default function HistoryPage() {
  const { dateRange, updateDateRange } = useDateRange();
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutHistoryEntry | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutHistoryEntry | null>(null);

  const emojis = ['😫', '😕', '😐', '🙂', '🤩'];

  useEffect(() => {
    fetchHistory();
  }, [dateRange]);

  async function fetchHistory() {
    try {
      const data = await getWorkoutHistory();
      // Filter workouts based on date range
      const filteredData = data.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= dateRange.startDate && workoutDate <= dateRange.endDate;
      });
      setHistory(filteredData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workout history');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!selectedWorkout) return;

    try {
      await deleteArchivedWorkout(selectedWorkout.id);
      setHistory(history.filter(w => w.id !== selectedWorkout.id));
      setShowDeleteConfirm(false);
      setSelectedWorkout(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workout');
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">History</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track your fitness journey and progress
          </p>
        </div>
        <CompactDateRange
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onDateClick={() => setShowDatePicker(true)}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading history</h3>
              <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-black rounded-lg border border-gray-100 dark:border-gray-900">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No workout history</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start logging your workouts to track your progress.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((workout) => (
            <div
              key={workout.id}
              className="group bg-white dark:bg-black rounded-lg border border-gray-100 dark:border-gray-900 hover:border-gray-200 dark:hover:border-gray-800 transition-all cursor-pointer"
              onClick={() => setExpandedWorkout(expandedWorkout === workout.id ? null : workout.id)}
            >
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {workout.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(workout.date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {workout.score && (
                      <div className="text-lg" title={`Rating: ${workout.score}/5`}>
                        {emojis[workout.score - 1]}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingWorkout(workout);
                        }}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWorkout(workout);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {expandedWorkout === workout.id && workout.workout_exercises && (
                  <div className="mt-3 space-y-1.5">
                    {workout.workout_exercises.map((we) => (
                      <div
                        key={we.id}
                        className="flex justify-between items-center py-1.5 px-3 rounded-md bg-gray-50 dark:bg-gray-900/50 text-sm"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">
                          {we.exercise.name}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 tabular-nums">
                          {we.sets} × {we.reps} @ {we.weight}kg
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Workout"
        message={`Are you sure you want to delete "${selectedWorkout?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSelectedWorkout(null);
        }}
      />

      {showDatePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-black rounded-lg p-6 max-w-md w-full mx-4">
            <TimeFrameSelector 
              onTimeFrameChange={(start, end) => {
                updateDateRange({ startDate: start, endDate: end });
                setShowDatePicker(false);
              }}
            />
          </div>
        </div>
      )}

      {editingWorkout && (
        <EditHistoricWorkoutDialog
          workout={editingWorkout}
          onClose={() => setEditingWorkout(null)}
          onSuccess={() => {
            setEditingWorkout(null);
            fetchHistory();
          }}
        />
      )}
    </div>
  );
}