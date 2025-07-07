"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Database, Key, ExternalLink } from "lucide-react"

export function ConfigurationMessage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Settings className="h-12 w-12 text-blue-500" />
          </div>
          <CardTitle className="text-2xl">Configuração Necessária</CardTitle>
          <CardDescription>Para usar o sistema de finanças, você precisa configurar o Supabase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              Este aplicativo usa Supabase para autenticação e armazenamento de dados. Configure as variáveis de
              ambiente para continuar.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Passos para Configuração:
            </h3>

            <div className="space-y-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">1. Crie um projeto no Supabase</p>
                <p className="text-gray-600">Acesse supabase.com e crie um novo projeto</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">2. Configure as variáveis de ambiente</p>
                <p className="text-gray-600">Adicione as seguintes variáveis:</p>
                <div className="mt-2 p-2 bg-gray-800 text-green-400 rounded text-xs font-mono">
                  NEXT_PUBLIC_SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL!
                  <br />
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">3. Execute o script SQL</p>
                <p className="text-gray-600">Execute o script em scripts/create-tables.sql no SQL Editor do Supabase</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button asChild>
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ir para Supabase
              </a>
            </Button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Modo de Demonstração</h4>
            <p className="text-blue-800 text-sm">
              Enquanto isso, você pode explorar a interface do aplicativo abaixo, mas as funcionalidades de salvamento
              não estarão disponíveis.
            </p>
            <Button
              variant="outline"
              className="mt-3 bg-transparent"
              onClick={() => {
                // Create a mock user for demo
                const mockUser = { id: "demo", email: "demo@example.com" }
                // This is just for demo - in real app this would be handled by auth
                window.location.reload()
              }}
            >
              Continuar em Modo Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
