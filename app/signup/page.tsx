'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | JSX.Element>('')
  const { signup } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('') // Clear any previous errors

    // Enhanced password validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter.')
      return
    }

    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number.')
      return
    }

    try {
      await signup(email, password)
      router.push('/create')
    } catch (error: any) {
      const errorCode = error.code
      switch (errorCode) {
        case 'auth/email-already-in-use':
          setError(
            <span>
              This email is already registered. Please{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                log in
              </Link>{' '}
              instead.
            </span>
          )
          break
        case 'auth/invalid-email':
          setError('Please enter a valid email address.')
          break
        case 'auth/operation-not-allowed':
          setError('Sign up is currently disabled. Please contact support.')
          break
        case 'auth/weak-password':
          setError('Please choose a stronger password. It should be at least 6 characters long with numbers and uppercase letters.')
          break
        case 'auth/network-request-failed':
          setError('Unable to connect. Please check your internet connection and try again.')
          break
        default:
          setError(`Sign up failed: ${error.message || 'Please try again.'}`)
          console.error('Signup failed:', error)
      }
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full brand-gradient-bg">Sign Up</Button>
          </form>
          <div className="mt-4 text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

