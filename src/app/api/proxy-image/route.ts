import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { googleDriveUrl, productId, displayOrder } = await request.json();

    if (!googleDriveUrl || !productId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Download image from Google Drive
    const response = await fetch(googleDriveUrl);
    if (!response.ok) {
      throw new Error('Failed to download image from Google Drive');
    }

    const imageBuffer = await response.arrayBuffer();
    const imageData = new Uint8Array(imageBuffer);

    // Generate a unique filename
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const storagePath = `products/${productId}/${filename}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('product-imgs')
      .upload(storagePath, imageData, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-imgs')
      .getPublicUrl(storagePath);

    // Create or update image mapping
    const { error: mappingError } = await supabase
      .from('image_mappings')
      .upsert({
        product_id: productId,
        google_drive_url: googleDriveUrl,
        storage_path: storagePath,
        display_order: displayOrder,
        is_optimized: true
      });

    if (mappingError) {
      throw mappingError;
    }

    return NextResponse.json({
      success: true,
      storagePath,
      publicUrl
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
} 