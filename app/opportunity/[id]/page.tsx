'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Bookmark, MessageSquare, Send } from 'lucide-react'

const mockOpportunity = {
  id: 1,
  title: "Community Garden for Food Security",
  description: "We want to build a community garden to address food insecurity.",
  nextSteps: [
    "Identify suitable location",
    "Gather volunteers",
    "Secure funding for supplies",
  ],
  connections: [
    "Local gardening enthusiasts",
    "Community leaders",
    "Potential sponsors",
  ],
  replies: [
    { id: 1, author: "Jane Doe", content: "I'd love to help! I have experience in urban gardening." },
    { id: 2, author: "John Smith", content: "I can connect you with some local businesses for sponsorship." },
  ]
}

export default function OpportunityDetails() {
  const { id } = useParams()
  const [opportunity] = useState(mockOpportunity)
  const [newReply, setNewReply] = useState('')

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, we would save the reply to the backend here
    setNewReply('')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold">{opportunity.title}</h1>
          <button className="text-gray-500 hover:text-blue-500">
            <Bookmark className="h-6 w-6" />
          </button>
        </div>
        
        <p className="text-gray-600">{opportunity.description}</p>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Next Steps</h2>
          <ul className="list-disc pl-5 space-y-1">
            {opportunity.nextSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Who We're Looking to Connect With</h2>
          <ul className="list-disc pl-5 space-y-1">
            {opportunity.connections.map((connection, index) => (
              <li key={index}>{connection}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <h2 className="text-2xl font-semibold">Collaboration</h2>
        
        <form onSubmit={handleSubmitReply} className="space-y-4">
          <textarea
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Add your thoughts or offer to help..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 flex items-center"
            >
              <Send className="h-5 w-5 mr-2" />
              Send Reply
            </button>
          </div>
        </form>
        
        <div className="space-y-4">
          {opportunity.replies.map((reply) => (
            <div key={reply.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <MessageSquare className="h-5 w-5 text-gray-500 mr-2" />
                <span className="font-semibold">{reply.author}</span>
              </div>
              <p>{reply.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

