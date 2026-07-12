import Link from 'next/link'
import { OVERALL_WEIGHT_CAP, OVERALL_WAIST_CAP, WEEKLY_WEIGHT_CAP, WEEKLY_WAIST_CAP } from '@/lib/scoring'

export default function RankingsPage() {
  return (
    <div style={{ paddingTop: '12px', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link href="/dashboard" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#6366f1', letterSpacing: '1px', textDecoration: 'none' }}>
          ← BACK
        </Link>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '38px', letterSpacing: '3px', color: '#fff', lineHeight: 1, marginTop: '12px' }}>
          HOW RANKINGS WORK
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#6b7280', letterSpacing: '2px', marginTop: '6px' }}>
          COMPOSITE HEALTH SCORE · 0–100 PTS
        </div>
      </div>

      {/* The score at a glance */}
      <div style={{ background: '#141414', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '20px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#9ca3af', letterSpacing: '2px', marginBottom: '14px' }}>
          THE FORMULA
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: '#d1d5db', lineHeight: 1.7, background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '14px', fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ color: '#818cf8' }}>min(weight_loss% / {OVERALL_WEIGHT_CAP}, 1) × <strong>40</strong></span>
          <br />
          <span style={{ color: '#f472b6' }}>+ min(waist_loss% / {OVERALL_WAIST_CAP}, 1) × <strong>40</strong></span>
          <br />
          <span style={{ color: '#fbbf24' }}>+ (days_logged / days_elapsed) × <strong>20</strong></span>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
          {[
            { color: '#818cf8', label: 'Weight', pts: '40 pts max' },
            { color: '#f472b6', label: 'Waist',  pts: '40 pts max' },
            { color: '#fbbf24', label: 'Consistency', pts: '20 pts max' },
          ].map(({ color, label, pts }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color, flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#9ca3af' }}>{label} — {pts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Three pillars */}
      <PillarCard
        color="#818cf8"
        accent="rgba(99,102,241,0.12)"
        border="rgba(99,102,241,0.2)"
        emoji="💪"
        title="Weight Lost"
        pts="40 pts"
        overall={`Full score: lose ≥${OVERALL_WEIGHT_CAP}% of your starting weight`}
        weekly={`Full score: lose ≥${WEEKLY_WEIGHT_CAP}% of last week's weight`}
        why="The NIH and American Heart Association both define ≥5% body-weight loss as clinically significant for reducing cardiovascular risk, improving blood sugar, and lowering blood pressure. Reaching ≥10% is classed as a substantial health improvement. The score caps at 10% intentionally — rapid loss beyond that rate is typically muscle loss, not fat, and is unsustainable."
        source="NIH National Heart, Lung, and Blood Institute · American Heart Association (2022)"
      />

      <PillarCard
        color="#f472b6"
        accent="rgba(236,72,153,0.08)"
        border="rgba(236,72,153,0.2)"
        emoji="📏"
        title="Waist Shrinkage"
        pts="40 pts"
        overall={`Full score: reduce waist ≥${OVERALL_WAIST_CAP}% from your first measurement`}
        weekly={`Full score: reduce waist ≥${WEEKLY_WAIST_CAP}% from last week`}
        why="Waist circumference is the single best predictor of visceral (belly) fat and cardiometabolic risk — more predictive than BMI alone. Two people can lose the same scale weight while having very different reductions in dangerous belly fat. The WHO, AHA, and NHLBI all use waist circumference as a primary metabolic health marker. Even a 4–8% reduction meaningfully lowers Type 2 diabetes and cardiovascular disease risk."
        source="World Health Organization · American Heart Association · NHLBI"
        note="Tip: Log your waist in every check-in to unlock this component — it's the most important metric in the challenge."
        noteColor="#f472b6"
      />

      <PillarCard
        color="#fbbf24"
        accent="rgba(245,158,11,0.08)"
        border="rgba(245,158,11,0.2)"
        emoji="🔥"
        title="Consistency"
        pts="20 pts"
        overall="Full score: log every day of the challenge"
        weekly="Full score: log every day this week (7/7)"
        why="Research from the American College of Sports Medicine and behavioural health literature consistently shows that adherence is the strongest predictor of long-term success — more so than any single workout or diet choice. Consistency gets 20 pts rather than 40 because it should support body-composition results, not replace them."
        source="American College of Sports Medicine (ACSM) · Behavioral Medicine Research"
      />

      {/* Why % not absolute */}
      <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: '#fff', letterSpacing: '1px', marginBottom: '10px' }}>
          WHY PERCENTAGES, NOT KG?
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: '#9ca3af', lineHeight: 1.7 }}>
          Using absolute kg would unfairly advantage heavier people. A 70 kg person losing 5 kg has achieved <span style={{ color: '#fff', fontWeight: 600 }}>7.1%</span> — a much larger relative change than a 120 kg person losing the same 5 kg (<span style={{ color: '#fff', fontWeight: 600 }}>4.2%</span>). Percentage-based scoring levels the playing field regardless of starting size.
        </div>
      </div>

      {/* Overall vs Weekly */}
      <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: '#fff', letterSpacing: '1px', marginBottom: '10px' }}>
          OVERALL VS THIS WEEK
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', padding: '6px 12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#818cf8', flexShrink: 0 }}>OVERALL</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: '#9ca3af', lineHeight: 1.6 }}>
              Measures total progress since Day 1. Uses your profile start weight and your first waist log as the baseline. This is the main championship rank.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', padding: '6px 12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#fbbf24', flexShrink: 0 }}>THIS WEEK</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: '#9ca3af', lineHeight: 1.6 }}>
              Measures last 7 days only. Baseline is your most recent reading from before the 7-day window. Resets every week — great for momentum and short sprints. Scale weight caps at {WEEKLY_WEIGHT_CAP}%, waist at {WEEKLY_WAIST_CAP}%.
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Link
          href="/dashboard"
          style={{
            display: 'inline-block',
            padding: '16px 36px',
            background: 'linear-gradient(135deg,#6366f1,#ec4899)',
            borderRadius: '16px',
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            letterSpacing: '2px',
            color: '#fff',
            textDecoration: 'none',
            boxShadow: '0 8px 30px rgba(99,102,241,0.3)',
          }}
        >
          BACK TO STANDINGS
        </Link>
      </div>
    </div>
  )
}

