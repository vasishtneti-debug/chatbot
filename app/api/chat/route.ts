import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
    try {
      const { messages, sessionId } = await req.json()
  
      // MOCK — replace this with real Claude call once you add credits
      const reply = "I have no Anthropic credits :(."
  
      await supabase.from('messages').insert([
        { session_id: sessionId, role: 'user', content: messages.at(-1).content },
        { session_id: sessionId, role: 'assistant', content: reply },
      ])
  
      return NextResponse.json({ message: reply })
  
    } catch (error) {
      console.error(error)
      return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
  }