'use client'

import { useState } from 'react'
import { SendHorizontal } from 'lucide-react'
import OpportunityCanvas from '../components/OpportunityCanvas'

export default function Chat() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hi! I can help you refine your opportunity. What would you like to work on?' }
  ])
  const [input, setInput] = useState('')
  const [showCanvas, setShowCanvas] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setMessages(prev => [...prev, { role: 'user', content: input }])
    
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: "I've analyzed your idea. Would you like me to help you create an opportunity canvas for this?" 
        }
      ])
      setShowCanvas(true)
    }, 1000)

    setInput('')
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] gap-4 md:gap-6">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${
                message.role === 'assistant' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'assistant'
                    ? 'bg-gray-100'
                    : 'bg-blue-500 text-white'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <SendHorizontal className="w-5 h-5" />
          </button>
        </form>
      </div>
      {showCanvas && (
        <div className="w-full md:w-[600px] border-t md:border-l md:border-t-0 p-4 md:p-6">
          <OpportunityCanvas initialContent="" />
        </div>
      )}
    </div>
  )
}

