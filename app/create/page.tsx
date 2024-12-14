'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { v4 as uuidv4 } from 'uuid'

const AIChat = dynamic(() => import('../components/AIChat'), { ssr: false })
const OpportunityCanvas = dynamic(() => import('../components/OpportunityCanvas'), { ssr: false })

interface Thread {
  id: string;
  canvasContent: any;
}

export default function Create() {
  const [activeTab, setActiveTab] = useState('chat')
  const [threads, setThreads] = useState<Thread[]>([{ id: uuidv4(), canvasContent: null }])
  const [activeThreadId, setActiveThreadId] = useState<string>(threads[0].id)
  const { user } = useAuth()
  const router = useRouter()

  const handleSuggestion = (suggestion: string) => {
    try {
      const data = JSON.parse(suggestion)
      setThreads(prevThreads => 
        prevThreads.map(thread => 
          thread.id === activeThreadId 
            ? { ...thread, canvasContent: {
                title: data.title,
                description: data.description || '',
                sections: {
                  connections: {
                    heading: 'Who I\'m Looking to Collaborate With',
                    items: data.sections.connections.items || []
                  }
                },
                tags: data.tags || [],
                status: 'draft'
              }}
            : thread
        )
      )
    } catch (error) {
      console.error('Error parsing suggestion:', error)
    }
  }

  const createNewThread = () => {
    const newThread = { id: uuidv4(), canvasContent: null }
    setThreads(prev => [...prev, newThread])
    setActiveThreadId(newThread.id)
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold brand-gradient">Create Your Opportunity</h1>
        <Button onClick={createNewThread} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Thread
        </Button>
      </div>
      
      {threads.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {threads.map((thread, index) => (
            <Button
              key={thread.id}
              variant={thread.id === activeThreadId ? "default" : "outline"}
              onClick={() => setActiveThreadId(thread.id)}
            >
              Thread {index + 1}
            </Button>
          ))}
        </div>
      )}

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
                threadId={activeThreadId}
              />
            </TabsContent>
            <TabsContent value="canvas" className="h-full">
              <OpportunityCanvas 
                initialContent={threads.find(t => t.id === activeThreadId)?.canvasContent || null} 
              />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  )
}

