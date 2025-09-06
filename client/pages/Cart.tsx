import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  CreditCard,
  Tag,
  Truck,
  Shield,
} from "lucide-react";

export default function Cart() {
  const { state, updateQuantity, removeFromCart, clearCart } = useCart();

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(id);
    } else {
      await updateQuantity(id, newQuantity);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile-Optimized Breadcrumb */}
        <div className="bg-black border-b border-gray-800">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link
                to="/"
                className="hover:text-brand-red transition-colors touch-manipulation"
              >
                Home
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">Shopping Cart</span>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Empty Cart */}
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="text-center max-w-md mx-auto space-y-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 sm:p-12 mobile-glass">
              <ShoppingBag className="h-16 w-16 sm:h-24 sm:w-24 text-brand-red mx-auto mb-6 animate-bounce" />
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
                Your cart is empty
              </h1>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Looks like you haven't added any items to your cart yet. Start
                shopping to fill it up!
              </p>
              <Link to="/">
                <Button className="w-full bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red text-white font-bold py-4 rounded-xl shadow-xl mobile-shadow-red transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-Optimized Breadcrumb */}
      <div className="bg-black border-b border-gray-800">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link
              to="/"
              className="hover:text-brand-red transition-colors touch-manipulation"
            >
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Shopping Cart</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Mobile-Optimized Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Shopping Cart
          </h1>
          <Button
            variant="outline"
            onClick={clearCart}
            className="text-destructive border-destructive hover:bg-destructive hover:text-white w-full sm:w-auto py-3 sm:py-2 rounded-xl touch-manipulation"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Mobile-Optimized Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => (
              <Card key={item.id} className="mobile-card overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  {/* Mobile Layout: Stack items vertically */}
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    {/* Product Image & Info */}
                    <div className="flex space-x-4 sm:flex-1">
                      <img
                        src={item.product.image_url || '/api/placeholder/150/150'}
                        alt={item.product.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl mobile-shadow flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1 text-base sm:text-lg leading-tight">
                          {item.product.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {item.product.description}
                        </p>
                      </div>
                    </div>

                    {/* Mobile: Quantity & Price Section */}
                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-between space-y-0 sm:space-y-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3 sm:space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          className="h-10 w-10 sm:h-8 sm:w-8 p-0 rounded-xl touch-manipulation mobile-btn"
                        >
                          <Minus className="h-4 w-4 sm:h-3 sm:w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-16 sm:w-14 text-center h-10 sm:h-8 rounded-xl"
                          min="0"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          className="h-10 w-10 sm:h-8 sm:w-8 p-0 rounded-xl touch-manipulation mobile-btn"
                        >
                          <Plus className="h-4 w-4 sm:h-3 sm:w-3" />
                        </Button>
                      </div>

                      {/* Price & Remove */}
                      <div className="flex items-center space-x-4 sm:space-x-2">
                        <div className="text-right">
                          <div className="font-bold text-foreground text-lg sm:text-base">
                            R{(item.product.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            R{item.product.price.toFixed(2)} each
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-10 w-10 sm:h-8 sm:w-8 p-0 rounded-xl touch-manipulation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mobile-Optimized Order Summary */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-4 mobile-card">
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-brand-red" />
                  Order Summary
                </h2>

                {/* Summary Details */}
                <div className="space-y-3 mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mobile-glass">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({state.itemCount} items)
                    </span>
                    <span className="text-foreground font-medium">
                      R{state.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Truck className="h-3 w-3 mr-1" />
                      Shipping
                    </span>
                    <span className="text-foreground font-medium">
                      {state.total >= 500 ? (
                        <span className="text-green-600 font-bold">Free</span>
                      ) : (
                        "R50.00"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (15%)</span>
                    <span className="text-foreground font-medium">
                      R{(state.total * 0.15).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="text-brand-red">
                        R
                        {(
                          state.total +
                          (state.total >= 500 ? 0 : 50) +
                          state.total * 0.15
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Free Shipping Alert */}
                {state.total < 500 && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6 mobile-shadow">
                    <div className="flex items-start space-x-2">
                      <Truck className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                        Add R{(500 - state.total).toFixed(2)} more for free
                        shipping!
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link to="/checkout" className="block w-full">
                    <Button className="w-full bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red text-white font-bold py-4 rounded-xl shadow-xl mobile-shadow-red transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Proceed to Checkout
                    </Button>
                  </Link>

                  <Link to="/" className="block w-full">
                    <Button
                      variant="outline"
                      className="w-full py-4 rounded-xl border-2 hover:border-brand-red/50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Continue Shopping
                    </Button>
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="flex flex-col items-center space-y-1">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-muted-foreground">
                        Secure Checkout
                      </span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <Truck className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-muted-foreground">
                        Fast Delivery
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
