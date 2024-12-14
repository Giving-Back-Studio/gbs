'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, ArrowRight, ThumbsUp } from 'lucide-react'
import Link from 'next/link'
import { useInView } from 'react-intersection-observer'
import { collection, query, orderBy, limit, startAfter, getDocs, DocumentData, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Opportunity {
  id: string
  title: string
  description: string
  content: string
  engagementCount: number
  likeCount: number
  tags: string[]
  status: 'draft' | 'published'
  createdAt: any
  createdBy: string
}

const PAGE_SIZE = 9

export default function Feed() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null)
  const [loading, setLoading] = useState(false)
  const [allTags, setAllTags] = useState<string[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const { ref, inView } = useInView()

  useEffect(() => {
    fetchOpportunities()
  }, [selectedTag])

  useEffect(() => {
    if (inView && !loading) {
      fetchOpportunities()
    }
  }, [inView])

  const fetchOpportunities = async () => {
    if (loading || !db) return;
    setLoading(true);

    try {
      let baseQuery = query(
        collection(db, 'opportunities'),
        where('status', '==', 'published')
      );

      baseQuery = query(baseQuery, orderBy('createdAt', 'desc'));

      if (lastVisible) {
        baseQuery = query(baseQuery, startAfter(lastVisible));
      }

      const finalQuery = query(baseQuery, limit(PAGE_SIZE));

      const snapshot = await getDocs(finalQuery);

      const newOpportunities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Opportunity[];

      if (!lastVisible) {
        setOpportunities(selectedTag 
          ? newOpportunities.filter(opp => opp.tags.includes(selectedTag))
          : newOpportunities
        );
      } else {
        setOpportunities(prev => {
          const updatedOpps = selectedTag
            ? newOpportunities.filter(opp => opp.tags.includes(selectedTag))
            : newOpportunities;
          return [...prev, ...updatedOpps];
        });
      }

      if (snapshot.docs.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      } else {
        setLastVisible(null);
      }

      const tags = newOpportunities.flatMap(opp => opp.tags);
      setAllTags(prev => Array.from(new Set([...prev, ...tags])));
    } catch (error: any) {
      console.error('Error fetching opportunities:', error);
      if (error.code === 'permission-denied') {
        setOpportunities([]);
        setAllTags([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag === selectedTag ? null : tag);
    setOpportunities([]);
    setLastVisible(null);
  };

  return (
    <div>
      <h2 className="text-3xl sm:text-4xl font-bold brand-gradient mb-8">Explore Opportunities</h2>
      <div className="mb-6 flex flex-wrap gap-2">
        {allTags.map((tag, index) => (
          <Badge
            key={`tag-${tag}-${index}`}
            variant={selectedTag === tag ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities.map((opportunity, index) => (
          <Card 
            key={`${opportunity.id}-${index}`} 
            className="flex flex-col brand-hover"
          >
            <CardContent className="flex-grow p-6">
              <h3 className="text-xl font-semibold mb-2">{opportunity.title}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {opportunity.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="brand-gradient-bg text-white">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{opportunity.engagementCount} engagements</span>
                </div>
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  <span>{opportunity.likeCount} likes</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-gray-800 p-4">
              <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-2">
                <Link href={`/opportunity/${opportunity.id}`} className="w-full sm:w-auto">
                  <Button variant="ghost" size="sm" className="brand-gradient-hover w-full">
                    View Details
                  </Button>
                </Link>
                <Link href={`/opportunity/${opportunity.id}#collaborate`} className="w-full sm:w-auto">
                  <Button size="sm" className="brand-gradient-bg text-white w-full">
                    Collaborate <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      {lastVisible && <div ref={ref} className="h-10" />}
      {loading && <p className="text-center mt-4">Loading more opportunities...</p>}
    </div>
  )
}

