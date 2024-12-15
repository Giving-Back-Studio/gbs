'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Sparkles, Menu, LogOut, User } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  // Get display name or email from user object
  const userDisplayName = user?.displayName || user?.email?.split('@')[0] || 'User'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-white dark:bg-gray-900">
      <div className="container h-full mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold brand-gradient">Giving Back Studio</span>
        </Link>
        <nav className="hidden md:flex space-x-6 items-center">
          <Button variant="link" onClick={() => handleNavigation('/create')}>
            Create
          </Button>
          {user ? (
            <Button variant="link" onClick={() => handleNavigation('/profile')}>
              Profile
            </Button>
          ) : (
            <Button variant="link" onClick={() => handleNavigation('/about')}>
              About
            </Button>
          )}
          {user ? (
            <>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Welcome, {userDisplayName}
              </span>
              <Button onClick={logout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={() => handleNavigation('/login')} className="brand-gradient-bg text-white">
              Start Your Journey
            </Button>
          )}
          <ModeToggle />
        </nav>
        <div className="flex items-center md:hidden">
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-4">
                <Button variant="ghost" onClick={() => handleNavigation('/create')}>
                  Create
                </Button>
                {user ? (
                  <Button variant="ghost" onClick={() => handleNavigation('/profile')}>
                    Profile
                  </Button>
                ) : (
                  <Button variant="ghost" onClick={() => handleNavigation('/about')}>
                    About
                  </Button>
                )}
                {user ? (
                  <>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Welcome, {userDisplayName}
                    </span>
                    <Button onClick={logout} variant="outline" size="sm">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => handleNavigation('/login')} className="brand-gradient-bg text-white w-full">
                    Start Your Journey
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

