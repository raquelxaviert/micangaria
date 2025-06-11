// Script para limpeza organizada do repositório
const fs = require('fs');
const path = require('path');

console.log('🧹 LIMPEZA ORGANIZADA DO REPOSITÓRIO\n');

// ARQUIVOS QUE PODEM SER REMOVIDOS COM SEGURANÇA
const arquivosParaRemover = {
  'SQLs de Debug/Teste (já resolvidos)': [
    'fix_all_constraints.sql',
    'fix_constraints_smart.sql', // Este foi aplicado, pode manter como backup
    'fix_rls_policies.sql',
    'fix_rls_quick.sql',
    'fix_style_constraint.sql',
    'fix_type_constraint.sql',
    'list_products_columns.sql'
  ],
  
  'SQLs de Setup (duplicados/obsoletos)': [
    'supabase_setup_parte1_storage.sql',
    'supabase_setup_parte2_sku.sql',
    'supabase_storage_dev.sql',
    'supabase_storage_setup.sql',
    'supabase_optional_tables.sql'
  ],
  
  'Scripts JS de Teste/Debug': [
    'test_supabase_simple.js',
    'test_delete_function.js',
    'test_bucket_cjs.js',
    'test_bucket.js',
    'test_admin_complete.js',
    'test-supabase.js',
    'demo_tipos_personalizados.js',
    'delete_fix_confirmed.js',
    'debug_admin.js',
    'button_hover_fix.js'
  ],
  
  'Documentação Temporária/Debug': [
    'STATUS-CORRECOES.md',
    'SUPABASE-TROUBLESHOOTING.md',
    'ESTRATEGIA-CONSTRAINTS.md',
    'EXEMPLO-TIPOS-PERSONALIZADOS.md',
    'CORRECAO-UPLOAD.md',
    'MELHORIAS-FORMULARIO.md' // Tem o FINAL que é mais atualizado
  ],
  
  'Arquivos Diversos': [
    'shopify.txt',
    'produtos_mock_data.txt' // Dados já foram limpos
  ]
};

// ARQUIVOS IMPORTANTES PARA MANTER
const arquivosImportantes = {
  'SQL Essenciais': [
    'database_schema.sql', // Schema principal
    'supabase_setup_completo.sql', // Setup completo
    'supabase_setup_minimal.sql', // Setup mínimo
    'novo_projeto_supabase.sql' // Para novos projetos
  ],
  
  'Scripts Úteis': [
    'check-products.js', // Para verificar produtos
    'teste_constraints_corrigidas.js', // Para testar constraints
    'limpar_workspace.js', // Limpeza
    'relatorio_limpeza.js' // Relatório
  ],
  
  'Documentação Importante': [
    'README.md', // Principal
    'GUIA-ADMIN-COMPLETO.md', // Guia completo
    'GUIA-PRODUCAO.md', // Para produção
    'RESUMO-FINAL.md', // Resumo geral
    'PROXIMOS-PASSOS.md', // Roadmap
    'SHOPIFY-VS-PERSONALIZADO.md', // Comparativo
    'MELHORIAS-FORMULARIO-FINAL.md', // Versão final
    'docs/blueprint.md' // Blueprint do projeto
  ]
};

// Função para mover para pasta de backup
function criarBackup() {
  const backupDir = 'backup_arquivos_desenvolvimento';
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
    console.log(`📁 Criada pasta de backup: ${backupDir}`);
  }
  return backupDir;
}

// Função principal de limpeza
function executarLimpeza(moverParaBackup = true) {
  console.log('📋 ANÁLISE DOS ARQUIVOS:\n');
  
  // Mostrar arquivos importantes que serão mantidos
  console.log('✅ ARQUIVOS QUE SERÃO MANTIDOS:');
  Object.entries(arquivosImportantes).forEach(([categoria, arquivos]) => {
    console.log(`\n📂 ${categoria}:`);
    arquivos.forEach(arquivo => {
      const existe = fs.existsSync(arquivo);
      console.log(`   ${existe ? '✅' : '❌'} ${arquivo}`);
    });
  });
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Mostrar arquivos que podem ser removidos
  console.log('🗑️ ARQUIVOS QUE PODEM SER REMOVIDOS:');
  let totalArquivos = 0;
  let arquivosExistentes = [];
  
  Object.entries(arquivosParaRemover).forEach(([categoria, arquivos]) => {
    console.log(`\n📂 ${categoria}:`);
    arquivos.forEach(arquivo => {
      const existe = fs.existsSync(arquivo);
      if (existe) {
        arquivosExistentes.push({ arquivo, categoria });
        console.log(`   🗑️ ${arquivo}`);
        totalArquivos++;
      } else {
        console.log(`   ➖ ${arquivo} (já removido)`);
      }
    });
  });
  
  console.log(`\n📊 RESUMO: ${totalArquivos} arquivos podem ser removidos\n`);
  
  if (moverParaBackup && arquivosExistentes.length > 0) {
    const backupDir = criarBackup();
    
    console.log('🔄 MOVENDO ARQUIVOS PARA BACKUP...\n');
    
    arquivosExistentes.forEach(({ arquivo, categoria }) => {
      try {
        const origem = path.resolve(arquivo);
        const destino = path.resolve(backupDir, arquivo);
        
        // Criar subdiretórios se necessário
        const destinoDir = path.dirname(destino);
        if (!fs.existsSync(destinoDir)) {
          fs.mkdirSync(destinoDir, { recursive: true });
        }
        
        fs.renameSync(origem, destino);
        console.log(`   ✅ ${arquivo} → backup/`);
      } catch (error) {
        console.log(`   ❌ Erro ao mover ${arquivo}: ${error.message}`);
      }
    });
    
    console.log(`\n✅ Limpeza concluída! ${arquivosExistentes.length} arquivos movidos para backup`);
    console.log(`📁 Pasta de backup: ${backupDir}`);
  }
  
  console.log('\n🎯 ESTRUTURA FINAL RECOMENDADA:');
  console.log(`
📁 Raiz do projeto
├── 📄 README.md (principal)
├── 📄 package.json
├── 📄 next.config.ts
├── 📄 tailwind.config.ts
├── 📄 tsconfig.json
│
├── 📁 src/ (código fonte)
├── 📁 public/ (assets)
│
├── 📁 docs/
│   └── 📄 blueprint.md
│
├── 📁 sql/ (scripts essenciais)
│   ├── 📄 database_schema.sql
│   ├── 📄 supabase_setup_completo.sql
│   └── 📄 supabase_setup_minimal.sql
│
├── 📁 scripts/ (utilitários)
│   ├── 📄 check-products.js
│   └── 📄 teste_constraints_corrigidas.js
│
└── 📁 docs/guias/
    ├── 📄 GUIA-ADMIN-COMPLETO.md
    ├── 📄 GUIA-PRODUCAO.md
    └── 📄 RESUMO-FINAL.md
  `);
  
  console.log('\n💡 PRÓXIMO PASSO: Organizar arquivos restantes em pastas');
}

// Executar análise (não remove nada ainda)
console.log('🔍 EXECUTANDO ANÁLISE (sem remover arquivos)...\n');
executarLimpeza(false);

console.log('\n❓ QUER EXECUTAR A LIMPEZA?');
console.log('   Para executar: node limpeza_repo.js --execute');
console.log('   Para apenas analisar: node limpeza_repo.js');

// Se passou --execute, executa a limpeza
if (process.argv.includes('--execute')) {
  console.log('\n🚀 EXECUTANDO LIMPEZA...\n');
  executarLimpeza(true);
}
