'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MenuItem } from '@/lib/menu-data'

interface MenuGridProps {
  items: MenuItem[]
  onItemClick?: (item: MenuItem) => void
}

export function MenuGrid({ items, onItemClick }: MenuGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((item) => (
        <Card 
          key={item.id} 
          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 py-4"
          onClick={() => onItemClick?.(item)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-4xl">{item.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                  {item.isVegetarian && (
                    <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 text-xs">
                      素食
                    </Badge>
                  )}
                  {item.isSpicy && (
                    <Badge className="bg-red-500 text-white hover:bg-red-600 text-xs">
                      辣
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                <p className="text-lg font-bold text-primary mt-2">${item.price.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
