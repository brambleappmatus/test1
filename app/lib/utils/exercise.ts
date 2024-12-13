// Utility functions for exercise-related calculations
export function calculateSuggestedWeight(currentWeight: number): number {
  return Math.round((currentWeight + 2.5) * 2) / 2;
}

export function formatExerciseDate(date: string): string {
  return new Date(date).toLocaleDateString();
}