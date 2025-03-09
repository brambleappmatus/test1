'use client';

import { useState, useEffect } from 'react';
import { formatWeight } from './lib/utils/formatWeight';
import CompactMetrics from './components/dashboard/CompactMetrics';
import CompactMetricsMobile from './components/dashboard/CompactMetricsMobile';
import CompactDateRange from './components/dashboard/CompactDateRange';
import PerformanceChart from './components/dashboard/PerformanceChart';
import ExercisePerformanceChart from './components/dashboard/ExercisePerformanceChart';
import WorkoutExerciseProgress from './components/dashboard/WorkoutExerciseProgress';
import PersonalBests from './components/dashboard/PersonalBests';
import RecentActivity from './components/dashboard/RecentActivity';
import TimeFrameSelector from './components/dashboard/TimeFrameSelector';
import { getDashboardStats } from './lib/api/dashboard';
import { useDateRange } from './hooks/useDateRange';
import { DumbbellIcon, ChartBarIcon, StarIcon } from './components/icons';
import { getWorkouts } from './lib/api/workouts';
import { getWorkoutExercises } from './lib/api/workout-exercises';

export default function Home() {
  const { dateRange, updateDateRange } = useDateRange();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPbExercises, setSelectedPbExercises] = useState<string[]>([]);
  const [workoutExercises, setWorkoutExercises] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const data = await getDashboardStats(
          'custom',
          dateRange.startDate,
          dateRange.endDate
        );
        setDashboardData(data);
        setError(null);

        // Fetch workout exercises
        const workouts = await getWorkouts();
        const exercisesByWorkout: Record<string, string[]> = {};
        
        await Promise.all(workouts.map(async (workout) => {
          const exercises = await getWorkoutExercises(workout.id);
          exercisesByWorkout[workout.id] = exercises.map(e => e.exercise_id);
        }));

        setWorkoutExercises(exercisesByWorkout);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [dateRange]);

  const metrics = [
    {
      icon: DumbbellIcon,
      label: 'Total Workouts',
      value: dashboardData?.totalWorkouts || 0,
      change: dashboardData?.workoutChange
    },
    {
      icon: ChartBarIcon,
      label: 'Total Weight',
      value: dashboardData?.totalWeight || 0,
      change: dashboardData?.weightChange
    },
    {
      icon: StarIcon,
      label: 'Avg. Score',
      value: dashboardData?.avgScore?.toFixed(1) || '0.0',
      change: dashboardData?.scoreChange
    }
  ];

  const filteredPersonalBests = dashboardData?.personalBests.filter((pb: any) => 
    selectedPbExercises.length === 0 || 
    selectedPbExercises.includes(dashboardData.exercises.find((e: any) => e.name === pb.exerciseName)?.id)
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <CompactDateRange
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onDateClick={() => setShowDatePicker(true)}
        />
      </div>

      {error ? (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading dashboard</h3>
              <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <CompactMetrics metrics={metrics} />
          <CompactMetricsMobile metrics={metrics} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PerformanceChart data={dashboardData?.performanceData || []} />
            </div>
            <div className="bg-white dark:bg-black rounded-lg border border-gray-100 dark:border-gray-900 p-6">
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <RecentActivity activities={dashboardData?.recentActivity || []} />
            </div>
          </div>

          <ExercisePerformanceChart
            data={dashboardData?.exerciseProgressData || []}
            exercises={dashboardData?.exercises || []}
          />

          <WorkoutExerciseProgress
            data={dashboardData?.exerciseProgressData || []}
            exercises={dashboardData?.exercises || []}
            workouts={dashboardData?.workouts || []}
            workoutExercises={workoutExercises}
          />

          <PersonalBests 
            exercises={dashboardData?.exercises || []}
            personalBests={filteredPersonalBests}
            selectedExercises={selectedPbExercises}
            onExerciseSelect={setSelectedPbExercises}
          />
        </>
      )}

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
    </div>
  );
}