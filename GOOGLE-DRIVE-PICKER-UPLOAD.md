# Google Drive Picker - Upload de Imagens

## Funcionalidades Implementadas

### ✅ Seleção de Imagens Existentes
- Visualização de todas as imagens da pasta configurada no Google Drive
- Preview com thumbnails
- Seleção múltipla (até 5 imagens por produto)
- Busca por nome de arquivo
- Indicador visual de seleção

### ✅ Upload de Novas Imagens
- Botão **+** para adicionar novas imagens
- Suporte a múltiplos arquivos
- Validação de tipo (apenas imagens)
- Validação de tamanho (máximo 10MB por imagem)
- Preview temporário das imagens selecionadas

### ✅ Controles e Navegação
- Botão de refresh para recarregar a lista
- Botão para abrir diretamente a pasta no Google Drive
- Busca em tempo real
- Contador de seleção

## Fluxo do Usuário

### Para Usar Imagens Existentes:
1. Clique em "Selecionar do Google Drive"
2. Navegue pelas imagens disponíveis
3. Clique nas imagens desejadas para selecioná-las
4. Use a busca se necessário
5. Clique em "Confirmar" para aplicar

### Para Adicionar Novas Imagens:
1. Clique em "Selecionar do Google Drive"
2. Clique no botão **+** na barra de controles
3. Selecione as imagens do seu computador
4. As imagens aparecerão como preview temporário
5. Clique no botão da pasta (📁) para abrir o Google Drive
6. Faça upload manual das imagens para a pasta
7. Volte ao picker e clique no botão de refresh (🔄)
8. Selecione as imagens recém-enviadas
9. Clique em "Confirmar"

## Configuração Necessária

### Variáveis de Ambiente (.env.local):
```bash
NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID=id_da_pasta_de_imagens
```

### Pasta do Google Drive:
- Deve estar configurada como pública para leitura
- Deve permitir visualização de qualquer pessoa com o link
- Recomenda-se criar uma pasta específica para imagens de produtos

## Melhorias Futuras Possíveis

1. **Upload Direto**: Implementar OAuth para upload direto (mais complexo)
2. **Drag & Drop**: Arrastar arquivos diretamente para o componente
3. **Organização**: Subpastas por categoria de produto
4. **Compressão**: Otimização automática de imagens antes do upload
5. **Batch Operations**: Operações em lote (deletar, mover, etc.)

## Notas Técnicas

- O upload é feito em duas etapas devido às limitações da API do Google Drive sem OAuth
- As imagens são convertidas para URLs públicas do formato `https://drive.google.com/uc?export=view&id=FILE_ID`
- O componente funciona com qualquer pasta pública do Google Drive
- As imagens são automaticamente filtradas (apenas arquivos de imagem são exibidos)
