'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

interface Opportunity {
  id: number
  title: string
  status: 'draft' | 'published'
  date: string
  engagements: number
}

export default function Profile() {
  const [opportunities] = useState<Opportunity[]>([
    {
      id: 1,
      title: "Community Garden Project",
      status: 'published',
      date: "2023-12-13",
      engagements: 5
    },
    {
      id: 2,
      title: "Youth Mentorship Program",
      status: 'draft',
      date: "2023-12-12",
      engagements: 0
    }
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8">
        <Image
          src="/placeholder.svg"
          alt="Profile"
          width={120}
          height={120}
          className="rounded-full"
        />
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold">John Doe</h1>
          <p className="text-gray-600">Social Enterprise Creator</p>
          <p className="text-gray-600">San Francisco, CA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="text-2xl font-bold">{opportunities.length}</div>
            <div className="text-gray-600">Opportunities</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="text-2xl font-bold">12</div>
            <div className="text-gray-600">Connections</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="text-2xl font-bold">45</div>
            <div className="text-gray-600">Engagements</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="opportunities" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="opportunities" className="space-y-4">
          {opportunities
            .filter(opp => opp.status === 'published')
            .map(opportunity => (
              <Card key={opportunity.id}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <Link 
                        href={`/opportunity/${opportunity.id}`}
                        className="text-lg font-semibold hover:text-blue-600"
                      >
                        {opportunity.title}
                      </Link>
                      <div className="text-sm text-gray-600">
                        Published on {new Date(opportunity.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {opportunity.engagements} engagements
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
        <TabsContent value="drafts" className="space-y-4">
          {opportunities
            .filter(opp => opp.status === 'draft')
            .map(opportunity => (
              <Card key={opportunity.id}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <Link 
                        href={`/opportunity/${opportunity.id}`}
                        className="text-lg font-semibold hover:text-blue-600"
                      >
                        {opportunity.title}
                      </Link>
                      <div className="text-sm text-gray-600">
                        Last edited on {new Date(opportunity.date).toLocaleDateString()}
                      </div>
                    </div>
                    <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                      Continue Editing
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
        <TabsContent value="activity">
          <Card>
            <CardContent className="p-4 md:p-6 text-center text-gray-600">
              No recent activity to show
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

