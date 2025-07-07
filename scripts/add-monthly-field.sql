-- Script para adicionar o campo is_monthly na tabela upcoming_expenses
-- Executar no SQL Editor do Supabase

-- Adicionar a coluna is_monthly
ALTER TABLE public.upcoming_expenses 
ADD COLUMN is_monthly BOOLEAN DEFAULT false NOT NULL;

-- Atualizar todas as despesas existentes para não serem mensais por padrão
UPDATE public.upcoming_expenses 
SET is_monthly = false 
WHERE is_monthly IS NULL;

-- Verificar se a coluna foi adicionada com sucesso
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'upcoming_expenses' 
AND table_schema = 'public'
ORDER BY ordinal_position; 