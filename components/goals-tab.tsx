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
  const { user, isDemoMode } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({
    name: "",
    category: "",
    target_amount: "",
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
  })

  useEffect(() => {
    if (isDemoMode) {
      loadDemoGoals()
    } else {
      fetchGoals()
    }
  }, [user, isDemoMode])

  useEffect(() => {
    const totalGoals = goals.reduce((sum, goal) => sum + goal.target_amount, 0)
    onGoalChange(totalGoals)
  }, [goals, onGoalChange])

  const loadDemoGoals = () => {
    const demoData = localStorage.getItem("demo-goals")
    if (demoData) {
      setGoals(JSON.parse(demoData))
    } else {
      // Set some demo data
      const sampleGoals = [
        {
          id: "1",
          name: "Meta Alimentação",
          category: "Alimentação",
          target_amount: 800,
          current_amount: 250.5,
          month: new Date().toISOString().slice(0, 7),
          user_id: "demo",
        },
        {
          id: "2",
          name: "Meta Transporte",
          category: "Transporte",
          target_amount: 400,
          current_amount: 180,
          month: new Date().toISOString().slice(0, 7),
          user_id: "demo",
        },
      ]
      setGoals(sampleGoals)
      localStorage.setItem("demo-goals", JSON.stringify(sampleGoals))
    }
  }

  const fetchGoals = async () => {
    if (!user) return

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
  }

  const addGoal = async () => {
    if (!user || !newGoal.name || !newGoal.category || !newGoal.target_amount) {
      return
    }

    const goal = {
      id: isDemoMode ? Date.now().toString() : "",
      name: newGoal.name,
      category: newGoal.category,
      target_amount: Number.parseFloat(newGoal.target_amount),
      current_amount: 0,
      month: newGoal.month,
      user_id: user.id,
    }

    if (isDemoMode) {
      const updatedGoals = [goal, ...goals]
      setGoals(updatedGoals)
      localStorage.setItem("demo-goals", JSON.stringify(updatedGoals))
    } else {
      const { error } = await supabase.from("goals").insert([goal])
      if (error) {
        console.error("Error adding goal:", error)
        return
      }
      fetchGoals()
    }

    setNewGoal({
      name: "",
      category: "",
      target_amount: "",
      month: new Date().toISOString().slice(0, 7),
    })
    setIsDialogOpen(false)
  }

  const updateGoalProgress = async (goalId: string, currentAmount: number) => {
    if (isDemoMode) {
      const updatedGoals = goals.map((goal) => (goal.id === goalId ? { ...goal, current_amount: currentAmount } : goal))
      setGoals(updatedGoals)
      localStorage.setItem("demo-goals", JSON.stringify(updatedGoals))
    } else {
      const { error } = await supabase.from("goals").update({ current_amount: currentAmount }).eq("id", goalId)
      if (error) {
        console.error("Error updating goal:", error)
      } else {
        fetchGoals()
      }
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500"
    if (percentage >= 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 100) return <Badge variant="destructive">Excedido</Badge>
    if (percentage >= 80) return <Badge variant="secondary">Atenção</Badge>
    return <Badge variant="default">No Limite</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Metas Financeiras</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Meta</DialogTitle>
              <DialogDescription>Defina uma meta de gastos para uma categoria específica.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="goal-name">Nome da Meta</Label>
                <Input
                  id="goal-name"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="Ex: Gastos com Alimentação"
                />
              </div>
              <div>
                <Label htmlFor="goal-category">Categoria</Label>
                <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
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
                <Label htmlFor="goal-amount">Valor Limite (€)</Label>
                <Input
                  id="goal-amount"
                  type="number"
                  step="0.01"
                  value={newGoal.target_amount}
                  onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="goal-month">Mês</Label>
                <Input
                  id="goal-month"
                  type="month"
                  value={newGoal.month}
                  onChange={(e) => setNewGoal({ ...newGoal, month: e.target.value })}
                />
              </div>
              <Button onClick={addGoal} className="w-full">
                Criar Meta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
            <p className="text-xs text-muted-foreground">metas definidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Excedidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {goals.filter((goal) => (goal.current_amount / goal.target_amount) * 100 >= 100).length}
            </div>
            <p className="text-xs text-muted-foreground">precisam de atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
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
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                    <CardDescription>
                      {goal.category} • {monthName}
                    </CardDescription>
                  </div>
                  {getStatusBadge(percentage)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>
                      € {goal.current_amount.toFixed(2)} / € {goal.target_amount.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={Math.min(percentage, 100)} className="h-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{percentage.toFixed(1)}% utilizado</span>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Valor gasto"
                        className="w-32"
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
              <p className="text-gray-600 mb-4">Crie suas primeiras metas financeiras para acompanhar seus gastos.</p>
              <Button onClick={() => setIsDialogOpen(true)}>
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
