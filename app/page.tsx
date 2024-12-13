import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb, Users, Rocket, ArrowRight } from 'lucide-react'
import Feed from './components/Feed'

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 brand-gradient">
              Unleash your infinite creative power.
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
              Join the humanity centered innovation community.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild size="lg" className="brand-gradient-bg text-white">
                <Link href="/create">
                  Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
              >
                <Link href="#opportunities-feed">
                  View Opportunities
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-900 py-16 sm:py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-center brand-gradient mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: Lightbulb,
                title: "Spark Your Idea",
                description: "Input your social impact concept and let our AI-powered platform help structure it into a solid plan."
              },
              {
                icon: Users,
                title: "Collaborate & Refine",
                description: "Connect with like-minded individuals, gather feedback, and iterate on your idea to make it stronger."
              },
              {
                icon: Rocket,
                title: "Launch Your Impact",
                description: "Transform your refined plan into action, supported by a community of changemakers and resources."
              }
            ].map((step, index) => (
              <Card key={index} className="text-center brand-hover">
                <CardContent className="pt-6">
                  <step.icon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="opportunities-feed" className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Feed />
        </div>
      </section>
    </div>
  )
}

