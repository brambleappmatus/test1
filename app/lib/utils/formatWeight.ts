export function formatWeight(weightInKg: number): string {
  if (weightInKg >= 1000) {
    return `${(weightInKg / 1000).toFixed(1)}k kg`;
  }
  return `${weightInKg} kg`;
}