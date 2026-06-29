'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Flame, BarChart2, MessageCircleHeart } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/group', icon: Users, label: 'Crew' },
  { href: '/log', icon: Flame, label: 'Log', primary: true },
  { href: '/charts', icon: BarChart2, label: 'Stats' },
  { href: '/coach', icon: MessageCircleHeart, label: 'Coach' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm safe-bottom">
      <div className="flex items-center justify-around px-2 pt-2 pb-1 max-w-lg mx-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label, primary }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 min-w-[56px] py-1"
            >
              {primary ? (
                <span
                  className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-2xl transition-all',
                    active
                      ? 'gradient-orange glow-orange'
                      : 'bg-secondary hover:bg-secondary/80'
                  )}
                >
                  <Icon className={cn('w-5 h-5', active ? 'text-white' : 'text-muted-foreground')} />
                </span>
              ) : (
                <span
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-xl transition-all',
                    active && 'bg-primary/10'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      active ? 'text-brand-orange' : 'text-muted-foreground'
                    )}
                  />
                </span>
              )}
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors',
                  active ? 'text-brand-orange' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
