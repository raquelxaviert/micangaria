// Script para criar um produto de teste
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://koduoglrfzronbcgqrjc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Nzc3MzIsImV4cCI6MjA2NTE1MzczMn0.pQ62WyGKV5tyrYsEddp2h8zRVCDf1qZ23uE8z4-FPUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestProduct() {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name: 'Colar Boho Chic',
          description: 'Colar artesanal com pedras naturais em estilo boho chic. Perfeito para combinar com looks casuais e festivos.',
          price: 89.90,
          category: 'acessorios',
          subcategory: 'colares',
          images: [
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
            'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400'
          ],
          stock_quantity: 10,
          weight: 0.05,
          dimensions: {
            height: 2,
            width: 15,
            length: 50
          },
          is_active: true,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Erro ao criar produto:', error);
    } else {
      console.log('Produto criado com sucesso:', data);
    }
  } catch (err) {
    console.error('Erro:', err);
  }
}

createTestProduct();