function PillarCard({
  color, accent, border, emoji, title, pts,
  overall, weekly, why, source, note, noteColor,
}: {
  color: string
  accent: string
  border: string
  emoji: string
  title: string
  pts: string
  overall: string
  weekly: string
  why: string
  source: string
  note?: string
  noteColor?: string
}) {
  return (
    <div style={{ background: accent, border: `1px solid ${border}`, borderRadius: '20px', padding: '20px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>{emoji}</span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color, letterSpacing: '1px' }}>{title.toUpperCase()}</div>
        </div>
        <div style={{ background: color + '22', border: `1px solid ${color}55`, borderRadius: '8px', padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: '12px', color, fontWeight: 700 }}>
          {pts}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#6b7280', letterSpacing: '1px', flexShrink: 0 }}>OVERALL</span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#d1d5db' }}>{overall}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#6b7280', letterSpacing: '1px', flexShrink: 0 }}>WEEKLY</span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#d1d5db' }}>{weekly}</span>
        </div>
      </div>

      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#9ca3af', lineHeight: 1.7, marginBottom: '10px' }}>
        {why}
      </div>

      {note && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: noteColor ?? '#9ca3af', background: (noteColor ?? '#9ca3af') + '12', borderRadius: '8px', padding: '8px 12px', marginBottom: '10px', letterSpacing: '0.3px' }}>
          ★ {note}
        </div>
      )}

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#4b5563', letterSpacing: '0.5px' }}>
        SOURCE: {source}
      </div>
    </div>
  )
}
