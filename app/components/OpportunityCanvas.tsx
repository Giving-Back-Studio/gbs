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
    id?: string;
    title: string;
    description: string;
    sections: {
      nextSteps: { heading: string; items: string[] };
      connections: { heading: string; items: string[] };
      roles: { heading: string; items: string[] };
    };
    tags: string[];
    status: 'draft' | 'published';
  } | null;
  onTitleChange?: (title: string) => void;
  onClose?: () => void;
  onSave?: (content: any) => void;
}

export default function OpportunityCanvas({ 
  initialContent,
  onTitleChange,
  onClose,
  onSave
}: OpportunityCanvasProps) {
  const [title, setTitle] = useState(initialContent?.title || '')
  const [tags, setTags] = useState<string[]>(initialContent?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const { user } = useAuth()
  const router = useRouter()

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent?.description || '',
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none'
      }
    },
    onCreate: ({ editor }) => {
      if (initialContent) {
        editor.commands.setContent(formatInitialContent(initialContent))
      }
    },
    enableCoreExtensions: true,
    immediatelyRender: false
  })

  const formatInitialContent = (content: OpportunityCanvasProps['initialContent']) => {
    if (!content) return '';
    
    return `
      <h2 class="text-2xl font-bold mb-4">Who I'm Looking to Collaborate With</h2>
      <div class="mb-6">
        <p class="text-lg leading-relaxed">${content.description}</p>
      </div>
      
      <div class="mb-6">
        <ul class="space-y-2">
          ${content.sections.connections.items.map(connection => 
            `<li class="flex items-start">
              <span class="mr-2">•</span>
              <span class="text-lg">${connection}</span>
            </li>`
          ).join('')}
        </ul>
      </div>
    `
  }

  useEffect(() => {
    if (initialContent) {
      setTitle(initialContent.title)
      setTags(initialContent.tags || [])
      
      const formattedContent = `
        <h2 class="text-2xl font-bold mb-4">Opportunity Description</h2>
        <div class="mb-6">
          <p class="text-lg leading-relaxed">${initialContent.description}</p>
        </div>
        
        <h2 class="text-2xl font-bold mb-4">Key Roles & Responsibilities</h2>
        <div class="mb-6">
          <ul class="list-disc pl-6 space-y-2">
            ${initialContent.sections.roles?.items.map(role => 
              `<li class="text-lg">${role}</li>`
            ).join('')}
          </ul>
        </div>

        <h2 class="text-2xl font-bold mb-4">Required Connections</h2>
        <div class="mb-6">
          <ul class="list-disc pl-6 space-y-2">
            ${initialContent.sections.connections.items.map(connection => 
              `<li class="text-lg">${connection}</li>`
            ).join('')}
          </ul>
        </div>

        <h2 class="text-2xl font-bold mb-4">Next Steps</h2>
        <div class="mb-6">
          <ul class="list-disc pl-6 space-y-2">
            ${initialContent.sections.nextSteps.items.map(step => 
              `<li class="text-lg">${step}</li>`
            ).join('')}
          </ul>
        </div>
      `
      
      if (editor) {
        editor.commands.setContent(formattedContent)
      }
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

  const handleUnpublish = async () => {
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
      router.push(`/opportunity/${docRef.id}`)
    } catch (error) {
      console.error('Error unpublishing opportunity:', error)
    }
  }

  const handleSaveDraft = async () => {
    if (!user || !title.trim()) {
      alert('Please provide a title for your opportunity.')
      return
    }
    
    try {
      const content = {
        title: title.trim(),
        description: editor?.getText() || '',  // Get the full text content
        content: editor?.getHTML() || '',      // Store the full HTML content
        tags,
        status: 'draft',
        sections: {
          roles: {
            heading: "Key Roles & Responsibilities",
            items: extractListItems(editor?.getHTML() || '', 'Key Roles & Responsibilities')
          },
          nextSteps: { 
            heading: "Next Steps",
            items: extractListItems(editor?.getHTML() || '', 'Next Steps')
          },
          connections: { 
            heading: "Required Connections",
            items: extractListItems(editor?.getHTML() || '', 'Required Connections')
          }
        }
      }

      if (onSave) {
        await onSave(content)
      }
      
      if (onClose) {
        onClose()
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      alert('Failed to save draft. Please try again.')
    }
  }

  const extractListItems = (html: string, sectionTitle: string): string[] => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const items: string[] = []
    
    const headers = Array.from(doc.querySelectorAll('h2'))
    const targetHeader = headers.find(h => h.textContent?.includes(sectionTitle))
    
    if (targetHeader) {
      let currentElement = targetHeader.nextElementSibling
      while (currentElement && currentElement.tagName !== 'H2') {
        if (currentElement.tagName === 'UL') {
          const listItems = currentElement.querySelectorAll('li')
          listItems.forEach(li => items.push(li.textContent || ''))
        }
        currentElement = currentElement.nextElementSibling
      }
    }
    
    return items.filter(item => item.trim() !== '')
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Title Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Opportunity Title
          </label>
          <Input
            type="text"
            placeholder="Enter a clear, compelling title..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              onTitleChange?.(e.target.value)
            }}
            className="text-xl font-semibold"
          />
        </div>

        {/* Editor Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Description
          </label>
          <div className="border rounded-lg p-4 min-h-[200px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <EditorContent editor={editor} className="prose prose-sm max-w-none focus:outline-none" />
          </div>
        </div>

        {/* Tags Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map(tag => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="px-2 py-1 hover:bg-destructive/10 cursor-pointer transition-colors"
                onClick={() => handleRemoveTag(tag)}
              >
                {tag} ×
              </Badge>
            ))}
          </div>
          <Input
            type="text"
            placeholder="Add relevant tags (press Enter)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
          />
        </div>
      </div>

      {/* Actions Footer */}
      <div className="border-t p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button onClick={handlePublish}>
            Publish Opportunity
          </Button>
        </div>
      </div>
    </div>
  )
}

