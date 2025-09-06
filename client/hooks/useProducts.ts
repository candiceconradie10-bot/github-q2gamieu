import { useState, useEffect } from 'react';
import { products, Product } from '@/lib/supabaseClient';

export const useProducts = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productList = await products.getAll();
      setAllProducts(productList);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products: allProducts,
    loading,
    error,
    refetch: fetchProducts
  };
};

export const useProductsByCategory = (category: string) => {
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoryProducts = async () => {
    try {
      setLoading(true);
      const productList = await products.getByCategory(category);
      setCategoryProducts(productList);
      setError(null);
    } catch (err) {
      console.error('Error fetching category products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (category) {
      fetchCategoryProducts();
    }
  }, [category]);

  return {
    products: categoryProducts,
    loading,
    error,
    refetch: fetchCategoryProducts
  };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const productData = await products.getById(id);
      setProduct(productData);
      setError(null);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct
  };
};