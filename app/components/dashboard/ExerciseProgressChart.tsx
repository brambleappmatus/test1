'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import type { Exercise } from '@/app/types/database';
import { useTheme } from '@/app/providers/ThemeProvider';

const COLORS = [
  '#10b981', // Emerald-600 (primary)
  '#3b82f6', // Blue-600
  '#f59e0b', // Amber-500
  '#8b5cf6', // Violet-500
  '#ec4899', // Pink-500
];

interface ChartData {
  date: string;
  [key: string]: number | string;
}

interface ExerciseProgressChartProps {
  data: ChartData[];
  exercises: Exercise[];
}

export default function ExerciseProgressChart({ data, exercises }: ExerciseProgressChartProps) {
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [hoveredExercise, setHoveredExercise] = useState<string | null>(null);
  const { theme } = useTheme();

  const getExerciseColor = (index: number) => COLORS[index % COLORS.length];

  const handleLegendClick = (exerciseId: string) => {
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

  // Custom legend that shows exercise pills
  const CustomLegend = () => (
    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
      {exercises.map((exercise, index) => (
        <button
          key={exercise.id}
          onClick={() => handleLegendClick(exercise.id)}
          onMouseEnter={() => setHoveredExercise(exercise.id)}
          onMouseLeave={() => setHoveredExercise(null)}
          className={`
            px-2.5 py-1 rounded-full text-xs font-medium transition-all
            ${selectedExercises.includes(exercise.id)
              ? `text-white dark:text-black`
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
            }
            ${selectedExercises.includes(exercise.id) 
              ? `bg-[${getExerciseColor(index)}]` 
              : 'bg-gray-50 dark:bg-gray-900/50'
            }
          `}
          style={{
            backgroundColor: selectedExercises.includes(exercise.id) 
              ? getExerciseColor(index) 
              : undefined
          }}
        >
          {exercise.name}
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-white dark:bg-black rounded-lg border border-gray-100 dark:border-gray-900 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white">Exercise Progress</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Select up to 5 exercises to compare
          </p>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
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
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
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
                  strokeWidth={hoveredExercise === exerciseId ? 3 : 2}
                  dot={false}
                  activeDot={{ r: 4, fill: getExerciseColor(index) }}
                  opacity={hoveredExercise === null || hoveredExercise === exerciseId ? 1 : 0.2}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <CustomLegend />
    </div>
  );
}