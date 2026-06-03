'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MenuItem } from '@/lib/menu-data'
import { Flame, Leaf, Bird, IceCream } from 'lucide-react'

interface MenuGridProps {
  items: MenuItem[]
  onItemClick?: (item: MenuItem) => void
}

function getGradientClass(item: MenuItem): string {
  if (item.category === 'Dessert') {
    return 'from-pink-400 via-pink-500 to-purple-500'
  }
  if (item.category === 'Specialty' || item.name.includes('Duck')) {
    return 'from-sky-400 via-cyan-500 to-teal-500'
  }
  if (item.isVegetarian) {
    return 'from-emerald-400 via-emerald-500 to-green-600'
  }
  if (item.isSpicy) {
    return 'from-orange-400 via-red-500 to-red-600'
  }
  return 'from-amber-400 via-amber-500 to-orange-500'
}

function getCategoryIcon(item: MenuItem) {
  if (item.category === 'Dessert') {
    return <IceCream className="h-6 w-6" />
  }
  if (item.category === 'Specialty' || item.name.includes('Duck')) {
    return <Bird className="h-6 w-6" />
  }
  if (item.isVegetarian) {
    return <Leaf className="h-6 w-6" />
  }
  if (item.isSpicy) {
    return <Flame className="h-6 w-6" />
  }
  return <Flame className="h-6 w-6" />
}

export function MenuGrid({ items, onItemClick }: MenuGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((item) => (
        <Card 
          key={item.id} 
          className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden group py-0"
          onClick={() => onItemClick?.(item)}
        >
          <CardContent className="p-0">
            {/* Gradient Header */}
            <div className={`h-20 bg-gradient-to-br ${getGradientClass(item)} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute inset-0 flex items-center justify-center text-white/90">
                {getCategoryIcon(item)}
              </div>
              {/* Decorative circles */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
              <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-white/10 rounded-full" />
            </div>
            
            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-foreground leading-tight">{item.name}</h3>
                <p className="text-lg font-bold text-emerald-600 whitespace-nowrap">${item.price.toFixed(2)}</p>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
              
              <div className="flex items-center gap-2 flex-wrap">
                {item.isVegetarian && (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 text-xs">
                    <Leaf className="h-3 w-3 mr-1" />
                    Vegetarian
                  </Badge>
                )}
                {item.isSpicy && (
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 text-xs">
                    <Flame className="h-3 w-3 mr-1" />
                    Spicy
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
