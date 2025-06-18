-- Teste para verificar produtos vendidos
-- Este script verifica se a API consegue identificar produtos vendidos

-- 1. Verificar se há pedidos com status 'paid'
SELECT 
    id,
    status,
    payment_status,
    items,
    created_at
FROM orders 
WHERE status = 'paid'
ORDER BY created_at DESC;

-- 2. Verificar se há reservas ativas para produtos vendidos
SELECT 
    sr.id,
    sr.product_id,
    sr.status,
    sr.expires_at,
    o.status as order_status
FROM stock_reservations sr
LEFT JOIN orders o ON o.items::text LIKE '%' || sr.product_id || '%'
WHERE sr.status = 'active'
AND o.status = 'paid';

-- 3. Verificar produtos específicos que devem aparecer como vendidos
-- Substitua '1ba7687a-f1ce-4df2-8962-bbb2320cfa48' pelo ID do produto que você quer testar
SELECT 
    'Produto Teste' as produto,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM orders 
            WHERE status = 'paid' 
            AND items::text LIKE '%1ba7687a-f1ce-4df2-8962-bbb2320cfa48%'
        ) THEN 'VENDIDO'
        WHEN EXISTS (
            SELECT 1 FROM stock_reservations 
            WHERE product_id = '1ba7687a-f1ce-4df2-8962-bbb2320cfa48'
            AND status = 'active'
            AND expires_at > NOW()
        ) THEN 'RESERVADO'
        ELSE 'DISPONÍVEL'
    END as status_atual; 