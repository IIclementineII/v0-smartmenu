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
  PlusCircle, FileDown, BarChart3, AlertTriangle, DollarSign, X, Check, Bot,
  ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
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
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
        <Sparkles className="h-3 w-3 text-white" />
      </div>
      <div className="bg-emerald-100 rounded-lg px-3 py-2 flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce-dot-1" />
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce-dot-2" />
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce-dot-3" />
      </div>
    </div>
  )
}

// Donut chart colours per category
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

type SortField = 'category' | 'price' | 'stock' | null
type SortDirection = 'asc' | 'desc'

export function OwnerDashboard() {
  const [items, setItems] = useState<MenuItem[]>(initialMenuItems)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({ name: '', price: '', stock: '', category: '' })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

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
  const menuValue = items.reduce((sum, i) => sum + i.price, 0)
  const avgPrice = menuValue / totalDishes

  // Category donut chart data
  const categoryMap: Record<string, number> = {}
  items.forEach(i => { categoryMap[i.category] = (categoryMap[i.category] ?? 0) + 1 })
  const chartData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))

  // Sorting logic
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedItems = [...items].sort((a, b) => {
    if (!sortField) return 0
    const dir = sortDirection === 'asc' ? 1 : -1
    if (sortField === 'category') return a.category.localeCompare(b.category) * dir
    if (sortField === 'price') return (a.price - b.price) * dir
    if (sortField === 'stock') return (a.stock - b.stock) * dir
    return 0
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1" /> 
      : <ArrowDown className="h-3 w-3 ml-1" />
  }

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
    <div className="space-y-5 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-serif">Jade Palace Restaurant</h1>
          <p className="text-sm text-muted-foreground">Menu Management Dashboard</p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs">
            <PlusCircle className="h-3.5 w-3.5" /> Add New Dish
          </Button>
          <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-1.5 text-xs">
            <BarChart3 className="h-3.5 w-3.5" /> View Analytics
          </Button>
          <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-1.5 text-xs">
            <FileDown className="h-3.5 w-3.5" /> Export Menu
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
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Est. Menu Value</p>
              <p className="text-xl font-bold text-emerald-600">${menuValue.toFixed(0)} <span className="text-xs font-normal text-muted-foreground">(avg ${avgPrice.toFixed(2)})</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Category Donut Chart */}
        <Card className="border-emerald-100 lg:col-span-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-foreground">Menu Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {chartData.map(entry => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? '#10b981'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #d1fae5' }}
                  formatter={(value: number, name: string) => [`${value} dish${value !== 1 ? 'es' : ''}`, name]}
                />
                <Legend 
                  iconType="circle" 
                  iconSize={8} 
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) => <span className="text-muted-foreground">{value}</span>}
                />
              </PieChart>
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
                    <TableHead 
                      className={`text-xs cursor-pointer select-none hover:text-emerald-600 transition-colors ${sortField === 'category' ? 'text-emerald-600' : ''}`}
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center">
                        Category
                        <SortIcon field="category" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className={`text-xs cursor-pointer select-none hover:text-emerald-600 transition-colors ${sortField === 'price' ? 'text-emerald-600' : ''}`}
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center">
                        Price
                        <SortIcon field="price" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className={`text-xs cursor-pointer select-none hover:text-emerald-600 transition-colors ${sortField === 'stock' ? 'text-emerald-600' : ''}`}
                      onClick={() => handleSort('stock')}
                    >
                      <div className="flex items-center">
                        Stock
                        <SortIcon field="stock" />
                      </div>
                    </TableHead>
                    <TableHead className="text-xs">Available</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItems.map(item => (
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

      {/* Floating AI Button */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-200"
      >
        <div className="relative">
          <Bot className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
        <span className="font-medium text-sm">AI Assistant</span>
      </button>

      {/* Slide-in Drawer Overlay - covers entire page with blur */}
      {drawerOpen && (
        <div 
          className="transition-all duration-300"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 40,
          }}
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Slide-in Drawer */}
      <div 
        className={`fixed top-0 right-0 w-[400px] max-w-full bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Drawer Header */}
        <div className="px-4 py-4 border-b border-emerald-100 flex items-center gap-3 bg-white flex-shrink-0" style={{ height: '70px' }}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-emerald-800">AI Menu Assistant</h3>
            <span className="text-xs text-gray-500">Manage your menu with natural language</span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <ScrollArea 
          className="p-4 bg-emerald-50/50" 
          ref={scrollRef}
          style={{ flex: 1, height: 0, overflowY: 'auto' }}
        >
            <div className="space-y-3">
              {messages.map(message => (
                <div key={message.id}>
                  <div className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      message.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-emerald-100 text-emerald-900 rounded-tl-sm'
                    }`}>
                      <p className="whitespace-pre-line">{message.content}</p>
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

          {error && <div className="px-4 py-2 bg-red-50 text-red-600 text-xs border-t border-red-100 flex-shrink-0">{error}</div>}

          {/* Input */}
          <form onSubmit={handleChatSubmit} className="flex gap-2 p-4 border-t border-emerald-100 bg-white flex-shrink-0" style={{ height: '60px' }}>
            <Input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder='e.g. "Update Kung Pao Chicken price to $19.99"'
              className="flex-1 bg-white border-emerald-200 text-emerald-900 text-sm placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !chatInput.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
