# 🗑️ Como Deletar Usuário do Supabase

## 🎯 **Método Manual (Recomendado)**

### 1. **Acesse o Painel do Supabase:**
```
https://app.supabase.com
```

### 2. **Vá para Authentication > Users:**
- No menu lateral, clique em **"Authentication"**
- Clique em **"Users"**
- Você verá a lista de usuários cadastrados

### 3. **Delete o Usuário:**
- Encontre o usuário (provavelmente `wdson91@gmail.com`)
- Clique nos **três pontos (⋮)** ao lado do usuário
- Selecione **"Delete user"**
- Confirme a ação

### 4. **Limpe as Tabelas (Opcional):**
Se quiser limpar todos os dados das tabelas também:

- Vá para **"Table Editor"**
- Para cada tabela (`expenses`, `upcoming_expenses`, `goals`, `shopping_items`):
  - Clique na tabela
  - Selecione todas as linhas (se houver)
  - Clique em **"Delete"**

## 🔧 **Método via SQL (Alternativo)**

Se preferir usar SQL, vá para **SQL Editor** e execute:

```sql
-- 1. Deletar todos os dados das tabelas
DELETE FROM expenses;
DELETE FROM upcoming_expenses;
DELETE FROM goals;
DELETE FROM shopping_items;

-- 2. Para deletar usuário, você precisa usar o painel Admin
-- (Não é possível via SQL com chave anônima)
```

## ✅ **Verificar se Foi Deletado:**

1. **Authentication > Users**: Lista deve estar vazia
2. **Table Editor**: Tabelas devem estar vazias
3. **No app**: Tentar fazer login deve dar erro "Invalid credentials"

## 🆕 **Depois de Deletar:**

1. **Teste o cadastro**: Vá para http://localhost:3001
2. **Cadastre-se novamente**: Use wdson91@gmail.com / 94019543
3. **Teste as funcionalidades**: Adicione despesas e veja salvando

---

**💡 O erro "Invalid login credentials" que apareceu confirma que o usuário não existe ou tem credenciais diferentes.**

**🎯 Próximo passo: Acesse o painel do Supabase e delete manualmente, depois teste o cadastro novamente!** 