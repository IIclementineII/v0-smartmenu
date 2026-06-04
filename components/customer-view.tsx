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
    <div className="flex flex-col lg:flex-row gap-5 min-h-[calc(100vh-200px)]" style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Left Panel — flexible, takes remaining space */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Our Menu</h2>
          <p className="text-sm text-muted-foreground">Hover a dish to ask the AI about it, or use the filters below.</p>
        </div>
        <MenuGrid items={items} onAddToInquiry={handleAddToInquiry} />
      </div>

      {/* Right Panel — fixed width chat panel */}
      <div className="min-h-[480px] flex flex-col" style={{ flexShrink: 0, width: '340px', maxWidth: '100%' }}>
        <CustomerChat ref={chatRef} className="flex-1" />
      </div>
    </div>
  )
}
