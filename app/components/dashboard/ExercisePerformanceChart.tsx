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
import type { Exercise } from '@/app/types/database';

interface ExercisePerformanceChartProps {
  data: any[];
  exercises: Exercise[];
}

const COLORS = [
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
];

const INITIAL_VISIBLE_COUNT = 10;

export default function ExercisePerformanceChart({ data, exercises }: ExercisePerformanceChartProps) {
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const { theme } = useTheme();

  const handleExerciseToggle = (exerciseId: string) => {
    setSelectedExercises(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      }
      if (prev.length >= 5) {
        return [...prev.slice(1), exerciseId];
      }
      return [...prev, exerciseId];
    });
  };

  const getExerciseColor = (index: number) => COLORS[index % COLORS.length];
  const visibleExercises = showAll ? exercises : exercises.slice(0, INITIAL_VISIBLE_COUNT);

  return (
    <div className="bg-white dark:bg-black rounded-lg border border-gray-100 dark:border-gray-900 p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h3 className="text-base font-medium text-gray-900 dark:text-white">
            Exercise Weight Progress
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select up to 5 exercises to compare
          </p>
        </div>

        <div className="h-[300px]">
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
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {visibleExercises.map((exercise, index) => (
              <button
                key={exercise.id}
                onClick={() => handleExerciseToggle(exercise.id)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${selectedExercises.includes(exercise.id)
                    ? 'text-white dark:text-black'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
                  }
                  ${selectedExercises.includes(exercise.id) 
                    ? 'bg-[' + getExerciseColor(selectedExercises.indexOf(exercise.id)) + ']' 
                    : 'bg-gray-50 dark:bg-gray-900/50'
                  }
                `}
                style={{
                  backgroundColor: selectedExercises.includes(exercise.id) 
                    ? getExerciseColor(selectedExercises.indexOf(exercise.id)) 
                    : undefined
                }}
              >
                {exercise.name}
              </button>
            ))}
          </div>

          {exercises.length > INITIAL_VISIBLE_COUNT && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
              >
                {showAll ? (
                  <>
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Show Less
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Show {exercises.length - INITIAL_VISIBLE_COUNT} More
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}