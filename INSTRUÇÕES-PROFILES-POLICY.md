# Configuração de Policies para Tabela Profiles

## Problema Identificado

A tabela `public.profiles` estava com Row Level Security configurada para que cada usuário só pudesse ver seus próprios dados. Isso impedia que o campo "Quem Pagou" mostrasse todos os usuários disponíveis.

## Solução

Ajustar as policies para permitir que usuários autenticados vejam TODOS os perfis (apenas leitura), mas mantenham as restrições para modificação.

## Como Aplicar

### 1. Via SQL Editor no Supabase Dashboard

1. Acesse o painel do Supabase
2. Vá em **SQL Editor**
3. Execute o script `scripts/profiles-read-policy.sql`

### 2. Verificar se funcionou

Após aplicar, teste criando uma despesa. O campo "Quem Pagou" deve mostrar todos os usuários cadastrados.

## Estrutura das Policies Resultantes

- **SELECT**: Usuários autenticados podem ver todos os perfis
- **INSERT**: Usuário só pode criar seu próprio perfil  
- **UPDATE**: Usuário só pode atualizar seu próprio perfil
- **DELETE**: Usuário só pode deletar seu próprio perfil

## Segurança

Esta configuração é segura pois:
- Permite apenas **leitura** de todos os perfis
- Mantém **modificações** restritas ao próprio usuário
- Só usuários **autenticados** têm acesso

## Campos Visíveis

A consulta busca apenas:
- `id` (UUID do usuário)
- `full_name` (nome completo)

Emails e outros dados sensíveis não são expostos. 