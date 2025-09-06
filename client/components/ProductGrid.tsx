import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  featured?: boolean;
  columns?: 2 | 3 | 4;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  error = null,
  featured = false,
  columns = 3
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2 text-white">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading products...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md mx-auto">
          <p className="font-medium">Failed to load products</p>
          <p className="text-sm text-red-300 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 bg-gray-500/10 border border-gray-500/20 rounded-xl p-6 max-w-md mx-auto">
          <p className="font-medium">No products found</p>
          <p className="text-sm text-gray-300 mt-2">Check back later for new products</p>
        </div>
      </div>
    );
  }

  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-6 lg:gap-8`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          featured={featured}
        />
      ))}
    </div>
  );
};