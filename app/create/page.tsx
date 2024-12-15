'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Plus, Menu, X, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { v4 as uuidv4 } from 'uuid'
import ThreadSidebar from '../components/ThreadSidebar'
import { useWindowSize } from '@/hooks/use-window-size'
import { cn } from '@/lib/utils'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

const AIChat = dynamic(() => import('../components/AIChat'), { ssr: false })
const OpportunityCanvas = dynamic(() => import('../components/OpportunityCanvas'), { ssr: false })

interface Thread {
  id: string;
  title: string;
  userId?: string;
  content: {
    title: string;
    description: string;
    sections: {
      nextSteps: { heading: string; items: string[] };
      connections: { heading: string; items: string[] };
    };
    tags: string[];
    status: 'draft' | 'published';
  } | null;
}

export default function Create() {
  const { width = 0 } = useWindowSize()
  const isSmallScreen = width < 1024
  const [threads, setThreads] = useState<Thread[]>([{ 
    id: uuidv4(), 
    title: 'New Opportunity',
    content: null
  }])
  const [activeThreadId, setActiveThreadId] = useState<string>(threads[0].id)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showOpportunity, setShowOpportunity] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const loadThreads = async () => {
      if (!user) return

      try {
        const threadsRef = collection(db, 'threads')
        const q = query(
          threadsRef,
          where('userId', '==', user.uid),
          orderBy('updatedAt', 'desc')
        )
        
        const querySnapshot = await getDocs(q)
        const loadedThreads = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Thread[]

        if (loadedThreads.length > 0) {
          setThreads(loadedThreads)
          setActiveThreadId(loadedThreads[0].id)
        } else {
          const defaultThread = { 
            id: uuidv4(), 
            title: 'New Opportunity',
            content: null,
            userId: user.uid
          }
          setThreads([defaultThread])
          setActiveThreadId(defaultThread.id)
          await saveThread(defaultThread)
        }
      } catch (error) {
        console.error('Error loading threads:', error)
      }
    }

    loadThreads()
  }, [user])

  useEffect(() => {
    if (activeThreadId) {
      setShowOpportunity(false)
    }
  }, [activeThreadId])

  const saveThread = async (threadToSave: Thread) => {
    if (!user) return

    try {
      const threadData = {
        userId: user.uid,
        title: threadToSave.title || 'New Opportunity',
        content: threadToSave.content || null,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      }

      // For new threads
      if (!threadToSave.id?.includes('/')) {
        await addDoc(collection(db, 'threads'), threadData)
      } 
      // For existing threads
      else {
        const threadRef = doc(db, 'threads', threadToSave.id)
        await updateDoc(threadRef, {
          ...threadData,
          updatedAt: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Error saving thread:', error)
      throw error
    }
  }

  const handleTitleChange = (title: string) => {
    setThreads(prev => {
      const newThreads = prev.map(thread => 
        thread.id === activeThreadId 
          ? { ...thread, title } 
          : thread
      )
      const updatedThread = newThreads.find(t => t.id === activeThreadId)
      if (updatedThread) {
        saveThread(updatedThread)
      }
      return newThreads
    })
  }

  const handleSuggestion = async (suggestionStr: string) => {
    try {
      const suggestion = JSON.parse(suggestionStr)
      
      const updatedThread = {
        ...threads.find(t => t.id === activeThreadId)!,
        title: suggestion.title || 'New Opportunity',
        content: {
          title: suggestion.title || 'New Opportunity',
          description: suggestion.description || '',
          sections: {
            roles: suggestion.sections?.roles || { heading: "Key Roles & Responsibilities", items: [] },
            nextSteps: suggestion.sections?.nextSteps || { heading: "Next Steps", items: [] },
            connections: suggestion.sections?.connections || { heading: "Required Connections", items: [] }
          },
          tags: suggestion.tags || [],
          status: 'draft'
        }
      }
      
      setThreads(prev => prev.map(thread => 
        thread.id === activeThreadId ? updatedThread : thread
      ))
      
      await saveThread(updatedThread)
      setShowOpportunity(true)
    } catch (error) {
      console.error('Error parsing suggestion:', error)
    }
  }

  const createNewThread = async () => {
    const newThread = { 
      id: uuidv4(), 
      title: 'New Opportunity',
      content: null
    }
    
    setThreads(prev => [...prev, newThread])
    setActiveThreadId(newThread.id)
    setShowOpportunity(false)
    
    if (user) {
      await saveThread(newThread)
    }
  }

  const handleFirstMessage = async (threadId: string, message: string) => {
    const thread = threads.find(t => t.id === threadId)
    if (!thread) return

    // Update thread title with first few words of the message
    const title = message.split(' ').slice(0, 5).join(' ') + '...'
    const updatedThread = { ...thread, title }
    
    await saveThread(updatedThread)
    setThreads(prev => prev.map(t => 
      t.id === threadId ? updatedThread : t
    ))
  }

  const handleSaveCanvas = async (content: any) => {
    const updatedThread = {
      ...threads.find(t => t.id === activeThreadId)!,
      content,
      title: content.title
    }
    
    setThreads(prev => prev.map(thread => 
      thread.id === activeThreadId ? updatedThread : thread
    ))
    
    await saveThread(updatedThread)
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          {(!showOpportunity || !isSmallScreen) && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowSidebar(!showSidebar)}
              className="shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          {showOpportunity && isSmallScreen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowOpportunity(false)}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold">Opportunity Creator</h1>
            <p className="text-sm text-muted-foreground">
              {threads.find(t => t.id === activeThreadId)?.title || 'New Opportunity'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!showOpportunity && (
            <Button onClick={createNewThread} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" /> New Opportunity
            </Button>
          )}
          {showOpportunity && !isSmallScreen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowOpportunity(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {!showOpportunity && (
          <aside 
            className={cn(
              "w-80 border-r bg-muted/10 overflow-y-auto transition-transform duration-300",
              showSidebar ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <ThreadSidebar
              threads={threads}
              activeThreadId={activeThreadId}
              onThreadSelect={(id) => {
                setActiveThreadId(id)
                setShowOpportunity(false)
              }}
              onNewThread={createNewThread}
            />
          </aside>
        )}
        
        {/* Main Workspace */}
        <main className={cn(
          "flex-1 flex",
          showOpportunity ? "md:gap-6" : "",
          showSidebar && !showOpportunity ? "ml-4" : ""
        )}>
          {/* Chat Section */}
          {(!showOpportunity || !isSmallScreen) && (
            <div className={cn(
              "flex-1 min-w-0 flex flex-col",
              showOpportunity ? "lg:max-w-[45%]" : ""
            )}>
              <AIChat 
                threadId={activeThreadId}
                onSuggestion={handleSuggestion}
                onFirstMessage={handleFirstMessage}
                onTabChange={(tab) => {
                  if (tab === 'canvas') {
                    setShowOpportunity(true)
                  }
                }}
              />
            </div>
          )}
          
          {/* Canvas Section */}
          {showOpportunity && (
            <div className={cn(
              "flex-1 overflow-hidden flex flex-col",
              isSmallScreen ? "w-full" : "border-l"
            )}>
              <OpportunityCanvas
                initialContent={threads.find(t => t.id === activeThreadId)?.content || null}
                onTitleChange={handleTitleChange}
                onClose={() => setShowOpportunity(false)}
                onSave={handleSaveCanvas}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

