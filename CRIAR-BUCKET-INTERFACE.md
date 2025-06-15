# MÉTODO ALTERNATIVO: Criar Bucket via Interface

## 🔧 Passo a Passo - Interface do Supabase

### 1. Acesse o Dashboard
- Vá para https://supabase.com/dashboard
- Selecione seu projeto

### 2. Navegue para Storage
- No menu lateral, clique em **Storage**
- Você verá a lista de buckets existentes

### 3. Criar o Bucket
- Clique no botão **"New bucket"** ou **"Create bucket"**
- Preencha os dados:
  ```
  Name: product-images
  Public: ✅ SIM (muito importante!)
  File size limit: 50 MB
  Allowed MIME types: image/jpeg,image/jpg,image/png,image/gif,image/webp
  ```
- Clique em **Create bucket**

### 4. Verificar se foi criado
- O bucket `product-images` deve aparecer na lista
- Clique nele para verificar se está vazio (normal)
- Verifique se aparece um ícone de "público" ao lado do nome

### 5. Configurar Políticas (se necessário)
- Vá em **Storage** > **Policies**
- Se não houver políticas para `product-images`, clique em **New policy**
- Para cada operação (SELECT, INSERT, UPDATE, DELETE):
  ```
  Policy name: Allow public [OPERATION] on product-images
  Allowed operation: [SELECT/INSERT/UPDATE/DELETE]
  Target roles: public
  USING expression: bucket_id = 'product-images'
  WITH CHECK expression: bucket_id = 'product-images' (apenas para INSERT/UPDATE)
  ```

## 🧪 Teste Rápido

Após criar o bucket, teste no console do navegador (F12):

```javascript
// Teste básico - listar buckets
const { data, error } = await supabase.storage.listBuckets();
console.log('Buckets:', data?.map(b => b.name), 'Error:', error);

// Deve mostrar 'product-images' na lista
```

## ⚠️ Problemas Comuns

1. **Bucket não público**: Certifique-se de marcar "Public" durante a criação
2. **Permissões**: Se der erro, verifique as políticas RLS
3. **Cache**: Às vezes é necessário aguardar alguns minutos para propagação

## 🎯 Resultado Esperado

Após a criação via interface:
- Bucket `product-images` visível no dashboard
- Ícone de "público" ao lado do nome
- Possibilidade de fazer upload manual de teste

Este método via interface é mais confiável que SQL direto!
