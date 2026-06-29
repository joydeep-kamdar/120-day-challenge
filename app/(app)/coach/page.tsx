'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageCircleHeart } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
    <div className="flex flex-col h-[calc(100dvh-8.5rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
        <div className="w-12 h-12 rounded-full gradient-orange glow-orange flex items-center justify-center text-2xl">
          👩‍💪
        </div>
        <div>
          <h1 className="font-bold text-lg" style={{ fontFamily: 'var(--font-heading)' }}>Coach Zara</h1>
          <p className="text-xs text-muted-foreground">Your personal hype machine 🔥</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-2">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
            >
              {msg.role === 'coach' && (
                <div className="w-8 h-8 rounded-full gradient-orange flex items-center justify-center text-sm flex-shrink-0 mt-1">
                  👩‍💪
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'gradient-orange text-white rounded-tr-sm'
                    : 'bg-card border border-border rounded-tl-sm'
                }`}
              >
                {msg.content || (
                  <span className="flex gap-1">
                    <span className="animate-bounce w-1.5 h-1.5 rounded-full bg-muted-foreground" style={{ animationDelay: '0ms' }} />
                    <span className="animate-bounce w-1.5 h-1.5 rounded-full bg-muted-foreground" style={{ animationDelay: '150ms' }} />
                    <span className="animate-bounce w-1.5 h-1.5 rounded-full bg-muted-foreground" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {QUICK_PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="flex-shrink-0 text-xs bg-secondary border border-border rounded-full px-3 py-1.5 text-muted-foreground hover:border-brand-orange/40 hover:text-foreground transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-border">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder="Ask Zara anything..."
          className="rounded-xl bg-secondary border-border flex-1"
          disabled={streaming}
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || streaming}
          className="w-10 h-10 p-0 rounded-xl gradient-orange border-0 text-white hover:opacity-90 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
