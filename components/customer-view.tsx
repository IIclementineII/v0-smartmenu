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
    <div className="flex flex-col lg:flex-row gap-5 min-h-[calc(100vh-200px)]" style={{ maxWidth: '100%', overflow: 'hidden' }}>
      {/* Left Panel — flexible, takes remaining space */}
      <div className="w-full lg:flex-1 lg:min-w-0 overflow-hidden">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Our Menu</h2>
          <p className="text-sm text-muted-foreground">Hover a dish to ask the AI about it, or use the filters below.</p>
        </div>
        <MenuGrid items={items} onAddToInquiry={handleAddToInquiry} />
      </div>

      {/* Right Panel — fixed width, shrinks if needed */}
      <div className="w-full lg:w-[360px] lg:flex-shrink-0 lg:min-h-0 min-h-[480px] flex flex-col">
        <CustomerChat ref={chatRef} className="flex-1" />
      </div>
    </div>
  )
}
