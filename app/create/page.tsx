'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '../contexts/AuthContext'

const AIChat = dynamic(() => import('../components/AIChat'), { ssr: false })
const OpportunityCanvas = dynamic(() => import('../components/OpportunityCanvas'), { ssr: false })

export default function Create() {
  const [activeTab, setActiveTab] = useState('chat')
  const [canvasContent, setCanvasContent] = useState<{
    title: string;
    description: string;
    sections: {
      nextSteps: { heading: string; items: string[] };
      connections: { heading: string; items: string[] };
    };
    tags: string[];
    status: 'draft' | 'published';
  } | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  const handleSuggestion = (suggestion: string) => {
    try {
      const data = JSON.parse(suggestion)
      setCanvasContent({
        title: data.title,
        description: data.description || '',
        sections: {
          nextSteps: {
            heading: 'Next Steps',
            items: data.nextSteps || []
          },
          connections: {
            heading: 'Who I\'m Looking to Connect With',
            items: data.connections || []
          }
        },
        tags: data.tags || [],
        status: 'draft'
      })
    } catch (error) {
      console.error('Error parsing suggestion:', error)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) {
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
              <AIChat 
                onSuggestion={handleSuggestion} 
                onTabChange={setActiveTab}
              />
            </TabsContent>
            <TabsContent value="canvas" className="h-full">
              <OpportunityCanvas initialContent={canvasContent} />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  )
}

