"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { SimpleUser } from "@/lib/simple-auth"
import { LoginForm } from "@/components/login-form"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: SimpleUser | User | null
  loading: boolean
  isDemoMode: boolean
  isUsingSupabase: boolean
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  isDemoMode: false,
  isUsingSupabase: true
})

export const useAuth = () => useContext(AuthContext)

// Demo user for testing
const DEMO_USER: SimpleUser = {
  id: "demo-user-id",
  email: "demo@financas-casal.com",
  name: "Usuário Demo"
}

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SimpleUser | User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isUsingSupabase, setIsUsingSupabase] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    console.log("=== AUTH WRAPPER USEEFFECT ===")
    
    // Check if we're in demo mode from localStorage
    const demoMode = localStorage.getItem("demo-mode") === "true"
    console.log("Demo mode from localStorage:", demoMode)
    
    if (demoMode) {
      console.log("Ativando modo DEMO")
      setUser(DEMO_USER)
      setIsDemoMode(true)
      setLoading(false)
      return
    }

    // Check if Supabase is configured - if yes, use it by default
    const useSupabase = isSupabaseConfigured()
    console.log("useSupabase detected:", useSupabase)
    setIsUsingSupabase(useSupabase)

    if (useSupabase) {
      // Initialize Supabase auth (now default when configured)
      console.log("Inicializando autenticação Supabase...")
      initSupabaseAuth()
    } else {
      // Supabase não configurado - mostrar erro
      console.log("Supabase não configurado, mostrando erro...")
      setAuthError("Supabase não está configurado. Verifique as variáveis de ambiente.")
      setLoading(false)
    }
  }, [])

  const initSupabaseAuth = async () => {
    console.log("=== INICIANDO AUTENTICAÇÃO SUPABASE ===")
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      console.log("Session data:", session)
      console.log("Session error:", error)
      
      if (error) {
        console.error("Auth session error:", error)
        setAuthError(error.message)
      } else {
        console.log("User from session:", session?.user)
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
      console.log("Auth state change event:", event)
      console.log("Auth state change session:", session)
      
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

  const enableDemoMode = () => {
    localStorage.setItem("demo-mode", "true")
    setUser(DEMO_USER)
    setIsDemoMode(true)
    setIsUsingSupabase(false)
  }

  // Removidas - só usa Supabase agora

  const logout = async () => {
    if (isUsingSupabase) {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        console.error("Error signing out from Supabase:", err)
      }
    }
    
    setUser(null)
    setIsDemoMode(false)
    localStorage.removeItem("demo-mode")
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
        onEnableDemoMode={enableDemoMode}
        authError={authError}
      />
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, isDemoMode, isUsingSupabase }}>
      {children}
    </AuthContext.Provider>
  )
}
