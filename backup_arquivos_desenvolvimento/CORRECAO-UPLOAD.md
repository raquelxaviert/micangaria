# 🚨 CORREÇÃO URGENTE: Upload de Imagens

## PROBLEMA
O erro "Upload para Supabase falhou: new row violates row-level security policy" indica que as políticas de segurança do Supabase Storage não estão configuradas corretamente.

## SOLUÇÃO (Execute AGORA)

### Passo 1: Acessar Supabase Dashboard
1. Vá para: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto `micangaria`

### Passo 2: Executar SQL de Configuração
1. No dashboard, clique em **SQL Editor** (na barra lateral esquerda)
2. Clique em **New query**
3. **COPIE E COLE** todo o conteúdo do arquivo `supabase_storage_dev.sql`
4. Clique em **Run** (ou pressione Ctrl+Enter)

### Passo 3: Verificar Resultado
Você deve ver no final da execução:
```
✅ Configuração de Storage concluída com sucesso!
```

### Passo 4: Testar Upload
1. Volte para a aplicação: http://localhost:9002/test-upload
2. Clique em **Executar Teste**
3. Deve aparecer:
   ```
   ✅ Buckets: ["product-images"]
   ✅ Bucket product-images encontrado
   ✅ Upload bem-sucedido
   ✅ URL pública: https://...
   ✅ Arquivo removido
   ```

### Passo 5: Testar Admin
1. Vá para: http://localhost:9002/admin
2. Faça login com senha: `micangaria2024`
3. Clique em **Adicionar Produto**
4. Tente fazer upload de uma imagem
5. Deve funcionar sem erros!

## SE AINDA HOUVER PROBLEMAS

### Verificar Bucket
No Supabase Dashboard → Storage:
- Deve existir um bucket chamado `product-images`
- Deve estar marcado como **Public**

### Log de Debug
Abra o Console do navegador (F12) e veja os logs detalhados do erro.

## ARQUIVOS IMPORTANTES
- `supabase_storage_dev.sql` - Execute este no Supabase
- `src/app/test-upload/page.tsx` - Página de teste
- `src/components/ImageUploadSimple.tsx` - Componente com melhor tratamento de erro

## STATUS
- ✅ Componente `ImageUploadSimple` corrigido
- ✅ Admin usando componente correto
- ✅ SQL de configuração criado
- ❌ **PENDENTE: Executar SQL no Supabase**
- ❌ **PENDENTE: Testar upload funcionando**
