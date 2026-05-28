'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const SESSION_ID = crypto.randomUUID()

type Message = { role: 'user' | 'assistant'; content: string }

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load history from Supabase on mount
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('messages')
        .select('role, content')
        .eq('session_id', SESSION_ID)
        .order('created_at', { ascending: true })
      if (data) setMessages(data as Message[])
    }
    load()
  }, [])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const updated = [...messages, { role: 'user' as const, content: input }]
    setMessages(updated)
    setInput('')
    setLoading(true)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updated, sessionId: SESSION_ID }),
    })

    const data = await res.json()
    if (data.message) {
      setMessages([...updated, { role: 'assistant', content: data.message }])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-4 py-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${
              msg.role === 'user'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-black'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-black px-4 py-2 rounded-2xl text-sm">
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 pt-4 border-t">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask something…"
          disabled={loading}
          className="flex-1 border rounded-xl px-4 py-2 text-sm outline-none focus:border-black"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-black text-white px-4 py-2 rounded-xl text-sm disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  )
}