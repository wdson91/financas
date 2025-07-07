"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { PiggyBank, ShoppingCart, TrendingUp, Target, DollarSign, User, LogOut, Clock, Calendar, TrendingDown, Menu } from "lucide-react"
import { ExpensesTab } from "@/components/expenses-tab"
import { GoalsTab } from "@/components/goals-tab"
import { ShoppingListTab } from "@/components/shopping-list-tab"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-wrapper"
import { useIsMobile } from "@/hooks/use-mobile"

export function DashboardContent() {
  const { user, isUsingSupabase } = useAuth()
  const isMobile = useIsMobile()
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [pendingTotal, setPendingTotal] = useState(0)
  const [totalIncomes, setTotalIncomes] = useState(0)
  const [shoppingItems, setShoppingItems] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const fetchMonthlyIncomes = async () => {
    if (!user || !isUsingSupabase) return

    // Obter primeiro e último dia do mês atual
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    // Primeiro, obter o couple_id do usuário logado
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("couple_id")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return
    }

    if (!userProfile?.couple_id) {
      // Se não tem couple_id, buscar apenas entradas próprias
      const { data, error } = await supabase
        .from("incomes")
        .select("amount")
        .eq("user_id", user.id)
        .gte("date", firstDayOfMonth.toISOString().split("T")[0])
        .lte("date", lastDayOfMonth.toISOString().split("T")[0])

      if (error) {
        console.error("Error fetching incomes:", error)
      } else {
        const total = data?.reduce((sum, income) => sum + income.amount, 0) || 0
        setTotalIncomes(total)
      }
      return
    }

    // Buscar o parceiro do usuário logado
    const { data: partnerProfile, error: partnerError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", userProfile.couple_id)
      .single()

    if (partnerError) {
      console.error("Error fetching partner profile:", partnerError)
      return
    }

    // Montar array com usuário logado e parceiro
    const coupleUserIds = [user.id]
    if (partnerProfile) {
      coupleUserIds.push(partnerProfile.id)
    }

    // Buscar entradas de todos os usuários do casal
    const { data, error } = await supabase
      .from("incomes")
      .select("amount")
      .in("user_id", coupleUserIds)
      .gte("date", firstDayOfMonth.toISOString().split("T")[0])
      .lte("date", lastDayOfMonth.toISOString().split("T")[0])

    if (error) {
      console.error("Error fetching incomes:", error)
    } else {
      const total = data?.reduce((sum, income) => sum + income.amount, 0) || 0
      setTotalIncomes(total)
    }
  }

  useEffect(() => {
    if (isUsingSupabase && user) {
      fetchMonthlyIncomes()
    }
  }, [user, isUsingSupabase])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
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
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <PiggyBank className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Finanças do Casal</h1>
            </div>
            
            {/* Desktop User Info */}
            <div className="hidden sm:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">{user?.email}</span>
                <span className="md:hidden">{user?.email?.split('@')[0]}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobile && isMenuOpen && (
            <div className="sm:hidden border-t bg-white">
              <div className="px-4 py-3 space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Gastos do Mês</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">€ {totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{currentMonth}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Despesas Pendentes</CardTitle>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">€ {pendingTotal.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">a vencer</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Balanço Mensal</CardTitle>
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-lg sm:text-2xl font-bold ${(totalIncomes - totalExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                € {(totalIncomes - totalExpenses).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="hidden sm:inline">Entradas: € {totalIncomes.toFixed(2)} | Saídas: € {totalExpenses.toFixed(2)}</span>
                <span className="sm:hidden">€ {totalIncomes.toFixed(2)} / € {totalExpenses.toFixed(2)}</span>
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Lista de Compras</CardTitle>
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{shoppingItems}</div>
              <p className="text-xs text-muted-foreground">itens pendentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Buttons */}
        <div className="mb-6 flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto text-sm"
            onClick={() => window.location.href = '/resumo-mensal'}
          >
            <Calendar className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Ver Resumo dos Próximos Meses</span>
            <span className="sm:hidden">Resumo Mensal</span>
          </Button>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto text-sm"
            onClick={() => window.location.href = '/entradas'}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Gerenciar Entradas</span>
            <span className="sm:hidden">Entradas</span>
          </Button>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="expenses" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto sm:h-10">
            <TabsTrigger value="expenses" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 sm:py-0">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Despesas</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 sm:py-0">
              <Target className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Metas</span>
            </TabsTrigger>
            <TabsTrigger value="shopping" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 sm:py-0">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Compras</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses">
            <ExpensesTab onTotalChange={setTotalExpenses} onPendingTotalChange={setPendingTotal} />
          </TabsContent>

          <TabsContent value="goals">
            <GoalsTab onGoalChange={() => {}} />
          </TabsContent>

          <TabsContent value="shopping">
            <ShoppingListTab onItemsChange={setShoppingItems} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
