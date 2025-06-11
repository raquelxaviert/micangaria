# 🏷️ BADGES DE MATERIAIS E TAMANHOS

## ✅ STATUS ATUAL
O código já está implementado e funcionando! Os badges aparecerão automaticamente quando você adicionar os dados no Supabase.

## 📋 CAMPOS NO SUPABASE
Você precisa adicionar dados nos seguintes campos da tabela `products`:

### **materials** (array de strings)
Exemplos de valores:
```json
["prata 925", "ouro 18k", "couro legítimo"]
["algodão", "seda", "poliéster"]
["pérolas", "cristais", "pedras naturais"]
```

### **sizes** (array de strings)  
Exemplos de valores:
```json
["P", "M", "G"]
["Único", "Ajustável"]
["36", "37", "38", "39"]
["40cm", "45cm", "50cm"]
```

## 🎨 COMO OS BADGES APARECEM

### **Badge de Material:**
- **Posição:** Logo acima do título do produto
- **Estilo:** `variant="outline"` (borda fina)
- **Exibe:** Apenas o **primeiro material** da lista
- **Exemplo:** `prata 925`, `couro legítimo`, `algodão`

### **Badge de Tamanho:**
- **Posição:** Ao lado do badge de material
- **Estilo:** `variant="secondary"` (fundo cinza)
- **Exibe:** Apenas o **primeiro tamanho** da lista
- **Exemplo:** `P`, `Único`, `36`, `40cm`

## 📝 EXEMPLO DE PRODUTO NO SUPABASE

```sql
-- Exemplo: Colar de prata
UPDATE products 
SET 
  materials = '["prata 925", "pedras naturais"]',
  sizes = '["40cm", "45cm", "50cm"]'
WHERE id = 'seu-produto-id';

-- Exemplo: Bolsa de couro
UPDATE products 
SET 
  materials = '["couro legítimo", "tecido"]',
  sizes = '["Único"]'
WHERE id = 'seu-produto-id';

-- Exemplo: Anel ajustável
UPDATE products 
SET 
  materials = '["ouro 18k", "cristais"]',
  sizes = '["Ajustável"]'
WHERE id = 'seu-produto-id';
```

## 🔧 COMO ADICIONAR VIA INTERFACE DO SUPABASE

1. **Acesse o Supabase Dashboard**
2. **Vá para Table Editor > products**
3. **Clique no produto que quer editar**
4. **Nos campos `materials` e `sizes`:**
   - Clique no campo
   - Digite no formato: `["item1", "item2", "item3"]`
   - Clique em "Save"

## 📱 RESPONSIVIDADE DOS BADGES

### **Versão Desktop:**
- Badges maiores: `px-1.5 py-0.5 h-5`
- Mais espaçados

### **Versão Mobile/Compact:**
- Badges menores: `px-1 py-0 h-4`
- Mais compactos para economizar espaço

## 🎯 PRÓXIMOS PASSOS

1. **✅ Código implementado:** Pronto para usar
2. **🔲 Adicionar dados:** Você precisa popular os campos no Supabase
3. **🔲 Testar:** Ver os badges aparecem nos produtos
4. **🔲 Ajustar:** Se necessário, modificar estilos ou exibição

## 💡 DICAS

- **Materials:** Sempre coloque o material principal primeiro (ex: "prata 925", "ouro 18k")
- **Sizes:** Para produtos únicos, use `["Único"]` ou `["Ajustável"]`
- **Formatting:** Use sempre arrays JSON válidos: `["item1", "item2"]`
- **Display:** Apenas o primeiro item de cada array será exibido no badge

## ⚠️ IMPORTANTE

Se os badges não aparecerem mesmo com dados adicionados:
1. Verifique o formato JSON dos dados
2. Recarregue a página (Ctrl+F5)
3. Verifique o console do navegador para erros
4. Confirme que os campos estão preenchidos corretamente no Supabase
