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
    description: string;
    sections: {
      nextSteps: { heading: string; items: string[] };
      connections: { heading: string; items: string[] };
    };
    tags: string[];
    status: 'draft' | 'published';
  } | null;
}

export default function OpportunityCanvas({ initialContent }: OpportunityCanvasProps) {
  const [title, setTitle] = useState(initialContent?.title || '')
  const [tags, setTags] = useState<string[]>(initialContent?.tags || [])
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
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none'
      }
    },
    onCreate: ({ editor }) => {
      if (initialContent) {
        editor.commands.setContent(formatInitialContent(initialContent))
      }
    }
  })

  const formatInitialContent = (content: OpportunityCanvasProps['initialContent']) => {
    if (!content) return '';
    
    return `
      <h1 class="text-2xl font-bold mb-4">${content.title}</h1>
      
      <div class="mb-6">
        <p class="text-lg">${content.description}</p>
      </div>
      
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-3">${content.sections.nextSteps.heading}</h2>
        <ul class="space-y-2">
          ${content.sections.nextSteps.items.map(step => 
            `<li class="flex items-start">
              <span class="mr-2">•</span>
              <span>${step}</span>
            </li>`
          ).join('')}
        </ul>
      </div>
      
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-3">${content.sections.connections.heading}</h2>
        <ul class="space-y-2">
          ${content.sections.connections.items.map(connection => 
            `<li class="flex items-start">
              <span class="mr-2">•</span>
              <span>${connection}</span>
            </li>`
          ).join('')}
        </ul>
      </div>
    `
  }

  useEffect(() => {
    if (initialContent && editor) {
      const content = `
        <h1 class="text-2xl font-bold mb-4">${initialContent.title}</h1>
        
        <div class="mb-6">
          <p class="text-lg">${initialContent.description}</p>
        </div>
        
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-3">${initialContent.sections.nextSteps.heading}</h2>
          <ul class="space-y-2">
            ${initialContent.sections.nextSteps.items.map(step => 
              `<li class="flex items-start">
                <span class="mr-2">•</span>
                <span>${step}</span>
              </li>`
            ).join('')}
          </ul>
        </div>
        
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-3">${initialContent.sections.connections.heading}</h2>
          <ul class="space-y-2">
            ${initialContent.sections.connections.items.map(connection => 
              `<li class="flex items-start">
                <span class="mr-2">•</span>
                <span>${connection}</span>
              </li>`
            ).join('')}
          </ul>
        </div>
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
    if (!user || !title.trim()) {
      alert('Please provide a title for your opportunity.')
      return
    }

    try {
      const opportunityData = {
        title: title.trim(),
        content: editor?.getHTML(),
        description: editor?.getText().slice(0, 200) + '...', // First 200 chars as description
        tags,
        status: 'draft',
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
  }, [editor, title, tags, user, router])

  const handlePublish = async () => {
    if (!user || !title.trim()) {
      alert('Please provide a title for your opportunity.')
      return
    }
    
    try {
      const opportunityData = {
        title: title.trim(),
        content: editor?.getHTML(),
        description: editor?.getText().slice(0, 200) + '...', // First 200 chars as description
        tags,
        status: 'published',
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        engagementCount: 0,
        likeCount: 0,
      }

      const docRef = await addDoc(collection(db, 'opportunities'), opportunityData)
      router.push(`/opportunity/${docRef.id}`)
    } catch (error) {
      console.error('Error publishing opportunity:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Input
        type="text"
        placeholder="Enter opportunity title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-xl font-bold"
      />
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
      <Button className="w-full" onClick={handlePublish}>Publish Opportunity</Button>
    </div>
  )
}

