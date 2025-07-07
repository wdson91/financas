# 📋 Instruções para Configurar Políticas do Supabase

## 🎯 Arquivos Disponíveis

### 1. `create-tables.sql` (Principal)
- **Uso**: Execute este arquivo primeiro
- **Conteúdo**: Cria todas as tabelas + políticas básicas
- **Recomendado**: Para setup inicial completo

### 2. `upcoming-expenses-policies.sql` (Específico)
- **Uso**: Execute se quiser apenas as políticas da tabela `upcoming_expenses`
- **Conteúdo**: Políticas básicas + verificações + testes
- **Recomendado**: Para atualizações ou configuração específica

### 3. `upcoming-expenses-advanced-policies.sql` (Avançado)
- **Uso**: Execute se quiser políticas mais restritivas
- **Conteúdo**: Políticas avançadas + funções + triggers
- **Recomendado**: Para ambientes de produção com regras de negócio específicas

## 🚀 Como Aplicar no Supabase

### Passo 1: Acessar o Editor SQL
1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá para **SQL Editor** no menu lateral
3. Clique em **New Query**

### Passo 2: Executar Script Principal
```sql
-- Cole o conteúdo do arquivo create-tables.sql
-- Execute com Ctrl+Enter ou clique em Run
```

### Passo 3: Verificar Criação
```sql
-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('expenses', 'upcoming_expenses', 'goals', 'shopping_items');

-- Verificar se as políticas foram criadas
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename = 'upcoming_expenses';
```

## 🔒 Políticas Implementadas

### Para a tabela `upcoming_expenses`:

#### 📖 **SELECT (Visualizar)**
- **Regra**: `auth.uid() = user_id`
- **Resultado**: Usuários só veem suas próprias despesas a vencer

#### ➕ **INSERT (Criar)**
- **Regra**: `auth.uid() = user_id`
- **Resultado**: Usuários só podem criar despesas para si mesmos

#### ✏️ **UPDATE (Atualizar)**
- **Regra**: `auth.uid() = user_id`
- **Resultado**: Usuários só podem atualizar suas próprias despesas

#### 🗑️ **DELETE (Excluir)**
- **Regra**: `auth.uid() = user_id`
- **Resultado**: Usuários só podem excluir suas próprias despesas

## 🔧 Políticas Avançadas (Opcionais)

### 1. Impedir Edição de Despesas Pagas
```sql
-- Usuários não podem editar despesas já marcadas como pagas
USING (auth.uid() = user_id AND is_paid = false)
```

### 2. Impedir Criação de Despesas com Data Passada
```sql
-- Usuários só podem criar despesas com vencimento futuro
WITH CHECK (auth.uid() = user_id AND due_date >= CURRENT_DATE)
```

### 3. Auditoria de Mudanças
```sql
-- Registra todas as alterações em uma tabela de auditoria
-- Inclui: quem alterou, quando, dados antigos e novos
```

## 🧪 Como Testar as Políticas

### 1. Criar um Usuário de Teste
```sql
-- No Supabase, crie uma conta de teste via Authentication
```

### 2. Testar Inserção
```sql
INSERT INTO upcoming_expenses (name, amount, category, due_date, payer, user_id)
VALUES ('Teste Conta', 100.00, 'Moradia', '2024-02-01', 'Teste', auth.uid());
```

### 3. Testar Visualização
```sql
SELECT * FROM upcoming_expenses;
-- Deve retornar apenas as despesas do usuário logado
```

### 4. Testar Atualização
```sql
UPDATE upcoming_expenses 
SET is_paid = true 
WHERE name = 'Teste Conta';
-- Deve funcionar apenas para despesas próprias
```

### 5. Testar Exclusão
```sql
DELETE FROM upcoming_expenses 
WHERE name = 'Teste Conta';
-- Deve funcionar apenas para despesas próprias
```

## ⚠️ Troubleshooting

### Erro: "Insufficient privileges"
- **Causa**: RLS está ativado mas faltam políticas
- **Solução**: Execute o script de políticas completo

### Erro: "Policy already exists"
- **Causa**: Tentativa de criar política já existente
- **Solução**: Use `DROP POLICY IF EXISTS` antes de criar

### Dados não aparecem na aplicação
- **Causa**: user_id não corresponde ao usuário autenticado
- **Solução**: Verifique se `auth.uid()` está sendo usado corretamente

### Não consegue criar registros
- **Causa**: Política de INSERT muito restritiva
- **Solução**: Verifique se `user_id` está sendo definido como `auth.uid()`

## 🔍 Comandos Úteis para Debugging

### Verificar Usuário Atual
```sql
SELECT auth.uid() as current_user_id;
```

### Listar Todas as Políticas
```sql
SELECT * FROM pg_policies WHERE tablename = 'upcoming_expenses';
```

### Verificar RLS Status
```sql
SELECT schemaname, tablename, rowsecurity, enable_row_security
FROM pg_tables 
WHERE tablename = 'upcoming_expenses';
```

### Desabilitar RLS Temporariamente (para debug)
```sql
ALTER TABLE upcoming_expenses DISABLE ROW LEVEL SECURITY;
-- Lembre-se de reabilitar depois!
-- ALTER TABLE upcoming_expenses ENABLE ROW LEVEL SECURITY;
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Supabase Dashboard
2. Teste as queries diretamente no SQL Editor
3. Confirme que o usuário está autenticado (`auth.uid()` não é null)
4. Verifique se as políticas estão ativas e corretas

---
**✅ Após executar os scripts, suas políticas estarão ativas e protegerão os dados adequadamente!** 