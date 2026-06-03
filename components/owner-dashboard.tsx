'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  UtensilsCrossed, 
  Leaf, 
  Flame, 
  Edit2, 
  Send, 
  Sparkles,
  User
} from 'lucide-react'
import { MenuItem, menuItems as initialMenuItems } from '@/lib/menu-data'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const API_URL = 'https://smartmenu-agent-production.up.railway.app/api/chat'

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function TypingIndicator() {
  return (
    <div className="flex gap-2 justify-start">
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
        <Sparkles className="h-3 w-3 text-white" />
      </div>
      <div className="bg-slate-700 rounded-lg px-3 py-2 flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce-dot-1" />
        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce-dot-2" />
        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce-dot-3" />
      </div>
    </div>
  )
}

export function OwnerDashboard() {
  const [items, setItems] = useState<MenuItem[]>(initialMenuItems)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I can help you manage your menu. Try commands like:\n\n• "Update Kung Pao Chicken price to $18.99"\n• "Set Mapo Tofu as sold out"\n• "Change Edamame stock to 50"',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sessionId = useRef(`owner-session-${Date.now()}`)
  
  const totalDishes = items.length
  const vegetarianCount = items.filter(item => item.isVegetarian).length
  const spicyCount = items.filter(item => item.isSpicy).length
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])
  
  const toggleAvailability = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ))
  }
  
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
        content: data.response || data.message || 'Command received. Please check the table for updates.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      setError('Failed to process command. Please try again.')
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
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-serif">Jade Palace Restaurant</h1>
          <p className="text-muted-foreground">Menu Management Dashboard</p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <UtensilsCrossed className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Dishes</p>
                <p className="text-2xl font-bold text-foreground">{totalDishes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vegetarian</p>
                <p className="text-2xl font-bold text-foreground">{vegetarianCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-amber-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Flame className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Spicy</p>
                <p className="text-2xl font-bold text-foreground">{spicyCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Data Table */}
      <Card className="border-emerald-100">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-50/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-emerald-50/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{item.name}</span>
                        {item.isVegetarian && (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                            <Leaf className="h-3 w-3" />
                          </Badge>
                        )}
                        {item.isSpicy && (
                          <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                            <Flame className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.category}</TableCell>
                    <TableCell className="font-medium text-emerald-600">${item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={item.stock < 15 ? 'text-red-500 font-medium' : 'text-muted-foreground'}>
                        {item.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={item.available} 
                          onCheckedChange={() => toggleAvailability(item.id)}
                          className="data-[state=checked]:bg-emerald-600"
                        />
                        <span className={`text-sm ${item.available ? 'text-emerald-600' : 'text-red-500'}`}>
                          {item.available ? 'Active' : 'Sold Out'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="hover:bg-emerald-100 hover:text-emerald-700">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Owner Chat Interface - Dark Theme */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="bg-slate-900 p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Assistant</h3>
              <span className="text-xs text-slate-400">Manage menu with natural language</span>
            </div>
          </div>
        </div>
        
        <ScrollArea className="h-40 bg-slate-900 p-4" ref={scrollRef}>
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id}>
                <div
                  className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-100'
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                      <User className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <p 
                  className={`text-xs text-slate-500 mt-1 ${message.role === 'user' ? 'text-right mr-8' : 'ml-8'}`}
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
          <div className="py-2 px-4 bg-red-900/50 text-red-300 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-slate-800 border-t border-slate-700">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., Update Kung Pao Chicken price to $18.99"
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
        </form>
      </Card>
    </div>
  )
}
