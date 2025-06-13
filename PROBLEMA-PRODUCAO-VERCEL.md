# 🚨 PROBLEMA: Pedidos não salvam em PRODUÇÃO (rugebrecho.com)

## ❌ **PROBLEMA IDENTIFICADO:**
- **Localhost**: Funciona ✅
- **Produção**: Não salva no Supabase ❌

## 🎯 **CAUSAS PROVÁVEIS:**

### **1. Variáveis de ambiente no Vercel**
### **2. Service Role Key incorreta**
### **3. CORS ou permissões**

## 🔧 **SOLUÇÕES:**

### **1. URGENTE: Configurar variáveis no Vercel**

#### **Acesse o painel do Vercel:**
1. https://vercel.com/dashboard
2. **Seu projeto** → Settings → Environment Variables

#### **Adicione TODAS essas variáveis:**

```bash
# === APP CONFIG ===
NEXT_PUBLIC_SITE_URL=https://rugebrecho.com
NEXT_PUBLIC_PRODUCTION_URL=https://rugebrecho.com
NEXT_PUBLIC_APP_URL=https://rugebrecho.com
NODE_ENV=production

# === SUPABASE CONFIG ===
NEXT_PUBLIC_SUPABASE_URL=https://koduoglrfzronbcgqrjc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Nzc3MzIsImV4cCI6MjA2NTE1MzczMn0.pQ62WyGKV5tyrYsEddp2h8zRVCDf1qZ23uE8z4-FPUI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU3NzczMiwiZXhwIjoyMDY1MTUzNzMyfQ._QzIHHde6bfku4CgZ3tEajjuinlyRldkRGj9AZfYuT0

# === ADMIN CONFIG ===
ADMIN_PASSWORD=micangaria2024

# === MERCADO PAGO SANDBOX (para testar em prod) ===
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-1462764550696594-061211-e1e1043f436264c9bf3ff42860b3a608-2490474713
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=APP_USR-eb3a9828-399f-4f0e-b120-ce476ca4e3ef
MERCADO_PAGO_SANDBOX=true
MP_STORE_TEST_EMAIL=test_user_285481368@testuser.com

# === MELHOR ENVIO CONFIG ===
MELHOR_ENVIO_SANDBOX=true
MELHOR_ENVIO_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NTYiLCJqdGkiOiJjNmM1ZjkyZjY1OTQxYWNiZjlhYzljYTMzOTVkYjIxOTVjZTIwNDc4NTllN2Q3MjIzYmY0MDcyOTI0NjU0NTJlNjIxZWFhZGMyZDI1MmQ2ZCIsImlhdCI6MTc0OTc1NTI5Ni4zNjA0MzksIm5iZiI6MTc0OTc1NTI5Ni4zNjA0NDEsImV4cCI6MTc4MTI5MTI5Ni4zNTA1OTksInN1YiI6IjlmMjIzNTUyLWM2NDAtNDNlNS1hYzVkLTM1YzgzNmNiNzMxNCIsInNjb3BlcyI6WyJjYXJ0LXJlYWQiLCJjYXJ0LXdyaXRlIiwiY29tcGFuaWVzLXJlYWQiLCJjb21wYW5pZXMtd3JpdGUiLCJjb3Vwb25zLXJlYWQiLCJjb3Vwb25zLXdyaXRlIiwibm90aWZpY2F0aW9ucy1yZWFkIiwib3JkZXJzLXJlYWQiLCJwcm9kdWN0cy1yZWFkIiwicHJvZHVjdHMtZGVzdHJveSIsInByb2R1Y3RzLXdyaXRlIiwicHVyY2hhc2VzLXJlYWQiLCJzaGlwcGluZy1jYWxjdWxhdGUiLCJzaGlwcGluZy1jYW5jZWwiLCJzaGlwcGluZy1jaGVja291dCIsInNoaXBwaW5nLWNvbXBhbmllcyIsInNoaXBwaW5nLWdlbmVyYXRlIiwic2hpcHBpbmctcHJldmlldyIsInNoaXBwaW5nLXByaW50Iiwic2hpcHBpbmctc2hhcmUiLCJzaGlwcGluZy10cmFja2luZyIsImVjb21tZXJjZS1zaGlwcGluZyIsInRyYW5zYWN0aW9ucy1yZWFkIiwidXNlcnMtcmVhZCIsInVzZXJzLXdyaXRlIiwid2ViaG9va3MtcmVhZCIsIndlYmhvb2tzLXdyaXRlIiwid2ViaG9va3MtZGVsZXRlIiwidGRlYWxlci13ZWJob29rIl19.K3s9W8hrx-15oRnRkb8sDgtFN0BXRGj0BtAri-3pcLGUW1-XP5Kli271u3hYKIaZyxdDi6IaaNDgUQv1HLaHYAHWg2O0dO9LmIEpESi1Ftl8DF45JUOpb9tDdGZU3zeFlJajO0DQhp_6fTM7P0E-mlftSlYsKiEmoDls4Whca7dLtVKflg9HLqw9aEs5oi0QZZhX71MtxUwxZ4hvA9dcaw5aC17fUpjyiSj_y1w802p8-jfzQVr-opjyEqIplLMD7-7lR7J_DP2iAkYfGEmPj8nX6L_lE97eDPCd3ga50Sryw6VeNhhsUmoOOF_Lzqqkaj0ExcXkPhD-oiV9q6oFhziSmmSnpySxeYuUKUHvNvPjUGGo6EvHZ267v5YqVRIrdnCg1OP2Hw2ddNVe6D3ba9hbGCoQwVilM7Tn-eEl7XWIppRIdpFvn6tAuETeD0yGaMqfUfmTkeC7QvaKOFpBu3Z6f76LP5iU1RNUgLFdcXA-HmAlV2ZU4-y7aMgjlERGxpEwdLIYqyLpFiC6QkZP5JeGvtv39HMLQpQ_5g1yWhctIVhs_rrt4qU
```

### **2. ADICIONAR LOGS PARA DEBUG:**

Vou adicionar logs para debugar o problema em produção.

### **3. REDEPLOY:**

Após configurar as variáveis, fazer novo deploy:
```bash
git add .
git commit -m "Fix production environment variables"
git push origin main
```

## 🔍 **COMO VERIFICAR:**

### **1. Logs do Vercel:**
- https://vercel.com/dashboard → Seu projeto → Functions
- Verificar logs da API `/api/checkout/create-preference`

### **2. Se continuar sem salvar:**
- Problema na Service Role Key
- Problema de CORS do Supabase

## 🎯 **PRIORIDADE:**

1. **Configurar variáveis no Vercel** ← URGENTE
2. **Verificar logs** 
3. **Redeploy e testar**
