'use client'

import { useRef } from 'react'
import { MenuItem } from '@/lib/menu-data'
import { MenuGrid } from './menu-grid'
import { CustomerChat, CustomerChatHandle } from './customer-chat'

interface CustomerViewProps {
  items: MenuItem[]
}

export function CustomerView({ items }: CustomerViewProps) {
  const chatRef = useRef<CustomerChatHandle>(null)

  const handleAddToInquiry = (item: MenuItem) => {
    chatRef.current?.sendMessage(`Tell me more about ${item.name}`)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5 min-h-[calc(100vh-200px)] items-start">
      {/* Left Panel — 65% */}
      <div className="w-full lg:w-[65%]">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Our Menu</h2>
          <p className="text-sm text-muted-foreground">Hover a dish to ask the AI about it, or use the filters below.</p>
        </div>
        <MenuGrid items={items} onAddToInquiry={handleAddToInquiry} />
      </div>

      {/* Right Panel — 35% */}
      <div 
        className="w-full lg:w-[35%] min-h-[480px] lg:min-h-0 lg:sticky"
        style={{ top: '2rem', alignSelf: 'flex-start', maxHeight: 'calc(100vh - 4rem)' }}
      >
        <CustomerChat ref={chatRef} className="h-full" />
      </div>
    </div>
  )
}
