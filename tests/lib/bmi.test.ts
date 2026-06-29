import { describe, it, expect } from 'vitest'
import { calculateBmi, getBmiCategory, getBmiLabel, getWeightProgress } from '@/lib/bmi'

describe('calculateBmi', () => {
  it('calculates correctly for normal weight', () => {
    expect(calculateBmi(70, 175)).toBe(22.9)
  })

  it('calculates correctly for overweight', () => {
    expect(calculateBmi(90, 175)).toBe(29.4)
  })

  it('returns 0 for invalid height', () => {
    expect(calculateBmi(70, 0)).toBe(0)
  })

  it('returns 0 for invalid weight', () => {
    expect(calculateBmi(0, 175)).toBe(0)
  })
})

describe('getBmiCategory', () => {
  it('identifies underweight', () => expect(getBmiCategory(17)).toBe('underweight'))
  it('identifies normal', () => expect(getBmiCategory(22)).toBe('normal'))
  it('identifies overweight', () => expect(getBmiCategory(27)).toBe('overweight'))
  it('identifies obese', () => expect(getBmiCategory(35)).toBe('obese'))
  it('boundary: 18.5 is normal', () => expect(getBmiCategory(18.5)).toBe('normal'))
  it('boundary: 25 is overweight', () => expect(getBmiCategory(25)).toBe('overweight'))
  it('boundary: 30 is obese', () => expect(getBmiCategory(30)).toBe('obese'))
})

describe('getBmiLabel', () => {
  it('returns Healthy for normal BMI', () => expect(getBmiLabel(22)).toBe('Healthy'))
  it('returns Overweight for 27', () => expect(getBmiLabel(27)).toBe('Overweight'))
})

describe('getWeightProgress', () => {
  it('calculates 50% progress', () => {
    expect(getWeightProgress(85, 90, 80)).toBe(50)
  })

  it('returns 100 when goal reached', () => {
    expect(getWeightProgress(80, 90, 80)).toBe(100)
  })

  it('returns 0 when no progress', () => {
    expect(getWeightProgress(90, 90, 80)).toBe(0)
  })

  it('clamps to 0 minimum (gained weight)', () => {
    expect(getWeightProgress(95, 90, 80)).toBe(0)
  })

  it('clamps to 100 maximum', () => {
    expect(getWeightProgress(75, 90, 80)).toBe(100)
  })

  it('handles equal start and goal', () => {
    expect(getWeightProgress(80, 80, 80)).toBe(100)
  })
})
