'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CustomerView } from '@/components/customer-view'
import { OwnerDashboard } from '@/components/owner-dashboard'
import { menuItems } from '@/lib/menu-data'
import { User, LayoutDashboard, Sparkles, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

const TAGLINE = 'Where Tradition Meets Innovation'

function TypewriterTagline() {
  const [displayed, setDisplayed] = useState('')
  const [phase, setPhase] = useState<'typing' | 'pause' | 'deleting' | 'pauseEmpty'>('typing')

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (phase === 'typing') {
      if (displayed.length < TAGLINE.length) {
        timeout = setTimeout(() => {
          setDisplayed(TAGLINE.slice(0, displayed.length + 1))
        }, 50)
      } else {
        timeout = setTimeout(() => setPhase('pause'), 2000)
      }
    } else if (phase === 'pause') {
      timeout = setTimeout(() => setPhase('deleting'), 0)
    } else if (phase === 'deleting') {
      if (displayed.length > 0) {
        timeout = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1))
        }, 30)
      } else {
        timeout = setTimeout(() => setPhase('pauseEmpty'), 500)
      }
    } else if (phase === 'pauseEmpty') {
      timeout = setTimeout(() => setPhase('typing'), 0)
    }

    return () => clearTimeout(timeout)
  }, [displayed, phase])

  const showCursor = phase === 'typing' || phase === 'deleting'

  return (
    <p className="text-emerald-200/85 text-lg sm:text-xl mb-2 font-medium min-h-[1.75rem]">
      {displayed}
      {showCursor && <span className="typewriter-cursor opacity-80" />}
    </p>
  )
}

function HeroTitle() {
  return (
    <h1 
      className="hero-title font-serif text-3xl sm:text-4xl md:text-5xl font-semibold mb-2 tracking-tight text-balance animate-fade-in"
    >
      Jade Palace Restaurant
    </h1>
  )
}

function FloatingParticles() {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`,
    size: Math.random() * 3 + 2,
  }))

  return (
    <>
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            animationDelay: p.delay,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </>
  )
}

function BackToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`back-to-top fixed bottom-6 left-6 z-40 w-10 h-10 rounded-full text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center ${visible ? 'visible' : ''}`}
      aria-label="Back to top"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  )
}

export default function SmartMenuPage() {
  const scrollToContent = () => {
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div style={{ overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative h-[320px] overflow-hidden gradient-border-bottom">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D2B2B] via-emerald-950 to-black" />
        {/* Ambient blobs */}
        <div className="absolute top-10 left-10 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-4 right-8 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        
        {/* Floating particles */}
        <FloatingParticles />

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center py-6">
          {/* Elegant Jade Logo with golden border */}
          <div 
            className="logo-icon mb-4 w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30 fade-up cursor-pointer ring-2 ring-amber-500/60" 
            style={{ animationDelay: '0ms' }}
          >
            {/* Stylized Lotus/Jade Icon */}
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
              {/* Central jade gem shape */}
              <path d="M12 3L4 10l8 11 8-11-8-7z" fill="currentColor" opacity="0.3" />
              <path d="M12 3L4 10l8 11 8-11-8-7z" />
              {/* Inner facet lines */}
              <path d="M12 3v18M4 10h16M8 6.5L12 21M16 6.5L12 21" opacity="0.5" />
              {/* Top accent */}
              <circle cx="12" cy="7" r="1.5" fill="currentColor" />
            </svg>
          </div>

          {/* Title with word hover */}
          <HeroTitle />

          <div className="fade-up" style={{ animationDelay: '200ms' }}>
            <TypewriterTagline />
          </div>

          <Button
            onClick={scrollToContent}
            size="lg"
            className="btn-ripple bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-lg shadow-amber-500/30 gap-2 px-6 py-5 text-sm font-semibold rounded-full fade-up mt-4"
            style={{ animationDelay: '320ms' }}
          >
            <Sparkles className="h-4 w-4" />
            Ask Our AI
          </Button>
        </div>
      </section>

      {/* Main */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="customer" className="w-full">
          <TabsList className="mb-6 bg-white/70 backdrop-blur border border-emerald-100 shadow-sm">
            <TabsTrigger
              value="customer"
              className="gap-2 tab-indicator data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-colors duration-200 relative z-10"
            >
              <User className="h-4 w-4" />
              Customer
            </TabsTrigger>
            <div className="relative">
              <TabsTrigger
                value="owner"
                className="gap-2 tab-indicator data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-colors duration-200 relative z-10 whitespace-nowrap"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Owner Dashboard</span>
              </TabsTrigger>
              {/* Notification dot - positioned OUTSIDE the tab pill */}
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ring-2 ring-white" />
            </div>
          </TabsList>

          <TabsContent value="customer" className="mt-0">
            <CustomerView items={menuItems} />
          </TabsContent>

          <TabsContent value="owner" className="mt-0">
            <OwnerDashboard />
          </TabsContent>
        </Tabs>
      </main>

      {/* Back to Top */}
      <BackToTopButton />
    </div>
    </div>
  )
}
