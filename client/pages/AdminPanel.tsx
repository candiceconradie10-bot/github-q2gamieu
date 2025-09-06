import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import { products, orders as ordersApi, Product, Order } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Eye,
  Save,
  X,
  Calendar,
  Loader2
} from 'lucide-react';

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  category: string;
  is_active: boolean;
}

export default function AdminPanel() {
  const { profile, loading: authLoading } = useAuth();
  const { products: allProducts, loading: productsLoading, refetch: refetchProducts } = useProducts();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [productForm, setProductForm] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    image_url: '',
    stock: 0,
    category: 'corporate-gifts',
    is_active: true
  });

  // Check if user is admin
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-red mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-red-500/10 border-red-500/20">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
            <p className="text-gray-300">You don't have permission to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const allOrders = await ordersApi.getAll();
      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  React.useEffect(() => {
    loadOrders();
  }, []);

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (editingProduct) {
        // Update existing product
        await products.update(editingProduct.id, productForm);
        toast.success('Product updated successfully');
      } else {
        // Create new product
        await products.create(productForm);
        toast.success('Product created successfully');
      }
      
      await refetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await products.delete(productId);
      await refetchProducts();
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      description: product.description,
      price: product.price,
      image_url: product.image_url || '',
      stock: product.stock,
      category: product.category,
      is_active: product.is_active
    });
    setShowProductForm(true);
  };

  const resetForm = () => {
    setProductForm({
      title: '',
      description: '',
      price: 0,
      image_url: '',
      stock: 0,
      category: 'corporate-gifts',
      is_active: true
    });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      await loadOrders();
      toast.success('Order status updated');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalProducts = allProducts.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400">Manage your e-commerce store</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-green-400">
                <DollarSign className="h-5 w-5 mr-2" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">R{totalRevenue.toFixed(2)}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-blue-400">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{totalOrders}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-purple-400">
                <Package className="h-5 w-5 mr-2" />
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{totalProducts}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="products" className="data-[state=active]:bg-brand-red">
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-brand-red">
              Orders
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Products</h2>
              <Button
                onClick={() => setShowProductForm(true)}
                className="bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {showProductForm && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex justify-between items-center">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                    <Button variant="ghost" onClick={resetForm}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Title</Label>
                        <Input
                          value={productForm.title}
                          onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                          className="bg-white/10 border-white/20 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-white">Category</Label>
                        <select
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-white"
                        >
                          <option value="corporate-gifts">Corporate Gifts</option>
                          <option value="corporate-clothing">Corporate Clothing</option>
                          <option value="workwear">Workwear</option>
                          <option value="headwear-and-accessories">Headwear & Accessories</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-white">Description</Label>
                      <Textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                        rows={3}
                        required
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-white">Price (R)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                          className="bg-white/10 border-white/20 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-white">Stock</Label>
                        <Input
                          type="number"
                          min="0"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                          className="bg-white/10 border-white/20 text-white"
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_active"
                          checked={productForm.is_active}
                          onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="is_active" className="text-white">Active</Label>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-white">Image URL</Label>
                      <Input
                        type="url"
                        value={productForm.image_url}
                        onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="https://..."
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={formLoading}
                      className="bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red"
                    >
                      {formLoading ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Save className="h-4 w-4 mr-2" />
                          {editingProduct ? 'Update Product' : 'Create Product'}
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {productsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-red mx-auto mb-4" />
                  <p className="text-gray-400">Loading products...</p>
                </div>
              ) : (
                allProducts.map((product) => (
                  <Card key={product.id} className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex space-x-4">
                          <img
                            src={product.image_url || '/api/placeholder/80/80'}
                            alt={product.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="font-bold text-white text-lg">{product.title}</h3>
                            <p className="text-gray-400 mb-2">{product.description}</p>
                            <div className="flex items-center space-x-4">
                              <span className="text-white font-medium">R{product.price.toFixed(2)}</span>
                              <Badge className={product.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                {product.stock} in stock
                              </Badge>
                              <Badge className={product.is_active ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}>
                                {product.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Orders</h2>
            
            <div className="grid gap-4">
              {ordersLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-red mx-auto mb-4" />
                  <p className="text-gray-400">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-400">No orders found</p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-white">Order #{order.id.slice(0, 8)}</h3>
                          <p className="text-gray-400">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold text-lg">R{order.total.toFixed(2)}</p>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                            className="mt-2 p-2 rounded bg-white/10 border border-white/20 text-white text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="shipped">Shipped</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-white">Items:</h4>
                        {order.products.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-400">{item.title} x{item.quantity}</span>
                            <span className="text-white">R{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}