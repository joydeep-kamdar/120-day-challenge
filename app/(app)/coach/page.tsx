'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const QUICK_PROMPTS = [
  "How am I doing?",
  "Motivate me!",
  "Tips for today",
  "Pump me up 🔥",
]

interface Message {
  role: 'user' | 'coach'
  content: string
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'coach',
      content: "Hey babe! 💕 I'm Coach Zara — your personal fitness hype machine for the next 120 days. Ask me anything, or just need a push? I'm right here. Let's get it! 🔥",
    },
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return

    const userMessage = text.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setStreaming(true)
    setMessages(prev => [...prev, { role: 'coach', content: '' }])

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      })

      if (!res.ok || !res.body) throw new Error('Failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'coach',
            content: updated[updated.length - 1].content + chunk,
          }
          return updated
        })
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'coach',
          content: "Oops! Something went wrong on my end. Try again? 💕",
        }
        return updated
      })
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 8.5rem)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#ec4899,#6366f1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          flexShrink: 0,
          boxShadow: '0 0 20px rgba(236,72,153,0.3)',
        }}>
          👩‍💪
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '1px', color: '#fff', lineHeight: 1 }}>
            COACH ZARA
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#ec4899', letterSpacing: '1px', marginTop: '3px' }}>
            YOUR PERSONAL HYPE MACHINE
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444', letterSpacing: '1px' }}>ONLINE</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '8px' }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '8px',
                alignItems: 'flex-end',
              }}
            >
              {msg.role === 'coach' && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg,#ec4899,#6366f1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0,
                }}>
                  👩‍💪
                </div>
              )}
              <div style={{
                maxWidth: '80%',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: '12px 16px',
                fontSize: '14px',
                lineHeight: 1.5,
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg,#6366f1,#ec4899)'
                  : 'rgba(255,255,255,0.04)',
                border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                color: '#fff',
                fontFamily: 'var(--font-sans)',
              }}>
                {msg.content || (
                  <span style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '18px' }}>
                    {[0, 150, 300].map(delay => (
                      <span
                        key={delay}
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#ec4899',
                          animation: `bounce 1s ${delay}ms infinite`,
                          display: 'inline-block',
                        }}
                      />
                    ))}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts — shown only before first user message */}
      {messages.length <= 1 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
          {QUICK_PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              style={{
                flexShrink: 0,
                fontSize: '12px',
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: '20px',
                padding: '8px 14px',
                color: '#818cf8',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.5px',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        display: 'flex',
        gap: '8px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder="Ask Zara anything..."
          disabled={streaming}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            padding: '12px 16px',
            fontSize: '15px',
            color: '#fff',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || streaming}
          style={{
            width: '44px',
            height: '44px',
            flexShrink: 0,
            borderRadius: '14px',
            background: input.trim() && !streaming
              ? 'linear-gradient(135deg,#ec4899,#6366f1)'
              : 'rgba(255,255,255,0.06)',
            border: 'none',
            cursor: input.trim() && !streaming ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            transition: 'all 0.2s',
          }}
        >
          ↑
        </button>
      </div>
    </div>
  )
}
