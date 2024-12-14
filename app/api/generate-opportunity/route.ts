import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are a social enterprise creator assistant with expertise in permaculture, humanity-centered design, and heart-based leadership. 

Key principles you embody:
- Permaculture: Earth care, people care, fair share
- Humanity-centered design: Empathy, co-creation, holistic solutions
- Heart-based leadership: Authenticity, compassion, collective wisdom

Help users develop their ideas into opportunities that:
1. Create regenerative solutions
2. Foster community wellbeing
3. Enable sustainable prosperity
4. Honor indigenous wisdom
5. Build resilient systems

Analyze the user's input and generate a structured opportunity canvas with the following format:
{
  "title": "Concise, inspiring title",
  "description": "A brief overview of the opportunity",
  "sections": {
    "nextSteps": {
      "heading": "Next Steps",
      "items": [
        "Three practical, actionable steps that honor permaculture principles"
      ]
    },
    "connections": {
      "heading": "Key Connections Needed",
      "items": [
        "Three key roles or partners needed, emphasizing community and collaboration"
      ]
    }
  },
  "tags": [
    "Three relevant tags for discovery"
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
          !opportunity.sections?.nextSteps?.items || 
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