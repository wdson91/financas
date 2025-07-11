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
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Plus, Target, TrendingUp, AlertTriangle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-wrapper"

interface Goal {
  id: string
  name: string
  category: string
  target_amount: number
  current_amount: number
  month: string
  user_id: string
}

const categories = ["Moradia", "Alimentação", "Transporte", "Lazer", "Saúde", "Educação", "Outros"]

interface GoalsTabProps {
  onGoalChange: (total: number) => void
}

export function GoalsTab({ onGoalChange }: GoalsTabProps) {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({
    name: "",
    category: "",
    target_amount: "",
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
  })

  useEffect(() => {
    fetchGoals()
  }, [user])

  useEffect(() => {
    const totalGoals = goals.reduce((sum, goal) => sum + goal.target_amount, 0)
    onGoalChange(totalGoals)
  }, [goals, onGoalChange])



  const fetchGoals = async () => {
    if (!user) return

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

      // Se não tem couple_id, buscar apenas metas próprias
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("month", { ascending: false })

      if (error) {
        console.error("Error fetching goals:", error)
      } else {
        setGoals(data || [])
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

    // Buscar metas de todos os usuários do casal
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .in("user_id", coupleUserIds)
      .order("month", { ascending: false })

    if (error) {
      console.error("Error fetching goals:", error)
    } else {
      setGoals(data || [])
    }
  }

  const addGoal = async () => {
    if (!user || !newGoal.name || !newGoal.category || !newGoal.target_amount) {
      return
    }

    const goal = {
      id: "",
      name: newGoal.name,
      category: newGoal.category,
      target_amount: Number.parseFloat(newGoal.target_amount),
      current_amount: 0,
      month: newGoal.month,
      user_id: user.id,
    }

    const { error } = await supabase.from("goals").insert([goal])
    if (error) {
      console.error("Error adding goal:", error)
      return
    }
    fetchGoals()

    setNewGoal({
      name: "",
      category: "",
      target_amount: "",
      month: new Date().toISOString().slice(0, 7),
    })
    setIsDialogOpen(false)
  }

  const updateGoalProgress = async (goalId: string, currentAmount: number) => {
    const { error } = await supabase.from("goals").update({ current_amount: currentAmount }).eq("id", goalId)
    if (error) {
      console.error("Error updating goal:", error)
    } else {
      fetchGoals()
    }
  }

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 100) return <Badge variant="destructive">Excedido</Badge>
    if (percentage >= 80) return <Badge variant="secondary">Atenção</Badge>
    return <Badge variant="default">No Limite</Badge>
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold">Metas Financeiras</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto text-sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nova Meta</span>
              <span className="sm:hidden">Nova Meta</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Criar Nova Meta</DialogTitle>
              <DialogDescription className="text-sm">Defina uma meta de gastos para uma categoria específica.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="goal-name" className="text-sm">Nome da Meta</Label>
                <Input
                  id="goal-name"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="Ex: Gastos com Alimentação"
                  className="h-10 sm:h-11 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="goal-category" className="text-sm">Categoria</Label>
                <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                  <SelectTrigger className="h-10 sm:h-11 text-sm">
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
                <Label htmlFor="goal-amount" className="text-sm">Valor Limite (€)</Label>
                <Input
                  id="goal-amount"
                  type="number"
                  step="0.01"
                  value={newGoal.target_amount}
                  onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                  placeholder="0.00"
                  className="h-10 sm:h-11 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="goal-month" className="text-sm">Mês</Label>
                <Input
                  id="goal-month"
                  type="month"
                  value={newGoal.month}
                  onChange={(e) => setNewGoal({ ...newGoal, month: e.target.value })}
                  className="h-10 sm:h-11 text-sm"
                />
              </div>
              <Button onClick={addGoal} className="w-full h-10 sm:h-11 text-sm">
                Criar Meta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Metas Ativas</CardTitle>
            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{goals.length}</div>
            <p className="text-xs text-muted-foreground">metas definidas</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Metas Excedidas</CardTitle>
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-red-600">
              {goals.filter((goal) => (goal.current_amount / goal.target_amount) * 100 >= 100).length}
            </div>
            <p className="text-xs text-muted-foreground">precisam de atenção</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Economia Total</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              €{" "}
              {goals.reduce((sum, goal) => sum + Math.max(0, goal.target_amount - goal.current_amount), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">ainda disponível</p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => {
          const percentage = (goal.current_amount / goal.target_amount) * 100
          const monthName = new Date(goal.month + "-01").toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })

          return (
            <Card key={goal.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start space-y-2 sm:space-y-0">
                  <div>
                    <CardTitle className="text-base sm:text-lg">{goal.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {goal.category} • {monthName}
                    </CardDescription>
                  </div>
                  {getStatusBadge(percentage)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Progresso</span>
                    <span>
                      € {goal.current_amount.toFixed(2)} / € {goal.target_amount.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={Math.min(percentage, 100)} className="h-2" />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                    <span className="text-xs sm:text-sm text-gray-600">{percentage.toFixed(1)}% utilizado</span>
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Valor gasto"
                        className="w-full sm:w-32 h-8 sm:h-9 text-xs sm:text-sm"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            const value = Number.parseFloat((e.target as HTMLInputElement).value)
                            if (value > 0) {
                              updateGoalProgress(goal.id, value)
                              ;(e.target as HTMLInputElement).value = ""
                            }
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        className="w-full sm:w-auto h-8 sm:h-9 text-xs"
                        onClick={() => {
                          const input = document.querySelector(`input[placeholder="Valor gasto"]`) as HTMLInputElement
                          const value = Number.parseFloat(input.value)
                          if (value > 0) {
                            updateGoalProgress(goal.id, value)
                            input.value = ""
                          }
                        }}
                      >
                        Atualizar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {goals.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma meta definida</h3>
              <p className="text-sm text-gray-600 mb-4">Crie suas primeiras metas financeiras para acompanhar seus gastos.</p>
              <Button onClick={() => setIsDialogOpen(true)} className="text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Meta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
