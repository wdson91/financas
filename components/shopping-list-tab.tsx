"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, ShoppingCart, Trash2, History } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-wrapper"

interface ShoppingItem {
  id: string
  name: string
  quantity: number
  category?: string
  completed: boolean
  user_id: string
  created_at: string
}

const shoppingCategories = [
  "Frutas e Verduras",
  "Carnes",
  "Laticínios",
  "Padaria",
  "Limpeza",
  "Higiene",
  "Bebidas",
  "Outros",
]

interface ShoppingListTabProps {
  onItemsChange: (count: number) => void
}

export function ShoppingListTab({ onItemsChange }: ShoppingListTabProps) {
  const { user } = useAuth()
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "1",
    category: "",
  })

  useEffect(() => {
    fetchItems()
  }, [user])

  const addItem = async () => {
    if (!user || !newItem.name) return

    const item = {
      id: "",
      name: newItem.name,
      quantity: Number.parseInt(newItem.quantity) || 1,
      category: newItem.category || "Outros",
      completed: false,
      user_id: user.id,
      created_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("shopping_items").insert([item])
    if (error) {
      console.error("Error adding item:", error)
      return
    }
    setNewItem({ name: "", quantity: "1", category: "" })
    setIsDialogOpen(false)
    fetchItems()
  }

  const toggleItem = async (id: string, completed: boolean) => {
    const { error } = await supabase.from("shopping_items").update({ completed }).eq("id", id)
    if (error) {
      console.error("Error updating item:", error)
    }
    fetchItems()
  }

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("shopping_items").delete().eq("id", id)
    if (error) {
      console.error("Error deleting item:", error)
    }
    fetchItems()
  }

  const clearCompleted = async () => {
    const { error } = await supabase.from("shopping_items").delete().eq("user_id", user?.id).eq("completed", true)
    if (error) {
      console.error("Error clearing completed items:", error)
    }
    fetchItems()
  }

  useEffect(() => {
    const pendingItems = items.filter((item) => !item.completed).length
    onItemsChange(pendingItems)
  }, [items, onItemsChange])

  const fetchItems = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from("shopping_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching shopping items:", error)
    } else {
      setItems(data || [])
    }
  }

  const pendingItems = items.filter((item) => !item.completed)
  const completedItems = items.filter((item) => item.completed)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Lista de Compras</h2>
        <div className="flex space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Item</DialogTitle>
                <DialogDescription>Adicione um novo item à sua lista de compras.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="item-name">Nome do Item</Label>
                  <Input
                    id="item-name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Ex: Leite"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addItem()
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="item-quantity">Quantidade</Label>
                  <Input
                    id="item-quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="item-category">Categoria (Opcional)</Label>
                  <select
                    id="item-category"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Selecione uma categoria</option>
                    {shoppingCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <Button onClick={addItem} className="w-full">
                  Adicionar Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {completedItems.length > 0 && (
            <Button variant="outline" onClick={clearCompleted}>
              Limpar Concluídos
            </Button>
          )}
        </div>
      </div>

      {/* Shopping Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Pendentes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Concluídos</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Items */}
      {pendingItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Itens para Comprar</CardTitle>
            <CardDescription>Marque os itens conforme for comprando</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={(checked) => toggleItem(item.id, checked as boolean)}
                    className="h-5 w-5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{item.name}</span>
                      <Badge variant="outline">{item.quantity}x</Badge>
                      {item.category && (
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Items */}
      {completedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Itens Comprados</CardTitle>
            <CardDescription>Itens já adquiridos nesta lista</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-green-50">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={(checked) => toggleItem(item.id, checked as boolean)}
                    className="h-5 w-5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium line-through text-gray-600">{item.name}</span>
                      <Badge variant="outline">{item.quantity}x</Badge>
                      {item.category && (
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Lista vazia</h3>
            <p className="text-gray-600 mb-4">Adicione itens à sua lista de compras para começar.</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Item
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
