'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CustomerView } from '@/components/customer-view'
import { OwnerDashboard } from '@/components/owner-dashboard'
import { menuItems } from '@/lib/menu-data'
import { UtensilsCrossed, User, LayoutDashboard } from 'lucide-react'

export default function SmartMenuPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">SmartMenu</h1>
              <p className="text-sm text-muted-foreground">Golden Dragon Restaurant AI Assistant</p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="customer" className="w-full">
          <TabsList className="mb-6 bg-muted/80">
            <TabsTrigger value="customer" className="gap-2">
              <User className="h-4 w-4" />
              Customer
            </TabsTrigger>
            <TabsTrigger value="owner" className="gap-2">
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
