'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '../contexts/AuthContext'

const AIChat = dynamic(() => import('../components/AIChat'), { ssr: false })
const OpportunityCanvas = dynamic(() => import('../components/OpportunityCanvas'), { ssr: false })

export default function Create() {
  const [activeTab, setActiveTab] = useState('chat')
  const { user } = useAuth()
  const router = useRouter()

  const handleSuggestion = (suggestion: string) => {
    console.log('Suggestion:', suggestion)
  }

  if (typeof window !== 'undefined' && !user) {
    router.push('/login')
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)] flex flex-col">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 brand-gradient text-center">Create Your Opportunity</h1>
      <Card className="flex-grow flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <TabsList className="px-4 pt-4 bg-background">
            <TabsTrigger value="chat" className="flex-1">AI Chat</TabsTrigger>
            <TabsTrigger value="canvas" className="flex-1">Opportunity Canvas</TabsTrigger>
          </TabsList>
          <div className="flex-grow overflow-hidden p-4">
            <TabsContent value="chat" className="h-full">
              <AIChat onSuggestion={handleSuggestion} />
            </TabsContent>
            <TabsContent value="canvas" className="h-full">
              <OpportunityCanvas />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  )
}

