-- ============================================================================
-- Script de Desenvolvimento - Permitir Inserções sem Autenticação
-- ============================================================================
-- 
-- ATENÇÃO: Este script é APENAS para desenvolvimento!
-- NUNCA use em produção sem revisar as políticas de segurança.
--
-- Este script permite inserções na tabela transactions mesmo sem
-- autenticação real, usando um user_id fixo para desenvolvimento.
--
-- UUID de desenvolvimento usado: 00000000-0000-0000-0000-000000000001
--
-- @author Vaidoso FC
-- @version 1.0.0 (DEV ONLY)
-- ============================================================================

-- ============================================================================
-- POLÍTICA TEMPORÁRIA PARA DESENVOLVIMENTO
-- ============================================================================

-- Remove todas as policies existentes (incluindo as temporárias se já existirem)
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow dev inserts (TEMPORARY)" ON public.transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow dev view (TEMPORARY)" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow dev delete (TEMPORARY)" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;

-- Cria policies permissivas para desenvolvimento
-- Permite inserções com qualquer user_id (apenas para desenvolvimento)
CREATE POLICY "Allow dev inserts (TEMPORARY)"
    ON public.transactions
    FOR INSERT
    WITH CHECK (true); -- Permite qualquer inserção

-- Permite ver todas as transações (apenas para desenvolvimento)
CREATE POLICY "Allow dev view (TEMPORARY)"
    ON public.transactions
    FOR SELECT
    USING (true); -- Permite ver todas as transações

-- Permite deletar qualquer transação (apenas para desenvolvimento)
CREATE POLICY "Allow dev delete (TEMPORARY)"
    ON public.transactions
    FOR DELETE
    USING (true); -- Permite deletar qualquer transação

-- Permite atualizar qualquer transação (apenas para desenvolvimento)
CREATE POLICY "Allow dev update (TEMPORARY)"
    ON public.transactions
    FOR UPDATE
    USING (true)
    WITH CHECK (true); -- Permite atualizar qualquer transação

-- Mantém a policy de UPDATE com RLS normal
-- (UPDATE pode manter a policy original se necessário)

-- ============================================================================
-- NOTA IMPORTANTE
-- ============================================================================
-- 
-- Estas policies permitem operações sem verificação de autenticação.
-- 
-- Para PRODUÇÃO, você DEVE:
-- 1. Remover todas as policies temporárias:
--    DROP POLICY IF EXISTS "Allow dev inserts (TEMPORARY)" ON public.transactions;
--    DROP POLICY IF EXISTS "Allow dev view (TEMPORARY)" ON public.transactions;
--    DROP POLICY IF EXISTS "Allow dev delete (TEMPORARY)" ON public.transactions;
--
-- 2. Recriar as policies originais seguras:
--    CREATE POLICY "Users can insert their own transactions"
--        ON public.transactions FOR INSERT
--        WITH CHECK (auth.uid() = user_id);
--    
--    CREATE POLICY "Users can view their own transactions"
--        ON public.transactions FOR SELECT
--        USING (auth.uid() = user_id);
--    
--    CREATE POLICY "Users can delete their own transactions"
--        ON public.transactions FOR DELETE
--        USING (auth.uid() = user_id);
--
-- ============================================================================

