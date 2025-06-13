const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://koduoglrfzronbcgqrjc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU3NzczMiwiZXhwIjoyMDY1MTUzNzMyfQ._QzIHHde6bfku4CgZ3tEajjuinlyRldkRGj9AZfYuT0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyOrdersSchema() {
  console.log('🔍 Verificando schema da tabela orders...\n');
  
  try {
    // Verificar estrutura da tabela via query SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        ORDER BY ordinal_position;
      `
    });
    
    if (error) {
      console.error('❌ Erro ao verificar schema:', error);
      
      // Tentar método alternativo - buscar alguns registros para ver campos
      console.log('\n📝 Tentando método alternativo...');
      const { data: sampleData, error: sampleError } = await supabase
        .from('orders')
        .select('*')
        .limit(1);
        
      if (sampleError) {
        console.error('❌ Erro ao buscar dados de exemplo:', sampleError);
      } else {
        console.log('✅ Campos encontrados na tabela orders:');
        if (sampleData && sampleData.length > 0) {
          Object.keys(sampleData[0]).forEach(field => {
            console.log(`  - ${field}`);
          });
        } else {
          console.log('  (tabela vazia, não foi possível determinar campos)');
        }
      }
    } else {
      console.log('✅ Schema da tabela orders:');
      data.forEach(column => {
        console.log(`  - ${column.column_name}: ${column.data_type} (${column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
    }
    
    // Verificar se campos críticos existem
    console.log('\n🎯 Verificando campos críticos...');
    const { data: testData, error: testError } = await supabase
      .from('orders')
      .select('id, status, customer_info, shipping_address, payment_id, updated_at, label_id')
      .limit(1);
      
    if (testError) {
      console.error('❌ Alguns campos críticos estão faltando:', testError.message);
      console.log('\n💡 Execute o seguinte SQL no Supabase para corrigir:');
      console.log(`
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_info JSONB,
ADD COLUMN IF NOT EXISTS shipping_address JSONB,
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
ADD COLUMN IF NOT EXISTS label_id TEXT;
      `);
    } else {
      console.log('✅ Todos os campos críticos estão presentes!');
    }
    
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
  }
}

verifyOrdersSchema();
