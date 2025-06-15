# Configuração Completa: Supabase Storage + Admin

## ✅ Mudanças Implementadas

### 1. **Código do Admin (src/app/admin/page.tsx)**
- ✅ Adicionado suporte para `image_storage_path` e `gallery_storage_paths`
- ✅ Melhorada verificação de URLs blob antes de salvar
- ✅ Aumentado tempo de espera para upload das imagens (3 segundos)
- ✅ Logs detalhados para debug do processo de upload
- ✅ Extração automática de storage paths das URLs do Supabase

### 2. **Upload Utils (src/lib/uploadUtils.ts)**
- ✅ Verificação automática da existência do bucket
- ✅ Logs detalhados de debug
- ✅ Tratamento de erros específicos (RLS, bucket missing)
- ✅ Retorno do storage path junto com a URL

### 3. **MultiImageUpload**
- ✅ Logs para debug do processo de upload
- ✅ Verificação de URLs blob no callback do pai

## 🔧 Configurações Necessárias

### 1. **Configure o Bucket no Supabase**

Execute um destes scripts no SQL Editor:
- `setup-storage-simples.sql` (mais simples)
- `setup-supabase-storage.sql` (mais completo)

Ou crie manualmente:
1. Acesse **Storage** > **Create Bucket**
2. Nome: `product-images`
3. ✅ **Marque "Public bucket"**
4. File size limit: 50MB

### 2. **Verifique a Configuração**

Execute `test-storage-config.sql` no SQL Editor para verificar:
```sql
SELECT id, name, public FROM storage.buckets WHERE id = 'product-images';
```

### 3. **Teste o Upload**

Execute `test-bucket-upload.js` no console do navegador (F12) para testar completamente.

## 📊 Esquema da Tabela

A tabela `products` agora salva:
- **`image_url`**: URL pública da imagem principal
- **`image_storage_path`**: Path no storage (ex: "products/arquivo.jpg")
- **`gallery_urls`**: Array de URLs públicas da galeria
- **`gallery_storage_paths`**: Array de paths no storage

## 🔄 Fluxo Completo

1. **Upload de Imagem**:
   - MultiImageUpload faz upload para `product-images/products/`
   - Retorna URL pública do Supabase
   - Atualiza formData com URLs finais

2. **Salvamento do Produto**:
   - Verifica se há URLs blob pendentes
   - Extrai storage paths das URLs do Supabase
   - Salva URLs + paths na tabela products

3. **Exibição**:
   - Cards usam `image_url` para mostrar imagens
   - Storage paths ficam para referência/backup

## 🐛 Debug

Se ainda houver problemas:

1. **Verifique o console** para logs detalhados
2. **Confirme o bucket** está público
3. **Execute o teste** de upload no navegador
4. **Verifique as políticas RLS** no Supabase

## 🎯 Resultado Esperado

Após criar/editar produto com imagens:
```json
{
  "image_url": "https://[projeto].supabase.co/storage/v1/object/public/product-images/products/1234567890.jpg",
  "image_storage_path": "products/1234567890.jpg",
  "gallery_urls": [
    "https://[projeto].supabase.co/storage/v1/object/public/product-images/products/abcdef.jpg"
  ],
  "gallery_storage_paths": ["products/abcdef.jpg"]
}
```

As URLs blob não devem mais aparecer no banco de dados!
