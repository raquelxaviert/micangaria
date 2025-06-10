'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestUpload() {
  const [status, setStatus] = useState('');
  const [result, setResult] = useState('');

  const testUpload = async () => {
    setStatus('Iniciando teste...');
    setResult('');

    try {
      const supabase = createClient();
      
      setStatus('1. Testando conexão...');
      
      // Listar buckets
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        setResult(prev => prev + `❌ Erro ao listar buckets: ${JSON.stringify(listError)}\n`);
        return;
      }
      
      setResult(prev => prev + `✅ Buckets: ${JSON.stringify(buckets.map(b => b.name))}\n`);
      
      // Verificar bucket product-images
      const bucket = buckets.find(b => b.name === 'product-images');
      if (!bucket) {
        setResult(prev => prev + `❌ Bucket product-images não encontrado\n`);
        return;
      }
      
      setResult(prev => prev + `✅ Bucket product-images encontrado\n`);
      
      setStatus('2. Criando arquivo de teste...');
      
      // Criar arquivo de teste
      const testContent = new Blob(['Hello World'], { type: 'text/plain' });
      const fileName = `test-${Date.now()}.txt`;
      
      setStatus('3. Fazendo upload...');
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, testContent);
      
      if (uploadError) {
        setResult(prev => prev + `❌ Erro no upload: ${JSON.stringify(uploadError, null, 2)}\n`);
        
        // Verificar tipo específico de erro
        if (uploadError.message?.includes('row-level security')) {
          setResult(prev => prev + `🚨 PROBLEMA DE RLS DETECTADO!\n`);
          setResult(prev => prev + `Execute o arquivo supabase_setup_parte1_storage.sql no Supabase\n`);
        }
        
        return;
      }
      
      setResult(prev => prev + `✅ Upload bem-sucedido: ${JSON.stringify(uploadData)}\n`);
      
      setStatus('4. Testando URL pública...');
      
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      
      setResult(prev => prev + `✅ URL pública: ${urlData.publicUrl}\n`);
      
      setStatus('5. Removendo arquivo de teste...');
      
      const { error: removeError } = await supabase.storage
        .from('product-images')
        .remove([fileName]);
      
      if (removeError) {
        setResult(prev => prev + `⚠️ Erro ao remover: ${JSON.stringify(removeError)}\n`);
      } else {
        setResult(prev => prev + `✅ Arquivo removido\n`);
      }
      
      setStatus('✅ Teste concluído!');
      
    } catch (error: any) {
      setResult(prev => prev + `❌ Erro geral: ${error.message || error}\n`);
      setResult(prev => prev + `Stack: ${error.stack}\n`);
      setStatus('❌ Teste falhou');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Teste de Upload Supabase</h1>
      
      <button 
        onClick={testUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
      >
        Executar Teste
      </button>
      
      <div className="mb-4">
        <strong>Status:</strong> {status}
      </div>
      
      <div className="bg-gray-100 p-4 rounded">
        <strong>Resultado:</strong>
        <pre className="whitespace-pre-wrap text-sm mt-2">{result}</pre>
      </div>
      
      <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">Se aparecer erro de RLS:</h3>
        <p className="text-sm text-yellow-700">
          1. Vá para o Supabase Dashboard → SQL Editor<br/>
          2. Execute o conteúdo do arquivo <code>supabase_setup_parte1_storage.sql</code><br/>
          3. Isso criará as políticas de segurança necessárias para o bucket
        </p>
      </div>
    </div>
  );
}
