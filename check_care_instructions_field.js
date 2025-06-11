// VERIFICAR SE O CAMPO CARE_INSTRUCTIONS EXISTE NO SUPABASE
// Execute: node check_care_instructions_field.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  console.log('Certifique-se de ter NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCareInstructionsField() {
  console.log('🔍 Verificando estrutura da tabela products...\n');

  try {
    // Tentar buscar um produto para ver os campos disponíveis
    console.log('📋 Verificando campos da tabela products...');
    const { data: sampleProduct, error } = await supabase
      .from('products')
      .select('*')
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    console.log('📊 Campos encontrados na tabela products:');
    
    if (sampleProduct) {
      const fields = Object.keys(sampleProduct);
      fields.forEach((field, index) => {
        console.log(`   ${index + 1}. ${field}`);
      });

      // Verificar especificamente o campo care_instructions
      const hasCareInstructions = fields.includes('care_instructions');

      console.log('\n🎯 Verificação do campo care_instructions:');
      
      if (hasCareInstructions) {
        console.log('✅ Campo care_instructions EXISTE na tabela products');
        console.log('   Você pode usar este campo no formulário de admin');
      } else {
        console.log('❌ Campo care_instructions NÃO EXISTE na tabela products');
        console.log('\n📝 Para adicionar este campo, execute o seguinte SQL no Supabase Dashboard:');
        console.log('');
        console.log('   ALTER TABLE products ADD COLUMN care_instructions TEXT;');
        console.log('   COMMENT ON COLUMN products.care_instructions IS \'Instruções de cuidados do produto\';');
        console.log('');
      }

      // Verificar campos relacionados
      const relatedFields = ['description', 'materials', 'notes', 'meta_description'];
      const existingRelatedFields = relatedFields.filter(field => fields.includes(field));

      console.log('\n🔗 Campos relacionados existentes:');
      existingRelatedFields.forEach(field => {
        console.log(`   ✅ ${field}`);
      });

      // Sugestão de implementação
      if (!hasCareInstructions) {
        console.log('\n💡 Sugestões:');
        console.log('   1. Adicione o campo care_instructions usando o SQL acima');
        console.log('   2. Ou use um campo existente como "notes" temporariamente');
        console.log('   3. Ou use o campo "description" com uma seção específica');
      }
    } else {
      console.log('⚠️ Nenhum produto encontrado na tabela. Tentando método alternativo...');
      
      // Tentar acessar diretamente o campo care_instructions
      const { data, error: selectError } = await supabase
        .from('products')
        .select('care_instructions')
        .limit(1);
      
      if (selectError) {
        if (selectError.message.includes('column "care_instructions" does not exist')) {
          console.log('❌ Confirmado: campo care_instructions não existe');
          console.log('\n📝 Execute este SQL no Supabase Dashboard:');
          console.log('   ALTER TABLE products ADD COLUMN care_instructions TEXT;');
        } else {
          console.log('⚠️ Erro inesperado:', selectError.message);
        }
      } else {
        console.log('✅ Campo care_instructions existe!');
      }
    }

  } catch (error) {
    console.error('❌ Erro durante verificação:', error.message);
  }
}

// Executar verificação
checkCareInstructionsField()
  .then(() => {
    console.log('\n✨ Verificação concluída!');
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
  });