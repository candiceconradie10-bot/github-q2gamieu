import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { orders } from "@/lib/supabaseClient";
import { toast } from "sonner";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  CheckCircle,
  User,
  MapPin,
  Phone,
  Mail,
  Building,
  Lock,
  Star,
  Timer,
} from "lucide-react";

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
}

interface ShippingAddress {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface PaymentInfo {
  method: "card" | "eft" | "payfast";
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardName?: string;
}

export default function Checkout() {
  const { state, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
  });

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address: "",
    city: "",
    province: "",
    postalCode: "",
    country: "South Africa",
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: "card",
  });

  const [billingDifferent, setBillingDifferent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = state.total;
  const shipping = subtotal >= 500 ? 0 : 50;
  const tax = subtotal * 0.15;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Create order in database
    try {
      if (!user) {
        toast.error('Please log in to place an order');
        return;
      }

      const orderData = {
        user_id: user.id,
        products: state.items.map(item => ({
          product_id: item.product_id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity
        })),
        total,
        status: 'pending' as const,
        shipping_address: {
          customerInfo,
          shippingAddress
        }
      };

      await orders.create(orderData);
      await clearCart();
      
      toast.success('Order placed successfully!');
      navigate("/order-confirmation");
    } catch (error) {
      console.error('Order creation failed:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="text-center max-w-md mx-auto space-y-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 sm:p-12 mobile-glass">
              <Timer className="h-16 w-16 sm:h-24 sm:w-24 text-brand-red mx-auto mb-6 animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
                No items in cart
              </h1>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Add some items to your cart before proceeding to checkout.
              </p>
              <Link to="/">
                <Button className="w-full bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red text-white font-bold py-4 rounded-xl shadow-xl mobile-shadow-red transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Start Shopping
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
            <Link
              to="/cart"
              className="hover:text-brand-red transition-colors touch-manipulation"
            >
              Cart
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Checkout</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Mobile-Optimized Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Secure Checkout
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Mobile-Optimized Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card className="mobile-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <User className="h-5 w-5 mr-2 text-brand-red" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="flex items-center text-sm font-medium"
                      >
                        <span>First Name</span>
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        required
                        value={customerInfo.firstName}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            firstName: e.target.value,
                          })
                        }
                        className="h-12 rounded-xl text-base"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="lastName"
                        className="flex items-center text-sm font-medium"
                      >
                        <span>Last Name</span>
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        required
                        value={customerInfo.lastName}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            lastName: e.target.value,
                          })
                        }
                        className="h-12 rounded-xl text-base"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="flex items-center text-sm font-medium"
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      <span>Email Address</span>
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={customerInfo.email}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          email: e.target.value,
                        })
                      }
                      className="h-12 rounded-xl text-base"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="flex items-center text-sm font-medium"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        <span>Phone Number</span>
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="phone"
                        required
                        value={customerInfo.phone}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            phone: e.target.value,
                          })
                        }
                        className="h-12 rounded-xl text-base"
                        placeholder="+27 12 345 6789"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="company"
                        className="flex items-center text-sm font-medium"
                      >
                        <Building className="h-3 w-3 mr-1" />
                        <span>Company (Optional)</span>
                      </Label>
                      <Input
                        id="company"
                        value={customerInfo.company}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            company: e.target.value,
                          })
                        }
                        className="h-12 rounded-xl text-base"
                        placeholder="Company name"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="mobile-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <MapPin className="h-5 w-5 mr-2 text-brand-red" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="address"
                      className="flex items-center text-sm font-medium"
                    >
                      <span>Street Address</span>
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Textarea
                      id="address"
                      required
                      rows={3}
                      value={shippingAddress.address}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          address: e.target.value,
                        })
                      }
                      className="rounded-xl text-base"
                      placeholder="123 Main Street, Apt 4B"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="city"
                        className="flex items-center text-sm font-medium"
                      >
                        <span>City</span>
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="city"
                        required
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            city: e.target.value,
                          })
                        }
                        className="h-12 rounded-xl text-base"
                        placeholder="Johannesburg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="province"
                        className="flex items-center text-sm font-medium"
                      >
                        <span>Province</span>
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="province"
                        required
                        value={shippingAddress.province}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            province: e.target.value,
                          })
                        }
                        className="h-12 rounded-xl text-base"
                        placeholder="Gauteng"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="postalCode"
                        className="flex items-center text-sm font-medium"
                      >
                        <span>Postal Code</span>
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="postalCode"
                        required
                        value={shippingAddress.postalCode}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            postalCode: e.target.value,
                          })
                        }
                        className="h-12 rounded-xl text-base"
                        placeholder="2000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-sm font-medium">
                        Country
                      </Label>
                      <Input
                        id="country"
                        value={shippingAddress.country}
                        readOnly
                        className="h-12 rounded-xl text-base bg-muted"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="mobile-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <CreditCard className="h-5 w-5 mr-2 text-brand-red" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={paymentInfo.method}
                    onValueChange={(value) =>
                      setPaymentInfo({
                        ...paymentInfo,
                        method: value as "card" | "eft" | "payfast",
                      })
                    }
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-4 rounded-xl border border-border hover:border-brand-red/50 transition-colors touch-manipulation">
                      <RadioGroupItem
                        value="card"
                        id="card"
                        className="w-5 h-5"
                      />
                      <Label htmlFor="card" className="flex-1 font-medium">
                        Credit/Debit Card
                        <span className="block text-sm text-muted-foreground font-normal">
                          Visa, Mastercard, American Express
                        </span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 rounded-xl border border-border hover:border-brand-red/50 transition-colors touch-manipulation">
                      <RadioGroupItem
                        value="eft"
                        id="eft"
                        className="w-5 h-5"
                      />
                      <Label htmlFor="eft" className="flex-1 font-medium">
                        EFT/Bank Transfer
                        <span className="block text-sm text-muted-foreground font-normal">
                          Direct bank transfer
                        </span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 rounded-xl border border-border hover:border-brand-red/50 transition-colors touch-manipulation">
                      <RadioGroupItem
                        value="payfast"
                        id="payfast"
                        className="w-5 h-5"
                      />
                      <Label htmlFor="payfast" className="flex-1 font-medium">
                        PayFast
                        <span className="block text-sm text-muted-foreground font-normal">
                          Secure online payment gateway
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentInfo.method === "card" && (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div className="space-y-2">
                        <Label
                          htmlFor="cardName"
                          className="flex items-center text-sm font-medium"
                        >
                          <span>Cardholder Name</span>
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id="cardName"
                          required
                          value={paymentInfo.cardName || ""}
                          onChange={(e) =>
                            setPaymentInfo({
                              ...paymentInfo,
                              cardName: e.target.value,
                            })
                          }
                          className="h-12 rounded-xl text-base"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="cardNumber"
                          className="flex items-center text-sm font-medium"
                        >
                          <span>Card Number</span>
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id="cardNumber"
                          required
                          placeholder="1234 5678 9012 3456"
                          value={paymentInfo.cardNumber || ""}
                          onChange={(e) =>
                            setPaymentInfo({
                              ...paymentInfo,
                              cardNumber: e.target.value,
                            })
                          }
                          className="h-12 rounded-xl text-base"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="expiryDate"
                            className="flex items-center text-sm font-medium"
                          >
                            <span>Expiry Date</span>
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input
                            id="expiryDate"
                            required
                            placeholder="MM/YY"
                            value={paymentInfo.expiryDate || ""}
                            onChange={(e) =>
                              setPaymentInfo({
                                ...paymentInfo,
                                expiryDate: e.target.value,
                              })
                            }
                            className="h-12 rounded-xl text-base"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="cvv"
                            className="flex items-center text-sm font-medium"
                          >
                            <span>CVV</span>
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input
                            id="cvv"
                            required
                            placeholder="123"
                            value={paymentInfo.cvv || ""}
                            onChange={(e) =>
                              setPaymentInfo({
                                ...paymentInfo,
                                cvv: e.target.value,
                              })
                            }
                            className="h-12 rounded-xl text-base"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentInfo.method === "eft" && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl mobile-glass">
                      <div className="flex items-start space-x-3">
                        <Truck className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                          Bank transfer details will be provided after order
                          confirmation. Your order will be processed once
                          payment is received.
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentInfo.method === "payfast" && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl mobile-glass">
                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                          You will be redirected to PayFast to complete your
                          payment securely.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Terms and Conditions */}
              <Card className="mobile-card">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 mobile-glass">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) =>
                        setTermsAccepted(checked as boolean)
                      }
                      className="mt-1 w-5 h-5"
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm leading-relaxed font-medium"
                    >
                      I agree to the{" "}
                      <Link
                        to="/terms"
                        className="text-brand-red hover:underline touch-manipulation"
                      >
                        Terms and Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy"
                        className="text-brand-red hover:underline touch-manipulation"
                      >
                        Privacy Policy
                      </Link>
                      . I understand that my order will be processed according
                      to these terms.
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile-Optimized Order Summary */}
            <div className="lg:col-span-1">
              <Card className="lg:sticky lg:top-4 mobile-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <CheckCircle className="h-5 w-5 mr-2 text-brand-red" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mobile-glass">
                    {state.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm border-b border-border/50 pb-2 last:border-b-0 last:pb-0"
                      >
                        <div className="flex-1 pr-2">
                          <div className="font-medium line-clamp-1">
                            {item.name}
                          </div>
                          <div className="text-muted-foreground">
                            Qty: {item.quantity} × R{item.price.toFixed(2)}
                          </div>
                        </div>
                        <div className="font-bold text-brand-red">
                          R{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Totals */}
                  <div className="border-t pt-4 space-y-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mobile-glass">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        R{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center">
                        <Truck className="h-3 w-3 mr-1" />
                        Shipping
                      </span>
                      <span className="font-medium">
                        {shipping === 0 ? (
                          <span className="text-green-600 font-bold">Free</span>
                        ) : (
                          `R${shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (15%)</span>
                      <span className="font-medium">R{tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-foreground">Total</span>
                        <span className="text-brand-red text-xl">
                          R{total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 space-y-3">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red text-white font-bold py-4 rounded-xl shadow-xl mobile-shadow-red transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          <Lock className="h-5 w-5 mr-2" />
                          Place Order - R{total.toFixed(2)}
                        </>
                      )}
                    </Button>
                    <Link to="/cart" className="block w-full">
                      <Button
                        variant="outline"
                        className="w-full py-4 rounded-xl border-2 hover:border-brand-red/50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Cart
                      </Button>
                    </Link>
                  </div>

                  {/* Trust Indicators */}
                  <div className="pt-4 border-t border-border">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="flex flex-col items-center space-y-1 p-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-muted-foreground">
                          Secure
                        </span>
                      </div>
                      <div className="flex flex-col items-center space-y-1 p-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs text-muted-foreground">
                          Trusted
                        </span>
                      </div>
                      <div className="flex flex-col items-center space-y-1 p-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-xs text-muted-foreground">
                          Verified
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center">
                      <Lock className="h-3 w-3 mr-1" />
                      Your payment information is secure and encrypted
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
