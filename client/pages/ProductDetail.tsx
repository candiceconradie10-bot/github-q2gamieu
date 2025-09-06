import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { useProduct } from "@/hooks/useProducts";
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  Heart,
  Share2,
} from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { product, loading, error } = useProduct(id || "");
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const handleAddToCart = async () => {
    if (product) {
      await addToCart(product, quantity);
    }
  };

  const adjustQuantity = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(product?.stock || 1, quantity + delta));
    setQuantity(newQuantity);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="h-96 rounded-2xl bg-white/5 animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-white/5 rounded animate-pulse" />
            <div className="h-4 bg-white/5 rounded animate-pulse" />
            <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 mb-6">{error || "Product not found"}</p>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-black border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-brand-red transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link 
              to={`/${product.category}`} 
              className="hover:text-brand-red transition-colors"
            >
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">
              {product.title}
            </span>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white/5">
              <img
                src={product.image_url || '/api/placeholder/600/600'}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={`absolute top-4 right-4 rounded-full p-3 backdrop-blur-md transition-all duration-300 ${
                  isLiked
                    ? "bg-red-500/80 text-white"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-4 bg-gradient-to-r from-brand-red/20 to-red-600/20 text-brand-red border border-brand-red/30">
                {product.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {product.title}
              </h1>
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-white">
                  R{product.price.toFixed(2)}
                </span>
                <Badge className={`${
                  product.stock > 10 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  product.stock > 0 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </Badge>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-white font-medium">Quantity:</span>
                <div className="flex items-center bg-white/10 rounded-lg border border-white/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => adjustQuantity(-1)}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-white hover:bg-white/10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 text-white font-medium min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => adjustQuantity(1)}
                    disabled={quantity >= (product.stock || 0)}
                    className="px-3 py-2 text-white hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex-1 bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <ShieldCheck className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Quality Guaranteed</p>
                    <p className="text-sm text-gray-400">100% satisfaction</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Truck className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Fast Delivery</p>
                    <p className="text-sm text-gray-400">Nationwide shipping</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}