"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { LoginForm } from "@/components/login-form"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  isUsingSupabase: boolean
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  isUsingSupabase: true
})

export const useAuth = () => useContext(AuthContext)

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUsingSupabase, setIsUsingSupabase] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    // Check if Supabase is configured - if yes, use it by default
    const useSupabase = isSupabaseConfigured()
    setIsUsingSupabase(useSupabase)

    if (useSupabase) {
      // Initialize Supabase auth (now default when configured)
      initSupabaseAuth()
    } else {
      // Supabase não configurado - mostrar erro
      setAuthError("Supabase não está configurado. Verifique as variáveis de ambiente.")
      setLoading(false)
    }
  }, [])

  const initSupabaseAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error("Auth session error:", error)
        setAuthError(error.message)
      } else {
        setUser(session?.user ?? null)
      }
    } catch (err) {
      console.error("Auth initialization error:", err)
      setAuthError("Failed to initialize authentication")
    } finally {
      setLoading(false)
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        setUser(session?.user ?? null)
        setAuthError(null)
      } catch (err) {
        console.error("Auth state change error:", err)
        setAuthError("Authentication error occurred")
      }
    })

    return () => subscription.unsubscribe()
  }

  const logout = async () => {
    if (isUsingSupabase) {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        console.error("Error signing out from Supabase:", err)
      }
    }
    
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <LoginForm 
        authError={authError}
      />
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, isUsingSupabase }}>
      {children}
    </AuthContext.Provider>
  )
}
