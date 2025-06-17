import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import ProductDetails from '@/components/products/ProductDetails';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function ProductPage({ params }: { params: { id: string } }) {
  // Fetch product with optimized images
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      image_mappings (
        id,
        storage_path,
        display_order,
        is_optimized
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !product) {
    notFound();
  }

  // Sort images by display_order and use optimized versions when available
  const sortedImages = product.image_mappings
    ?.sort((a, b) => a.display_order - b.display_order)
    .map(mapping => {
      if (mapping.is_optimized && mapping.storage_path) {
        const { data: { publicUrl } } = supabase.storage
          .from('product-imgs')
          .getPublicUrl(mapping.storage_path);
        return publicUrl;
      }
      return product.gallery_urls?.[mapping.display_order] || product.image_url;
    }) || [];

  // Use the first optimized image as the cover image, or fallback to the original
  const coverImage = sortedImages[0] || product.image_url;

  return (
    <ProductDetails
      product={{
        ...product,
        image_url: coverImage,
        gallery_urls: sortedImages
      }}
    />
  );
} 