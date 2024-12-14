'use client'

import { useState, useCallback, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from '../contexts/AuthContext'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

interface OpportunityCanvasProps {
  initialContent?: {
    title: string;
    nextSteps: string[];
    connections: string[];
    tags: string[];
  } | null;
}

export default function OpportunityCanvas({ initialContent }: OpportunityCanvasProps) {
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const { user } = useAuth()
  const router = useRouter()

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent || `
      <h1>Title</h1>
      <p>Enter your opportunity title here...</p>
      <h2>Next Steps</h2>
      <ul>
        <li>Step 1</li>
        <li>Step 2</li>
        <li>Step 3</li>
      </ul>
      <h2>Who I'm Looking to Connect With</h2>
      <ul>
        <li>Person or role 1</li>
        <li>Person or role 2</li>
        <li>Person or role 3</li>
      </ul>
    `,
  })

  useEffect(() => {
    if (initialContent && editor) {
      const content = `
        <h1>${initialContent.title}</h1>
        <h2>Next Steps</h2>
        <ul>
          ${initialContent.nextSteps.map(step => `<li>${step}</li>`).join('')}
        </ul>
        <h2>Who I'm Looking to Connect With</h2>
        <ul>
          ${initialContent.connections.map(connection => `<li>${connection}</li>`).join('')}
        </ul>
      `
      editor.commands.setContent(content)
      setTags(initialContent.tags)
    }
  }, [initialContent, editor])

  const handleAddTag = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      setTags(prev => {
        const newTag = tagInput.trim()
        return prev.includes(newTag) ? prev : [...prev, newTag]
      })
      setTagInput('')
    }
  }, [tagInput])

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }, [])

  const handleSave = useCallback(async () => {
    if (!user) {
      alert('You must be logged in to save an opportunity.')
      return
    }

    try {
      const opportunityData = {
        content: editor?.getHTML(),
        tags,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        engagementCount: 0,
        likeCount: 0,
      }

      const docRef = await addDoc(collection(db, 'opportunities'), opportunityData)
      console.log('Opportunity saved with ID:', docRef.id)
      router.push(`/opportunity/${docRef.id}`)
    } catch (error) {
      console.error('Error saving opportunity:', error)
      alert('Failed to save opportunity. Please try again.')
    }
  }, [editor, tags, user, router])

  return (
    <div className="space-y-4">
      <div className="border rounded-md p-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200">
        <EditorContent editor={editor} className="prose max-w-none focus:outline-none" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Tags</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
              {tag} ×
            </Badge>
          ))}
        </div>
        <Input
          type="text"
          placeholder="Add tags (press Enter to add)"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
        />
      </div>
      <Button className="w-full" onClick={handleSave}>Save Opportunity</Button>
    </div>
  )
}

