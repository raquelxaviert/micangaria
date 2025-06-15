## 🔧 SOLUÇÃO: Erro "bucketId is required"

### PROBLEMA
Mesmo após recriar o bucket, ainda aparece: "Failed to retrieve folder contents from product-images: bucketId is required"

### ✅ SOLUÇÕES (execute em ordem)

#### 1. LIMPAR CACHE DO NAVEGADOR
- Feche completamente o navegador
- Reabra e acesse o Supabase Dashboard
- Ou use Ctrl + F5 para refresh forçado

#### 2. VERIFICAR SE O BUCKET EXISTE REALMENTE
Execute no SQL Editor do Supabase:
```sql
SELECT * FROM storage.buckets WHERE id = 'product-images';
```
Deve retornar uma linha com o bucket.

#### 3. VERIFICAR PERMISSÕES VIA SQL
Execute no SQL Editor:
```sql
-- Verificar se RLS está ativo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'buckets' AND schemaname = 'storage';

-- Verificar políticas existentes
SELECT policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'buckets' AND schemaname = 'storage';
```

#### 4. RECRIAR COM CONFIGURAÇÃO ESPECÍFICA
Execute este SQL para garantir configuração correta:
```sql
-- Deletar completamente
DELETE FROM storage.objects WHERE bucket_id = 'product-images';
DELETE FROM storage.buckets WHERE id = 'product-images';

-- Recriar com configuração específica
INSERT INTO storage.buckets (
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  avif_autodetection,
  created_at,
  updated_at
) VALUES (
  'product-images',
  'product-images',
  true,
  52428800,
  ARRAY['image/*'],
  false,
  NOW(),
  NOW()
);
```

#### 5. CONFIGURAR POLÍTICAS MANUALMENTE
Se ainda não funcionar, configure as políticas via interface:

1. Vá em **Storage** > **Policies**
2. Clique em **New Policy**
3. Selecione **For buckets table**
4. **Policy name:** "Allow bucket access"
5. **Allowed operation:** All
6. **Target roles:** public
7. **USING expression:** `true`
8. **WITH CHECK:** `true`

#### 6. TESTE ALTERNATIVO: USAR BROWSER PRIVADO
- Abra uma aba privada/incógnito
- Acesse o Supabase Dashboard
- Vá em Storage para verificar se o erro persiste

#### 7. VERIFICAR BROWSER E EXTENSÕES
- Desative extensões do navegador temporariamente
- Tente em outro navegador (Chrome, Firefox, Edge)

#### 8. ÚLTIMA OPÇÃO: CRIAR BUCKET COM NOME DIFERENTE
Se nada funcionar, tente:
```sql
-- Criar com nome diferente
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-imgs', 'product-imgs', true);
```

Depois ajuste o código para usar 'product-imgs' em vez de 'product-images':
```typescript
// Em src/lib/uploadUtils.ts, mude:
.from('product-images') // para:
.from('product-imgs')
```

### 🔍 DEBUG ADICIONAL

Execute no console do navegador (F12):
```javascript
// Teste de conectividade
const { createClient } = supabase;
const client = createClient(
  'SUA_URL_SUPABASE', 
  'SUA_CHAVE_PUBLICA'
);

// Testar listagem
const { data, error } = await client.storage.listBuckets();
console.log('Buckets:', data, 'Error:', error);

// Testar acesso específico
const { data: files, error: filesError } = await client.storage
  .from('product-images')
  .list('');
console.log('Files:', files, 'Error:', filesError);
```

### 🎯 SE NADA FUNCIONAR
Pode ser um bug temporário do Supabase. Aguarde algumas horas ou:
1. Entre em contato com o suporte do Supabase
2. Use um bucket com nome diferente temporariamente
3. Verifique se há manutenção programada no Supabase
