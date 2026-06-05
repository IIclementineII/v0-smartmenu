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
  style?: React.CSSProperties
}

const API_URL = 'https://smartmenu-agent-production.up.railway.app/api/chat'

// Pool of suggestion chips for variety
const ALL_CHIPS = [
  "What's gluten-free?",
  "Any dairy-free options?",
  "Show me soups",
  "What's most popular?",
  "Best dishes under $10",
  "Any vegan options?",
  "What pairs well with Peking Duck?",
  "How long does delivery take?",
  "What's the chef's recommendation?",
  "Show me appetizers",
  "Any nut-free dishes?",
  "What's good for sharing?",
  "Show me desserts",
  "Anything light and healthy?",
  "What's spicy but vegetarian?",
]

// Get random chips, excluding previously shown ones
function getRandomChips(previousChips: string[], count: number = 3): string[] {
  const available = ALL_CHIPS.filter(chip => !previousChips.includes(chip))
  // If not enough available, use all chips
  const pool = available.length >= count ? available : ALL_CHIPS
  
  // Fisher-Yates shuffle and take first `count`
  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

// Simple markdown renderer for AI responses
function renderMarkdown(text: string): React.ReactNode {
  // Split by lines and process
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  
  lines.forEach((line, idx) => {
    // Process bold text: **text** -> <strong>text</strong>
    let processed = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    
    // Check if line is a bullet point
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      const bulletContent = line.trim().replace(/^[\*\-•]\s*/, '')
      const processedBullet = bulletContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      elements.push(
        <div key={idx} className="flex gap-2 ml-2">
          <span>•</span>
          <span dangerouslySetInnerHTML={{ __html: processedBullet }} />
        </div>
      )
    } else if (line.trim() === '') {
      elements.push(<br key={idx} />)
    } else {
      elements.push(
        <span key={idx}>
          <span dangerouslySetInnerHTML={{ __html: processed }} />
          {idx < lines.length - 1 && <br />}
        </span>
      )
    }
  })
  
  return <>{elements}</>
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-md" style={{ background: 'linear-gradient(to bottom right, #F97316, #EA580C)' }}>
        <Sparkles className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="bg-emerald-100 rounded-2xl px-3 py-2.5 flex items-center gap-1.5">
        <span 
          className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
          style={{ animation: 'bounce-dots 1.4s infinite ease-in-out 0s' }}
        />
        <span 
          className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
          style={{ animation: 'bounce-dots 1.4s infinite ease-in-out 0.15s' }}
        />
        <span 
          className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
          style={{ animation: 'bounce-dots 1.4s infinite ease-in-out 0.3s' }}
        />
      </div>
    </div>
  )
}

interface SuggestionChipsProps {
  chips: string[]
  onChipClick: (text: string) => void
  disabled?: boolean
}

function SuggestionChips({ chips, onChipClick, disabled }: SuggestionChipsProps) {
  return (
    <div className="flex gap-1.5 flex-wrap ml-9 mt-1.5">
      {chips.map(chip => (
        <button
          key={chip}
          onClick={() => onChipClick(chip)}
          disabled={disabled}
          style={{
            border: '1px solid #059669',
            color: '#059669',
            background: 'white',
            borderRadius: '999px',
            padding: '4px 12px',
            fontSize: '11px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.background = '#ecfdf5'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white'
          }}
        >
          {chip}
        </button>
      ))}
    </div>
  )
}

export const CustomerChat = forwardRef<CustomerChatHandle, CustomerChatProps>(
  function CustomerChat({ className, style }, ref) {
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
    const [currentChips, setCurrentChips] = useState<string[]>([])
    const scrollRef = useRef<HTMLDivElement>(null)
    const sessionId = useRef(`session-${Date.now()}`)

    // Initialize chips on client only to avoid hydration mismatch
    useEffect(() => {
      setCurrentChips(getRandomChips([]))
    }, [])

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
            content: data.reply || "I received your message but couldn't process it properly.",
            timestamp: new Date(),
          },
        ])
        // Generate new random chips, excluding the ones just shown
        setCurrentChips(prev => getRandomChips(prev))
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
        // Generate new random chips even on error
        setCurrentChips(prev => getRandomChips(prev))
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
      <div 
        className={`flex flex-col rounded-2xl overflow-hidden shadow-xl border border-emerald-200 ${className}`}
        style={style}
      >
        {/* Header */}
        <div className="p-3 bg-white border-b border-emerald-100 flex-shrink-0" style={{ height: '56px' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, #F97316, #EA580C)' }}>
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-emerald-800 text-sm">Jade Palace AI</h2>
              <p className="text-[11px] text-gray-500">Your personal menu assistant</p>
            </div>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Online
            </span>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea 
          className="p-3 bg-emerald-50/50" 
          ref={scrollRef}
          style={{ flex: 1, height: 0, overflowY: 'auto' }}
        >
          <div className="space-y-3">
            {messages.map((message, index) => {
              const isLastAssistantMessage = message.role === 'assistant' && 
                index === messages.length - 1 || 
                (message.role === 'assistant' && messages[index + 1]?.role === 'user')
              const showSuggestions = message.role === 'assistant' && index === messages.length - 1 && !isLoading
              
              return (
                <div key={message.id}>
                  <div className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-md mt-0.5" style={{ background: 'linear-gradient(to bottom right, #F97316, #EA580C)' }}>
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
                      <div className="leading-relaxed">{renderMarkdown(message.content)}</div>
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
                  {/* Smart suggestion chips after assistant messages */}
                  {showSuggestions && currentChips.length > 0 && (
                    <SuggestionChips 
                      chips={currentChips} 
                      onChipClick={send} 
                      disabled={isLoading}
                    />
                  )}
                </div>
              )
            })}
            {isLoading && <TypingIndicator />}
          </div>
        </ScrollArea>

        {error && (
          <div className="px-3 py-1.5 bg-red-50 text-red-600 text-xs flex-shrink-0 border-t border-red-100">{error}</div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-emerald-100 flex gap-2 flex-shrink-0" style={{ height: '56px' }}>
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
