'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from '@/app/contexts/AuthContext'
import Link from 'next/link'

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

export default function OpportunityPage() {
  const { id } = useParams()
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

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
            />
            <Button className="brand-gradient-bg text-white">
              Send Message
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
      </div>
    </div>
  )
}

