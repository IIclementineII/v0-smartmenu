'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
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
  Bot,
  User
} from 'lucide-react'
import { MenuItem, menuItems as initialMenuItems } from '@/lib/menu-data'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function OwnerDashboard() {
  const [items, setItems] = useState<MenuItem[]>(initialMenuItems)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '您好老板！我可以帮您管理菜单。例如：\n• "将宫保鸡丁价格改为 $18.99"\n• "将麻婆豆腐设为售罄"\n• "将春卷库存设为 50"'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const totalDishes = items.length
  const vegetarianCount = items.filter(item => item.isVegetarian).length
  const spicyCount = items.filter(item => item.isSpicy).length
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])
  
  const toggleAvailability = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ))
  }
  
  const processCommand = (command: string): string => {
    const lowerCommand = command.toLowerCase()
    
    // Price update command
    const priceMatch = command.match(/(?:将)?(.+?)(?:的)?价格(?:改为|设为|改成)\s*\$?(\d+\.?\d*)/i)
    if (priceMatch) {
      const dishName = priceMatch[1].trim()
      const newPrice = parseFloat(priceMatch[2])
      const dish = items.find(item => item.name.includes(dishName))
      if (dish) {
        setItems(prev => prev.map(item => 
          item.id === dish.id ? { ...item, price: newPrice } : item
        ))
        return `已将「${dish.name}」价格更新为 $${newPrice.toFixed(2)}`
      }
      return `未找到菜品「${dishName}」`
    }
    
    // Stock update command
    const stockMatch = command.match(/(?:将)?(.+?)(?:的)?库存(?:改为|设为|改成)\s*(\d+)/i)
    if (stockMatch) {
      const dishName = stockMatch[1].trim()
      const newStock = parseInt(stockMatch[2])
      const dish = items.find(item => item.name.includes(dishName))
      if (dish) {
        setItems(prev => prev.map(item => 
          item.id === dish.id ? { ...item, stock: newStock } : item
        ))
        return `已将「${dish.name}」库存更新为 ${newStock}`
      }
      return `未找到菜品「${dishName}」`
    }
    
    // Availability toggle
    if (lowerCommand.includes('售罄') || lowerCommand.includes('下架')) {
      const dishName = command.replace(/(?:将)?/g, '').replace(/(?:设为)?(?:售罄|下架)/g, '').trim()
      const dish = items.find(item => item.name.includes(dishName))
      if (dish) {
        setItems(prev => prev.map(item => 
          item.id === dish.id ? { ...item, available: false } : item
        ))
        return `已将「${dish.name}」设为售罄`
      }
    }
    
    if (lowerCommand.includes('上架') || lowerCommand.includes('恢复')) {
      const dishName = command.replace(/(?:将)?/g, '').replace(/(?:设为)?(?:上架|恢复)/g, '').trim()
      const dish = items.find(item => item.name.includes(dishName))
      if (dish) {
        setItems(prev => prev.map(item => 
          item.id === dish.id ? { ...item, available: true } : item
        ))
        return `已将「${dish.name}」恢复上架`
      }
    }
    
    return '抱歉，我没有理解您的指令。请尝试类似这样的命令：\n• "将宫保鸡丁价格改为 $18.99"\n• "将麻婆豆腐设为售罄"\n• "将春卷库存设为 50"'
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    setTimeout(() => {
      const response = processCommand(input)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 600)
  }
  
  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">金龙餐厅</h1>
          <p className="text-muted-foreground">菜单管理后台</p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">菜品总数</p>
                <p className="text-2xl font-bold text-foreground">{totalDishes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">素食菜品</p>
                <p className="text-2xl font-bold text-foreground">{vegetarianCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">辣味菜品</p>
                <p className="text-2xl font-bold text-foreground">{spicyCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>菜品名称</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>价格</TableHead>
                  <TableHead>库存</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.emoji}</span>
                        <span className="font-medium text-foreground">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.category}</TableCell>
                    <TableCell className="font-medium text-foreground">${item.price.toFixed(2)}</TableCell>
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
                        />
                        <span className={`text-sm ${item.available ? 'text-emerald-600' : 'text-red-500'}`}>
                          {item.available ? '上架中' : '已售罄'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
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
      
      {/* Owner Chat Interface */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">AI 助手</h3>
            <span className="text-sm text-muted-foreground">- 用自然语言管理菜单</span>
          </div>
          
          <ScrollArea className="h-32 mb-3 rounded-lg bg-muted/30 p-3" ref={scrollRef}>
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-foreground border'
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                  <div className="bg-card border rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入指令，如：将宫保鸡丁价格改为 $18.99"
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="bg-primary hover:bg-primary/90">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
