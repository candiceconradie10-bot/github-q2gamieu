import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { OptimizedImage } from "./OptimizedImage";
import { useCart, Product } from "@/contexts/CartContext";
import { Star, Heart, ShoppingCart, Eye, Zap, TrendingUp } from "lucide-react";

interface ProductCardProps {
  product: Product;
  featured?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProductCard({
  product,
  featured = false,
  size = "md",
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      addToCart(product);
    },
    [addToCart, product],
  );

  const handleLike = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsLiked(!isLiked);
    },
    [isLiked],
  );

  const cardSizes = {
    sm: "max-w-xs",
    md: "max-w-sm lg:max-w-md",
    lg: "max-w-md lg:max-w-lg",
  };

  const imageSizes = {
    sm: "h-48 md:h-56",
    md: "h-56 md:h-64 lg:h-72",
    lg: "h-64 md:h-72 lg:h-80",
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className={`group relative ${cardSizes[size]} w-full touch-manipulation block`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
    >
      {/* Premium Card Container */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-xl border border-white/20 transition-all duration-700 hover:scale-[1.03] hover:shadow-2xl hover:shadow-brand-red/20 hover:border-brand-red/40 interactive-element">
        {/* Animated background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-red/5 via-transparent to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-red/5 via-transparent to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Image Container */}
        <div className={`relative overflow-hidden ${imageSizes[size]}`}>
          {/* Image Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-300/20 via-gray-200/20 to-gray-300/20 animate-pulse" />
          )}

          {/* Product Image */}
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {/* Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Featured Badge */}
          {featured && (
            <Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-3 py-1 rounded-full border-0 shadow-lg">
              <TrendingUp className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}

          {/* Quick Actions - Overlay */}
          <div
            className={`absolute inset-4 flex items-start justify-between transition-all duration-300 ${
              isHovered
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`rounded-full p-3 backdrop-blur-md transition-all duration-300 hover:scale-110 ${
                isLiked
                  ? "bg-red-500/80 text-white"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            </Button>

            {/* Quick View */}
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full p-3 bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-all duration-300 hover:scale-110"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Add to Cart - Bottom Overlay */}
          <div
            className={`absolute bottom-4 left-4 right-4 transition-all duration-500 ${
              isHovered
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red text-white font-semibold py-3 rounded-2xl backdrop-blur-md shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6 space-y-4">
          {/* Rating */}
          {product.rating && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating!)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-600"
                      } transition-colors duration-200`}
                    />
                  ))}
                </div>
                <span className="text-sm text-white/70 font-medium">
                  {product.rating?.toFixed(1)}
                </span>
              </div>
              {product.reviews && (
                <span className="text-xs text-white/50">
                  ({product.reviews} reviews)
                </span>
              )}
            </div>
          )}

          {/* Product Name */}
          <h3 className="font-bold text-white text-lg leading-tight line-clamp-2 group-hover:text-brand-red transition-colors duration-300">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-white/70 text-sm line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Price and Action */}
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-white">
                  R{product.price.toFixed(2)}
                </span>
                {Math.random() > 0.7 && (
                  <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Deal
                  </Badge>
                )}
              </div>
              <div className="text-xs text-white/50">
                Free shipping eligible
              </div>
            </div>

            {/* Mobile Add to Cart Button */}
            <div className="block lg:hidden">
              <Button
                onClick={handleAddToCart}
                size="sm"
                className="bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red rounded-xl px-4 py-2 shadow-lg hover:shadow-brand-red/25 transition-all duration-300"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Animated Border */}
        <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-brand-red via-red-600 to-brand-red opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />
      </div>

      {/* External Glow Effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-brand-red/20 via-red-600/20 to-brand-red/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-20" />
    </Link>
  );
}
