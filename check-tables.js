import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltam variáveis de ambiente do Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  try {
    console.log('🔍 Verificando tabelas do Supabase...\n');
    
    // Lista de tabelas que esperamos encontrar baseado no código
    const expectedTables = [
      'products',
      'orders', 
      'order_items',
      'categories',
      'product_images',
      'shipping_addresses',
      'customers',
      'payments'
    ];
    
    console.log('🔍 Testando acesso às tabelas...');
    console.log('----------------------------------');
    
    const foundTables = [];
    const missingTables = [];
    
    for (const tableName of expectedTables) {
      try {
        const { data: tableData, error: tableError, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' })
          .limit(1);
          
        if (tableError) {
          console.log(`❌ ${tableName}: ${tableError.message}`);
          missingTables.push({ name: tableName, error: tableError.message });
        } else {
          console.log(`✅ ${tableName}: Acessível (${count || 0} registros total)`);
          foundTables.push({ name: tableName, count: count || 0 });
        }
      } catch (err) {
        console.log(`❌ ${tableName}: Erro de conexão - ${err.message}`);
        missingTables.push({ name: tableName, error: err.message });
      }
    }
    
    console.log('\n📊 RESUMO:');
    console.log('===========');
    console.log(`✅ Tabelas encontradas: ${foundTables.length}`);
    foundTables.forEach(table => {
      console.log(`   - ${table.name} (${table.count} registros)`);
    });
    
    if (missingTables.length > 0) {
      console.log(`\n❌ Tabelas com problemas: ${missingTables.length}`);
      missingTables.forEach(table => {
        console.log(`   - ${table.name}: ${table.error}`);
      });
    }
    
    // Testar uma query mais específica na tabela products se ela existir
    if (foundTables.find(t => t.name === 'products')) {
      console.log('\n🔍 Detalhes da tabela products:');
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('id, name, price, status')
        .limit(3);
        
      if (prodError) {
        console.log(`❌ Erro ao acessar produtos: ${prodError.message}`);
      } else {
        console.log('Primeiros produtos:');
        products?.forEach((product, i) => {
          console.log(`   ${i + 1}. ${product.name} - R$ ${product.price} (${product.status})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

listTables();
