"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Play, AlertTriangle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface LoginFormProps {
  onEnableDemoMode: () => void
  authError?: string | null
}

export function LoginForm({ 
  onEnableDemoMode, 
  authError
}: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  // Removido - agora só usa Supabase

  // Removido - só usa Supabase agora

  const handleSupabaseSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage("Login realizado com sucesso!")
        // O redirecionamento será feito pelo auth-wrapper
      }
    } catch (err) {
      console.error("Supabase auth error:", err)
      setMessage("Erro de conexão. Tente novamente.")
    }
    setLoading(false)
  }

  const handleSupabaseSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage("Verifique seu e-mail para confirmar a conta!")
      }
    } catch (err) {
      console.error("Supabase signup error:", err)
      setMessage("Erro de conexão. Tente novamente.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-pink-500" />
          </div>
          <CardTitle className="text-2xl">Finanças do Casal</CardTitle>
          <CardDescription>Gerencie suas finanças e listas de compras juntos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Demo Mode Button */}
          <div className="text-center">
            <Button
              onClick={onEnableDemoMode}
              variant="outline"
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white border-0 hover:from-blue-600 hover:to-green-600"
            >
              <Play className="h-4 w-4 mr-2" />
              Experimentar Modo Demo
            </Button>
            <p className="text-xs text-gray-500 mt-2">Explore todas as funcionalidades sem precisar criar conta</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou faça login</span>
            </div>
          </div>

          {/* Auth Error Alert */}
          {authError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{authError}. Você pode usar o modo demo enquanto isso.</AlertDescription>
            </Alert>
          )}

                    {/* Supabase Login/Signup */}
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSupabaseSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="wdson91@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="94019543"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              {/* Info para primeiro uso */}
              <div className="mt-4 p-3 bg-green-50 rounded-md">
                <p className="text-xs text-green-700 text-center">
                  <strong>Primeira vez?</strong><br />
                  Clique em "Cadastrar" para criar sua conta
                </p>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSupabaseSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signup">E-mail</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="wdson91@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Senha</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="94019543"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </form>

              {/* Sugestão de credenciais */}
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-xs text-blue-700 text-center">
                  <strong>Sugestão:</strong><br />
                  E-mail: wdson91@gmail.com<br />
                  Senha: 94019543 (mínimo 6 caracteres)
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {message && (
            <div className={`mt-4 p-3 text-sm text-center rounded-md ${
              message.includes('sucesso') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
