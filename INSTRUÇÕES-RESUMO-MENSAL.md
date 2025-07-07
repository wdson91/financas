# Página de Resumo Mensal

## 📋 **Descrição**

A página de **Resumo Mensal** oferece uma visão completa das despesas programadas para os próximos 12 meses, incluindo despesas mensais recorrentes e despesas específicas registradas.

## 🎯 **Funcionalidades**

### **1. Estatísticas Gerais**
- **Total dos próximos 12 meses**: Soma de todas as despesas projetadas
- **Média mensal**: Valor médio por mês
- **Despesas mensais**: Quantidade de despesas recorrentes

### **2. Navegação por Mês**
- Botões para navegar entre os meses
- Foco no mês atual por padrão
- Visualização detalhada de cada mês

### **3. Detalhes do Mês**
- Lista completa de despesas do mês selecionado
- Identificação visual de despesas mensais (🔄)
- Identificação de despesas projetadas (laranja)
- Informações de vencimento e pagador

### **4. Visão Geral dos 12 Meses**
- Grid com todos os meses
- Total por mês
- Quantidade de despesas
- Clique para navegar para o mês específico

## 🔄 **Como Funciona**

### **Despesas Existentes**
- Mostra despesas já registradas no banco
- Inclui despesas específicas e mensais

### **Despesas Projetadas**
- Para despesas mensais, projeta automaticamente os próximos meses
- Exemplo: Internet vence dia 15/01 → Projeta 15/02, 15/03, etc.
- Badge "Projetada" para identificar essas despesas

### **Cálculo Inteligente**
- Soma despesas específicas + projeções mensais
- Evita duplicação (não soma se já existe despesa específica)
- Considera apenas despesas futuras

## 📊 **Exemplo Prático**

```
Janeiro 2025:
- Aluguel: € 1.200 (mensal)
- Internet: € 89,90 (mensal)
- Conta de luz: € 150 (específica)
Total: € 1.439,90

Fevereiro 2025:
- Aluguel: € 1.200 (projetada)
- Internet: € 89,90 (projetada)
Total: € 1.289,90
```

## 🎨 **Indicadores Visuais**

- **🔄 Mensal**: Despesa recorrente mensal
- **🟠 Projetada**: Despesa calculada automaticamente
- **📅 Atual**: Mês atual
- **💰 Verde**: Mês com despesas
- **⚪ Cinza**: Mês sem despesas

## 📱 **Como Acessar**

1. **No Dashboard Principal**:
   - Clique no botão "Ver Resumo dos Próximos Meses"
   - Localizado abaixo dos cards de estatísticas

2. **URL Direta**:
   - Acesse: `/resumo-mensal`

## ⚙️ **Compatibilidade**

- ✅ **Modo Demo**: Funciona com dados locais
- ✅ **Modo Supabase**: Busca dados do banco
- ✅ **Modo Simples**: Funciona com dados locais

## 🔧 **Recursos Técnicos**

### **Projeção de Despesas Mensais**
```javascript
// Para cada despesa mensal
monthlyExpenses.forEach(monthlyExpense => {
  const lastDueDate = new Date(monthlyExpense.due_date)
  const targetMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), lastDueDate.getDate())
  
  // Se é futura e não existe específica
  if (targetMonth > new Date() && !monthExpenses.some(exp => exp.name === monthlyExpense.name)) {
    // Cria projeção
  }
})
```

### **Formatação de Moeda**
```javascript
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}
```

## 🎯 **Casos de Uso**

### **Planejamento Financeiro**
- Visualizar compromissos futuros
- Calcular média de gastos mensais
- Identificar meses com gastos altos

### **Controle de Despesas**
- Acompanhar despesas recorrentes
- Planejar pagamentos
- Identificar oportunidades de economia

### **Tomada de Decisão**
- Comparar meses diferentes
- Avaliar impacto de novas despesas
- Planejar investimentos

## ⚠️ **Observações**

- **Despesas projetadas** são calculadas em tempo real
- **Não são salvas no banco** até serem pagas
- **Atualização automática** quando novas despesas são adicionadas
- **Compatível** com todas as funcionalidades existentes 