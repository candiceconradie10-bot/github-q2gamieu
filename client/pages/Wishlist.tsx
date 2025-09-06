import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { wishlist, WishlistItem, Product } from '@/lib/supabaseClient';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Heart,
  ShoppingCart,
  Package,
  Loader2,
  ArrowLeft,
  Star,
  Eye
} from 'lucide-react';

export default function Wishlist() {
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const items = await wishlist.getItems(user.id);
        setWishlistItems(items);
      } catch (error) {
        console.error('Error fetching wishlist items:', error);
        toast.error('Failed to load wishlist items');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchWishlistItems();
    }
  }, [user, authLoading]);

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    setAddingToCart(product.id.toString());
    
    try {
      await addToCart(product, 1);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      await wishlist.remove(user.id, productId);
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const getStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-red mx-auto mb-4" />
          <p className="text-white">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-red-500/10 border-red-500/20">
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-400 mb-4">Sign In Required</h1>
            <p className="text-gray-300 mb-6">Please sign in to view your wishlist.</p>
            <Link to="/">
              <Button className="bg-brand-red hover:bg-red-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-white hover:text-brand-red">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Store
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Heart className="h-8 w-8 text-brand-red" />
                My Wishlist
              </h1>
              <p className="text-gray-400 mt-2">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Heart className="h-16 w-16 text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Your wishlist is empty</h2>
              <p className="text-gray-400 mb-6">
                Browse our products and add items you love to your wishlist for easy access later.
              </p>
              <Link to="/">
                <Button className="bg-brand-red hover:bg-red-600">
                  <Package className="h-4 w-4 mr-2" />
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              if (!item.product) return null;
              
              const product = item.product as Product;
              
              return (
                <Card key={item.id} className="bg-black/40 border-gray-800 hover:border-gray-600 transition-all duration-300 group">
                  <CardContent className="p-4">
                    {/* Product Image */}
                    <div className="relative mb-4">
                      <Link to={`/product/${product.id}`}>
                        <img
                          src={product.image_url || '/placeholder.svg'}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      </Link>
                      
                      {/* Wishlist Button */}
                      <div className="absolute top-2 right-2">
                        <WishlistButton
                          productId={product.id.toString()}
                          size="sm"
                          variant="ghost"
                          className="bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                        />
                      </div>

                      {/* Active Badge */}
                      {product.is_active && (
                        <Badge className="absolute top-2 left-2 bg-green-600 text-white">
                          Available
                        </Badge>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-3">
                      <div>
                        <Link to={`/product/${product.id}`}>
                          <h3 className="font-semibold text-white hover:text-brand-red transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                          {product.description}
                        </p>
                      </div>

                      {/* Rating */}
                      {product.rating > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex">{getStarRating(product.rating)}</div>
                          <span className="text-sm text-gray-400">
                            ({product.reviews_count} reviews)
                          </span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-brand-red">
                          {formatCurrency(product.price)}
                        </span>
                        <Badge variant="secondary" className="capitalize">
                          {product.category.replace('-', ' ')}
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={addingToCart === product.id.toString() || !product.is_active}
                          className="flex-1 bg-brand-red hover:bg-red-600 disabled:opacity-50"
                        >
                          {addingToCart === product.id.toString() ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <ShoppingCart className="h-4 w-4 mr-2" />
                          )}
                          {!product.is_active ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                        
                        <Link to={`/product/${product.id}`}>
                          <Button variant="outline" size="sm" className="border-gray-600">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        {wishlistItems.length > 0 && (
          <div className="mt-12 text-center">
            <div className="bg-black/40 border border-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-white mb-4">
                Ready to make a purchase?
              </h3>
              <p className="text-gray-400 mb-6">
                Browse all products to find more items you'll love, or continue shopping from your wishlist.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/">
                  <Button variant="outline" className="border-gray-600">
                    <Package className="h-4 w-4 mr-2" />
                    Browse All Products
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button className="bg-brand-red hover:bg-red-600">
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}