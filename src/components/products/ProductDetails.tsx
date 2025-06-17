import { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types/product';

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const images = [product.image_url, ...(product.gallery_urls || [])].filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            <Image
              src={images[selectedImageIndex]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square overflow-hidden rounded-lg ${
                    selectedImageIndex === index
                      ? 'ring-2 ring-primary'
                      : 'hover:opacity-75'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 25vw, 12.5vw"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-gray-600">{product.description}</p>
          
          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold">
              ${product.price.toFixed(2)}
            </span>
            {product.compare_at_price && (
              <span className="text-lg text-gray-500 line-through">
                ${product.compare_at_price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors">
            Add to Cart
          </button>

          {/* Additional Details */}
          {product.care_instructions && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Care Instructions</h2>
              <p className="text-gray-600">{product.care_instructions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 