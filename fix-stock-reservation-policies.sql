-- Corrigir políticas RLS para stock_reservations
-- Permitir que todos os usuários vejam reservas ativas

-- 1. Desabilitar RLS temporariamente para verificar dados
ALTER TABLE stock_reservations DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se há reservas ativas
SELECT 
    id,
    product_id,
    user_id,
    status,
    expires_at,
    created_at
FROM stock_reservations 
WHERE status = 'active' 
AND expires_at > NOW()
ORDER BY created_at DESC;

-- 3. Recriar políticas RLS corretas
ALTER TABLE stock_reservations ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos vejam reservas ativas (para verificar status do produto)
DROP POLICY IF EXISTS "Allow public read access to active reservations" ON stock_reservations;
CREATE POLICY "Allow public read access to active reservations" ON stock_reservations
    FOR SELECT
    USING (
        status = 'active' 
        AND expires_at > NOW()
    );

-- Política para permitir que usuários vejam suas próprias reservas
DROP POLICY IF EXISTS "Users can view their own reservations" ON stock_reservations;
CREATE POLICY "Users can view their own reservations" ON stock_reservations
    FOR SELECT
    USING (
        auth.uid() = user_id
    );

-- Política para permitir que usuários criem suas próprias reservas
DROP POLICY IF EXISTS "Users can create their own reservations" ON stock_reservations;
CREATE POLICY "Users can create their own reservations" ON stock_reservations
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

-- Política para permitir que usuários atualizem suas próprias reservas
DROP POLICY IF EXISTS "Users can update their own reservations" ON stock_reservations;
CREATE POLICY "Users can update their own reservations" ON stock_reservations
    FOR UPDATE
    USING (
        auth.uid() = user_id
    )
    WITH CHECK (
        auth.uid() = user_id
    );

-- Política para permitir que usuários deletem suas próprias reservas
DROP POLICY IF EXISTS "Users can delete their own reservations" ON stock_reservations;
CREATE POLICY "Users can delete their own reservations" ON stock_reservations
    FOR DELETE
    USING (
        auth.uid() = user_id
    );

-- 4. Verificar políticas criadas
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
WHERE tablename = 'stock_reservations'
ORDER BY policyname; 