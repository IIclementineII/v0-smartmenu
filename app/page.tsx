'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CustomerView } from '@/components/customer-view'
import { OwnerDashboard } from '@/components/owner-dashboard'
import { menuItems } from '@/lib/menu-data'
import { User, LayoutDashboard, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SmartMenuPage() {
  const [activeTab, setActiveTab] = useState('customer')
  const [taglineVisible, setTaglineVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setTaglineVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const scrollToContent = () => {
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Deep Teal-Black Gradient */}
      <section className="relative h-[400px] overflow-hidden">
        {/* Background gradient - Deep teal to black */}
        <div 
          className="absolute inset-0" 
          style={{ background: 'linear-gradient(135deg, #0D2B2B 0%, #071515 50%, #000000 100%)' }}
        />
        
        {/* Subtle jade glow effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
          {/* Jade Logo */}
          <div className="mb-5 w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-fade-up">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          
          <h1 
            className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold text-white mb-3 tracking-tight text-balance animate-fade-up"
            style={{ animationDelay: '0.1s' }}
          >
            Jade Palace Restaurant
          </h1>
          
          {/* Typewriter tagline */}
          <div 
            className="h-8 mb-2 animate-fade-up"
            style={{ animationDelay: '0.2s' }}
          >
            {taglineVisible && (
              <p className="text-emerald-300/90 text-lg sm:text-xl font-medium typewriter inline-block">
                Where Tradition Meets Innovation
              </p>
            )}
          </div>
          
          <p 
            className="text-emerald-400/50 text-sm sm:text-base mb-7 max-w-md animate-fade-up"
            style={{ animationDelay: '0.3s' }}
          >
            AI-Powered Menu Experience
          </p>
          
          <Button 
            onClick={scrollToContent}
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-lg shadow-amber-500/25 gap-2 px-7 py-5 text-sm font-semibold rounded-full transition-all hover:scale-105 animate-fade-up"
            style={{ animationDelay: '0.4s' }}
          >
            <Sparkles className="h-4 w-4" />
            Ask Our AI
          </Button>
        </div>
      </section>
      
      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab List with sliding underline effect */}
          <TabsList className="mb-6 bg-white/80 backdrop-blur-md border border-emerald-100/50 p-1 relative">
            <TabsTrigger 
              value="customer" 
              className="gap-2 relative z-10 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
            >
              <User className="h-4 w-4" />
              Customer
            </TabsTrigger>
            <TabsTrigger 
              value="owner" 
              className="gap-2 relative z-10 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
            >
              <LayoutDashboard className="h-4 w-4" />
              Owner Dashboard
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="customer" className="mt-0 animate-fade-up">
            <CustomerView items={menuItems} />
          </TabsContent>
          
          <TabsContent value="owner" className="mt-0 animate-fade-up">
            <OwnerDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
