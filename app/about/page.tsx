'use client'

import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb, Users, Rocket, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-20">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 brand-gradient">Build Your Dreams</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Join the community where anything truly is possible through collaboration.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: Users,
            title: "Connect",
            description: "Build community consciously with social enterprise creators."
          },
          {
            icon: Rocket,
            title: "Collaborate",
            description: "Find and share collaborative opportunities that matter."
          },
          {
            icon: Lightbulb,
            title: "Create",
            description: "Generate new streams of profit with purpose."
          }
        ].map((item, index) => (
          <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardContent className="pt-6">
              <item.icon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="text-center max-w-3xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 py-16 px-8 rounded-lg">
        <h2 className="text-3xl font-bold mb-6 brand-gradient">Empowering Social Enterprise</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          At Giving Back Studio, we believe in the power of community and purpose-driven innovation. 
          Our platform is designed to help you connect with like-minded creators, collaborate on 
          meaningful projects, and build profitable enterprises that make a positive impact on the world.
        </p>
        <Button asChild size="lg" className="brand-gradient-bg text-white">
          <Link href="/signup">Build Your Dream Today</Link>
        </Button>
      </section>
    </div>
  )
}

