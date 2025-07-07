# Funcionalidade de Despesas Mensais Recorrentes

## 📋 **Descrição**

A funcionalidade de despesas mensais permite que você configure despesas que se repetem automaticamente todo mês na mesma data. Ideal para contas fixas como aluguel, internet, luz, água, etc.

## ✨ **Como Funciona**

### **1. Criando uma Despesa Mensal**

1. Vá na aba **"Despesas"**
2. Clique em **"Despesa a Vencer"** 
3. Preencha os dados normalmente:
   - Nome da despesa (ex: "Conta de Luz")
   - Valor
   - Categoria
   - Data de vencimento
   - Quem vai pagar
4. ✅ **Marque a opção**: "Despesa mensal recorrente"
5. Clique em **"Adicionar Despesa a Vencer"**

### **2. Identificação Visual**

Despesas mensais são identificadas por:
- 🔄 **Badge azul "Mensal"** com ícone de repetição
- Aparecem na lista de "Despesas a Vencer"

### **3. Recorrência Automática**

Quando você **marca uma despesa mensal como paga**:

1. ✅ A despesa atual é **movida para "Despesas Recentes"**
2. 🔄 **Automaticamente** uma nova despesa é criada para o **próximo mês**
3. A nova despesa mantém:
   - Mesmo nome
   - Mesmo valor
   - Mesma categoria
   - Mesmo pagador
   - Data: **próximo mês, mesmo dia**

## 🗓️ **Exemplo Prático**

```
Despesa Original:
- Nome: "Internet"
- Valor: € 89,90
- Vencimento: 15/01/2025
- Mensal: ✅ Sim

Após pagar (15/01/2025):
✅ Despesa vai para "Recentes" com data de pagamento
🔄 Nova despesa criada automaticamente:
- Nome: "Internet" 
- Valor: € 89,90
- Vencimento: 15/02/2025
- Mensal: ✅ Sim
```

## ⚙️ **Configuração do Banco (Supabase)**

Execute o script no SQL Editor do Supabase:

```sql
-- Adicionar campo is_monthly
ALTER TABLE public.upcoming_expenses 
ADD COLUMN is_monthly BOOLEAN DEFAULT false NOT NULL;
```

## 🎯 **Vantagens**

- ✅ **Automatização**: Sem esquecer contas fixas
- ✅ **Precisão**: Sempre na mesma data
- ✅ **Organização**: Fácil identificação visual
- ✅ **Histórico**: Mantém registro de todos os pagamentos
- ✅ **Flexibilidade**: Pode desmarcar o "mensal" quando quiser

## 📝 **Casos de Uso**

**Ideais para despesas mensais:**
- 🏠 Aluguel
- 💡 Conta de luz
- 💧 Conta de água
- 🌐 Internet
- 📱 Plano celular
- 🏥 Plano de saúde
- 🎓 Mensalidade escolar

**Não recomendado para:**
- Despesas variáveis (supermercado, gasolina)
- Compras esporádicas
- Despesas com valores que mudam

## 🔧 **Gerenciamento**

- **Para parar a recorrência**: Marque a despesa como paga e edite/delete a próxima antes do vencimento
- **Para alterar valor**: Edite a próxima despesa criada
- **Para pular um mês**: Delete a despesa do mês específico

## ⚠️ **Observações**

- A recorrência só é criada **após marcar como pago**
- Se deletar uma despesa mensal, a recorrência para
- O sistema calcula automaticamente o próximo mês (ex: 31/01 → 28/02 se fevereiro)
- Funciona tanto no modo Supabase quanto no modo demo/simples 