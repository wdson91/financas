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

### 🔄 Sistema de Autenticação Híbrido
- **Login Simples (JSON)**: Sistema básico para uso pessoal
- **Supabase**: Para recursos avançados e sincronização
- **Modo Demo**: Para testar sem cadastro
- **Detecção automática** do sistema disponível

## 🎛️ Sistemas de Autenticação

### 1. Modo Demo (Recomendado para Teste) ⭐
- **Funciona imediatamente** sem configuração
- **Dados persistem** durante a sessão (localStorage)
- **Todas as funcionalidades** disponíveis
- **Ideal para**: Testar o sistema completo

### 2. Login Simples (Básico)
Sistema básico baseado em arquivo JSON - ideal para uso doméstico.
- **Dados**: Não persistem entre sessões
- **Ideal para**: Uso temporário

**Credenciais atuais:**
- **Usuário 1**: `wdson91@gmail.com` / `94019543`
- **Usuário 2**: `casal2@exemplo.com` / `123456`

### 3. Supabase (Avançado) 🚀
**Status**: ❌ Não configurado (por isso despesas não salvam no Supabase)

Para configurar o Supabase e ter persistência completa:
1. Veja instruções detalhadas em `SUPABASE-CONFIG.md`
2. Configure variáveis de ambiente no `.env.local`
3. Execute scripts SQL no painel do Supabase

**Enquanto isso**: Use o **Modo Demo** que funciona perfeitamente para testar!

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
- `demo-expenses`: Despesas do modo demo
- `demo-upcoming-expenses`: Despesas a vencer do modo demo
- `simple-auth-user`: Usuário do sistema simples

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
   - Clique em **"Experimentar Modo Demo"** para testar imediatamente
   - Ou faça login com as credenciais do sistema simples
   - Para Supabase: siga instruções em `SUPABASE-CONFIG.md`

## ❗ Solução de Problemas

### "As despesas não estão sendo salvas no Supabase"
**Causa**: Supabase não está configurado (variáveis de ambiente ausentes)

**Solução**:
1. **Opção Rápida**: Use o **Modo Demo** (dados salvam no localStorage)
2. **Opção Completa**: Configure o Supabase seguindo `SUPABASE-CONFIG.md`

### "Dados não persistem entre sessões"
- **Modo Demo**: ✅ Persiste (localStorage)
- **Sistema Simples**: ❌ Não persiste (memória)
- **Supabase**: ✅ Persiste (banco de dados)

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
│   ├── simple-auth.ts             # Autenticação simples (JSON)
│   ├── expense-history.ts         # Histórico para autocomplete
│   ├── supabase.ts               # Cliente Supabase
│   └── utils.ts
├── data/
│   └── users.json                # Credenciais do sistema simples
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

### Sistema Simples
- Adequado para uso doméstico
- Senhas em texto simples no JSON
- Autenticação baseada em localStorage

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
- **Auth**: Sistema híbrido (JSON + Supabase)
- **Charts**: Recharts
- **Storage**: localStorage + Supabase

---

**Desenvolvido com ❤️ para facilitar o controle financeiro do casal!** 