'use client'

import { MenuItem } from '@/lib/menu-data'
import { MenuGrid } from './menu-grid'
import { CustomerChat } from './customer-chat'

interface CustomerViewProps {
  items: MenuItem[]
}

export function CustomerView({ items }: CustomerViewProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[calc(100vh-180px)]">
      {/* Left Panel - Menu Grid */}
      <div className="w-full lg:w-[40%] overflow-auto">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground">Our Menu</h2>
          <p className="text-sm text-muted-foreground">Click a dish or ask the assistant</p>
        </div>
        <MenuGrid items={items} />
      </div>
      
      {/* Right Panel - Chat */}
      <div className="w-full lg:w-[60%] lg:min-h-0 min-h-[400px]">
        <CustomerChat className="h-full" />
      </div>
    </div>
  )
}
