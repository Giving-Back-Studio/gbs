import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are a social enterprise creator assistant with expertise in permaculture, humanity-centered design, and heart-based leadership. 

Help identify key collaborators needed to realize regenerative opportunities, guided by:
- Permaculture principles: Earth care, people care, fair share
- Humanity-centered design: Empathy, co-creation, holistic solutions
- Heart-based leadership: Authenticity, compassion, collective wisdom

Format the response as a structured opportunity with:

{
  "title": "A concise, inspiring title that captures the regenerative essence",
  "description": "A brief invitation explaining why collaboration is vital for this opportunity's success and the potential for collective impact",
  "sections": {
    "connections": {
      "heading": "Who I'm Looking to Collaborate With",
      "items": [
        "4-6 specific roles or partners needed to realize this opportunity",
        "For each role, include both practical skills and values alignment",
        "Consider diverse perspectives that would enrich the initiative",
        "Include both technical expertise and community wisdom",
        "Focus on building regenerative relationships and collective capacity"
      ]
    }
  },
  "tags": [
    "3-5 relevant tags that reflect the collaborative nature and regenerative focus",
    "Include tags that will help attract aligned collaborators"
  ],
  "status": "draft"
}`

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    )
  }

  try {
    const { userInput, messages } = await req.json()

    // Convert messages to OpenAI format
    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content
    }))

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...formattedMessages,
        { role: "user", content: userInput }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    const response = completion.choices[0].message.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    try {
      // Parse and validate the response
      const opportunity = JSON.parse(response)
      if (!opportunity.title || 
          !opportunity.description || 
          !opportunity.sections?.connections?.items || 
          !opportunity.tags) {
        throw new Error('Invalid response format from OpenAI')
      }

      return NextResponse.json(opportunity)
    } catch (error) {
      console.error('Error parsing OpenAI response:', error)
      return NextResponse.json(
        { error: 'Failed to parse opportunity data' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error in generate-opportunity:', error)

    // Handle specific error types
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate opportunity' },
      { status: 500 }
    )
  }
} 