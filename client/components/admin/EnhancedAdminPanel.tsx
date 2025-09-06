import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  products, 
  orders, 
  Product, 
  Order, 
  Profile,
  adminActivity,
  admin,
  supabase 
} from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  Package,
  ShoppingCart,
  Users,
  Activity,
  Eye,
  Save,
  X,
  Loader2,
  Settings,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Search,
  FileText,
  UserCheck,
  Shield
} from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  rating: number;
  reviews_count: number;
  is_active: boolean;
}

interface AdminStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentActivity: number;
}

interface AdminActivityLog {
  id: string;
  admin_id?: string;
  action: string;
  target_type?: string;
  target_id?: string;
  payload?: any;
  created_at: string;
}

const categories = [
  'corporate-clothing',
  'corporate-gifts', 
  'workwear',
  'headwear-and-accessories',
  'gifting',
  'display',
  'footwear',
  'custom-products'
];

export default function EnhancedAdminPanel() {
  const { user, profile, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Data states
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentActivity: 0
  });

  // Loading states
  const [productsLoading, setProductsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  // Form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>('all');

  const [productForm, setProductForm] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    category: 'corporate-gifts',
    rating: 0,
    reviews_count: 0,
    is_active: true
  });

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setCheckingAdmin(false);
        return;
      }

      try {
        const adminStatus = await admin.isAdmin(user.id);
        setIsAdmin(adminStatus);
        
        if (adminStatus) {
          await logAdminActivity('admin_panel_accessed');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading]);

  // Load all data
  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  const logAdminActivity = async (action: string, targetType?: string, targetId?: string, payload?: any) => {
    if (!user) return;
    
    try {
      await adminActivity.log(user.id, action, targetType, targetId, payload);
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  };

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadProducts(),
        loadOrders(), 
        loadUsers(),
        loadActivityLogs(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    }
  };

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const data = await products.getAllForAdmin();
      setAllProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const data = await orders.getAll();
      setAllOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    try {
      setActivityLoading(true);
      const data = await adminActivity.getAll(50);
      setActivityLogs(data);
    } catch (error) {
      console.error('Error loading activity logs:', error);
      // Don't show error toast for activity logs as it's not critical
    } finally {
      setActivityLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const totalProducts = allProducts.length;
      const activeProducts = allProducts.filter(p => p.is_active).length;
      const totalOrders = allOrders.length;
      const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
      const totalUsers = allUsers.length;
      const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
      const recentActivity = activityLogs.filter(log => 
        new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length;

      setStats({
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        totalUsers,
        totalRevenue,
        recentActivity
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setFormLoading(true);

    try {
      if (editingProduct) {
        await products.update(editingProduct.id, productForm);
        await logAdminActivity('product_updated', 'product', editingProduct.id.toString(), {
          name: productForm.name,
          price: productForm.price
        });
        toast.success('Product updated successfully');
      } else {
        const result = await products.create(productForm);
        await logAdminActivity('product_created', 'product', result.data?.id?.toString(), {
          name: productForm.name,
          price: productForm.price
        });
        toast.success('Product created successfully');
      }
      
      await loadProducts();
      await loadStats();
      resetProductForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const product = allProducts.find(p => p.id === productId);
      await products.delete(productId);
      await logAdminActivity('product_deleted', 'product', productId.toString(), {
        name: product?.name
      });
      toast.success('Product deleted successfully');
      await loadProducts();
      await loadStats();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, status: Order['status']) => {
    if (!user) return;

    try {
      await orders.updateStatus(orderId, status);
      await logAdminActivity('order_status_updated', 'order', orderId, { status });
      toast.success(`Order status updated to ${status}`);
      await loadOrders();
      await loadStats();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      image_url: product.image_url || '',
      category: product.category,
      rating: product.rating,
      reviews_count: product.reviews_count,
      is_active: product.is_active
    });
    setShowProductForm(true);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setShowProductForm(false);
    setProductForm({
      name: '',
      description: '',
      price: 0,
      image_url: '',
      category: 'corporate-gifts',
      rating: 0,
      reviews_count: 0,
      is_active: true
    });
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'shipped': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
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

  // Filter data
  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = allOrders.filter(order => {
    if (selectedOrderStatus === 'all') return true;
    return order.status === selectedOrderStatus;
  });

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-red mx-auto mb-4" />
          <p className="text-white">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-red-500/10 border-red-500/20">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-400 mb-4">Authentication Required</h1>
            <p className="text-gray-300">Please sign in to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-red-500/10 border-red-500/20">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
            <p className="text-gray-300">You don't have permission to access the admin panel.</p>
            <p className="text-gray-400 text-sm mt-2">Logged in as: {user.email}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Settings className="h-8 w-8 text-brand-red" />
              Enhanced Admin Panel
            </h1>
            <p className="text-gray-400 mt-2">Complete e-commerce management dashboard</p>
          </div>
          <Badge className="bg-brand-red text-white flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Admin: {profile?.full_name || user.email}
          </Badge>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-black/40 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Products</p>
                  <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
                  <p className="text-xs text-green-400">{stats.activeProducts} active</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/40 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Orders</p>
                  <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
                  <p className="text-xs text-yellow-400">{stats.pendingOrders} pending</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                  <p className="text-xs text-blue-400">registered</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-xs text-green-400">{stats.recentActivity} recent activities</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-black/40">
            <TabsTrigger value="products" className="data-[state=active]:bg-brand-red">
              <Package className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-brand-red">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-brand-red">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-brand-red">
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-brand-red">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Products Management */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-white">Product Management</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
              <Button 
                onClick={() => setShowProductForm(true)}
                className="bg-brand-red hover:bg-red-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {showProductForm && (
              <Card className="bg-black/40 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={resetProductForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-white">Product Name</Label>
                        <Input
                          id="name"
                          value={productForm.name}
                          onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-gray-800 border-gray-700 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category" className="text-white">Category</Label>
                        <Select 
                          value={productForm.category} 
                          onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            {categories.map(cat => (
                              <SelectItem key={cat} value={cat} className="text-white">
                                {cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-white">Description</Label>
                      <Textarea
                        id="description"
                        value={productForm.description}
                        onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="price" className="text-white">Price (R)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) => setProductForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          className="bg-gray-800 border-gray-700 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="rating" className="text-white">Rating</Label>
                        <Input
                          id="rating"
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={productForm.rating}
                          onChange={(e) => setProductForm(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reviews_count" className="text-white">Reviews Count</Label>
                        <Input
                          id="reviews_count"
                          type="number"
                          value={productForm.reviews_count}
                          onChange={(e) => setProductForm(prev => ({ ...prev, reviews_count: parseInt(e.target.value) || 0 }))}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <Switch
                          id="active"
                          checked={productForm.is_active}
                          onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, is_active: checked }))}
                        />
                        <Label htmlFor="active" className="text-white">Active</Label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="image_url" className="text-white">Image URL</Label>
                      <Input
                        id="image_url"
                        value={productForm.image_url}
                        onChange={(e) => setProductForm(prev => ({ ...prev, image_url: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="https://example.com/image.jpg"
                      />
                      {productForm.image_url && (
                        <div className="mt-2">
                          <img 
                            src={productForm.image_url} 
                            alt="Product preview" 
                            className="w-24 h-24 object-cover rounded border border-gray-700"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-4">
                      <Button 
                        type="submit" 
                        disabled={formLoading}
                        className="bg-brand-red hover:bg-red-600"
                      >
                        {formLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        {editingProduct ? 'Update Product' : 'Create Product'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetProductForm}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productsLoading ? (
                <div className="col-span-full flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No products found</p>
                </div>
              ) : (
                filteredProducts.map(product => (
                  <Card key={product.id} className="bg-black/40 border-gray-800 hover:border-gray-600 transition-colors">
                    <CardContent className="p-4">
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-32 object-cover rounded mb-3"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      )}
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-white truncate">{product.name}</h3>
                          <Badge 
                            variant={product.is_active ? "default" : "secondary"}
                            className={product.is_active ? "bg-green-600" : ""}
                          >
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-400 font-semibold">{formatCurrency(product.price)}</span>
                          <span className="text-yellow-400">⭐ {product.rating}</span>
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditProduct(product)}
                            className="flex-1 border-gray-700"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="flex-1"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Orders Management */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex justify-between items-center gap-4">
              <h2 className="text-xl font-bold text-white">Order Management</h2>
              <Select 
                value={selectedOrderStatus} 
                onValueChange={setSelectedOrderStatus}
              >
                <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-white">All Orders</SelectItem>
                  <SelectItem value="pending" className="text-white">Pending</SelectItem>
                  <SelectItem value="shipped" className="text-white">Shipped</SelectItem>
                  <SelectItem value="completed" className="text-white">Completed</SelectItem>
                  <SelectItem value="cancelled" className="text-white">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No orders found</p>
                </div>
              ) : (
                filteredOrders.map(order => (
                  <Card key={order.id} className="bg-black/40 border-gray-800">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-white">Order #{order.id.slice(0, 8)}</h3>
                          <p className="text-sm text-gray-400">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-semibold text-white">{formatCurrency(order.total)}</span>
                          <Select 
                            value={order.status} 
                            onValueChange={(status) => handleOrderStatusUpdate(order.id, status as Order['status'])}
                          >
                            <SelectTrigger className={`w-32 ${getStatusColor(order.status)} border`}>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(order.status)}
                                <SelectValue />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="pending" className="text-white">Pending</SelectItem>
                              <SelectItem value="shipped" className="text-white">Shipped</SelectItem>
                              <SelectItem value="completed" className="text-white">Completed</SelectItem>
                              <SelectItem value="cancelled" className="text-white">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-white">Order Items:</h4>
                        <div className="space-y-1">
                          {order.products.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-300">{item.title} × {item.quantity}</span>
                              <span className="text-gray-300">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {order.shipping_address && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <h4 className="text-sm font-medium text-white">Shipping Address:</h4>
                          <div className="text-sm text-gray-400">
                            <p>{order.shipping_address.fullName}</p>
                            <p>{order.shipping_address.addressLine1}</p>
                            {order.shipping_address.addressLine2 && <p>{order.shipping_address.addressLine2}</p>}
                            <p>{order.shipping_address.city}, {order.shipping_address.postalCode}</p>
                            {order.shipping_address.phone && <p>Phone: {order.shipping_address.phone}</p>}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users" className="space-y-4">
            <h2 className="text-xl font-bold text-white">User Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usersLoading ? (
                <div className="col-span-full flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
                </div>
              ) : allUsers.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No users found</p>
                </div>
              ) : (
                allUsers.map(userProfile => (
                  <Card key={userProfile.id} className="bg-black/40 border-gray-800">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white">
                            {userProfile.full_name || 'Anonymous User'}
                          </h3>
                          <Badge 
                            variant={userProfile.is_admin ? "default" : "secondary"}
                            className={userProfile.is_admin ? "bg-purple-600" : ""}
                          >
                            {userProfile.is_admin ? 'Admin' : 'User'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-300">{userProfile.email}</p>
                          {userProfile.phone && (
                            <p className="text-gray-400">Phone: {userProfile.phone}</p>
                          )}
                          <p className="text-gray-400">
                            Joined: {formatDate(userProfile.created_at)}
                          </p>
                        </div>

                        {userProfile.address && (
                          <div className="text-xs text-gray-500">
                            <p>Address on file</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Activity Logs */}
          <TabsContent value="activity" className="space-y-4">
            <h2 className="text-xl font-bold text-white">Admin Activity Log</h2>
            
            <div className="space-y-2">
              {activityLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No activity logs found</p>
                </div>
              ) : (
                activityLogs.map(log => (
                  <Card key={log.id} className="bg-black/40 border-gray-800">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Activity className="h-4 w-4 text-blue-400" />
                          <div>
                            <p className="text-sm text-white font-medium">{log.action.replace('_', ' ')}</p>
                            {log.target_type && (
                              <p className="text-xs text-gray-400">
                                {log.target_type}: {log.target_id}
                              </p>
                            )}
                            {log.payload && (
                              <p className="text-xs text-gray-500">
                                {JSON.stringify(log.payload)}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <h2 className="text-xl font-bold text-white">Analytics Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Order Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {['pending', 'shipped', 'completed', 'cancelled'].map(status => {
                    const count = allOrders.filter(order => order.status === status).length;
                    const percentage = allOrders.length > 0 ? (count / allOrders.length * 100).toFixed(1) : 0;
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status as Order['status'])}
                          <span className="text-white capitalize">{status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">{count}</span>
                          <span className="text-sm text-gray-500">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Product Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categories.map(category => {
                    const count = allProducts.filter(product => product.category === category).length;
                    const activeCount = allProducts.filter(product => product.category === category && product.is_active).length;
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-white capitalize">
                          {category.replace('-', ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">{activeCount}/{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-black/40 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Recent Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-400">{stats.recentActivity}</p>
                    <p className="text-sm text-gray-400">Activities (24h)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-400">{stats.pendingOrders}</p>
                    <p className="text-sm text-gray-400">Pending Orders</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-400">{stats.activeProducts}</p>
                    <p className="text-sm text-gray-400">Active Products</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-400">{formatCurrency(stats.totalRevenue / (stats.totalOrders || 1))}</p>
                    <p className="text-sm text-gray-400">Avg. Order Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}