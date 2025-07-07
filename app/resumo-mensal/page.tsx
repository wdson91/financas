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
      const monthKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`
      const monthName = targetDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      
      // Filtrar despesas para este mês específico
      const monthExpenses = upcomingExpenses.filter(expense => {
        const expenseDate = new Date(expense.due_date)
        return expenseDate.getMonth() === targetDate.getMonth() && 
               expenseDate.getFullYear() === targetDate.getFullYear()
      })

      const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      
      summaries.push({
        month: monthKey,
        monthName,
        year: targetDate.getFullYear(),
        total,
        expenses: monthExpenses,
        isCurrentMonth: i === 0
      })
    }

    setMonthlySummaries(summaries)
  }, [upcomingExpenses])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando resumo mensal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resumo Mensal</h1>
          <p className="text-gray-600">Previsão de despesas para os próximos meses</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Próximos 12 Meses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(monthlySummaries.reduce((sum, month) => sum + month.total, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Média Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlySummaries.length > 0 
                ? formatCurrency(monthlySummaries.reduce((sum, month) => sum + month.total, 0) / 12)
                : formatCurrency(0)
              }
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Despesas Mensais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingExpenses.filter(exp => exp.is_monthly).length}
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Navegação de Meses */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentMonthIndex(Math.max(0, currentMonthIndex - 1))}
          disabled={currentMonthIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Mês Anterior
        </Button>
        
        <h2 className="text-xl font-semibold">
          {monthlySummaries[currentMonthIndex]?.monthName || "Carregando..."}
        </h2>
        
        <Button
          variant="outline"
          onClick={() => setCurrentMonthIndex(Math.min(11, currentMonthIndex + 1))}
          disabled={currentMonthIndex === 11}
        >
          Próximo Mês
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Detalhes do Mês Selecionado */}
      {monthlySummaries[currentMonthIndex] && (
        <Card className={getMonthColor(monthlySummaries[currentMonthIndex])}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{monthlySummaries[currentMonthIndex].monthName}</CardTitle>
                <CardDescription>
                  {monthlySummaries[currentMonthIndex].expenses.length} despesa(s) programada(s)
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {formatCurrency(monthlySummaries[currentMonthIndex].total)}
                </div>
                <div className="text-sm text-gray-600">Total do mês</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlySummaries[currentMonthIndex].expenses.length > 0 ? (
                monthlySummaries[currentMonthIndex].expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{expense.name}</h3>
                        <Badge variant="secondary">{expense.category}</Badge>
                        {expense.is_monthly && (
                          <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
                            <Repeat className="h-3 w-3 mr-1" />
                            Mensal
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Vence: {new Date(expense.due_date).toLocaleDateString("pt-BR")}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{getUserNameById(expense.payer)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {formatCurrency(expense.amount)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma despesa programada</h3>
                  <p className="text-gray-600">Este mês não possui despesas programadas.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visão Geral dos Próximos Meses */}
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral dos Próximos 12 Meses</CardTitle>
          <CardDescription>Resumo rápido de todos os meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthlySummaries.map((summary, index) => (
              <div
                key={summary.month}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  index === currentMonthIndex 
                    ? 'border-blue-500 bg-blue-100' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setCurrentMonthIndex(index)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{summary.monthName}</h3>
                  {summary.isCurrentMonth && (
                    <Badge variant="secondary">Atual</Badge>
                  )}
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.total)}
                </div>
                <div className="text-sm text-gray-600">
                  {summary.expenses.length} despesa(s)
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 