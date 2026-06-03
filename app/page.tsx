'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CustomerView } from '@/components/customer-view'
import { OwnerDashboard } from '@/components/owner-dashboard'
import { menuItems } from '@/lib/menu-data'
import { User, LayoutDashboard, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SmartMenuPage() {
  const scrollToContent = () => {
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[420px] overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-950 to-black" />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
          {/* Logo */}
          <div className="mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <svg 
              viewBox="0 0 24 24" 
              className="w-9 h-9 text-white"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold text-white mb-3 tracking-tight text-balance">
            Jade Palace Restaurant
          </h1>
          <p className="text-emerald-200/80 text-lg sm:text-xl mb-2 font-medium">
            Where Tradition Meets Innovation
          </p>
          <p className="text-emerald-300/60 text-sm sm:text-base mb-8 max-w-md">
            AI-Powered Menu Experience — Ask anything, discover everything
          </p>
          
          <Button 
            onClick={scrollToContent}
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-lg shadow-amber-500/30 gap-2 px-8 py-6 text-base font-semibold rounded-full transition-all hover:scale-105"
          >
            <Sparkles className="h-5 w-5" />
            Ask Our AI
          </Button>
        </div>
      </section>
      
      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="customer" className="w-full">
          <TabsList className="mb-6 bg-emerald-50 border border-emerald-100">
            <TabsTrigger value="customer" className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <User className="h-4 w-4" />
              Customer
            </TabsTrigger>
            <TabsTrigger value="owner" className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <LayoutDashboard className="h-4 w-4" />
              Owner Dashboard
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="customer" className="mt-0">
            <CustomerView items={menuItems} />
          </TabsContent>
          
          <TabsContent value="owner" className="mt-0">
            <OwnerDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
