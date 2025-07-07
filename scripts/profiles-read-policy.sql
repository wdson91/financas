-- Script para permitir que usuários autenticados vejam todos os perfis
-- Isso é necessário para popular o campo "Quem Pagou" com todos os usuários

-- Primeiro, vamos verificar as policies existentes
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Remover policy restritiva se existir
DROP POLICY IF EXISTS "Users can view own profile only" ON profiles;

-- Criar nova policy que permite ver todos os perfis para usuários autenticados
CREATE POLICY "Authenticated users can view all profiles" ON profiles
FOR SELECT USING (auth.role() = 'authenticated');

-- Manter as policies de INSERT/UPDATE/DELETE mais restritivas
CREATE POLICY "Users can insert own profile only" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile only" ON profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile only" ON profiles
FOR DELETE USING (auth.uid() = id);

-- Garantir que RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY; 