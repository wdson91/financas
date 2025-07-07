"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, AlertTriangle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface LoginFormProps {
  authError?: string | null
}

export function LoginForm({ 
  authError
}: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

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
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-pink-500" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl sm:text-2xl">Finanças do Casal</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Gerencie suas finanças e listas de compras juntos
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Auth Error Alert */}
          {authError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">{authError}</AlertDescription>
            </Alert>
          )}

          {/* Supabase Login/Signup */}
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-10 sm:h-11">
              <TabsTrigger value="signin" className="text-sm sm:text-base">Entrar</TabsTrigger>
              <TabsTrigger value="signup" className="text-sm sm:text-base">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSupabaseSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm sm:text-base">E-mail</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="seu@email.com"
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm sm:text-base">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Digite sua senha"
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>
                <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              {/* Info para primeiro uso */}
              <div className="mt-4 p-3 bg-green-50 rounded-md">
                <p className="text-xs sm:text-sm text-green-700 text-center">
                  <strong>Primeira vez?</strong><br />
                  Clique em &quot;Cadastrar&quot; para criar sua conta
                </p>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSupabaseSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signup" className="text-sm sm:text-base">E-mail</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup" className="text-sm sm:text-base">Senha</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>
                <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base" disabled={loading}>
                  {loading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </form>

              {/* Informações sobre cadastro */}
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-xs sm:text-sm text-blue-700 text-center">
                  <strong>Importante:</strong><br />
                  • A senha deve ter pelo menos 6 caracteres<br />
                  • Você receberá um e-mail de confirmação
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Message Display */}
          {message && (
            <Alert variant={message.includes("sucesso") ? "default" : "destructive"}>
              <AlertDescription className="text-sm">{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
