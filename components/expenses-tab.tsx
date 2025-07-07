"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell } from "recharts"
import { Plus, Calendar, User, Trash2, Clock, AlertTriangle, Repeat, Edit, UserPlus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-wrapper"
import { AutocompleteInput } from "@/components/ui/autocomplete-input"
import { expenseHistory } from "@/lib/expense-history"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface Expense {
  id: string
  name: string
  amount: number
  category: string
  date: string
  payer: string
  user_id: string
  observations?: string
}

interface UpcomingExpense {
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
  observations?: string
}

const categories = ["Moradia", "Alimentação", "Transporte", "Lazer", "Saúde", "Educação", "Outros"]

const categoryColors = {
  Moradia: "#8884d8",
  Alimentação: "#82ca9d",
  Transporte: "#ffc658",
  Lazer: "#ff7300",
  Saúde: "#00ff00",
  Educação: "#0088fe",
  Outros: "#ff8042",
}

interface ExpensesTabProps {
  onTotalChange: (total: number) => void
  onPendingTotalChange?: (total: number) => void
}

interface Profile {
  id: string
  full_name: string
  email?: string
}

interface UserOption {
  id: string
  email: string
  name?: string
}

export function ExpensesTab({ onTotalChange, onPendingTotalChange }: ExpensesTabProps) {
  const { user, isUsingSupabase } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [upcomingExpenses, setUpcomingExpenses] = useState<UpcomingExpense[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpcomingDialogOpen, setIsUpcomingDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isEditUpcomingDialogOpen, setIsEditUpcomingDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editingUpcomingExpense, setEditingUpcomingExpense] = useState<UpcomingExpense | null>(null)
  const [expenseSuggestions, setExpenseSuggestions] = useState<string[]>([])
  const [newExpense, setNewExpense] = useState({
    name: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    payer: "",
    observations: "",
  })
  const [newUpcomingExpense, setNewUpcomingExpense] = useState({
    name: "",
    amount: "",
    category: "",
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 dias a partir de hoje
    payer: "",
    is_monthly: false,
    observations: "",
  })

  useEffect(() => {
    // Carregar sugestões do histórico
    setExpenseSuggestions(expenseHistory.getExpenseNames())
    
    if (isUsingSupabase) {
      fetchExpenses()
      fetchUpcomingExpenses()
      fetchUsers()
    } else {
      // Usando sistema simples, não há dados persistentes
      setExpenses([])
      setUpcomingExpenses([])
      loadDemoUsers() // Usar usuários demo mesmo no sistema simples
    }
      }, [user, isUsingSupabase])



  const loadDemoUsers = () => {
    const demoUsers = [
      {
        id: "demo-user-id",
        email: "wdson91@gmail.com",
        name: "Utilizador Principal"
      },
      {
        id: "demo-user-2", 
        email: "casal2@exemplo.com",
        name: "Parceiro(a)"
      }
    ]
    setUsers(demoUsers)
  }

  const fetchUsers = async () => {
    if (!isUsingSupabase) return
    
    try {
      // Buscar todos os perfis da tabela public.profiles
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name", { ascending: true })

      if (error) {
        console.error("Error fetching profiles:", error)
        // Fallback para dados demo em caso de erro
        loadDemoUsers()
        return
      }

      if (profiles && profiles.length > 0) {
        // Converter perfis para formato UserOption
        const userOptions: UserOption[] = profiles.map((profile) => ({
          id: profile.id,
          email: "", // Email não é necessário para o select
          name: profile.full_name,
        }))
        setUsers(userOptions)
      } else {
        // Se não há perfis, usar dados demo
        loadDemoUsers()
      }
    } catch (error) {
      console.error("Error in fetchUsers:", error)
      loadDemoUsers()
    }
  }

  useEffect(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthlyTotal = expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
      })
      .reduce((sum, expense) => sum + expense.amount, 0)

    onTotalChange(monthlyTotal)
  }, [expenses, onTotalChange])

  useEffect(() => {
    // Calcular total de despesas pendentes (não pagas)
    const pendingTotal = upcomingExpenses
      .filter(expense => !expense.is_paid)
      .reduce((sum, expense) => sum + expense.amount, 0)

    if (onPendingTotalChange) {
      onPendingTotalChange(pendingTotal)
    }
  }, [upcomingExpenses, onPendingTotalChange])

  const fetchExpenses = async () => {
    if (!user) return

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

      // Se não tem couple_id, buscar apenas despesas próprias
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", firstDayOfMonth.toISOString().split("T")[0])
        .lte("date", lastDayOfMonth.toISOString().split("T")[0])
        .order("date", { ascending: false })

      if (error) {
        console.error("Error fetching expenses:", error)
      } else {
        setExpenses(data || [])
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

    const coupleUsers = [
      { id: user.id, full_name: "Você" }, // Usuário logado
      { id: partnerProfile.id, full_name: partnerProfile.full_name } // Parceiro
    ]



    // Buscar despesas de todos os usuários do casal
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .in("user_id", coupleUserIds)
      .gte("date", firstDayOfMonth.toISOString().split("T")[0])
      .lte("date", lastDayOfMonth.toISOString().split("T")[0])
      .order("date", { ascending: false })

    if (error) {
      console.error("Error fetching expenses:", error)
    } else {

      setExpenses(data || [])
    }
  }

  const fetchUpcomingExpenses = async () => {
    if (!user) return

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

      // Se não tem couple_id, buscar apenas despesas a vencer próprias
      const { data, error } = await supabase
        .from("upcoming_expenses")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_paid", false)
        .gte("due_date", firstDayOfMonth.toISOString().split("T")[0])
        .lte("due_date", lastDayOfMonth.toISOString().split("T")[0])
        .order("due_date", { ascending: true })

      if (error) {
        console.error("Error fetching upcoming expenses:", error)
      } else {
        setUpcomingExpenses(data || [])
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

    const coupleUsers = [
      { id: user.id, full_name: "Você" }, // Usuário logado
      { id: partnerProfile.id, full_name: partnerProfile.full_name } // Parceiro
    ]



    // Buscar despesas a vencer de todos os usuários do casal
    const { data, error } = await supabase
      .from("upcoming_expenses")
      .select("*")
      .in("user_id", coupleUserIds)
      .eq("is_paid", false)
      .gte("due_date", firstDayOfMonth.toISOString().split("T")[0])
      .lte("due_date", lastDayOfMonth.toISOString().split("T")[0])
      .order("due_date", { ascending: true })

    if (error) {
      console.error("Error fetching upcoming expenses:", error)
    } else {

      setUpcomingExpenses(data || [])
    }
  }

  const addExpense = async () => {
    if (!user || !newExpense.name.trim() || !newExpense.amount || !newExpense.category || !newExpense.payer.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios, incluindo 'Quem Pagou'.")
      return
    }

    // Validação adicional para UUID quando usando Supabase
    if (isUsingSupabase) {
      // Verificar se o payer é um UUID válido
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(newExpense.payer)) {
        alert("Erro: ID do usuário inválido. Por favor, selecione um usuário válido da lista.")
        return
      }
    }

    // Adicionar ao histórico de nomes
    expenseHistory.addExpenseName(newExpense.name)
    setExpenseSuggestions(expenseHistory.getExpenseNames())

    const expense: any = {
      name: newExpense.name,
      amount: Number.parseFloat(newExpense.amount),
      category: newExpense.category,
      date: newExpense.date,
      payer: newExpense.payer,
      user_id: user.id,
      observations: newExpense.observations,
    }

    if (isUsingSupabase) {
      const { error } = await supabase.from("expenses").insert([expense])
      if (error) {
        console.error("Error adding expense:", error)
        return
      }
      fetchExpenses()
    } else {
      // Sistema simples - adicionar à lista local
      const updatedExpenses = [expense, ...expenses]
      setExpenses(updatedExpenses)
    }

    setNewExpense({
      name: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      payer: "",
      observations: "",
    })
    setIsDialogOpen(false)
  }

  const addUpcomingExpense = async () => {
    if (!user || !newUpcomingExpense.name.trim() || !newUpcomingExpense.amount || !newUpcomingExpense.category || !newUpcomingExpense.payer.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios, incluindo 'Quem Vai Pagar'.")
      return
    }

    // Validação adicional para UUID quando usando Supabase
    if (isUsingSupabase) {
      // Verificar se o payer é um UUID válido
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(newUpcomingExpense.payer)) {
        alert("Erro: ID do usuário inválido. Por favor, selecione um usuário válido da lista.")
        return
      }
    }

    // Adicionar ao histórico de nomes
    expenseHistory.addExpenseName(newUpcomingExpense.name)
    setExpenseSuggestions(expenseHistory.getExpenseNames())

    const upcomingExpense: any = {
      name: newUpcomingExpense.name,
      amount: Number.parseFloat(newUpcomingExpense.amount),
      category: newUpcomingExpense.category,
      due_date: newUpcomingExpense.due_date,
      payer: newUpcomingExpense.payer,
      user_id: user.id,
      is_paid: false,
      is_monthly: newUpcomingExpense.is_monthly,
      created_at: new Date().toISOString(),
      observations: newUpcomingExpense.observations,
    }



    // Se é uma despesa mensal, criar projeções para os próximos 12 meses
    const monthlyProjections: any[] = []
    if (newUpcomingExpense.is_monthly) {
      const baseDate = new Date(newUpcomingExpense.due_date)
      
      for (let i = 1; i <= 12; i++) {
        const projectionDate = new Date(baseDate)
        projectionDate.setMonth(projectionDate.getMonth() + i)
        
        const projection: any = {
          name: newUpcomingExpense.name,
          amount: Number.parseFloat(newUpcomingExpense.amount),
          category: newUpcomingExpense.category,
          due_date: projectionDate.toISOString().split("T")[0],
          payer: newUpcomingExpense.payer,
          user_id: user.id,
          is_paid: false,
          is_monthly: true,
          created_at: new Date().toISOString(),
          observations: newUpcomingExpense.observations,
        }



        monthlyProjections.push(projection)
      }
    }

    if (isUsingSupabase) {
      // Preparar array com despesa principal + projeções
      const expensesToInsert = [upcomingExpense, ...monthlyProjections]
      
      const { error } = await supabase.from("upcoming_expenses").insert(expensesToInsert)
      if (error) {
        console.error("Error adding upcoming expense:", error)
        return
      }
      fetchUpcomingExpenses()
    } else {
      // Sistema simples - adicionar à lista local
      const updatedUpcoming = [upcomingExpense, ...upcomingExpenses]
      
      // Adicionar projeções mensais se necessário
      if (monthlyProjections.length > 0) {
        updatedUpcoming.unshift(...monthlyProjections)
      }
      
      setUpcomingExpenses(updatedUpcoming)
    }

    setNewUpcomingExpense({
      name: "",
      amount: "",
      category: "",
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      payer: "",
      is_monthly: false,
      observations: "",
    })
    setIsUpcomingDialogOpen(false)
  }

  const markAsPaid = async (upcomingExpenseId: string, upcomingExpense: UpcomingExpense) => {
    // Criar uma despesa normal
    const expense: any = {
      name: upcomingExpense.name,
      amount: upcomingExpense.amount,
      category: upcomingExpense.category,
      date: new Date().toISOString().split("T")[0],
      payer: upcomingExpense.payer,
      user_id: user?.id || "",
      observations: upcomingExpense.observations,
    }

    if (isUsingSupabase) {
      // Adicionar despesa
      const { error: expenseError } = await supabase.from("expenses").insert([expense])
      if (expenseError) {
        console.error("Error adding expense:", expenseError)
        return
      }

      // Marcar como pago
      const { error: updateError } = await supabase
        .from("upcoming_expenses")
        .update({ is_paid: true })
        .eq("id", upcomingExpenseId)

      if (updateError) {
        console.error("Error marking as paid:", updateError)
        return
      }

      fetchExpenses()
      fetchUpcomingExpenses()
    } else {
      // Sistema simples - adicionar à lista de despesas e remover de a vencer
      const updatedExpenses = [expense, ...expenses]
      setExpenses(updatedExpenses)
      
      const updatedUpcoming = upcomingExpenses.filter(e => e.id !== upcomingExpenseId)
      setUpcomingExpenses(updatedUpcoming)
    }
  }

  const deleteExpense = async (id: string) => {
    if (isUsingSupabase) {
      const { error } = await supabase.from("expenses").delete().eq("id", id)
      if (error) {
        console.error("Error deleting expense:", error)
      } else {
        fetchExpenses()
      }
    } else {
      // Sistema simples - remover da lista local
      const updatedExpenses = expenses.filter((expense) => expense.id !== id)
      setExpenses(updatedExpenses)
    }
  }

  const deleteUpcomingExpense = async (id: string) => {
    if (isUsingSupabase) {
      const { error } = await supabase.from("upcoming_expenses").delete().eq("id", id)
      if (error) {
        console.error("Error deleting upcoming expense:", error)
      } else {
        fetchUpcomingExpenses()
      }
    } else {
      // Sistema simples - remover da lista local
      const updatedUpcoming = upcomingExpenses.filter((expense) => expense.id !== id)
      setUpcomingExpenses(updatedUpcoming)
    }
  }

  const editExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setIsEditDialogOpen(true)
  }

  const editUpcomingExpense = (expense: UpcomingExpense) => {
    setEditingUpcomingExpense(expense)
    setIsEditUpcomingDialogOpen(true)
  }

  const updateExpense = async () => {
    if (!editingExpense || !user) return

    const updatedExpense = {
      ...editingExpense,
      amount: Number.parseFloat(editingExpense.amount.toString()),
    }

    if (isUsingSupabase) {
      const { error } = await supabase
        .from("expenses")
        .update(updatedExpense)
        .eq("id", editingExpense.id)
      
      if (error) {
        console.error("Error updating expense:", error)
        return
      }
      fetchExpenses()
    } else {
      const updatedExpenses = expenses.map(exp => 
        exp.id === editingExpense.id ? updatedExpense : exp
      )
      setExpenses(updatedExpenses)
    }

    setEditingExpense(null)
    setIsEditDialogOpen(false)
  }

  const updateUpcomingExpense = async () => {
    if (!editingUpcomingExpense || !user) return

    const updatedExpense = {
      ...editingUpcomingExpense,
      amount: Number.parseFloat(editingUpcomingExpense.amount.toString()),
    }

    if (isUsingSupabase) {
      const { error } = await supabase
        .from("upcoming_expenses")
        .update(updatedExpense)
        .eq("id", editingUpcomingExpense.id)
      
      if (error) {
        console.error("Error updating upcoming expense:", error)
        return
      }
      fetchUpcomingExpenses()
    } else {
      const updatedUpcoming = upcomingExpenses.map(exp => 
        exp.id === editingUpcomingExpense.id ? updatedExpense : exp
      )
      setUpcomingExpenses(updatedUpcoming)
    }

    setEditingUpcomingExpense(null)
    setIsEditUpcomingDialogOpen(false)
  }

  // Calcular dias até vencimento
  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Função para obter o nome do usuário pelo ID
  const getUserNameById = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.name || user?.email || userId
  }

  // Função para obter o nome completo do usuário pelo ID (incluindo usuários do casal)
  const getUserFullNameById = (userId: string) => {
    // Primeiro tentar encontrar nos usuários carregados
    const user = users.find(u => u.id === userId)
    if (user?.name) return user.name
    
    // Se não encontrar, pode ser um usuário do casal que não foi carregado
    // Retornar email ou ID como fallback
    return user?.email || userId
  }

  // Função para verificar se uma despesa foi criada pelo usuário atual
  const isOwnExpense = (userId: string) => {
    return user?.id === userId
  }

  // Preparar dados do gráfico
  const categoryData = categories
    .map((category) => {
      const total = expenses
        .filter((expense) => expense.category === category)
        .reduce((sum, expense) => sum + expense.amount, 0)

      return {
        name: category,
        value: total,
        color: categoryColors[category as keyof typeof categoryColors],
      }
    })
    .filter((item) => item.value > 0)

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
  })

  // Filtrar despesas vencendo em breve (próximos 7 dias)
  const expensesDueSoon = upcomingExpenses.filter(expense => {
    const daysUntilDue = getDaysUntilDue(expense.due_date)
    return daysUntilDue <= 7 && daysUntilDue >= 0
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Controle de Despesas</h2>
        
        {/* Resumo das despesas por usuário */}
        {monthlyExpenses.length > 0 && (
          <div className="flex space-x-4 text-sm">
            {users.map(user => {
              const userExpenses = monthlyExpenses.filter(expense => expense.user_id === user.id)
              const userTotal = userExpenses.reduce((sum, expense) => sum + expense.amount, 0)
              return (
                <div key={user.id} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${user.id === user?.id ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <span className="font-medium">{user.name || user.email}:</span>
                  <span className="text-gray-600">€{userTotal.toFixed(2)} ({userExpenses.length} despesas)</span>
                </div>
              )
            })}
          </div>
        )}
        <div className="flex space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Despesa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Despesa</DialogTitle>
                <DialogDescription>Registre uma nova despesa para acompanhar seus gastos.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Despesa</Label>
                                     <AutocompleteInput
                     id="name"
                     value={newExpense.name}
                     onChange={(value) => setNewExpense({ ...newExpense, name: value || "" })}
                     suggestions={expenseSuggestions}
                     placeholder="Ex: Supermercado, Conta telefone..."
                   />
                </div>
                <div>
                  <Label htmlFor="amount">Valor</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="payer">Quem Pagou</Label>
                  <Select
                    value={newExpense.payer}
                    onValueChange={(value) => setNewExpense({ ...newExpense, payer: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione quem pagou" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="observations">Observações (opcional)</Label>
                  <Textarea
                    id="observations"
                    value={newExpense.observations}
                    onChange={(e) => setNewExpense({ ...newExpense, observations: e.target.value })}
                    placeholder="Adicione observações sobre a despesa..."
                    rows={3}
                  />
                </div>
                <Button onClick={addExpense} className="w-full">
                  Adicionar Despesa
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isUpcomingDialogOpen} onOpenChange={setIsUpcomingDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Despesa a Vencer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Despesa a Vencer</DialogTitle>
                <DialogDescription>Registre uma despesa com data de vencimento futuro.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="upcoming-name">Nome da Despesa</Label>
                                     <AutocompleteInput
                     id="upcoming-name"
                     value={newUpcomingExpense.name}
                     onChange={(value) => setNewUpcomingExpense({ ...newUpcomingExpense, name: value || "" })}
                     suggestions={expenseSuggestions}
                     placeholder="Ex: Conta telefone, Internet..."
                   />
                </div>
                <div>
                  <Label htmlFor="upcoming-amount">Valor</Label>
                  <Input
                    id="upcoming-amount"
                    type="number"
                    step="0.01"
                    value={newUpcomingExpense.amount}
                    onChange={(e) => setNewUpcomingExpense({ ...newUpcomingExpense, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="upcoming-category">Categoria</Label>
                  <Select
                    value={newUpcomingExpense.category}
                    onValueChange={(value) => setNewUpcomingExpense({ ...newUpcomingExpense, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="due-date">Data de Vencimento</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={newUpcomingExpense.due_date}
                    onChange={(e) => setNewUpcomingExpense({ ...newUpcomingExpense, due_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="upcoming-payer">Quem Vai Pagar</Label>
                  <Select
                    value={newUpcomingExpense.payer}
                    onValueChange={(value) => setNewUpcomingExpense({ ...newUpcomingExpense, payer: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione quem vai pagar" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="upcoming-observations">Observações (opcional)</Label>
                  <Textarea
                    id="upcoming-observations"
                    value={newUpcomingExpense.observations}
                    onChange={(e) => setNewUpcomingExpense({ ...newUpcomingExpense, observations: e.target.value })}
                    placeholder="Adicione observações sobre a despesa a vencer..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-monthly"
                    checked={newUpcomingExpense.is_monthly}
                    onCheckedChange={(checked) => 
                      setNewUpcomingExpense({ ...newUpcomingExpense, is_monthly: checked === true })
                    }
                  />
                  <Label htmlFor="is-monthly" className="text-sm font-normal">
                    Despesa mensal recorrente (repetir todo mês na mesma data)
                  </Label>
                </div>
                <Button onClick={addUpcomingExpense} className="w-full">
                  Adicionar Despesa a Vencer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alerta de despesas vencendo */}
      {expensesDueSoon.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800">Despesas Vencendo em Breve</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expensesDueSoon.map((expense) => {
                const daysUntilDue = getDaysUntilDue(expense.due_date)
                return (
                  <div key={expense.id} className="flex justify-between items-center p-2 bg-white rounded border">
                    <div>
                      <span className="font-medium">{expense.name}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        - € {expense.amount.toFixed(2)} 
                        {daysUntilDue === 0 ? ' (hoje!)' : ` (${daysUntilDue} dias)`}
                      </span>
                    </div>
                    <Button size="sm" onClick={() => markAsPaid(expense.id, expense)}>
                      Marcar como Pago
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs para organizar conteúdo */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="recent">Despesas Recentes</TabsTrigger>
          <TabsTrigger value="upcoming">A Vencer</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Categoria</CardTitle>
                <CardDescription>Distribuição dos gastos mensais</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[300px]">
                  <PieChart width={533} height={300}>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: € ${(value || 0).toFixed(2)}`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo Mensal</CardTitle>
                <CardDescription>Estatísticas do mês atual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total de Despesas:</span>
                    <span className="font-bold">
                      € {monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Número de Transações:</span>
                    <span className="font-bold">{monthlyExpenses.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gasto Médio:</span>
                    <span className="font-bold">
                      €{" "}
                      {monthlyExpenses.length > 0
                        ? (
                            monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0) / monthlyExpenses.length
                          ).toFixed(2)
                        : "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Despesas a Vencer:</span>
                    <span className="font-bold text-orange-600">{upcomingExpenses.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent">
          {/* Recent Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Despesas Recentes</CardTitle>
              <CardDescription>Últimas transações registradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenses.slice(0, 10).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{expense.name}</h3>
                        <Badge variant="secondary">{expense.category}</Badge>
                        {isOwnExpense(expense.user_id) ? (
                          <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                            Minha
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
                            Parceiro
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(expense.date).toLocaleDateString("pt-BR")}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>Pago por: {getUserNameById(expense.payer)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <UserPlus className="h-3 w-3" />
                          <span>Criado por: {getUserFullNameById(expense.user_id)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg">€ {expense.amount.toFixed(2)}</span>
                      <Button variant="ghost" size="sm" onClick={() => editExpense(expense)}>
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteExpense(expense.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                {expenses.length === 0 && (
                  <div className="text-center py-8 text-gray-500">Nenhuma despesa registrada ainda.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          {/* Upcoming Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Despesas a Vencer</CardTitle>
              <CardDescription>Despesas programadas com suas datas de vencimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingExpenses.map((expense) => {
                  const daysUntilDue = getDaysUntilDue(expense.due_date)
                  const isOverdue = daysUntilDue < 0
                  const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0

                  return (
                    <div key={expense.id} className={`flex items-center justify-between p-4 border rounded-lg ${
                      isOverdue ? 'border-red-300 bg-red-50' : 
                      isDueSoon ? 'border-yellow-300 bg-yellow-50' : 
                      'border-gray-200'
                    }`}>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{expense.name}</h3>
                          <Badge variant="secondary">{expense.category}</Badge>
                          {isOwnExpense(expense.user_id) ? (
                            <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                              Minha
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
                              Parceiro
                            </Badge>
                          )}
                          {expense.is_monthly && (
                            <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
                              <Repeat className="h-3 w-3 mr-1" />
                              Mensal
                            </Badge>
                          )}
                          {isOverdue && <Badge variant="destructive">Vencida</Badge>}
                          {isDueSoon && <Badge variant="outline" className="border-yellow-500 text-yellow-700">Vence em breve</Badge>}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Vence: {new Date(expense.due_date).toLocaleDateString("pt-BR")}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {isOverdue ? `${Math.abs(daysUntilDue)} dias atrasada` :
                               daysUntilDue === 0 ? 'Vence hoje!' :
                               `${daysUntilDue} dias restantes`}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>Pago por: {getUserNameById(expense.payer)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <UserPlus className="h-3 w-3" />
                            <span>Criado por: {getUserFullNameById(expense.user_id)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-lg">€ {expense.amount.toFixed(2)}</span>
                        <Button size="sm" onClick={() => markAsPaid(expense.id, expense)}>
                          Pagar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => editUpcomingExpense(expense)}>
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteUpcomingExpense(expense.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
                {upcomingExpenses.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma despesa a vencer</h3>
                    <p className="text-gray-600 mb-4">Adicione despesas com datas de vencimento para acompanhar melhor suas finanças.</p>
                    <Button onClick={() => setIsUpcomingDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeira Despesa a Vencer
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Edição de Despesa */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Despesa</DialogTitle>
            <DialogDescription>Modifique os dados da despesa.</DialogDescription>
          </DialogHeader>
          {editingExpense && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome da Despesa</Label>
                <Input
                  id="edit-name"
                  value={editingExpense.name}
                  onChange={(e) => setEditingExpense({ ...editingExpense, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-amount">Valor</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  value={editingExpense.amount}
                  onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Categoria</Label>
                <Select
                  value={editingExpense.category}
                  onValueChange={(value) => setEditingExpense({ ...editingExpense, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-date">Data</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingExpense.date}
                  onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-payer">Quem Pagou</Label>
                <Select
                  value={editingExpense.payer}
                  onValueChange={(value) => setEditingExpense({ ...editingExpense, payer: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-observations">Observações</Label>
                <Textarea
                  id="edit-observations"
                  value={editingExpense.observations || ""}
                  onChange={(e) => setEditingExpense({ ...editingExpense, observations: e.target.value })}
                  placeholder="Observações sobre a despesa..."
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={updateExpense} className="flex-1">
                  Atualizar
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição de Despesa a Vencer */}
      <Dialog open={isEditUpcomingDialogOpen} onOpenChange={setIsEditUpcomingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Despesa a Vencer</DialogTitle>
            <DialogDescription>Modifique os dados da despesa a vencer.</DialogDescription>
          </DialogHeader>
          {editingUpcomingExpense && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-upcoming-name">Nome da Despesa</Label>
                <Input
                  id="edit-upcoming-name"
                  value={editingUpcomingExpense.name}
                  onChange={(e) => setEditingUpcomingExpense({ ...editingUpcomingExpense, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-upcoming-amount">Valor</Label>
                <Input
                  id="edit-upcoming-amount"
                  type="number"
                  step="0.01"
                  value={editingUpcomingExpense.amount}
                  onChange={(e) => setEditingUpcomingExpense({ ...editingUpcomingExpense, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-upcoming-category">Categoria</Label>
                <Select
                  value={editingUpcomingExpense.category}
                  onValueChange={(value) => setEditingUpcomingExpense({ ...editingUpcomingExpense, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-upcoming-due-date">Data de Vencimento</Label>
                <Input
                  id="edit-upcoming-due-date"
                  type="date"
                  value={editingUpcomingExpense.due_date}
                  onChange={(e) => setEditingUpcomingExpense({ ...editingUpcomingExpense, due_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-upcoming-payer">Quem Vai Pagar</Label>
                <Select
                  value={editingUpcomingExpense.payer}
                  onValueChange={(value) => setEditingUpcomingExpense({ ...editingUpcomingExpense, payer: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-upcoming-observations">Observações</Label>
                <Textarea
                  id="edit-upcoming-observations"
                  value={editingUpcomingExpense.observations || ""}
                  onChange={(e) => setEditingUpcomingExpense({ ...editingUpcomingExpense, observations: e.target.value })}
                  placeholder="Observações sobre a despesa a vencer..."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-is-monthly"
                  checked={editingUpcomingExpense.is_monthly}
                  onCheckedChange={(checked) => 
                    setEditingUpcomingExpense({ ...editingUpcomingExpense, is_monthly: checked === true })
                  }
                />
                <Label htmlFor="edit-is-monthly" className="text-sm font-normal">
                  Despesa mensal recorrente
                </Label>
              </div>
              <div className="flex space-x-2">
                <Button onClick={updateUpcomingExpense} className="flex-1">
                  Atualizar
                </Button>
                <Button variant="outline" onClick={() => setIsEditUpcomingDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
