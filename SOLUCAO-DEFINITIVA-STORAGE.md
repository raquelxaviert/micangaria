## SOLUÇÃO: Configurar Storage via Interface do Supabase

### ❌ Problema
- Scripts SQL falham com "must be owner of table objects"
- Usuários normais não têm permissão para alterar políticas RLS do Storage

### ✅ SOLUÇÃO DEFINITIVA: Via Interface

#### PASSO 1: Deletar bucket existente (se houver)
1. Acesse **Storage** no painel do Supabase
2. Se houver bucket `product-images`, clique nos **3 pontinhos** ao lado
3. Clique em **Delete bucket**
4. Confirme a exclusão

#### PASSO 2: Criar novo bucket
1. Clique em **New bucket**
2. **Bucket name:** `product-images`
3. **✅ IMPORTANTE: Marque "Public bucket"**
4. **File size limit:** 50 MB
5. **Allowed MIME types:** deixe vazio (aceita todos) ou adicione:
   ```
   image/jpeg,image/jpg,image/png,image/gif,image/webp
   ```
6. Clique em **Create bucket**

#### PASSO 3: Configurar políticas (Automático)
- Quando você marca "Public bucket", o Supabase cria automaticamente as políticas necessárias
- Não precisa fazer nada manual

#### PASSO 4: Verificar se funcionou
1. Vá em **Storage** > **product-images**
2. Deve aparecer a pasta vazia
3. Você pode testar fazendo upload manual de uma imagem

### 🧪 TESTE NO CÓDIGO

Após configurar, teste no console do navegador (F12):

```javascript
// Teste simples
const { createClient } = await import('/src/lib/supabase/client.js');
const supabase = createClient();

// Listar buckets
const { data, error } = await supabase.storage.listBuckets();
console.log('Buckets:', data?.map(b => b.name), 'Error:', error);

// Deve mostrar: ["product-images"]
```

### 🔍 SE AINDA NÃO FUNCIONAR

1. **Verifique as variáveis de ambiente:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Reinicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Limpe o cache do navegador** (Ctrl + F5)

### 🎯 RESULTADO ESPERADO

Após configurar via interface:
- ✅ Bucket `product-images` criado e público
- ✅ Upload de imagens funcionando
- ✅ URLs permanentes sendo geradas
- ✅ Sem mais URLs blob no banco de dados

Esta é a forma mais segura e garantida de configurar o Storage!
