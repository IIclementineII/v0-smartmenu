'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, User, Bot } from 'lucide-react'
import { MenuItem, menuItems, getVegetarianDishes, getSpicyDishes, getDishesWithoutAllergen } from '@/lib/menu-data'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  dishes?: MenuItem[]
}

interface CustomerChatProps {
  className?: string
}

function generateResponse(query: string): { text: string; dishes: MenuItem[] } {
  const lowerQuery = query.toLowerCase()
  
  if (lowerQuery.includes('素') || lowerQuery.includes('vegetarian') || lowerQuery.includes('蔬菜')) {
    const dishes = getVegetarianDishes()
    return {
      text: `我们有 ${dishes.length} 道素食菜品供您选择：`,
      dishes
    }
  }
  
  if (lowerQuery.includes('辣') || lowerQuery.includes('spicy')) {
    const dishes = getSpicyDishes()
    return {
      text: `以下是我们的 ${dishes.length} 道辣味菜品：`,
      dishes
    }
  }
  
  if (lowerQuery.includes('不辣') || lowerQuery.includes('mild') || lowerQuery.includes('清淡')) {
    const dishes = menuItems.filter(item => !item.isSpicy)
    return {
      text: `以下是我们的 ${dishes.length} 道不辣的菜品：`,
      dishes
    }
  }
  
  if (lowerQuery.includes('花生') || lowerQuery.includes('peanut')) {
    const dishes = getDishesWithoutAllergen('花生')
    return {
      text: `以下 ${dishes.length} 道菜品不含花生：`,
      dishes
    }
  }
  
  if (lowerQuery.includes('麸质') || lowerQuery.includes('gluten')) {
    const dishes = getDishesWithoutAllergen('麸质')
    return {
      text: `以下 ${dishes.length} 道菜品不含麸质：`,
      dishes
    }
  }
  
  if (lowerQuery.includes('推荐') || lowerQuery.includes('recommend') || lowerQuery.includes('特色')) {
    const dishes = menuItems.filter(item => item.price > 15)
    return {
      text: '以下是我们今日特别推荐的菜品：',
      dishes
    }
  }
  
  if (lowerQuery.includes('便宜') || lowerQuery.includes('cheap') || lowerQuery.includes('实惠')) {
    const dishes = menuItems.filter(item => item.price < 12)
    return {
      text: '以下是我们的实惠之选（$12以下）：',
      dishes
    }
  }
  
  return {
    text: '我可以帮您找到合适的菜品！请告诉我您的需求，例如：\n• "有什么素食菜品？"\n• "有什么辣的菜？"\n• "有什么不含花生的菜？"\n• "今日特别推荐"',
    dishes: []
  }
}

export function CustomerChat({ className }: CustomerChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '您好！欢迎光临金龙餐厅！我是您的智能菜单助手。您可以问我任何关于我们菜品的问题，例如：\n• "有什么素食菜品？"\n• "推荐一些不辣的菜"\n• "有什么不含花生的菜？"',
      dishes: []
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])
  
  const handleSubmit = async (e: React.FormEvent) => {
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
    
    // Simulate AI response delay
    setTimeout(() => {
      const response = generateResponse(input)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        dishes: response.dishes
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 800)
  }
  
  return (
    <Card className={`flex flex-col h-full ${className}`}>
      <div className="p-4 border-b bg-primary/5">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">菜单助手</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">向我询问任何关于菜品的问题</p>
      </div>
      
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                {message.dishes && message.dishes.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.dishes.map((dish) => (
                      <div
                        key={dish.id}
                        className="bg-card rounded-lg p-3 border shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{dish.emoji}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-foreground">{dish.name}</span>
                              {dish.isVegetarian && (
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">素食</span>
                              )}
                              {dish.isSpicy && (
                                <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">辣</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{dish.description}</p>
                          </div>
                          <span className="font-bold text-primary">${dish.price.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入您的问题..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()} className="bg-primary hover:bg-primary/90">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  )
}
