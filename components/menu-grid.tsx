'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { MenuItem } from '@/lib/menu-data'
import { Flame, Leaf, Bird, IceCream, Star, MessageSquarePlus, Clock } from 'lucide-react'

interface MenuGridProps {
  items: MenuItem[]
  onAddToInquiry?: (item: MenuItem) => void
}

type Filter = 'All' | 'Vegetarian' | 'Spicy' | 'Under $15' | 'Quick' | 'Premium' | 'No Allergens'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'Vegetarian', label: 'Vegetarian' },
  { key: 'Spicy', label: 'Spicy' },
  { key: 'Under $15', label: 'Under $15' },
  { key: 'Quick', label: 'Quick \u26A1' },
  { key: 'Premium', label: 'Premium \uD83D\uDC51' },
  { key: 'No Allergens', label: 'No Allergens \uD83C\uDF3F' },
]

// Specials matched by dish name instead of id (for MongoDB ObjectId compatibility)
const SPECIALS_NAMES = ['Kung Pao Chicken', 'Peking Duck', 'Buddha Delight']
const TODAYS_SPECIAL_NAME = 'Peking Duck'

// Prep times for dishes (in minutes) - keyed by name for API compatibility
const PREP_TIMES_BY_NAME: Record<string, number> = {
  'Kung Pao Chicken': 15,
  'Hot and Sour Soup': 12,
  'Spring Rolls': 8,
  'Peking Duck': 25,
  'Vegetable Fried Rice': 5,
  'Wonton Soup': 5,
  'Buddha Delight': 18,
  'Sesame Chicken': 10,
}

function getCategoryIcon(item: MenuItem) {
  if (item.category === 'Dessert') return <IceCream className="h-5 w-5" />
  if (item.category === 'Specialty' || item.name.includes('Duck')) return <Bird className="h-5 w-5" />
  if (item.isVegetarian) return <Leaf className="h-5 w-5" />
  return <Flame className="h-5 w-5" />
}

function getIconBg(item: MenuItem): string {
  if (item.category === 'Dessert') return 'from-pink-400 to-purple-500'
  if (item.category === 'Specialty' || item.name.includes('Duck')) return 'from-sky-400 to-teal-500'
  if (item.isVegetarian && item.isSpicy) return 'from-emerald-400 to-amber-500'
  if (item.isVegetarian) return 'from-emerald-400 to-green-600'
  if (item.isSpicy) return 'from-orange-400 to-red-600'
  return 'from-amber-400 to-orange-500'
}

function DishCard({
  item,
  index,
  onAddToInquiry,
}: {
  item: MenuItem
  index: number
  onAddToInquiry?: (item: MenuItem) => void
}) {
  const isTodaysSpecial = item.name === TODAYS_SPECIAL_NAME
  const prepTime = PREP_TIMES_BY_NAME[item.name] || 15
  
  return (
    <div
      className="dish-card glass-jade rounded-2xl overflow-hidden group cursor-default fade-up relative"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Today's Special Badge with shine */}
      {isTodaysSpecial && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="badge-shine bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] px-2 py-0.5 shadow-md">
            Today&apos;s Special
          </Badge>
        </div>
      )}
      
      {/* Icon strip */}
      <div className={`h-14 bg-gradient-to-br ${getIconBg(item)} flex items-center justify-center relative overflow-hidden`}>
        <div className="text-white/90">{getCategoryIcon(item)}</div>
        <div className="absolute -top-3 -right-3 w-10 h-10 bg-white/10 rounded-full" />
        <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-white/10 rounded-full" />
      </div>

      {/* Body */}
      <div className="p-3 pb-10">
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3 className="font-semibold text-foreground text-sm leading-tight">{item.name}</h3>
          <span className="text-amber-600 font-bold text-sm whitespace-nowrap">${item.price.toFixed(2)}</span>
        </div>

        <p className="text-xs text-muted-foreground mb-2 line-clamp-2 leading-relaxed">{item.description}</p>

        <div className="flex items-center gap-1 flex-wrap">
          {item.isVegetarian && (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 h-4">
              <Leaf className="h-2.5 w-2.5 mr-0.5" />Veg
            </Badge>
          )}
          {item.isSpicy && (
            <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] px-1.5 py-0 h-4">
              <Flame className="h-2.5 w-2.5 mr-0.5" />Spicy
            </Badge>
          )}
        </div>
      </div>

      {/* Quick info overlay - slides up from bottom with prep time LEFT and Ask button RIGHT */}
      <div className="quick-info flex items-center justify-between text-white text-[11px] rounded-b-2xl">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>{prepTime} min</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAddToInquiry?.(item)
          }}
          className="flex items-center gap-1 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 rounded text-white text-[10px] font-medium transition-colors"
        >
          <MessageSquarePlus className="h-3 w-3" />
          Ask AI
        </button>
      </div>
    </div>
  )
}

export function MenuGrid({ items, onAddToInquiry }: MenuGridProps) {
  const [activeFilter, setActiveFilter] = useState<Filter>('All')

  const specials = items.filter(i => SPECIALS_NAMES.includes(i.name))

  const filtered = items.filter(item => {
    const prepTime = PREP_TIMES_BY_NAME[item.name] || 15
    if (activeFilter === 'All') return true
    if (activeFilter === 'Vegetarian') return item.isVegetarian
    if (activeFilter === 'Spicy') return item.isSpicy
    if (activeFilter === 'Under $15') return item.price < 15
    if (activeFilter === 'Quick') return prepTime <= 10
    if (activeFilter === 'Premium') return item.price >= 15
    if (activeFilter === 'No Allergens') return !item.allergens || item.allergens.length === 0
    return true
  })

  return (
    <div className="space-y-6">
      {/* Today's Specials */}
      <div style={{ overflow: 'hidden', width: '100%' }}>
        <div className="flex items-center gap-2 mb-3">
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          <h3 className="font-semibold text-foreground text-sm tracking-wide uppercase">Today&apos;s Specials</h3>
        </div>
        <div 
          className="flex gap-3 scrollbar-none pt-2 pb-4" 
          style={{ 
            overflowX: 'auto', 
            overflowY: 'visible', 
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          {specials.map(item => (
            <div
              key={item.id}
              className="flex-shrink-0 w-44 glass-jade rounded-xl p-3 flex flex-col gap-1.5 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground leading-tight line-clamp-1">{item.name}</span>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[9px] px-1 py-0 h-4 ml-1 flex-shrink-0">
                  Popular
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
              <span className="text-amber-600 font-bold text-xs">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dietary Guide Filters */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Dietary Guide</p>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-200 ${
                activeFilter === f.key
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                  : 'bg-white/60 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((item, i) => (
          <DishCard key={item.id} item={item} index={i} onAddToInquiry={onAddToInquiry} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 py-10 text-center text-muted-foreground text-sm">
            No dishes match this filter.
          </div>
        )}
      </div>
    </div>
  )
}
