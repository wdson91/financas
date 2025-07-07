# 🔧 Configuração do Supabase

## ❌ Problema Atual

As despesas não estão sendo salvas no Supabase porque **o Supabase não está configurado**.

O sistema detecta automaticamente se o Supabase está disponível verificando as variáveis de ambiente. Como elas não existem, o sistema usa o **modo simples** (dados não persistem).

## 🚀 Como Configurar o Supabase

### Passo 1: Criar projeto no Supabase
1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Escolha uma organização e nome para o projeto
5. Defina uma senha para o banco de dados
6. Aguarde a criação do projeto (2-3 minutos)

### Passo 2: Obter credenciais
1. No painel do projeto, vá para **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL** (ex: `https://seuprojetoaqui.supabase.co`)
   - **Project API Key** - **anon/public** (chave longa que começa com `eyJ...`)

### Passo 3: Criar arquivo de ambiente
Crie um arquivo chamado `.env.local` na raiz do projeto com o seguinte conteúdo:

```bash
# Configuração do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seuprojetoaqui.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_muito_longa_aqui
```

### Passo 4: Configurar banco de dados
1. No Supabase, vá para **SQL Editor**
2. Clique em **New Query**
3. Cole o conteúdo do arquivo `scripts/create-tables.sql`
4. Execute o script (Ctrl+Enter ou botão Run)

### Passo 5: Configurar autenticação
1. No Supabase, vá para **Authentication** > **Users**
2. Clique em **Add User** > **Create New User**
3. Adicione email e senha (ex: `wdson91@gmail.com` / `94019543`)
4. Marque **Auto Confirm User** se disponível

### Passo 6: Testar configuração
1. Reinicie o servidor: `npm run dev`
2. No login, escolha a aba **"Supabase"**
3. Ou clique no botão **"Usar Supabase"**
4. Faça login com as credenciais criadas
5. Adicione uma despesa para testar

## 🔍 Como Verificar se Está Funcionando

### ✅ Indicadores de Sucesso:
- Login mostra aba "Supabase" habilitada
- Usuário consegue fazer login com credenciais do Supabase
- Despesas aparecem na aba "Supabase" > "Table Editor" > "expenses"
- Despesas pendentes aparecem na tabela "upcoming_expenses"

### ❌ Problemas Comuns:
- **"Tab Supabase desabilitada"**: Variáveis de ambiente não configuradas
- **"Error connecting"**: URL ou chave incorretas
- **"Unable to validate"**: Projeto Supabase não criado corretamente
- **"Row Level Security"**: Execute os scripts SQL completos

## 📊 Status Atual

**Modo Ativo**: Sistema Simples (dados em localStorage/memória)
**Supabase**: ❌ Não configurado

**Para ativar o Supabase**: Siga os passos acima

## 🔄 Alternativas Enquanto Isso

1. **Modo Demo**: Dados ficam no localStorage, persistem na sessão
2. **Sistema Simples**: Autenticação básica, dados não persistem
3. **Aguardar configuração**: Configurar Supabase quando tiver tempo

---

**💡 Dica**: O sistema funciona perfeitamente sem Supabase para testar funcionalidades. O Supabase é opcional para persistência de dados entre sessões. 