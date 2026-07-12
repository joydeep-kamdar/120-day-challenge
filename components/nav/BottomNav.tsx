'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard', emoji: '⌂', label: 'HOME' },
  { href: '/charts', emoji: '📊', label: 'STATS' },
  { href: '/log', emoji: '✏️', label: 'LOG', primary: true },
  { href: '/group', emoji: '👥', label: 'SQUAD' },
  { href: '/coach', emoji: '💋', label: 'COACH' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        display: 'flex',
        background: 'rgba(10,10,10,0.97)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
        paddingTop: '0',
      }}
    >
      {NAV.map(({ href, emoji, label, primary }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)
        if (primary) {
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg,#6366f1,#ec4899)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
                  marginTop: '-18px',
                }}
              >
                {emoji}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  color: '#9ca3af',
                  marginTop: '5px',
                }}
              >
                {label}
              </div>
            </Link>
          )
        }

        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '10px 4px 6px',
              cursor: 'pointer',
              textDecoration: 'none',
              color: active ? '#6366f1' : '#555',
              transform: active ? 'translateY(-1px)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: '24px' }}>{emoji}</div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '1px',
                fontWeight: active ? 700 : 400,
              }}
            >
              {label}
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
