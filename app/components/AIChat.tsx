'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface AIChatProps {
  onSuggestion: (suggestion: string) => void;
}

export default function AIChat({ onSuggestion }: AIChatProps) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai', content: string }>>([
    { role: 'ai', content: "Hi! I am a social enterprise creator assistant. I help you turn your ideas into better realities. What opportunity do you need support to realize? Describe in one sentence what your vision is and what support you are inviting in." }
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setMessages(prev => [...prev, { role: 'user', content: input }])

    setTimeout(() => {
      const aiResponse = `Thank you for sharing your vision. Let's work on refining your idea and creating an opportunity canvas. Can you provide more details about your specific goals and the type of support you're looking for?`
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }])
      onSuggestion(input)
    }, 1000)

    setInput('')
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-lg overflow-hidden border">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}>
              {message.content}
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
          />
          <Button type="submit" size="icon" className="h-full aspect-square">
            <Send size={20} />
          </Button>
        </div>
      </form>
    </div>
  )
}

