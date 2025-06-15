import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructures() {
  try {
    console.log('🔍 Verificando estrutura das tabelas existentes...\n');
    
    const existingTables = ['products', 'orders', 'categories'];
    
    for (const tableName of existingTables) {
      console.log(`📋 TABELA: ${tableName.toUpperCase()}`);
      console.log('=' .repeat(30));
      
      // Pegar alguns registros para ver a estrutura
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(2);
        
      if (error) {
        console.log(`❌ Erro: ${error.message}\n`);
        continue;
      }
      
      if (!data || data.length === 0) {
        console.log('⚠️ Tabela vazia\n');
        continue;
      }
      
      // Mostrar as colunas baseado no primeiro registro
      const columns = Object.keys(data[0]);
      console.log(`📊 Colunas (${columns.length}):`);
      columns.forEach((col, i) => {
        const value = data[0][col];
        const type = typeof value;
        const sample = value !== null ? 
          (type === 'string' && value.length > 30 ? value.substring(0, 30) + '...' : value) 
          : 'null';
        console.log(`   ${i + 1}. ${col} (${type}): ${sample}`);
      });
      
      console.log(`\n📈 Total de registros: Vamos verificar...`);
      
      // Contar total de registros
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.log(`❌ Erro ao contar: ${countError.message}`);
      } else {
        console.log(`📈 Total de registros: ${count}`);
      }
      
      console.log('\n' + '-'.repeat(50) + '\n');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkTableStructures();
