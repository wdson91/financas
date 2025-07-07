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
import { Textarea } from "@/components/ui/textarea"
import { Plus, Calendar, User, Trash2, Edit, TrendingUp, ChevronLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-wrapper"

interface Income {
  id: string
  name: string
  amount: number
  category: string
  date: string
  user_id: string
  observations?: string
}

const incomeCategories = ["Salário", "Freelance", "Investimentos", "Presentes", "Outros"]

export default function EntradasPage() {
  const { user, isUsingSupabase } = useAuth()
  const [incomes, setIncomes] = useState<Income[]>([])
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [newIncome, setNewIncome] = useState({
    name: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    observations: "",
  })

  useEffect(() => {
    if (isUsingSupabase && user) {
      fetchIncomes()
      fetchUsers()
    }
  }, [user, isUsingSupabase])

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

  const fetchIncomes = async () => {
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
      // Se não tem couple_id, buscar apenas entradas próprias
      const { data, error } = await supabase
        .from("incomes")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", firstDayOfMonth.toISOString().split("T")[0])
        .lte("date", lastDayOfMonth.toISOString().split("T")[0])
        .order("date", { ascending: false })

      if (error) {
        console.error("Error fetching incomes:", error)
      } else {
        setIncomes(data || [])
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
      .select("*")
      .in("user_id", coupleUserIds)
      .gte("date", firstDayOfMonth.toISOString().split("T")[0])
      .lte("date", lastDayOfMonth.toISOString().split("T")[0])
      .order("date", { ascending: false })

    if (error) {
      console.error("Error fetching incomes:", error)
    } else {
      setIncomes(data || [])
    }
  }

  const addIncome = async () => {
    if (!user || !newIncome.name.trim() || !newIncome.amount || !newIncome.category) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    const income = {
      name: newIncome.name,
      amount: Number.parseFloat(newIncome.amount),
      category: newIncome.category,
      date: newIncome.date,
      user_id: user.id,
      observations: newIncome.observations,
    }

    if (isUsingSupabase) {
      const { error } = await supabase.from("incomes").insert([income])
      if (error) {
        console.error("Error adding income:", error)
        return
      }
      fetchIncomes()
    } else {
      // Sistema simples - adicionar à lista local
      const updatedIncomes = [income, ...incomes]
      setIncomes(updatedIncomes)
    }

    setNewIncome({
      name: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      observations: "",
    })
    setIsDialogOpen(false)
  }

  const deleteIncome = async (id: string) => {
    if (isUsingSupabase) {
      const { error } = await supabase.from("incomes").delete().eq("id", id)
      if (error) {
        console.error("Error deleting income:", error)
        return
      }
      fetchIncomes()
    } else {
      // Sistema simples - remover da lista local
      const updatedIncomes = incomes.filter(income => income.id !== id)
      setIncomes(updatedIncomes)
    }
  }

  const editIncome = (income: Income) => {
    setEditingIncome(income)
    setIsEditDialogOpen(true)
  }

  const updateIncome = async () => {
    if (!editingIncome) return

    if (isUsingSupabase) {
      const { error } = await supabase
        .from("incomes")
        .update({
          name: editingIncome.name,
          amount: editingIncome.amount,
          category: editingIncome.category,
          date: editingIncome.date,
          observations: editingIncome.observations,
        })
        .eq("id", editingIncome.id)

      if (error) {
        console.error("Error updating income:", error)
        return
      }
      fetchIncomes()
    } else {
      // Sistema simples - atualizar na lista local
      const updatedIncomes = incomes.map(income =>
        income.id === editingIncome.id ? editingIncome : income
      )
      setIncomes(updatedIncomes)
    }

    setIsEditDialogOpen(false)
    setEditingIncome(null)
  }

  const getUserNameById = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.name || userId
  }

  const isOwnIncome = (userId: string) => {
    return userId === user?.id
  }

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyIncomes = incomes.filter((income) => {
    const incomeDate = new Date(income.date)
    return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear
  })

  const totalMonthlyIncome = monthlyIncomes.reduce((sum, income) => sum + income.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Entradas</h1>
            <p className="text-sm sm:text-base text-gray-600">Registre suas entradas como salários e outros valores</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => window.history.back()} className="text-sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total do Mês</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-green-600">€ {totalMonthlyIncome.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Entradas do mês atual</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Número de Entradas</CardTitle>
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{monthlyIncomes.length}</div>
              <p className="text-xs text-muted-foreground">Registros este mês</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Média por Entrada</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">
                € {monthlyIncomes.length > 0 ? (totalMonthlyIncome / monthlyIncomes.length).toFixed(2) : "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">Valor médio</p>
            </CardContent>
          </Card>
        </div>

        {/* Botão Adicionar */}
        <div className="flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto text-sm">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nova Entrada</span>
                <span className="sm:hidden">Nova Entrada</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Adicionar Nova Entrada</DialogTitle>
                <DialogDescription className="text-sm">Registre uma nova entrada de valor.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm">Nome da Entrada</Label>
                  <Input
                    id="name"
                    value={newIncome.name}
                    onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })}
                    placeholder="Ex: Salário, Freelance..."
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="amount" className="text-sm">Valor</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                    placeholder="0.00"
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-sm">Categoria</Label>
                  <Select
                    value={newIncome.category}
                    onValueChange={(value) => setNewIncome({ ...newIncome, category: value })}
                  >
                    <SelectTrigger className="h-10 sm:h-11 text-sm">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {incomeCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date" className="text-sm">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newIncome.date}
                    onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="observations" className="text-sm">Observações (opcional)</Label>
                  <Textarea
                    id="observations"
                    value={newIncome.observations}
                    onChange={(e) => setNewIncome({ ...newIncome, observations: e.target.value })}
                    placeholder="Adicione observações sobre a entrada..."
                    rows={3}
                    className="text-sm"
                  />
                </div>
                <Button onClick={addIncome} className="w-full h-10 sm:h-11 text-sm">
                  Adicionar Entrada
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Entradas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Entradas do Mês</CardTitle>
            <CardDescription className="text-sm">Lista de todas as entradas registradas este mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyIncomes.map((income) => (
                <div key={income.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg space-y-3 sm:space-y-0">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <h3 className="font-medium text-sm sm:text-base">{income.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">{income.category}</Badge>
                        {isOwnIncome(income.user_id) ? (
                          <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50 text-xs">
                            Minha
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50 text-xs">
                            Parceiro
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(income.date).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span className="truncate">Registrado por: {getUserNameById(income.user_id)}</span>
                      </div>
                    </div>
                    {income.observations && (
                      <div className="text-xs sm:text-sm text-gray-500">
                        {income.observations}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <span className="font-bold text-base sm:text-lg text-green-600">€ {income.amount.toFixed(2)}</span>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => editIncome(income)} className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteIncome(income.id)} className="h-8 w-8 p-0">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {monthlyIncomes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma entrada registrada</h3>
                  <p className="text-sm text-gray-600 mb-4">Adicione suas primeiras entradas para começar a controlar suas receitas.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Editar Entrada</DialogTitle>
              <DialogDescription className="text-sm">Modifique os dados da entrada.</DialogDescription>
            </DialogHeader>
            {editingIncome && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name" className="text-sm">Nome da Entrada</Label>
                  <Input
                    id="edit-name"
                    value={editingIncome.name}
                    onChange={(e) => setEditingIncome({ ...editingIncome, name: e.target.value })}
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-amount" className="text-sm">Valor</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    value={editingIncome.amount}
                    onChange={(e) => setEditingIncome({ ...editingIncome, amount: parseFloat(e.target.value) || 0 })}
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category" className="text-sm">Categoria</Label>
                  <Select
                    value={editingIncome.category}
                    onValueChange={(value) => setEditingIncome({ ...editingIncome, category: value })}
                  >
                    <SelectTrigger className="h-10 sm:h-11 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {incomeCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-date" className="text-sm">Data</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingIncome.date}
                    onChange={(e) => setEditingIncome({ ...editingIncome, date: e.target.value })}
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-observations" className="text-sm">Observações</Label>
                  <Textarea
                    id="edit-observations"
                    value={editingIncome.observations || ""}
                    onChange={(e) => setEditingIncome({ ...editingIncome, observations: e.target.value })}
                    placeholder="Observações sobre a entrada..."
                    rows={3}
                    className="text-sm"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={updateIncome} className="flex-1 h-10 sm:h-11 text-sm">
                    Atualizar
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1 h-10 sm:h-11 text-sm">
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 