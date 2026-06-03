'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  UtensilsCrossed, Leaf, Flame, Edit2, Send, Sparkles, User,
  PlusCircle, FileDown, RefreshCw, AlertTriangle, TrendingUp, X, Check,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { MenuItem, menuItems as initialMenuItems } from '@/lib/menu-data'

interface Message {
  id: string; role: 'user' | 'assistant'; content: string; timestamp: Date
}

const API_URL = 'https://smartmenu-agent-production.up.railway.app/api/chat'

function formatTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
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

// Bar chart colours per category
const CATEGORY_COLORS: Record<string, string> = {
  'Main Course': '#10b981',
  'Appetizer':   '#f59e0b',
  'Side':        '#06b6d4',
  'Specialty':   '#8b5cf6',
  'Dessert':     '#ec4899',
}

interface EditForm {
  name: string; price: string; stock: string; category: string
}

export function OwnerDashboard() {
  const [items, setItems] = useState<MenuItem[]>(initialMenuItems)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({ name: '', price: '', stock: '', category: '' })

  // Chat
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1', role: 'assistant',
      content: 'Hello! I can help you manage your menu. Try commands like:\n\n• "Update Kung Pao Chicken price to $18.99"\n• "Set Mapo Tofu as sold out"\n• "Change Edamame stock to 50"',
      timestamp: new Date(),
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sessionId = useRef(`owner-${Date.now()}`)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isLoading])

  // Stats
  const totalDishes = items.length
  const vegCount = items.filter(i => i.isVegetarian).length
  const spicyCount = items.filter(i => i.isSpicy).length
  const lowStock = items.filter(i => i.stock < 15)
  const revenueEstimate = items.reduce((sum, i) => sum + i.price * i.stock * 0.3, 0)

  // Category chart data
  const categoryMap: Record<string, number> = {}
  items.forEach(i => { categoryMap[i.category] = (categoryMap[i.category] ?? 0) + 1 })
  const chartData = Object.entries(categoryMap).map(([cat, count]) => ({ cat, count }))

  const toggleAvailability = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, available: !i.available } : i))
  }

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id)
    setEditForm({ name: item.name, price: item.price.toString(), stock: item.stock.toString(), category: item.category })
  }

  const cancelEdit = () => setEditingId(null)

  const saveEdit = (id: string) => {
    setItems(prev => prev.map(i =>
      i.id === id
        ? { ...i, name: editForm.name, price: parseFloat(editForm.price) || i.price, stock: parseInt(editForm.stock) || i.stock, category: editForm.category }
        : i
    ))
    setEditingId(null)
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isLoading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: chatInput, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setChatInput('')
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput, sessionId: sessionId.current }),
      })
      if (!res.ok) throw new Error(`API ${res.status}`)
      const data = await res.json()
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: data.response || data.message || 'Command received.',
        timestamp: new Date(),
      }])
    } catch {
      setError('Failed to process command. Please try again.')
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now.",
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-serif">Jade Palace Restaurant</h1>
          <p className="text-sm text-muted-foreground">Menu Management Dashboard</p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs">
            <PlusCircle className="h-3.5 w-3.5" /> Add Dish
          </Button>
          <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-1.5 text-xs">
            <FileDown className="h-3.5 w-3.5" /> Export PDF
          </Button>
          <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Bulk Price Update
          </Button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold">Low Stock Alert</p>
            <p className="text-xs mt-0.5">
              {lowStock.map(i => `${i.name} (${i.stock} left)`).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-emerald-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <UtensilsCrossed className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Dishes</p>
              <p className="text-2xl font-bold">{totalDishes}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Leaf className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vegetarian</p>
              <p className="text-2xl font-bold">{vegCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Flame className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Spicy</p>
              <p className="text-2xl font-bold">{spicyCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Daily Est.</p>
              <p className="text-xl font-bold text-emerald-600">${revenueEstimate.toFixed(0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Category Bar Chart */}
        <Card className="border-emerald-100 lg:col-span-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-foreground">Dishes by Category</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="cat" width={78} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(16,185,129,0.06)' }}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #d1fae5' }}
                  formatter={(v: number) => [`${v} dish${v !== 1 ? 'es' : ''}`, '']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
                  {chartData.map(entry => (
                    <Cell key={entry.cat} fill={CATEGORY_COLORS[entry.cat] ?? '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="border-emerald-100 lg:col-span-2 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-emerald-50/60">
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Price</TableHead>
                    <TableHead className="text-xs">Stock</TableHead>
                    <TableHead className="text-xs">Available</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <>
                      <TableRow key={item.id} className="hover:bg-emerald-50/30 text-sm">
                        <TableCell className="font-medium py-2">
                          <div className="flex items-center gap-1.5">
                            {item.name}
                            {item.isVegetarian && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1 py-0 h-4"><Leaf className="h-2.5 w-2.5" /></Badge>}
                            {item.isSpicy && <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] px-1 py-0 h-4"><Flame className="h-2.5 w-2.5" /></Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs py-2">{item.category}</TableCell>
                        <TableCell className="font-semibold text-amber-600 py-2">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="py-2">
                          <span className={item.stock < 15 ? 'text-red-500 font-semibold' : 'text-muted-foreground'}>
                            {item.stock}
                          </span>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1.5">
                            <Switch
                              checked={item.available}
                              onCheckedChange={() => toggleAvailability(item.id)}
                              className="data-[state=checked]:bg-emerald-600 scale-90"
                            />
                            <span className={`text-xs ${item.available ? 'text-emerald-600' : 'text-red-500'}`}>
                              {item.available ? 'Active' : 'Sold Out'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-2">
                          <Button
                            variant="ghost" size="sm"
                            className="h-7 w-7 p-0 hover:bg-emerald-100 hover:text-emerald-700"
                            onClick={() => editingId === item.id ? cancelEdit() : startEdit(item)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Inline edit row */}
                      {editingId === item.id && (
                        <TableRow key={`${item.id}-edit`} className="bg-emerald-50/50 border-emerald-200">
                          <TableCell colSpan={6} className="py-3 px-4">
                            <div className="flex flex-wrap gap-2 items-end">
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Name</label>
                                <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="h-7 text-xs w-40" />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Category</label>
                                <Input value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} className="h-7 text-xs w-28" />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Price ($)</label>
                                <Input value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} className="h-7 text-xs w-20" type="number" step="0.01" />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Stock</label>
                                <Input value={editForm.stock} onChange={e => setEditForm(f => ({ ...f, stock: e.target.value }))} className="h-7 text-xs w-16" type="number" />
                              </div>
                              <div className="flex gap-1.5 mb-0.5">
                                <Button size="sm" className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1" onClick={() => saveEdit(item.id)}>
                                  <Check className="h-3 w-3" /> Save
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground hover:text-red-600" onClick={cancelEdit}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant chat */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">AI Menu Assistant</h3>
            <span className="text-[11px] text-slate-400">Manage your menu with natural language</span>
          </div>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        </div>

        <ScrollArea className="h-44 bg-slate-900 p-4" ref={scrollRef}>
          <div className="space-y-3">
            {messages.map(message => (
              <div key={message.id}>
                <div className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    message.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-slate-700 text-slate-100 rounded-tl-sm'
                  }`}>
                    <p className="whitespace-pre-line">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <p
                  className={`text-[10px] text-slate-500 mt-1 ${message.role === 'user' ? 'text-right mr-8' : 'ml-8'}`}
                  suppressHydrationWarning
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            ))}
            {isLoading && <TypingIndicator />}
          </div>
        </ScrollArea>

        {error && <div className="px-4 py-1.5 bg-red-900/50 text-red-300 text-xs">{error}</div>}

        <form onSubmit={handleChatSubmit} className="flex gap-2 p-3 bg-slate-800 border-t border-slate-700">
          <Input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder='e.g. "Update Kung Pao Chicken price to $18.99"'
            className="flex-1 bg-slate-700 border-slate-600 text-white text-sm placeholder:text-slate-400 focus:border-emerald-500 h-8"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !chatInput.trim()} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 w-8 p-0">
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </Card>
    </div>
  )
}
