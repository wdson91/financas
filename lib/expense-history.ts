export class ExpenseHistoryService {
  private static instance: ExpenseHistoryService
  private storageKey = 'expense-names-history'

  static getInstance(): ExpenseHistoryService {
    if (!ExpenseHistoryService.instance) {
      ExpenseHistoryService.instance = new ExpenseHistoryService()
    }
    return ExpenseHistoryService.instance
  }

  addExpenseName(name: string): void {
    if (!name.trim()) return
    
    const normalizedName = name.trim().toLowerCase()
    const history = this.getExpenseNames()
    
    // Remove se já existe (para colocar no topo)
    const filtered = history.filter(item => item.toLowerCase() !== normalizedName)
    
    // Adiciona no início da lista
    const updated = [name.trim(), ...filtered]
    
    // Mantém apenas os últimos 50 nomes
    const limited = updated.slice(0, 50)
    
    localStorage.setItem(this.storageKey, JSON.stringify(limited))
  }

  getExpenseNames(): string[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Erro ao recuperar histórico de despesas:', error)
      return []
    }
  }

  searchExpenseNames(query: string): string[] {
    if (!query.trim()) return this.getExpenseNames()
    
    const normalizedQuery = query.toLowerCase()
    return this.getExpenseNames().filter(name => 
      name.toLowerCase().includes(normalizedQuery)
    )
  }

  clearHistory(): void {
    localStorage.removeItem(this.storageKey)
  }
}

export const expenseHistory = ExpenseHistoryService.getInstance() 