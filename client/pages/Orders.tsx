import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { orders, Order } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  Calendar,
  DollarSign,
  Loader2,
  ShoppingBag,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from "lucide-react";

interface OrderItemDetail {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
}

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const ordersList = await orders.getUserOrders(user.id);
        setUserOrders(ordersList);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: "Error",
          description: "Failed to load your orders. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchOrders();
    }
  }, [user, authLoading, toast]);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground">
              Please sign in to view your order history.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <Package className="h-8 w-8 mr-3 text-brand-red" />
            My Orders
          </h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your order history
          </p>
        </div>

        {userOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
              <h3 className="text-2xl font-semibold mb-4">No Orders Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet. Start shopping to see your orders here!
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {userOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </CardTitle>
                    <Badge 
                      className={`${getStatusColor(order.status)} flex items-center space-x-1`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-foreground">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Order Items</h4>
                    <div className="space-y-2">
                      {(order.products as OrderItemDetail[]).map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <div className="flex-1">
                            <span className="font-medium">{item.title}</span>
                            <span className="text-muted-foreground ml-2">
                              × {item.quantity}
                            </span>
                          </div>
                          <span className="font-semibold">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.shipping_address && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Shipping Address</h4>
                        <div className="text-sm text-muted-foreground">
                          {typeof order.shipping_address === 'object' ? (
                            <div>
                              <p>{order.shipping_address.street}</p>
                              <p>{order.shipping_address.city}, {order.shipping_address.province}</p>
                              <p>{order.shipping_address.postal_code}, {order.shipping_address.country}</p>
                            </div>
                          ) : (
                            <p>{String(order.shipping_address)}</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {selectedOrder?.id === order.id ? 'Hide Details' : 'View Details'}
                    </Button>

                    {selectedOrder?.id === order.id && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="font-medium">Order ID:</span>
                            <span className="ml-2 font-mono text-xs">{order.id}</span>
                          </div>
                          <div>
                            <span className="font-medium">Status:</span>
                            <span className="ml-2 capitalize">{order.status}</span>
                          </div>
                          <div>
                            <span className="font-medium">Total Items:</span>
                            <span className="ml-2">
                              {(order.products as OrderItemDetail[]).reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Last Updated:</span>
                            <span className="ml-2">{formatDate(order.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}