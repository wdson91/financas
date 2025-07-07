"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight, Repeat, User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-wrapper"

interface MonthlyExpense {
  id: string
  name: string
  amount: number
  category: string
  due_date: string
  payer: string
  user_id: string
  is_paid: boolean
  is_monthly: boolean
  created_at: string
}

interface MonthlySummary {
  month: string
  monthName: string
  year: number
  total: number
  expenses: MonthlyExpense[]
  isCurrentMonth: boolean
}

export default function ResumoMensalPage() {
  const { user, isUsingSupabase } = useAuth()
  const [upcomingExpenses, setUpcomingExpenses] = useState<MonthlyExpense[]>([])
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([])
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0)
  const [users, setUsers] = useState<{ id: string; name?: string; email?: string }[]>([])
  const [loading, setLoading] = useState(true)

  
  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      
      setLoading(true)
      
      if (isUsingSupabase && user) {
        await fetchUpcomingExpenses()
        await fetchUsers()
      }
      
      setLoading(false)
    }

    loadData()
  }, [user, isUsingSupabase])

  // Gerar resumos quando as despesas mudarem
  useEffect(() => {
    if (!loading) {
      generateMonthlySummaries()
    }
  }, [upcomingExpenses, loading])



  const fetchUpcomingExpenses = async () => {
    if (!user) {
      return
    }
    
    try {
      // Primeiro, obter o couple_id do usuário logado
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("couple_id")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("❌ Error fetching user profile:", profileError)
        return
      }

      let data;
      let error;

      if (!userProfile?.couple_id) {
        // Se não tem couple_id, buscar apenas despesas próprias
        const result = await supabase
          .from("upcoming_expenses")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_paid", false)
          .order("due_date", { ascending: true })
        
        data = result.data;
        error = result.error;
      } else {
        // Buscar o parceiro do usuário logado
        const { data: partnerProfile, error: partnerError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("id", userProfile.couple_id)
          .single()

        if (partnerError) {
          console.error("❌ Error fetching partner profile:", partnerError)
          return
        }

        // Montar array com usuário logado e parceiro
        const coupleUserIds = [user.id]
        if (partnerProfile) {
          coupleUserIds.push(partnerProfile.id)
        }
        // Buscar despesas a vencer de todos os usuários do casal
        const result = await supabase
          .from("upcoming_expenses")
          .select("*")
          .in("user_id", coupleUserIds)
          .eq("is_paid", false)
          .order("due_date", { ascending: true })
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error("❌ Error fetching upcoming expenses:", error)
        return
      }
      
      // Converter valores de string para number se necessário
      const processedData = data?.map(expense => ({
        ...expense,
        amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
      })) || []
      
      setUpcomingExpenses(processedData)
    } catch (error) {
      console.error("❌ Erro ao buscar despesas:", error)
    }
    

  }

  const fetchUsers = async () => {
    if (!isUsingSupabase) return
    
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name", { ascending: true })

      if (error) {
        console.error("Error fetching profiles:", error)
        return
      }

      if (profiles && profiles.length > 0) {
        const userOptions = profiles.map((profile) => ({
          id: profile.id,
          name: profile.full_name,
        }))
        setUsers(userOptions)
      }
    } catch (error) {
      console.error("Error in fetchUsers:", error)
    }
  }

  const getUserNameById = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.name || user?.email || userId
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  const getMonthColor = (summary: MonthlySummary) => {
    if (summary.isCurrentMonth) return "border-blue-500 bg-blue-50"
    if (summary.total > 0) return "border-green-500 bg-green-50"
    return "border-gray-200 bg-gray-50"
  }

  const generateMonthlySummaries = useCallback(() => {
    
    const summaries: MonthlySummary[] = []
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    // Gerar resumos para os próximos 12 meses
    for (let i = 0; i < 12; i++) {
      const targetDate = new Date(currentYear, currentMonth + i, 1)
      const monthKey = targetDate.toISOString().slice(0, 7) // YYYY-MM format
      
      // Filtrar despesas para este mês
      const monthExpenses = upcomingExpenses.filter(expense => {
        const expenseDate = new Date(expense.due_date)
        return expenseDate.getMonth() === targetDate.getMonth() && 
               expenseDate.getFullYear() === targetDate.getFullYear()
      })
      
      const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      
      summaries.push({
        month: monthKey,
        monthName: targetDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        year: targetDate.getFullYear(),
        total,
        expenses: monthExpenses,
        isCurrentMonth: targetDate.getMonth() === currentMonth && targetDate.getFullYear() === currentYear
      })
    }
    
    setMonthlySummaries(summaries)
  }, [upcomingExpenses])

  const nextMonth = () => {
    setCurrentMonthIndex(prev => Math.min(prev + 1, monthlySummaries.length - 1))
  }

  const prevMonth = () => {
    setCurrentMonthIndex(prev => Math.max(prev - 1, 0))
  }

  const currentSummary = monthlySummaries[currentMonthIndex]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando resumo mensal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Resumo Mensal</h1>
            <p className="text-sm sm:text-base text-gray-600">Acompanhe suas despesas futuras por mês</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => window.history.back()} className="text-sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
          </div>
        </div>

        {/* Navegação de Meses */}
        {monthlySummaries.length > 0 && (
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={prevMonth} 
              disabled={currentMonthIndex === 0}
              className="text-sm"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Mês Anterior</span>
            </Button>
            
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-semibold">{currentSummary?.monthName}</h2>
              <p className="text-xs sm:text-sm text-gray-600">
                {currentMonthIndex + 1} de {monthlySummaries.length} meses
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={nextMonth} 
              disabled={currentMonthIndex === monthlySummaries.length - 1}
              className="text-sm"
            >
              <span className="hidden sm:inline">Próximo Mês</span>
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Resumo do Mês Atual */}
        {currentSummary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className={`${getMonthColor(currentSummary)} hover:shadow-md transition-shadow`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Total do Mês</CardTitle>
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">
                  {formatCurrency(currentSummary.total)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentSummary.expenses.length} despesas a vencer
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Despesas Recorrentes</CardTitle>
                <Repeat className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">
                  {currentSummary.expenses.filter(e => e.is_monthly).length}
                </div>
                <p className="text-xs text-muted-foreground">Mensais</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Status</CardTitle>
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">
                  {currentSummary.isCurrentMonth ? (
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                      Mês Atual
                    </Badge>
                  ) : currentSummary.total > 0 ? (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      Com Despesas
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Livre
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentSummary.isCurrentMonth ? 'Mês em andamento' : 'Mês futuro'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Despesas do Mês */}
        {currentSummary && currentSummary.expenses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Despesas de {currentSummary.monthName}</CardTitle>
              <CardDescription className="text-sm">
                Lista de todas as despesas a vencer neste mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentSummary.expenses.map((expense) => (
                  <div key={expense.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg space-y-3 sm:space-y-0">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <h3 className="font-medium text-sm sm:text-base">{expense.name}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">{expense.category}</Badge>
                          {expense.is_monthly && (
                            <Badge variant="outline" className="border-purple-500 text-purple-700 bg-purple-50 text-xs">
                              <Repeat className="h-3 w-3 mr-1" />
                              Mensal
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Vence: {new Date(expense.due_date).toLocaleDateString("pt-BR")}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span className="truncate">Responsável: {getUserNameById(expense.payer)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <span className="font-bold text-base sm:text-lg text-red-600">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estado Vazio */}
        {currentSummary && currentSummary.expenses.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma despesa para {currentSummary.monthName}
              </h3>
              <p className="text-sm text-gray-600">
                {currentSummary.isCurrentMonth 
                  ? "Não há despesas a vencer neste mês."
                  : "Não há despesas programadas para este mês."
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Visão Geral dos Próximos Meses */}
        {monthlySummaries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Visão Geral dos Próximos Meses</CardTitle>
              <CardDescription className="text-sm">
                Resumo de despesas programadas para os próximos meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {monthlySummaries.map((summary, index) => (
                  <div 
                    key={summary.month} 
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      index === currentMonthIndex ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    } ${getMonthColor(summary)}`}
                    onClick={() => setCurrentMonthIndex(index)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{summary.monthName}</h4>
                      {summary.isCurrentMonth && (
                        <Badge variant="default" className="text-xs">Atual</Badge>
                      )}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(summary.total)}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {summary.expenses.length} despesa{summary.expenses.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 