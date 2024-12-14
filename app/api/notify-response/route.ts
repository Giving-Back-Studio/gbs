import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

export async function POST(req: Request) {
  try {
    const responseData = await req.json()

    // Add to responses collection
    await addDoc(collection(db, 'responses'), {
      ...responseData,
      createdAt: new Date()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving response:', error)
    return NextResponse.json(
      { error: 'Failed to save response' },
      { status: 500 }
    )
  }
} 