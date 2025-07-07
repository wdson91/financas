# Finanças do Casal

Sistema completo de gerenciamento financeiro para casais, com suporte a múltiplos métodos de autenticação e recursos avançados.

## ✨ Novas Funcionalidades

### 🔔 Despesas a Vencer
- **Cadastro de despesas futuras** com data de vencimento
- **Alertas visuais** para despesas vencendo em breve (próximos 7 dias)
- **Marcação automática** como pago (converte para despesa normal)
- **Status colorido** (vencida, vence em breve, normal)

### 🎯 Sistema de Autocomplete
- **Histórico inteligente** de nomes de despesas
- **Sugestões dinâmicas** conforme você digita
- **Navegação por teclado** (setas, Enter, Escape)
- **Armazenamento local** dos últimos 50 nomes utilizados

### 🔄 Sistema de Autenticação
- **Supabase**: Sistema principal com persistência completa
- **Detecção automática** do sistema disponível

## 🎛️ Sistema de Autenticação

### Supabase (Principal) 🚀
**Status**: ❌ Não configurado (por isso despesas não salvam no Supabase)

Para configurar o Supabase e ter persistência completa:
1. Veja instruções detalhadas em `SUPABASE-CONFIG.md`
2. Configure variáveis de ambiente no `.env.local`
3. Execute scripts SQL no painel do Supabase

**Enquanto isso**: O sistema funcionará com dados locais temporários.

## 📊 Funcionalidades Principais

### 💰 Controle de Despesas
- ✅ Cadastro com autocomplete inteligente
- ✅ Categorização automática
- ✅ Gráficos por categoria
- ✅ Resumo mensal detalhado
- ✅ Histórico completo

### ⏰ Despesas a Vencer
- ✅ Cadastro com data de vencimento
- ✅ Alertas visuais para vencimentos próximos
- ✅ Marcação como pago (converte para despesa)
- ✅ Status colorido por urgência
- ✅ Organização por abas

### 🎯 Metas Financeiras
- ✅ Definição de limites por categoria
- ✅ Acompanhamento de progresso
- ✅ Alertas de excesso
- ✅ Relatórios de economia

### 🛒 Lista de Compras
- ✅ Organização por categorias
- ✅ Controle de quantidades
- ✅ Marcação de itens comprados
- ✅ Contadores automáticos

## 🗄️ Estrutura de Dados

### Tabelas (Supabase)
```sql
-- Despesas normais
expenses (id, name, amount, category, date, payer, user_id, created_at)

-- Despesas a vencer
upcoming_expenses (id, name, amount, category, due_date, payer, user_id, is_paid, created_at)

-- Metas financeiras
goals (id, name, category, target_amount, current_amount, month, user_id, created_at)

-- Lista de compras
shopping_items (id, name, quantity, category, completed, user_id, created_at)
```

### Armazenamento Local
- `expense-names-history`: Histórico para autocomplete

## 🚀 Como Executar

1. **Instalar dependências:**
```bash
npm install
```

2. **Executar o projeto:**
```bash
npm run dev
```

3. **Acessar:**
```
http://localhost:3000
```

4. **Começar a usar:**
   - Faça login com suas credenciais
   - Para Supabase: siga instruções em `SUPABASE-CONFIG.md`

## ❗ Solução de Problemas

### "As despesas não estão sendo salvas no Supabase"
**Causa**: Supabase não está configurado (variáveis de ambiente ausentes)

**Solução**:
1. Configure o Supabase seguindo `SUPABASE-CONFIG.md`
2. Ou use o sistema com dados locais temporários

### "Dados não persistem entre sessões"
- **Supabase**: ✅ Persiste (banco de dados)
- **Sistema Local**: ❌ Não persiste (memória temporária)

### "Tab Supabase está desabilitada"
**Causa**: Arquivo `.env.local` não existe ou está incompleto

**Como verificar**: Se Supabase estiver configurado, a aba aparecerá habilitada no login.

## 📁 Estrutura do Projeto

```
financas-casal/
├── components/
│   ├── auth-wrapper.tsx           # Gerenciamento de autenticação
│   ├── login-form.tsx             # Formulário de login híbrido
│   ├── expenses-tab.tsx           # Controle de despesas + a vencer
│   ├── ui/
│   │   └── autocomplete-input.tsx # Componente de autocomplete
│   └── ...
├── lib/
│   ├── expense-history.ts         # Histórico para autocomplete
│   ├── supabase.ts               # Cliente Supabase
│   └── utils.ts

├── scripts/
│   └── create-tables.sql         # Script SQL para Supabase
└── ...
```

## 🎨 Interface

### Recursos Visuais
- ✅ **Design responsivo** - funciona em desktop e mobile
- ✅ **Tema moderno** - cores suaves e interface limpa
- ✅ **Feedback visual** - alertas, cores e status
- ✅ **Organização por abas** - conteúdo bem estruturado
- ✅ **Gráficos interativos** - visualização de dados

### Experiência do Usuário
- ✅ **Autocomplete inteligente** - agiliza o cadastro
- ✅ **Validações em tempo real** - evita erros
- ✅ **Feedback imediato** - confirma ações
- ✅ **Navegação intuitiva** - fácil de usar

## 🔒 Segurança

### Sistema Local
- Dados temporários em memória
- Adequado para testes rápidos

### Sistema Supabase
- Row Level Security (RLS) habilitado
- Políticas de acesso por usuário
- Autenticação JWT segura
- Criptografia de dados

## 📱 Responsividade

- ✅ **Desktop**: Layout completo com gráficos
- ✅ **Tablet**: Interface adaptada
- ✅ **Mobile**: Otimizada para toque

## 🛠️ Tecnologias

- **Framework**: Next.js 15 + React 19
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (opcional)
- **Auth**: Supabase (com fallback local)
- **Charts**: Recharts
- **Storage**: localStorage + Supabase

---

**Desenvolvido com ❤️ para facilitar o controle financeiro do casal!** 