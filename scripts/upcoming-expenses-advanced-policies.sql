-- =========================================================
-- POLÍTICAS AVANÇADAS PARA UPCOMING_EXPENSES
-- =========================================================

-- Este arquivo contém políticas mais específicas e avançadas
-- para diferentes cenários de uso da tabela upcoming_expenses

-- =========================================================
-- POLÍTICAS BÁSICAS (mesmas do arquivo principal)
-- =========================================================

-- Habilitar Row Level Security
ALTER TABLE upcoming_expenses ENABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view their own upcoming expenses" ON upcoming_expenses;
DROP POLICY IF EXISTS "Users can insert their own upcoming expenses" ON upcoming_expenses;
DROP POLICY IF EXISTS "Users can update their own upcoming expenses" ON upcoming_expenses;
DROP POLICY IF EXISTS "Users can delete their own upcoming expenses" ON upcoming_expenses;

-- Política básica de SELECT
CREATE POLICY "Users can view their own upcoming expenses" 
ON upcoming_expenses
FOR SELECT 
USING (auth.uid() = user_id);

-- Política básica de INSERT
CREATE POLICY "Users can insert their own upcoming expenses" 
ON upcoming_expenses
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política básica de UPDATE
CREATE POLICY "Users can update their own upcoming expenses" 
ON upcoming_expenses
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política básica de DELETE
CREATE POLICY "Users can delete their own upcoming expenses" 
ON upcoming_expenses
FOR DELETE 
USING (auth.uid() = user_id);

-- =========================================================
-- POLÍTICAS AVANÇADAS (OPCIONAIS)
-- =========================================================

-- Para usar as políticas avançadas, primeiro remova as básicas e descomente as avançadas

-- POLÍTICA AVANÇADA 1: Impedir edição de despesas já pagas
/*
DROP POLICY IF EXISTS "Users can update their own upcoming expenses" ON upcoming_expenses;

CREATE POLICY "Users can update unpaid upcoming expenses" 
ON upcoming_expenses
FOR UPDATE 
USING (auth.uid() = user_id AND is_paid = false)
WITH CHECK (auth.uid() = user_id);
*/

-- POLÍTICA AVANÇADA 2: Impedir exclusão de despesas já pagas
/*
DROP POLICY IF EXISTS "Users can delete their own upcoming expenses" ON upcoming_expenses;

CREATE POLICY "Users can delete unpaid upcoming expenses" 
ON upcoming_expenses
FOR DELETE 
USING (auth.uid() = user_id AND is_paid = false);
*/

-- POLÍTICA AVANÇADA 3: Separar visualização por status de pagamento
/*
DROP POLICY IF EXISTS "Users can view their own upcoming expenses" ON upcoming_expenses;

CREATE POLICY "Users can view unpaid upcoming expenses" 
ON upcoming_expenses
FOR SELECT 
USING (auth.uid() = user_id AND is_paid = false);

CREATE POLICY "Users can view paid upcoming expenses" 
ON upcoming_expenses
FOR SELECT 
USING (auth.uid() = user_id AND is_paid = true);
*/

-- POLÍTICA AVANÇADA 4: Restringir criação de despesas com data passada
/*
DROP POLICY IF EXISTS "Users can insert their own upcoming expenses" ON upcoming_expenses;

CREATE POLICY "Users can insert future upcoming expenses" 
ON upcoming_expenses
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND due_date >= CURRENT_DATE
);
*/

-- POLÍTICA AVANÇADA 5: Permitir apenas marcar como pago (não desmarcar)
/*
DROP POLICY IF EXISTS "Users can update their own upcoming expenses" ON upcoming_expenses;

CREATE POLICY "Users can update upcoming expenses details" 
ON upcoming_expenses
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND (
    -- Se is_paid estava false, pode mudar para true ou manter false
    (SELECT is_paid FROM upcoming_expenses WHERE id = upcoming_expenses.id) = false
    OR 
    -- Se is_paid estava true, deve manter true
    (SELECT is_paid FROM upcoming_expenses WHERE id = upcoming_expenses.id) = true AND is_paid = true
  )
);
*/

-- =========================================================
-- FUNÇÕES AUXILIARES PARA POLÍTICAS
-- =========================================================

-- Função para verificar se uma data é futura
CREATE OR REPLACE FUNCTION is_future_date(date_to_check DATE)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN date_to_check >= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se o usuário pode editar a despesa
CREATE OR REPLACE FUNCTION can_edit_upcoming_expense(expense_id UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  expense_record upcoming_expenses%ROWTYPE;
BEGIN
  SELECT * INTO expense_record 
  FROM upcoming_expenses 
  WHERE id = expense_id;
  
  -- Verifica se a despesa existe e pertence ao usuário
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Verifica se pertence ao usuário
  IF expense_record.user_id != user_uuid THEN
    RETURN FALSE;
  END IF;
  
  -- Verifica se não está paga (só pode editar despesas não pagas)
  IF expense_record.is_paid = TRUE THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- POLÍTICAS USANDO FUNÇÕES AUXILIARES (AVANÇADAS)
-- =========================================================

-- POLÍTICA ULTRA AVANÇADA: Usando função personalizada
/*
DROP POLICY IF EXISTS "Users can update their own upcoming expenses" ON upcoming_expenses;

CREATE POLICY "Users can edit unpaid upcoming expenses via function" 
ON upcoming_expenses
FOR UPDATE 
USING (can_edit_upcoming_expense(id, auth.uid()))
WITH CHECK (can_edit_upcoming_expense(id, auth.uid()));
*/

-- =========================================================
-- TRIGGERS PARA AUDITORIA (OPCIONAIS)
-- =========================================================

-- Tabela de auditoria para acompanhar mudanças
/*
CREATE TABLE IF NOT EXISTS upcoming_expenses_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES upcoming_expenses(id),
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função trigger para auditoria
CREATE OR REPLACE FUNCTION audit_upcoming_expenses()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO upcoming_expenses_audit (expense_id, action, old_data, user_id)
    VALUES (OLD.id, 'DELETE', row_to_json(OLD), OLD.user_id);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO upcoming_expenses_audit (expense_id, action, old_data, new_data, user_id)
    VALUES (NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), NEW.user_id);
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO upcoming_expenses_audit (expense_id, action, new_data, user_id)
    VALUES (NEW.id, 'INSERT', row_to_json(NEW), NEW.user_id);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
CREATE TRIGGER upcoming_expenses_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON upcoming_expenses
  FOR EACH ROW EXECUTE FUNCTION audit_upcoming_expenses();
*/

-- =========================================================
-- VERIFICAÇÃO FINAL
-- =========================================================

-- Verificar todas as políticas ativas
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