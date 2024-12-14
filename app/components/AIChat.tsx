'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '../contexts/AuthContext'

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
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'ai';
  content: string;
  timestamp: any;
  userId: string;
  opportunityId?: string;
  showCanvasButton?: boolean;
}

export default function AIChat({ onSuggestion, onTabChange }: AIChatProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: "Hi! I am a social enterprise creator assistant grounded in permaculture, humanity-centered design, and heart-based leadership principles. What opportunity do you need support to realize? Describe your vision and what support you're inviting in.",
      timestamp: serverTimestamp(),
      userId: 'system'
    }
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [opportunityId, setOpportunityId] = useState<string | undefined>(undefined)
  const { user } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  useEffect(() => {
    if (!user) return;
    
    const fetchChatHistory = async () => {
      if (!user) return;
      
      try {
        const chatRef = collection(db, 'chats');
        const q = query(
          chatRef,
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(50)
        );
        
        const snapshot = await getDocs(q);
        const history = snapshot.docs
          .map(doc => doc.data() as ChatMessage)
          .reverse();
        setMessages(history);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };
    
    fetchChatHistory();
  }, [user]);

  const saveMessage = async (message: ChatMessage) => {
    if (!user) return;
    
    await addDoc(collection(db, 'chats'), {
      ...message,
      timestamp: serverTimestamp(),
      userId: user.uid,
      opportunityId
    });
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
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error generating opportunity:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    setLoading(true)
    const userMessage: ChatMessage = { 
      role: 'user', 
      content: input,
      timestamp: serverTimestamp(),
      userId: user?.uid || 'anonymous',
      ...(opportunityId && { opportunityId })
    }
    setMessages(prev => [...prev, userMessage])

    // Save user message
    await saveMessage({
      role: 'user',
      content: input,
      timestamp: serverTimestamp(),
      userId: user?.uid || '',
      ...(opportunityId && { opportunityId })
    })

    try {
      const opportunity = await generateOpportunityCanvas(input)
      
      if ('error' in opportunity) {
        throw new Error(opportunity.error)
      }
      
      onSuggestion(JSON.stringify(opportunity))

      const aiMessage: ChatMessage = { 
        role: 'assistant', 
        content: `I've analyzed your vision through the lens of permaculture, humanity-centered design, and heart-based leadership principles. I've created an opportunity canvas that reflects these values and outlines regenerative next steps. Would you like to review and refine the canvas?`,
        timestamp: serverTimestamp(),
        userId: 'system',
        ...(opportunityId && { opportunityId }),
        showCanvasButton: true
      }
      setMessages(prev => [...prev, aiMessage])

      // Save AI message
      await saveMessage({
        role: 'ai',
        content: aiMessage.content,
        timestamp: serverTimestamp(),
        userId: user?.uid || '',
        ...(opportunityId && { opportunityId })
      })
    } catch (error: any) {
      const errorMessage = error.message === 'Service temporarily unavailable. Please try again later.'
        ? 'Our AI service is temporarily unavailable. Please try again in a few minutes.'
        : 'I apologize, but I encountered an error while processing your request. Please try again.'
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: errorMessage,
        timestamp: serverTimestamp(),
        userId: 'system',
        ...(opportunityId && { opportunityId })
      }])
    } finally {
      setLoading(false)
      setInput('')
    }
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-lg overflow-hidden border">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="flex flex-col gap-2">
              <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}>
                {message.content}
              </div>
              {message.role === 'ai' && message.showCanvasButton && (
                <Button 
                  onClick={() => onTabChange?.('canvas')}
                  className="flex items-center gap-2"
                  variant="outline"
                  size="sm"
                >
                  View Opportunity Canvas
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="border-t p-4 bg-background">
        <div className="flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow resize-none"
            placeholder="Type your message..."
            rows={2}
            disabled={loading}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="h-full aspect-square"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send size={20} />}
          </Button>
        </div>
      </form>
    </div>
  )
}

