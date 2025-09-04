import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Package,
  Truck,
  Mail,
  ArrowRight,
  Download,
} from "lucide-react";

export default function OrderConfirmation() {
  // In a real app, this would come from URL params or state
  const orderNumber =
    "APX-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your order has been successfully
              placed.
            </p>
          </div>

          {/* Order Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-left">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <div className="text-muted-foreground">Order Number</div>
                  <div className="font-semibold text-foreground">
                    {orderNumber}
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-muted-foreground">Order Date</div>
                  <div className="font-semibold text-foreground">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-muted-foreground">
                    Estimated Delivery
                  </div>
                  <div className="font-semibold text-foreground">
                    {estimatedDelivery.toLocaleDateString()}
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-muted-foreground">Payment Status</div>
                  <div className="font-semibold text-green-600">Confirmed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-left">What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 text-left">
                  <Mail className="h-5 w-5 text-brand-red mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">
                      Confirmation Email
                    </div>
                    <div className="text-sm text-muted-foreground">
                      You'll receive an order confirmation email within 5
                      minutes.
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 text-left">
                  <Package className="h-5 w-5 text-brand-red mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">
                      Order Processing
                    </div>
                    <div className="text-sm text-muted-foreground">
                      We'll prepare your items for shipping within 1-2 business
                      days.
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 text-left">
                  <Truck className="h-5 w-5 text-brand-red mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">
                      Shipping Updates
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Track your order with the tracking number we'll send you.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                className="flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button className="bg-brand-red hover:bg-brand-red/90 w-full sm:w-auto">
                  Continue Shopping
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="mt-12 p-6 bg-muted rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If you have any questions about your order, our customer service
              team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </Button>
              <Button variant="outline" size="sm">
                Call +27 11 886 5640
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
