'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '@/lib/utils'

const SYSTEM_PROMPT = `You are a social enterprise creator assistant with expertise in permaculture, humanity-centered design, and heart-based leadership. 

Key principles you embody:
- Permaculture: Earth care, people care, fair share
- Humanity-centered design: Empathy, co-creation, holistic solutions
- Heart-based leadership: Authenticity, compassion, collective wisdom

Help users develop their ideas into opportunities that:
1. Create regenerative solutions
2. Foster community wellbeing
3. Enable sustainable prosperity
4. Honor indigenous wisdom
5. Build resilient systems

Format responses to include practical next steps and needed connections while maintaining focus on these principles.`

interface AIChatProps {
  onSuggestion: (suggestion: string) => void;
  onTabChange?: (tab: string) => void;
  threadId?: string;
  onFirstMessage?: (threadId: string, message: string) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'ai';
  content: string;
  timestamp: any;
  userId: string;
  threadId?: string;
  showCanvasButton?: boolean;
}

// Add this interface to define the error response type
interface OpportunityError {
  error: string;
}

// Add interface for opportunity response
interface OpportunityResponse {
  title: string;
  description: string;
  roles?: string[];
  nextSteps?: string[];
  connections?: string[];
  tags?: string[];
  error?: string;
}

export default function AIChat({ onSuggestion, onTabChange, threadId, onFirstMessage }: AIChatProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: "Hi! I am a social enterprise creator assistant grounded in permaculture, humanity-centered design, and heart-based leadership principles. What opportunity do you need support to realize? Describe your vision and what support you're inviting in.",
      timestamp: serverTimestamp(),
      userId: 'system',
      threadId
    }
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.timestamp === serverTimestamp()) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  useEffect(() => {
    if (!user || !threadId) return;
    
    const fetchChatHistory = async () => {
      try {
        const chatRef = collection(db, 'chats');
        const q = query(
          chatRef,
          where('userId', '==', user.uid),
          where('threadId', '==', threadId),
          orderBy('timestamp', 'desc'),
          limit(50)
        );
        
        const snapshot = await getDocs(q);
        const history = snapshot.docs
          .map(doc => doc.data() as ChatMessage)
          .reverse();
        
        if (history.length > 0) {
          setMessages(history);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };
    
    fetchChatHistory();
  }, [user, threadId]);

  useEffect(() => {
    setMessages([{ 
      role: 'assistant', 
      content: "Hi! I am a social enterprise creator assistant grounded in permaculture, humanity-centered design, and heart-based leadership principles. What opportunity do you need support to realize? Describe your vision and what support you're inviting in.",
      timestamp: null,
      userId: 'system',
      threadId
    }])
  }, [threadId])

  const saveMessage = async (message: ChatMessage) => {
    if (!user || !threadId) return;
    
    const messageData = {
      ...message,
      timestamp: serverTimestamp(),
      userId: user.uid,
      threadId
    };

    await addDoc(collection(db, 'chats'), messageData);
  };

  const generateOpportunityCanvas = async (userInput: string) => {
    try {
      const response = await fetch('/api/generate-opportunity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput,
          messages: messages.map(m => ({
            role: m.role === 'ai' ? 'assistant' : 'user',
            content: m.content
          }))
        })
      })

      if (!response.ok) throw new Error('Failed to generate opportunity')
      
      const data = await response.json() as OpportunityResponse
      
      // Type guard to check if response is an error
      if ('error' in data && data.error) {
        throw new Error(data.error)
      }
      
      const formattedData = {
        title: data.title || "New Opportunity",
        description: data.description || "",
        sections: {
          roles: {
            heading: "Key Roles & Responsibilities",
            items: data.roles || []
          },
          nextSteps: {
            heading: "Next Steps",
            items: data.nextSteps || []
          },
          connections: {
            heading: "Required Connections",
            items: data.connections || []
          }
        },
        tags: data.tags || [],
        status: 'draft'
      }

      onSuggestion(JSON.stringify(formattedData))
      
      return formattedData
    } catch (error) {
      console.error('Error generating opportunity:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading || !threadId) return

    setLoading(true)
    const userMessage: ChatMessage = { 
      role: 'user', 
      content: input,
      timestamp: serverTimestamp(),
      userId: user?.uid || 'anonymous',
      threadId
    }
    
    if (messages.length === 1 && onFirstMessage) {
      await onFirstMessage(threadId, input)
    }

    try {
      await saveMessage(userMessage)
      setMessages(prev => [...prev, userMessage])

      const opportunity = await generateOpportunityCanvas(input)
      
      if ('error' in opportunity && typeof opportunity.error === 'string') {
        throw new Error(opportunity.error)
      }
      
      const aiMessage: ChatMessage = { 
        role: 'assistant', 
        content: `I've created an opportunity canvas for "${opportunity.title}". The canvas includes:
- A detailed description of the opportunity
- Key next steps for implementation
- Required connections and partnerships
- Essential roles and responsibilities

Would you like to review and refine the canvas?`,
        timestamp: serverTimestamp(),
        userId: 'system',
        threadId,
        showCanvasButton: true
      }
      
      await saveMessage(aiMessage)
      setMessages(prev => [...prev, aiMessage])
    } catch (error: any) {
      const errorMessage = error.message === 'Service temporarily unavailable. Please try again later.'
        ? 'Our AI service is temporarily unavailable. Please try again in a few minutes.'
        : 'I apologize, but I encountered an error while processing your request. Please try again.'
      
      const errorAiMessage: ChatMessage = {
        role: 'ai', 
        content: errorMessage,
        timestamp: serverTimestamp(),
        userId: 'system',
        threadId
      }
      setMessages(prev => [...prev, errorAiMessage])
      
      await saveMessage(errorAiMessage)
    } finally {
      setLoading(false)
      setInput('')
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={cn(
            "flex",
            message.role === 'user' ? "justify-end" : "justify-start",
            "animate-in fade-in-0 slide-in-from-bottom-3"
          )}>
            <div className="flex flex-col gap-2 max-w-[85%]">
              <div className={cn(
                "rounded-lg px-4 py-2",
                message.role === 'user' 
                  ? "bg-primary text-primary-foreground ml-auto" 
                  : "bg-muted"
              )}>
                {message.content}
              </div>
              {(message.role === 'assistant' || message.role === 'ai') && message.showCanvasButton && (
                <Button 
                  onClick={() => onTabChange?.('canvas')}
                  className="self-start"
                  variant="outline"
                  size="sm"
                >
                  View Opportunity Canvas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="border-t p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your social enterprise opportunity..."
            className="min-h-[80px] resize-none"
            disabled={loading}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="h-[80px] w-[80px] shrink-0"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Send className="h-6 w-6" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

