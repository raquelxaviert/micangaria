// Script para popular alguns produtos com materials e sizes
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: SUPABASE_URL ou SUPABASE_ANON_KEY não encontradas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateMaterialsAndSizes() {
  console.log('🔧 Populando produtos com materials e sizes...\n');

  try {
    // Buscar alguns produtos para atualizar
    const { data: produtos, error: errorBusca } = await supabase
      .from('products')
      .select('id, name, type')
      .limit(10);

    if (errorBusca) {
      console.error('❌ Erro ao buscar produtos:', errorBusca.message);
      return;
    }

    console.log(`📦 Encontrados ${produtos.length} produtos\n`);

    // Dados de exemplo para materials e sizes baseados no tipo
    const materialsMap = {
      'anel': ['prata 925', 'ouro 18k'],
      'colar': ['prata', 'ouro folheado'],
      'brinco': ['aço inoxidável', 'prata 925'],
      'bolsa': ['couro legítimo', 'lona'],
      'cinto': ['couro', 'metal'],
      'pulseira': ['prata', 'cordão'],
      'conjunto': ['metais diversos', 'prata']
    };

    const sizesMap = {
      'anel': ['16', '18', '20'],
      'colar': ['45cm', '50cm'],
      'brinco': ['único'],
      'bolsa': ['M', 'G'],
      'cinto': ['85cm', '90cm', '95cm'],
      'pulseira': ['ajustável'],
      'conjunto': ['único', 'variado']
    };

    // Atualizar cada produto
    for (const produto of produtos) {
      const materials = materialsMap[produto.type] || ['material único'];
      const sizes = sizesMap[produto.type] || ['único'];

      console.log(`🔄 Atualizando "${produto.name}":`);
      console.log(`   Materials: [${materials.join(', ')}]`);
      console.log(`   Sizes: [${sizes.join(', ')}]`);

      const { error: errorUpdate } = await supabase
        .from('products')
        .update({
          materials: materials,
          sizes: sizes
        })
        .eq('id', produto.id);

      if (errorUpdate) {
        console.error(`❌ Erro ao atualizar ${produto.name}:`, errorUpdate.message);
      } else {
        console.log(`✅ ${produto.name} atualizado com sucesso!\n`);
      }
    }

    console.log('🎉 Todos os produtos foram atualizados com materials e sizes!');
    console.log('📱 Agora os badges devem aparecer nos cards dos produtos.');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o script
populateMaterialsAndSizes();
