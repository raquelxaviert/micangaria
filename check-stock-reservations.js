import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://koduoglrfzronbcgqrjc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Nzc3MzIsImV4cCI6MjA2NTE1MzczMn0.pQ62WyGKV5tyrYsEddp2h8zRVCDf1qZ23uE8z4-FPUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStockReservations() {
  console.log('🔍 Verificando tabela stock_reservations...\n');

  try {
    // Verificar se a tabela existe
    const { data: tableExists, error: tableError } = await supabase
      .from('stock_reservations')
      .select('count')
      .limit(1);

    if (tableError) {
      console.log('❌ Tabela stock_reservations não existe ou não está acessível');
      console.log('Erro:', tableError.message);
      return;
    }

    console.log('✅ Tabela stock_reservations existe');

    // Verificar estrutura da tabela
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'stock_reservations' });

    if (columnsError) {
      console.log('⚠️ Não foi possível obter estrutura da tabela');
    } else {
      console.log('📊 Estrutura da tabela:');
      console.log(columns);
    }

    // Verificar registros
    const { data: reservations, error: reservationsError } = await supabase
      .from('stock_reservations')
      .select('*')
      .limit(10);

    if (reservationsError) {
      console.log('❌ Erro ao buscar reservas:', reservationsError.message);
    } else {
      console.log(`📈 Total de reservas: ${reservations?.length || 0}`);
      if (reservations && reservations.length > 0) {
        console.log('📋 Primeiras reservas:');
        reservations.forEach((reservation, index) => {
          console.log(`  ${index + 1}. ID: ${reservation.id}`);
          console.log(`     Produto: ${reservation.product_id}`);
          console.log(`     Usuário: ${reservation.user_id}`);
          console.log(`     Status: ${reservation.status}`);
          console.log(`     Expira: ${reservation.expires_at}`);
          console.log('');
        });
      }
    }

    // Verificar produtos com estoque
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, stock_available, stock_reserved')
      .limit(5);

    if (productsError) {
      console.log('❌ Erro ao buscar produtos:', productsError.message);
    } else {
      console.log('📦 Produtos com estoque:');
      products?.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name}`);
        console.log(`     ID: ${product.id}`);
        console.log(`     Disponível: ${product.stock_available}`);
        console.log(`     Reservado: ${product.stock_reserved}`);
        console.log('');
      });
    }

    // Verificar se há reservas ativas para um produto específico
    if (products && products.length > 0) {
      const testProductId = products[0].id;
      console.log(`🔍 Verificando reservas ativas para produto: ${testProductId}`);
      
      const { data: activeReservations, error: activeError } = await supabase
        .from('stock_reservations')
        .select('*')
        .eq('product_id', testProductId)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString());

      if (activeError) {
        console.log('❌ Erro ao verificar reservas ativas:', activeError.message);
      } else {
        console.log(`📊 Reservas ativas para produto ${testProductId}: ${activeReservations?.length || 0}`);
        if (activeReservations && activeReservations.length > 0) {
          activeReservations.forEach((reservation, index) => {
            console.log(`  ${index + 1}. Usuário: ${reservation.user_id}`);
            console.log(`     Expira: ${reservation.expires_at}`);
            console.log(`     Quantidade: ${reservation.quantity}`);
          });
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

checkStockReservations(); 