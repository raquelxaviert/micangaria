# Estrutura do Banco de Dados Supabase

## 📊 Tabelas Existentes

### Tabelas Principais (🔓 Públicas)
- `categories` - Categorias de produtos
- `collection_products` - Relação entre coleções e produtos  
- `collections` - Coleções de produtos
- `orders` - Pedidos/Compras
- `products` - Produtos do catálogo
- `user_favorites` - Produtos favoritos dos usuários

### Views/Tabelas Auxiliares (🔒 Protegidas)
- `collections_with_counts` - View com contagem de produtos por coleção
- `product_styles` - Estilos de produtos
- `product_types` - Tipos de produtos  
- `products_with_collections` - View de produtos com suas coleções

---

## 🏗️ Estrutura Detalhada das Tabelas

### `products` (3 registros)
**Campos principais:**
- `id` (UUID) - Chave primária
- `created_at` / `updated_at` - Timestamps
- `name` - Nome do produto
- `description` - Descrição detalhada
- `price` - Preço atual
- `compare_at_price` - Preço original (para desconto)
- `cost_price` - Preço de custo
- `category_id` - FK para categories
- `type` / `style` - Tipo e estilo do produto
- `collection` - Nome da coleção

**Imagens:**
- `image_url` / `image_alt` - Imagem principal
- `gallery_urls` - Array de URLs de galeria
- `image_storage_path` / `gallery_storage_paths` - Caminhos no storage

**Variantes:**
- `colors` - Cores disponíveis
- `materials` - Materiais do produto
- `sizes` - Tamanhos disponíveis
- `weight_grams` - Peso em gramas

**Inventário:**
- `sku` - Código do produto
- `barcode` - Código de barras
- `track_inventory` - Se controla estoque
- `quantity` - Quantidade disponível
- `allow_backorder` - Permite venda sem estoque

**SEO e Marketing:**
- `slug` - URL amigável
- `meta_title` / `meta_description` - Meta tags
- `search_keywords` - Palavras-chave de busca
- `tags` - Tags do produto

**Status e Promoções:**
- `is_active` - Produto ativo
- `is_featured` - Produto em destaque
- `is_new_arrival` - Produto novo
- `is_on_sale` - Em promoção
- `sale_start_date` / `sale_end_date` - Período de promoção
- `promotion_text` - Texto promocional

**Badges:**
- `show_colors_badge` - Mostrar badge de cores
- `show_materials_badge` - Mostrar badge de materiais
- `show_sizes_badge` - Mostrar badge de tamanhos

**Outros:**
- `vendor` - Fornecedor
- `notes` - Observações internas
- `care_instructions` - Instruções de cuidado

### `categories` (7 registros)
- `id` (UUID) - Chave primária
- `created_at` - Timestamp de criação
- `name` - Nome da categoria
- `description` - Descrição da categoria
- `slug` - URL amigável
- `is_active` - Status ativo/inativo

### `collections` (4 registros)
- `id` (UUID) - Chave primária
- `created_at` - Timestamp de criação
- `name` - Nome da coleção
- `description` - Descrição da coleção
- `slug` - URL amigável
- `is_active` - Status ativo/inativo
- `image_url` - Imagem da coleção
- `sort_order` - Ordem de exibição

### `orders` (0 registros - ⚠️ VAZIA)
**Estrutura esperada:**
- `id` (UUID) - Chave primária
- `created_at` / `updated_at` - Timestamps
- `status` - Status do pedido (pending, completed, cancelled, etc.)
- `total` - Valor total do pedido
- `subtotal` - Subtotal dos produtos
- `shipping_cost` - Custo do frete
- `tax_amount` - Valor dos impostos
- `discount_amount` - Valor do desconto
- `currency` - Moeda (BRL)
- `payment_method` - Método de pagamento
- `payment_status` - Status do pagamento
- `external_reference` - Referência externa (Mercado Pago)
- `customer_email` - Email do cliente
- `customer_name` - Nome do cliente
- `customer_phone` - Telefone do cliente
- `shipping_address` - Endereço de entrega (JSON)
- `billing_address` - Endereço de cobrança (JSON)
- `notes` - Observações do pedido

### `collection_products` (Tabela de Relacionamento)
- `id` (UUID) - Chave primária
- `collection_id` (UUID) - FK para collections
- `product_id` (UUID) - FK para products
- `sort_order` - Ordem do produto na coleção
- `created_at` - Timestamp

### `user_favorites`
- `id` (UUID) - Chave primária
- `user_id` (UUID) - ID do usuário
- `product_id` (UUID) - FK para products
- `created_at` - Timestamp

### `product_styles` (🔒 Protegida)
- Tabela auxiliar para tipos de estilos de produtos

### `product_types` (🔒 Protegida)
- Tabela auxiliar para tipos de produtos

---

## 🔗 Relacionamentos

### Relacionamentos Principais:
1. **`products` ← `categories`**
   - `products.category_id` → `categories.id`
   - Relacionamento: N:1 (muitos produtos para uma categoria)

2. **`products` ↔ `collections`**
   - Via tabela: `collection_products`
   - `collection_products.product_id` → `products.id`
   - `collection_products.collection_id` → `collections.id`
   - Relacionamento: N:N (muitos para muitos)

3. **`user_favorites` → `products`**
   - `user_favorites.product_id` → `products.id`
   - Relacionamento: N:1 (muitos favoritos para um produto)

4. **`orders` → `products`** (implícito)
   - Relacionamento através de order_items (tabela não visível/criada)
   - Deve existir uma tabela `order_items` ligando pedidos aos produtos

### Views/Relacionamentos Auxiliares:
- **`collections_with_counts`**: View que combina `collections` com contagem de produtos
- **`products_with_collections`**: View que combina `products` com suas coleções

---

## ⚠️ Problemas Identificados

1. **Tabela `orders` vazia**: Pode indicar problema no processo de checkout
2. **Falta tabela `order_items`**: Necessária para relacionar pedidos com produtos
3. **Relacionamentos implícitos**: Alguns relacionamentos podem não estar bem definidos

---

## 🚀 Status do Banco

- ✅ **Produtos**: 3 produtos cadastrados com estrutura completa
- ✅ **Categorias**: 7 categorias ativas  
- ✅ **Coleções**: 4 coleções definidas
- ⚠️ **Pedidos**: 0 pedidos (problema potencial)
- ✅ **Estrutura**: Bem organizada para e-commerce

---

*Documento gerado em: ${new Date().toLocaleDateString('pt-BR')}*
*Última verificação: Projeto Micangueria - Ruge Brechó*
