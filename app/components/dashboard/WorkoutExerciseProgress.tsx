'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format } from 'date-fns';
import { useTheme } from '@/app/providers/ThemeProvider';
import type { Exercise, Workout } from '@/app/types/database';

interface WorkoutExerciseProgressProps {
  data: any[];
  exercises: Exercise[];
  workouts: Workout[];
  workoutExercises: Record<string, string[]>;
}

const COLORS = [
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#eab308', // Yellow
  '#14b8a6', // Teal
  '#a855f7', // Purple
  '#f43f5e', // Rose
];

export default function WorkoutExerciseProgress({ 
  data, 
  exercises, 
  workouts,
  workoutExercises 
}: WorkoutExerciseProgressProps) {
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const { theme } = useTheme();

  const selectedExercises = selectedWorkout ? workoutExercises[selectedWorkout] || [] : [];
  const getExerciseColor = (index: number) => COLORS[index % COLORS.length];

  return (
    <div className="bg-white dark:bg-black rounded-lg border border-gray-100 dark:border-gray-900 p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white">
            Workout Progress
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Select a workout to view exercise progress
          </p>
        </div>

        <div className="h-[300px]">
          {selectedWorkout ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme === 'dark' ? '#1f2937' : '#f3f4f6'} 
                  opacity={0.5} 
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'}
                  tickFormatter={(value) => `${value}kg`}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    padding: '12px'
                  }}
                  labelFormatter={(value) => format(new Date(value), 'PPP')}
                />
                {selectedExercises.map((exerciseId, index) => {
                  const exercise = exercises.find(e => e.id === exerciseId);
                  if (!exercise) return null;
                  
                  return (
                    <Line
                      key={exerciseId}
                      type="monotone"
                      dataKey={exerciseId}
                      name={exercise.name}
                      stroke={getExerciseColor(index)}
                      strokeWidth={2}
                      dot={{ r: 4, fill: getExerciseColor(index) }}
                      activeDot={{ r: 6, fill: getExerciseColor(index) }}
                      connectNulls={true}
                    />
                  );
                })}
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              Select a workout to view progress
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {workouts.map((workout) => (
            <button
              key={workout.id}
              onClick={() => setSelectedWorkout(workout.id === selectedWorkout ? null : workout.id)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${workout.id === selectedWorkout
                  ? 'bg-emerald-600 text-white dark:text-black'
                  : 'bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
                }
              `}
            >
              {workout.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}