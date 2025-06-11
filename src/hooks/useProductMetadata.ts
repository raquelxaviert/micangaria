// Hook para gerenciar tipos e estilos de produtos
// src/hooks/useProductMetadata.ts

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ProductType {
  name: string;
  display_name: string;
  description: string;
}

interface ProductStyle {
  name: string;
  display_name: string;
  description: string;
}

export function useProductMetadata() {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [productStyles, setProductStyles] = useState<ProductStyle[]>([]);
  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const [customStyles, setCustomStyles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // Carregar tipos e estilos padrão do Supabase
  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      setLoading(true);

      // Buscar tipos padrão
      const { data: types, error: typesError } = await supabase
        .rpc('get_product_types');

      if (typesError) {
        console.error('Erro ao carregar tipos:', typesError);
      } else {
        setProductTypes(types || []);
      }

      // Buscar estilos padrão
      const { data: styles, error: stylesError } = await supabase
        .rpc('get_product_styles');

      if (stylesError) {
        console.error('Erro ao carregar estilos:', stylesError);
      } else {
        setProductStyles(styles || []);
      }      // Buscar tipos personalizados usados nos produtos
      console.log('🔍 Buscando tipos personalizados já utilizados...');
      const { data: usedTypes } = await supabase
        .from('products')
        .select('type')
        .not('type', 'is', null);

      const { data: usedStyles } = await supabase
        .from('products')
        .select('style')
        .not('style', 'is', null);      // Extrair tipos únicos que não estão na lista padrão
      const standardTypeNames = (types || []).map((t: ProductType) => t.name);
      const uniqueCustomTypes = [...new Set(
        (usedTypes || []).map((p: any) => p.type)
          .filter((type: string) => type && !standardTypeNames.includes(type))
      )];

      const standardStyleNames = (styles || []).map((s: ProductStyle) => s.name);
      const uniqueCustomStyles = [...new Set(
        (usedStyles || []).map((p: any) => p.style)
          .filter((style: string) => style && !standardStyleNames.includes(style))
      )];

      console.log('✅ Tipos personalizados encontrados:', uniqueCustomTypes);
      console.log('✅ Estilos personalizados encontrados:', uniqueCustomStyles);

      setCustomTypes(uniqueCustomTypes);
      setCustomStyles(uniqueCustomStyles);

    } catch (error) {
      console.error('Erro ao carregar metadados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar novo tipo personalizado
  const addCustomType = async (newType: string) => {
    const trimmedType = newType.trim().toLowerCase();
    
    if (!trimmedType) return false;
    
    // Verificar se já existe
    const allTypes = [
      ...productTypes.map(t => t.name),
      ...customTypes
    ];
    
    if (allTypes.includes(trimmedType)) {
      return false; // Já existe
    }

    // Adicionar à lista local
    setCustomTypes(prev => [...prev, trimmedType]);
    
    // Opcional: Salvar no Supabase como tipo personalizado
    try {
      await supabase
        .from('product_types')
        .insert({
          name: trimmedType,
          display_name: trimmedType.charAt(0).toUpperCase() + trimmedType.slice(1),
          description: `Tipo personalizado: ${trimmedType}`,
          is_default: false
        });
    } catch (error) {
      console.log('Tipo personalizado não salvo no banco (normal):', error);
    }

    return true;
  };

  // Adicionar novo estilo personalizado
  const addCustomStyle = async (newStyle: string) => {
    const trimmedStyle = newStyle.trim().toLowerCase();
    
    if (!trimmedStyle) return false;
    
    // Verificar se já existe
    const allStyles = [
      ...productStyles.map(s => s.name),
      ...customStyles
    ];
    
    if (allStyles.includes(trimmedStyle)) {
      return false; // Já existe
    }

    // Adicionar à lista local
    setCustomStyles(prev => [...prev, trimmedStyle]);
    
    // Opcional: Salvar no Supabase como estilo personalizado
    try {
      await supabase
        .from('product_styles')
        .insert({
          name: trimmedStyle,
          display_name: trimmedStyle.charAt(0).toUpperCase() + trimmedStyle.slice(1),
          description: `Estilo personalizado: ${trimmedStyle}`,
          is_default: false
        });
    } catch (error) {
      console.log('Estilo personalizado não salvo no banco (normal):', error);
    }

    return true;
  };

  // Obter todos os tipos (padrão + personalizados)
  const getAllTypes = () => {
    const standardTypes = productTypes.map(t => ({
      value: t.name,
      label: t.display_name,
      description: t.description,
      isCustom: false
    }));

    const customTypesList = customTypes.map(t => ({
      value: t,
      label: t.charAt(0).toUpperCase() + t.slice(1),
      description: `Tipo personalizado`,
      isCustom: true
    }));

    return [...standardTypes, ...customTypesList];
  };

  // Obter todos os estilos (padrão + personalizados)
  const getAllStyles = () => {
    const standardStyles = productStyles.map(s => ({
      value: s.name,
      label: s.display_name,
      description: s.description,
      isCustom: false
    }));

    const customStylesList = customStyles.map(s => ({
      value: s,
      label: s.charAt(0).toUpperCase() + s.slice(1),
      description: `Estilo personalizado`,
      isCustom: true
    }));

    return [...standardStyles, ...customStylesList];
  };

  return {
    // Estados
    loading,
    productTypes,
    productStyles,
    customTypes,
    customStyles,

    // Métodos
    addCustomType,
    addCustomStyle,
    getAllTypes,
    getAllStyles,
    loadMetadata
  };
}

export default useProductMetadata;
