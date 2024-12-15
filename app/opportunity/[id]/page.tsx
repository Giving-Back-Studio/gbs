'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc, addDoc, collection, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from '@/app/contexts/AuthContext'
import Link from 'next/link'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from 'date-fns'

interface Opportunity {
  id: string
  title: string
  content: string
  description: string
  tags: string[]
  status: 'draft' | 'published'
  createdAt: any
  createdBy: string
  engagementCount: number
  likeCount: number
}

interface Response {
  id: string
  message: string
  responderId: string
  responderEmail: string
  createdAt: any
}

export default function OpportunityPage() {
  const { id } = useParams()
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [responses, setResponses] = useState<Response[]>([])

  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!id) return

      try {
        const docRef = doc(db, 'opportunities', id as string)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setOpportunity({
            id: docSnap.id,
            ...docSnap.data()
          } as Opportunity)
        }
      } catch (error) {
        console.error('Error fetching opportunity:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOpportunity()
  }, [id])

  useEffect(() => {
    if (!id) return

    const q = query(
      collection(db, 'responses'),
      where('opportunityId', '==', id),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newResponses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Response[]
      setResponses(newResponses)
    })

    return () => unsubscribe()
  }, [id])

  const handleSendMessage = async () => {
    if (!user || !message.trim() || !opportunity) return
    
    setSending(true)
    try {
      // Add the response to a 'responses' collection
      const responseData = {
        opportunityId: opportunity.id,
        message: message.trim(),
        responderId: user.uid,
        responderEmail: user.email,
        createdAt: serverTimestamp(),
        opportunityCreatorId: opportunity.createdBy,
        opportunityTitle: opportunity.title
      }

      await addDoc(collection(db, 'responses'), responseData)
      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!opportunity) {
    return <div>Opportunity not found</div>
  }

  return (
    <div className="container py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">{opportunity.title}</h1>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {opportunity.tags.map((tag, index) => (
          <Badge key={index} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>

      <Card className="p-6 mb-8">
        <div 
          className="prose max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: opportunity.content }}
        />
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Collaborate</h2>
        {user ? (
          <div className="space-y-4">
            <textarea 
              className="w-full p-4 rounded-lg border"
              rows={4}
              placeholder="Share your thoughts or express interest..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button 
              className="brand-gradient-bg text-white"
              onClick={handleSendMessage}
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        ) : (
          <Card className="p-6">
            <p>Please sign in to collaborate on this opportunity.</p>
            <Button className="mt-4" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </Card>
        )}

        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-semibold">Responses ({responses.length})</h3>
          {responses.map((response) => (
            <Card key={response.id} className="p-4">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback>
                    {response.responderEmail?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-medium">{response.responderEmail}</p>
                    <span className="text-sm text-muted-foreground">
                      {response.createdAt?.toDate ? 
                        formatDistanceToNow(response.createdAt.toDate(), { addSuffix: true }) :
                        'Just now'
                      }
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{response.message}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

