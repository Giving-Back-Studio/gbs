import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { useRouter } from 'next/navigation'

interface ThreadSidebarProps {
  threads: Array<{ id: string; title: string }>;
  activeThreadId: string;
  onThreadSelect: (threadId: string) => void;
  onNewThread: () => void;
  className?: string;
}

export default function ThreadSidebar({ 
  threads, 
  activeThreadId, 
  onThreadSelect,
  onNewThread,
  className 
}: ThreadSidebarProps) {
  return (
    <div className={`border-r bg-background p-4 space-y-4 h-full ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">Threads</h2>
        <div className="flex gap-2">
          <Button onClick={onNewThread} size="sm" variant="ghost">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {threads.map((thread, index) => (
          <Button
            key={thread.id}
            variant={thread.id === activeThreadId ? "default" : "ghost"}
            className="w-full justify-start text-left truncate"
            onClick={() => onThreadSelect(thread.id)}
          >
            {thread.title || `Thread ${index + 1}`}
          </Button>
        ))}
      </div>
    </div>
  )
} 