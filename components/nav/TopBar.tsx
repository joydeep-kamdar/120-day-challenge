import { auth } from '@/lib/auth'
import { Flame } from 'lucide-react'
import Link from 'next/link'

export async function TopBar() {
  const session = await auth()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm safe-top">
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-orange flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            120 Day
          </span>
        </Link>

        <Link href={`/profile/${session?.user?.id ?? ''}`} className="flex items-center gap-2">
          {session?.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name ?? 'Profile'}
              className="w-8 h-8 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-8 h-8 rounded-full gradient-orange flex items-center justify-center text-white font-bold text-xs">
              {session?.user?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
          )}
        </Link>
      </div>
    </header>
  )
}
