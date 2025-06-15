# 🚀 Configuração Final do Google Drive - Micangueria

## ✅ Sistema Integrado

O sistema agora está completamente integrado para usar o Google Drive como fonte de imagens para os produtos. 

### 📁 Pasta Configurada
- **ID da Pasta**: `1fp36hi2E9rLWIpW7AaegAi7i7MWn8Rvp`
- **Link**: https://drive.google.com/drive/folders/1fp36hi2E9rLWIpW7AaegAi7i7MWn8Rvp

### 🔑 Próximos Passos - API Key

**1. Obter API Key do Google Drive:**

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google Drive API**:
   - Vá em "APIs e Serviços" > "Biblioteca"
   - Search "Google Drive API"
   - Clique em "Ativar"
4. Crie credenciais:
   - Vá em "APIs e Serviços" > "Credenciais"
   - Clique em "Criar Credenciais" > "Chave de API"
   - Copie a chave gerada

**2. Configurar no projeto:**

Substitua no arquivo `.env.local`:
```bash
NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY=SUA_API_KEY_AQUI
```

### 🖼️ Como Usar

1. **Upload de Imagens para o Google Drive:**
   - Acesse a pasta: https://drive.google.com/drive/folders/1fp36hi2E9rLWIpW7AaegAi7i7MWn8Rvp
   - Faça upload das imagens dos produtos
   - Certifique-se que as imagens estão em formato JPG, PNG ou WEBP

2. **No Admin do Site:**
   - Acesse o admin (`/admin`)
   - Crie ou edite um produto
   - Na seção "Imagens do Produto" clique em "Selecionar do Google Drive"
   - Selecione até 5 imagens
   - A primeira imagem será a principal

### 🔧 Recursos Implementados

- ✅ Seleção múltipla de imagens (até 5)
- ✅ Preview das imagens selecionadas
- ✅ Busca por nome de arquivo
- ✅ Indicação da imagem principal
- ✅ URLs públicas funcionais
- ✅ Fallback para upload tradicional
- ✅ Interface intuitiva e responsiva

### 📊 Funcionamento

1. **GoogleDrivePicker Component:**
   - Lista imagens da pasta específica
   - Permite seleção múltipla
   - Gera URLs públicas: `https://drive.google.com/uc?export=view&id=FILE_ID`

2. **Integração com Formulário:**
   - Salva URLs no campo `gallery_urls` da tabela `products`
   - Primeira imagem vai para `image_url`
   - Mantém compatibilidade com sistema existente

3. **Vantagens:**
   - Sem limitações de storage do Supabase
   - Fácil gerenciamento das imagens
   - URLs sempre funcionais
   - Interface profissional

### 🚀 Para Produção

Quando subir para produção (Vercel), certifique-se de:

1. Adicionar as variáveis de ambiente no Vercel:
   ```
   NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY=sua_api_key
   NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID=1fp36hi2E9rLWIpW7AaegAi7i7MWn8Rvp
   ```

2. Configurar restrições na API Key:
   - No Google Cloud Console
   - Restringir por domínio: `*.vercel.app` e seu domínio personalizado

### 🎯 Resultado Final

O admin agora permite:
- ✅ Seleção fácil de imagens do Google Drive
- ✅ Preview das imagens antes de salvar
- ✅ Múltiplas imagens por produto
- ✅ URLs públicas funcionais
- ✅ Interface profissional
- ✅ Backup com upload tradicional

**Status: 🟢 Implementação Completa - Pronto para Uso**
