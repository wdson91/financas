"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PiggyBank, ShoppingCart, TrendingUp, Target, DollarSign, User, LogOut, Play, Clock, Calendar } from "lucide-react"
import { ExpensesTab } from "@/components/expenses-tab"
import { GoalsTab } from "@/components/goals-tab"
import { ShoppingListTab } from "@/components/shopping-list-tab"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-wrapper"

export function DashboardContent() {
  const { user, isDemoMode } = useAuth()
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [pendingTotal, setPendingTotal] = useState(0)
  const [monthlyGoal, setMonthlyGoal] = useState(3000)
  const [shoppingItems, setShoppingItems] = useState(0)

  const handleSignOut = async () => {
    try {
      if (isDemoMode) {
        localStorage.removeItem("demo-mode")
        window.location.reload()
      } else {
        await supabase.auth.signOut()
      }
    } catch (err) {
      console.error("Error signing out:", err)
      // Force reload as fallback
      window.location.reload()
    }
  }

  const currentMonth = new Date().toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <PiggyBank className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Finanças do Casal</h1>
              {isDemoMode && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Play className="h-3 w-3 mr-1" />
                  Modo Demo
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Mode Notice */}
        {isDemoMode && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">Modo Demonstração Ativo</h3>
                <p className="text-sm text-blue-700">
                  Você está explorando o aplicativo em modo demo. Os dados não serão salvos permanentemente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos do Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€ {totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{currentMonth}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€ {pendingTotal.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">a vencer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meta Mensal</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€ {monthlyGoal.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {((totalExpenses / monthlyGoal) * 100).toFixed(1)}% utilizado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lista de Compras</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shoppingItems}</div>
              <p className="text-xs text-muted-foreground">itens pendentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Mensal Button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            className="w-full md:w-auto"
            onClick={() => window.location.href = '/resumo-mensal'}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Ver Resumo dos Próximos Meses
          </Button>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="expenses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expenses" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Despesas</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Metas</span>
            </TabsTrigger>
            <TabsTrigger value="shopping" className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Compras</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses">
            <ExpensesTab onTotalChange={setTotalExpenses} onPendingTotalChange={setPendingTotal} />
          </TabsContent>

          <TabsContent value="goals">
            <GoalsTab onGoalChange={setMonthlyGoal} />
          </TabsContent>

          <TabsContent value="shopping">
            <ShoppingListTab onItemsChange={setShoppingItems} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
