import { BottomNav } from '@/components/nav/BottomNav'
import { TopBar } from '@/components/nav/TopBar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        maxWidth: '430px',
        margin: '0 auto',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a0a',
        position: 'relative',
      }}
    >
      <TopBar />
      <main
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingTop: '60px',
          paddingBottom: '80px',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        {children}
      </main>
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '430px',
          zIndex: 50,
        }}
      >
        <BottomNav />
      </div>
    </div>
  )
}
