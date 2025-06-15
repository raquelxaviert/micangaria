## Configuração Manual do Storage via Interface do Supabase

### MÉTODO 1: Via Interface (Recomendado)

1. **Acesse o painel do Supabase:**
   - Vá para https://supabase.com/dashboard
   - Selecione seu projeto

2. **Criar o Bucket:**
   - Clique em **Storage** no menu lateral
   - Clique em **Create Bucket**
   - Nome: `product-images`
   - **✅ Marque "Public bucket"** (importante!)
   - File size limit: 50MB
   - Allowed MIME types: `image/jpeg,image/jpg,image/png,image/gif,image/webp`
   - Clique em **Create bucket**

3. **Configurar Políticas (se necessário):**
   - Vá em **Storage** > **Policies**
   - Se não houver políticas, clique em **Add policy**
   - Para o bucket `product-images`, adicione:
     - **Policy name:** `Public read access`
     - **Allowed operation:** SELECT
     - **Target roles:** public
     - **USING expression:** `bucket_id = 'product-images'`
     
   - Adicione outra política:
     - **Policy name:** `Public upload access`
     - **Allowed operation:** INSERT
     - **Target roles:** public
     - **WITH CHECK expression:** `bucket_id = 'product-images'`

### MÉTODO 2: SQL Simplificado (se o método 1 não funcionar)

Execute apenas isso no SQL Editor:

```sql
-- Apenas criar o bucket público
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;
```

### MÉTODO 3: Configuração via Dashboard > Settings

1. Vá em **Settings** > **Storage**
2. Verifique se RLS está **desabilitado** para testing
3. Ou configure as policies corretas

### Verificar se funcionou:

Após configurar, teste com este código no console do navegador (F12):

```javascript
// Teste no console do navegador
const { createClient } = supabase;
const supabaseClient = createClient('SUA_URL', 'SUA_KEY');

// Listar buckets
const { data, error } = await supabaseClient.storage.listBuckets();
console.log('Buckets:', data, 'Error:', error);

// Deve mostrar o bucket 'product-images'
```
