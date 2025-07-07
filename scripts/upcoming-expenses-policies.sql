-- =========================================================
-- POLÍTICAS PARA TABELA UPCOMING_EXPENSES
-- =========================================================

-- Primeiro, garantir que a tabela existe
CREATE TABLE IF NOT EXISTS upcoming_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  due_date DATE NOT NULL,
  payer TEXT NOT NULL,
  user_id UUID NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE upcoming_expenses ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (caso já existam)
DROP POLICY IF EXISTS "Users can view their own upcoming expenses" ON upcoming_expenses;
DROP POLICY IF EXISTS "Users can insert their own upcoming expenses" ON upcoming_expenses;
DROP POLICY IF EXISTS "Users can update their own upcoming expenses" ON upcoming_expenses;
DROP POLICY IF EXISTS "Users can delete their own upcoming expenses" ON upcoming_expenses;

-- Política para VISUALIZAR (SELECT)
-- Usuários só podem ver suas próprias despesas a vencer
CREATE POLICY "Users can view their own upcoming expenses" 
ON upcoming_expenses
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para INSERIR (INSERT)
-- Usuários só podem criar despesas a vencer para si mesmos
CREATE POLICY "Users can insert their own upcoming expenses" 
ON upcoming_expenses
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para ATUALIZAR (UPDATE)
-- Usuários só podem atualizar suas próprias despesas a vencer
CREATE POLICY "Users can update their own upcoming expenses" 
ON upcoming_expenses
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política para DELETAR (DELETE)
-- Usuários só podem deletar suas próprias despesas a vencer
CREATE POLICY "Users can delete their own upcoming expenses" 
ON upcoming_expenses
FOR DELETE 
USING (auth.uid() = user_id);

-- =========================================================
-- VERIFICAÇÃO DAS POLÍTICAS CRIADAS
-- =========================================================

-- Query para verificar se as políticas foram criadas corretamente
-- Execute esta query após rodar o script para confirmar
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'upcoming_expenses'
ORDER BY policyname;

-- =========================================================
-- TESTE DAS POLÍTICAS (OPCIONAL)
-- =========================================================

-- Para testar se as políticas estão funcionando, você pode:

-- 1. Inserir uma despesa a vencer (deve funcionar apenas para o usuário logado)
-- INSERT INTO upcoming_expenses (name, amount, category, due_date, payer, user_id)
-- VALUES ('Teste Conta', 100.00, 'Moradia', '2024-02-01', 'Teste', auth.uid());

-- 2. Tentar visualizar todas as despesas (deve retornar apenas as do usuário logado)
-- SELECT * FROM upcoming_expenses;

-- 3. Tentar atualizar uma despesa (deve funcionar apenas para despesas próprias)
-- UPDATE upcoming_expenses SET is_paid = true WHERE name = 'Teste Conta';

-- 4. Tentar deletar uma despesa (deve funcionar apenas para despesas próprias)
-- DELETE FROM upcoming_expenses WHERE name = 'Teste Conta'; 