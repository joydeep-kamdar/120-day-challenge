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
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
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
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg,#6366f1,#ec4899)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  boxShadow: '0 4px 18px rgba(99,102,241,0.4)',
                  marginTop: '-14px',
                }}
              >
                {emoji}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  letterSpacing: '1px',
                  color: '#9ca3af',
                  marginTop: '4px',
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
              gap: '3px',
              padding: '8px 4px',
              cursor: 'pointer',
              textDecoration: 'none',
              color: active ? '#6366f1' : '#9ca3af',
              opacity: 1,
              transform: active ? 'translateY(-1px)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: '20px' }}>{emoji}</div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '1px',
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
