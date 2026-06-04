'use client'

import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, User, Sparkles } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface CustomerChatHandle {
  sendMessage: (text: string) => void
}

interface CustomerChatProps {
  className?: string
}

const API_URL = 'https://smartmenu-agent-production.up.railway.app/api/chat'

const QUICK_REPLIES = [
  'Vegetarian options',
  'No peanuts',
  'Under $15',
  'Spicy dishes',
]

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
        <Sparkles className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="bg-emerald-100 rounded-2xl px-3 py-2.5 flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce-dot-1" />
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce-dot-2" />
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce-dot-3" />
      </div>
    </div>
  )
}

export const CustomerChat = forwardRef<CustomerChatHandle, CustomerChatProps>(
  function CustomerChat({ className }, ref) {
    const [messages, setMessages] = useState<Message[]>([
      {
        id: '1',
        role: 'assistant',
        content:
          "Welcome to Jade Palace Restaurant! I'm your AI menu assistant. Ask me anything:\n\n• \"What vegetarian dishes do you have?\"\n• \"Any dishes without peanuts?\"\n• \"What are your spicy options?\"",
        timestamp: new Date(),
      },
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const sessionId = useRef(`session-${Date.now()}`)

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
    }, [messages, isLoading])

    const send = async (text: string) => {
      if (!text.trim() || isLoading) return

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, userMessage])
      setInput('')
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, sessionId: sessionId.current }),
        })
        if (!response.ok) throw new Error(`API error: ${response.status}`)
        const data = await response.json()
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.response || data.message || "I received your message but couldn't process it properly.",
            timestamp: new Date(),
          },
        ])
      } catch {
        setError('Failed to get response. Please try again.')
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
            timestamp: new Date(),
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    // Expose sendMessage to parent via ref
    useImperativeHandle(ref, () => ({ sendMessage: send }))

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      send(input)
    }

    return (
      <div className={`flex flex-col rounded-2xl overflow-hidden shadow-xl border border-emerald-200 ${className}`}>
        {/* Header */}
        <div className="p-3 bg-white border-b border-emerald-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-emerald-800 text-sm">Jade Palace AI</h2>
              <p className="text-[11px] text-gray-500">Your personal menu assistant</p>
            </div>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-3 bg-emerald-50/50" ref={scrollRef}>
          <div className="space-y-3">
            {messages.map(message => (
              <div key={message.id}>
                <div className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md mt-0.5">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-sm'
                        : 'bg-emerald-100 text-emerald-900 rounded-tl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </div>
                <p
                  className={`text-[10px] text-gray-500 mt-1 ${message.role === 'user' ? 'text-right mr-9' : 'ml-9'}`}
                  suppressHydrationWarning
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            ))}
            {isLoading && <TypingIndicator />}
          </div>
        </ScrollArea>

        {error && (
          <div className="px-3 py-1.5 bg-red-50 text-red-600 text-xs flex-shrink-0 border-t border-red-100">{error}</div>
        )}

        {/* Quick-reply chips */}
        <div className="px-3 pt-2 pb-0 bg-white flex gap-1.5 flex-wrap flex-shrink-0 border-t border-emerald-100">
          {QUICK_REPLIES.map(chip => (
            <button
              key={chip}
              onClick={() => send(chip)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 rounded-full border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors duration-150 disabled:opacity-40"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-emerald-100 flex gap-2 flex-shrink-0">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about our menu..."
            className="flex-1 bg-white border-emerald-200 text-emerald-900 text-sm placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500 h-8"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 w-8 p-0"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    )
  }
)
