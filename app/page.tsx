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
  const words = ['Jade', 'Palace', 'Restaurant']
  return (
    <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold text-white mb-3 tracking-tight text-balance fade-up" style={{ animationDelay: '80ms' }}>
      {words.map((word, i) => (
        <span key={word} className="hero-word cursor-default">
          {word}
          {i < words.length - 1 && ' '}
        </span>
      ))}
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
      className={`back-to-top fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center ${visible ? 'visible' : ''}`}
      aria-label="Back to top"
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  )
}

export default function SmartMenuPage() {
  const scrollToContent = () => {
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative h-[400px] overflow-hidden gradient-border-bottom">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D2B2B] via-emerald-950 to-black" />
        {/* Ambient blobs */}
        <div className="absolute top-16 left-16 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-8 right-12 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        
        {/* Floating particles */}
        <FloatingParticles />

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
          {/* Logo with rotation */}
          <div 
            className="logo-spin mb-5 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 fade-up cursor-pointer" 
            style={{ animationDelay: '0ms' }}
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>

          {/* Title with word hover */}
          <HeroTitle />

          <div className="fade-up" style={{ animationDelay: '200ms' }}>
            <TypewriterTagline />
          </div>

          {/* Subtitle with shimmer */}
          <p
            className="shimmer-text text-emerald-300/60 text-sm sm:text-base mb-8 max-w-md cursor-default fade-up"
            style={{ animationDelay: '320ms' }}
          >
            AI-Powered Menu Experience — Ask anything, discover everything
          </p>

          {/* Button with ripple */}
          <Button
            onClick={scrollToContent}
            size="lg"
            className="btn-ripple bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-lg shadow-amber-500/30 gap-2 px-8 py-6 text-base font-semibold rounded-full fade-up"
            style={{ animationDelay: '420ms' }}
          >
            <Sparkles className="h-5 w-5" />
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
            <TabsTrigger
              value="owner"
              className="gap-2 tab-indicator data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-colors duration-200 relative z-10"
            >
              <LayoutDashboard className="h-4 w-4" />
              Owner Dashboard
              {/* Notification dot */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
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

      {/* Back to Top */}
      <BackToTopButton />
    </div>
  )
}
