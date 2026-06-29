export function calculateBmi(weightKg: number, heightCm: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0
  const heightM = heightCm / 100
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10
}

export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese'

export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'underweight'
  if (bmi < 25) return 'normal'
  if (bmi < 30) return 'overweight'
  return 'obese'
}

export function getBmiLabel(bmi: number): string {
  const cat = getBmiCategory(bmi)
  const labels: Record<BmiCategory, string> = {
    underweight: 'Underweight',
    normal: 'Healthy',
    overweight: 'Overweight',
    obese: 'Obese',
  }
  return labels[cat]
}

export function getBmiColor(bmi: number): string {
  const cat = getBmiCategory(bmi)
  const colors: Record<BmiCategory, string> = {
    underweight: '#3b82f6',
    normal: '#22c55e',
    overweight: '#f59e0b',
    obese: '#ef4444',
  }
  return colors[cat]
}

export function getWeightProgress(
  currentWeight: number,
  startWeight: number,
  goalWeight: number
): number {
  if (startWeight === goalWeight) return 100
  const totalToLose = startWeight - goalWeight
  const lost = startWeight - currentWeight
  const percent = (lost / totalToLose) * 100
  return Math.min(Math.max(Math.round(percent), 0), 100)
}
