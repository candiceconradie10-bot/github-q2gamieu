import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { getProductById } from "@/data/products";
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  ShieldCheck,
  Truck,
} from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<any | null>(null);

  const numericId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }, [id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (numericId !== null) {
          const local = getProductById(numericId);
          if (local) {
            setProduct(local);
            return;
          }
        }
        setError("Product not found");
      } catch (e: any) {
        setError(e?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [numericId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link to="/">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Card className="bg-black/50 backdrop-blur-xl border border-white/20 overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-[340px] sm:h-[420px] md:h-[520px]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                {product.name}
              </h1>
              {product.rating && (
                <div className="mt-2 flex items-center space-x-2 text-white/80">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-600"}`}
                    />
                  ))}
                  <span className="text-sm">{product.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            <div className="text-2xl font-bold text-white">
              R{Number(product.price).toFixed(2)}
            </div>

            {product.description && (
              <p className="text-white/70 leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                In Stock
              </Badge>
              <Badge className="bg-white/10 text-white border border-white/20">
                Free Shipping
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red text-white font-bold px-6 py-4 rounded-xl"
                onClick={() => addToCart(product)}
              >
                <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <Truck className="h-5 w-5 text-white mb-2" />
                <div className="text-white font-medium">Fast Delivery</div>
                <div className="text-white/60 text-sm">2-5 working days</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <ShieldCheck className="h-5 w-5 text-white mb-2" />
                <div className="text-white font-medium">Quality Guaranteed</div>
                <div className="text-white/60 text-sm">Premium materials</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <Star className="h-5 w-5 text-white mb-2" />
                <div className="text-white font-medium">
                  Trusted by 1000+ clients
                </div>
                <div className="text-white/60 text-sm">Excellent reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
