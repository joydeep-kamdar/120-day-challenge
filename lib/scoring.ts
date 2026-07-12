// Composite Health Score — 0 to 100 points
//
// Overall: weight loss since challenge start, waist reduction since first log, total consistency
// Weekly:  weight/waist change in last 7 days vs prior reading, this-week log rate
//
// Methodology backed by NIH, AHA, WHO, and ACSM — see /rankings

export const OVERALL_WEIGHT_CAP = 10   // ≥10% body-weight loss → full 40 pts (NIH "substantial")
export const OVERALL_WAIST_CAP  = 8    // ≥8% waist reduction   → full 40 pts (WHO cardiometabolic threshold)
export const WEEKLY_WEIGHT_CAP  = 1    // ≥1% weight loss/week  → full 40 pts (upper bound of safe rate)
export const WEEKLY_WAIST_CAP   = 0.75 // ≥0.75% waist/week    → full 40 pts (proportional to overall cap)

export interface ScoreBreakdown {
  total: number           // 0–100
  weightPts: number       // 0–40
  waistPts: number        // 0–40
  consistencyPts: number  // 0–20
  weightPct: number       // raw % change (positive = loss)
  waistPct: number        // raw % change (positive = reduction)
  consistencyPct: number  // 0–100
}

export function calcOverallScore({
  startWeightKg,
  currentWeightKg,
  firstWaistCm,
  latestWaistCm,
  totalLogs,
  daysElapsed,
}: {
  startWeightKg: number
  currentWeightKg: number
  firstWaistCm: number | null
  latestWaistCm: number | null
  totalLogs: number
  daysElapsed: number
}): ScoreBreakdown {
  const weightPct =
    startWeightKg > 0
      ? Math.max(0, ((startWeightKg - currentWeightKg) / startWeightKg) * 100)
      : 0

  const waistPct =
    firstWaistCm && latestWaistCm && firstWaistCm > 0
      ? Math.max(0, ((firstWaistCm - latestWaistCm) / firstWaistCm) * 100)
      : 0

  const consistencyPct = daysElapsed > 0 ? Math.min(100, (totalLogs / daysElapsed) * 100) : 0

  const weightPts      = Math.min(1, weightPct / OVERALL_WEIGHT_CAP) * 40
  const waistPts       = Math.min(1, waistPct  / OVERALL_WAIST_CAP)  * 40
  const consistencyPts = (consistencyPct / 100) * 20

  return {
    total:          round1(weightPts + waistPts + consistencyPts),
    weightPts:      round1(weightPts),
    waistPts:       round1(waistPts),
    consistencyPts: round1(consistencyPts),
    weightPct:      round1(weightPct),
    waistPct:       round1(waistPct),
    consistencyPct: Math.round(consistencyPct),
  }
}

export function calcWeeklyScore({
  prevWeightKg,
  thisWeekWeightKg,
  prevWaistCm,
  thisWeekWaistCm,
  logsThisWeek,
}: {
  prevWeightKg:     number | null
  thisWeekWeightKg: number | null
  prevWaistCm:      number | null
  thisWeekWaistCm:  number | null
  logsThisWeek:     number
}): ScoreBreakdown {
  const weightPct =
    prevWeightKg && thisWeekWeightKg && prevWeightKg > 0
      ? Math.max(0, ((prevWeightKg - thisWeekWeightKg) / prevWeightKg) * 100)
      : 0

  const waistPct =
    prevWaistCm && thisWeekWaistCm && prevWaistCm > 0
      ? Math.max(0, ((prevWaistCm - thisWeekWaistCm) / prevWaistCm) * 100)
      : 0

  const consistencyPct = Math.min(100, (logsThisWeek / 7) * 100)

  const weightPts      = Math.min(1, weightPct / WEEKLY_WEIGHT_CAP) * 40
  const waistPts       = Math.min(1, waistPct  / WEEKLY_WAIST_CAP)  * 40
  const consistencyPts = (consistencyPct / 100) * 20

  return {
    total:          round1(weightPts + waistPts + consistencyPts),
    weightPts:      round1(weightPts),
    waistPts:       round1(waistPts),
    consistencyPts: round1(consistencyPts),
    weightPct:      round1(weightPct),
    waistPct:       round1(waistPct),
    consistencyPct: Math.round(consistencyPct),
  }
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}
