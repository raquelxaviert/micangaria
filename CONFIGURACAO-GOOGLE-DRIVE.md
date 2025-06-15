# Configuração do Google Drive API

## 1. Configurar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** > **Library**
4. Procure e ative a **Google Drive API**
5. Vá em **APIs & Services** > **Credentials**
6. Clique em **Create Credentials** > **API Key**
7. Copie a API Key gerada

## 2. Configurar variáveis de ambiente

Adicione no arquivo `.env.local`:

```
NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID=1fp36hi2E9rLWIpW7AaegAi7i7MWn8Rvp
```

## 3. Instalar dependências

```bash
npm install googleapis
```

## 4. Configurar permissões da pasta

1. Abra sua pasta no Google Drive: https://drive.google.com/drive/folders/1fp36hi2E9rLWIpW7AaegAi7i7MWn8Rvp
2. Clique em **Compartilhar**
3. Mude para **Qualquer pessoa com o link**
4. Defina permissão como **Visualizador**
5. Copie o link de compartilhamento

## 5. Formato das URLs das imagens

Para acessar as imagens publicamente, use este formato:
```
https://drive.google.com/uc?export=view&id=ID_DO_ARQUIVO
```

Onde `ID_DO_ARQUIVO` é o ID único de cada imagem no Google Drive.
