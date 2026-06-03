'use client'

import { useState, useRef, useEffect } from 'react'
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

interface CustomerChatProps {
  className?: string
}

const API_URL = 'https://smartmenu-agent-production.up.railway.app/api/chat'

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-md">
        <Sparkles className="h-4 w-4 text-white" />
      </div>
      <div className="bg-slate-700 rounded-2xl px-4 py-3 flex items-center gap-1">
        <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce-dot-1" />
        <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce-dot-2" />
        <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce-dot-3" />
      </div>
    </div>
  )
}

export function CustomerChat({ className }: CustomerChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to Jade Palace Restaurant! I\'m your AI menu assistant. Feel free to ask me anything about our dishes, such as:\n\n• "What vegetarian dishes do you have?"\n• "Any dishes without peanuts?"\n• "What are your spicy options?"',
      timestamp: new Date()
    }
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          sessionId: sessionId.current
        })
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || 'I received your message but couldn\'t process it properly.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      setError('Failed to get response. Please try again.')
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className={`flex flex-col h-full rounded-2xl overflow-hidden shadow-xl ${className}`}>
      {/* Dark Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Jade Palace AI</h2>
            <p className="text-xs text-slate-400">Your personal menu assistant</p>
          </div>
        </div>
      </div>
      
      {/* Dark Chat Area */}
      <ScrollArea className="flex-1 p-4 bg-slate-900" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              <div
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <p 
                className={`text-xs text-slate-500 mt-1 ${message.role === 'user' ? 'text-right mr-11' : 'ml-11'}`}
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
        <div className="px-4 py-2 bg-red-900/50 text-red-300 text-sm">
          {error}
        </div>
      )}
      
      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about our menu..."
            className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
