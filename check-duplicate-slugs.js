import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://koduoglrfzronbcgqrjc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Nzc3MzIsImV4cCI6MjA2NTE1MzczMn0.pQ62WyGKV5tyrYsEddp2h8zRVCDf1qZ23uE8z4-FPUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicateSlugs() {
  console.log('🔍 Verificando produtos com problemas de slug...\n');

  try {
    // Buscar todos os produtos
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug, is_active')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('❌ Erro ao buscar produtos:', error.message);
      return;
    }

    console.log(`📊 Total de produtos: ${products?.length || 0}`);

    // Verificar produtos sem slug
    const productsWithoutSlug = products?.filter(p => !p.slug || p.slug.trim() === '');
    console.log(`⚠️ Produtos sem slug: ${productsWithoutSlug?.length || 0}`);
    
    if (productsWithoutSlug && productsWithoutSlug.length > 0) {
      console.log('📋 Produtos sem slug:');
      productsWithoutSlug.forEach((product, index) => {
        console.log(`  ${index + 1}. ID: ${product.id}`);
        console.log(`     Nome: ${product.name}`);
        console.log(`     Ativo: ${product.is_active}`);
        console.log('');
      });
    }

    // Verificar slugs duplicados
    const slugCounts = {};
    products?.forEach(product => {
      if (product.slug) {
        slugCounts[product.slug] = (slugCounts[product.slug] || 0) + 1;
      }
    });

    const duplicateSlugs = Object.entries(slugCounts)
      .filter(([slug, count]) => count > 1)
      .map(([slug, count]) => ({ slug, count }));

    console.log(`⚠️ Slugs duplicados: ${duplicateSlugs.length}`);
    
    if (duplicateSlugs.length > 0) {
      console.log('📋 Slugs duplicados:');
      duplicateSlugs.forEach(({ slug, count }) => {
        console.log(`  Slug: "${slug}" (${count} produtos)`);
        
        const productsWithSlug = products?.filter(p => p.slug === slug);
        productsWithSlug?.forEach((product, index) => {
          console.log(`    ${index + 1}. ID: ${product.id}`);
          console.log(`       Nome: ${product.name}`);
          console.log(`       Ativo: ${product.is_active}`);
        });
        console.log('');
      });
    }

    // Verificar produtos com slugs que podem causar problemas
    const problematicSlugs = products?.filter(p => {
      if (!p.slug) return false;
      return p.slug.includes(' ') || p.slug.includes('--') || p.slug.length < 3;
    });

    console.log(`⚠️ Slugs problemáticos: ${problematicSlugs?.length || 0}`);
    
    if (problematicSlugs && problematicSlugs.length > 0) {
      console.log('📋 Slugs que podem causar problemas:');
      problematicSlugs.forEach((product, index) => {
        console.log(`  ${index + 1}. ID: ${product.id}`);
        console.log(`     Nome: ${product.name}`);
        console.log(`     Slug: "${product.slug}"`);
        console.log('');
      });
    }

    // Testar busca por alguns slugs específicos
    if (products && products.length > 0) {
      const testSlugs = products
        .filter(p => p.slug && p.is_active)
        .slice(0, 3)
        .map(p => p.slug);

      console.log('🧪 Testando busca por slugs específicos:');
      
      for (const slug of testSlugs) {
        console.log(`\n🔍 Testando slug: "${slug}"`);
        
        const { data: result, error: searchError } = await supabase
          .from('products')
          .select('id, name, slug')
          .eq('slug', slug)
          .eq('is_active', true);

        if (searchError) {
          console.log(`  ❌ Erro: ${searchError.message}`);
        } else {
          console.log(`  ✅ Resultados: ${result?.length || 0}`);
          if (result && result.length > 0) {
            result.forEach((product, index) => {
              console.log(`    ${index + 1}. ID: ${product.id}, Nome: ${product.name}`);
            });
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

checkDuplicateSlugs(); 