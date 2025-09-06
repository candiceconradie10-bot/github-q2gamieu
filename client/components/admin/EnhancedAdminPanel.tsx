import React, { useState, useRef, useEffect } from 'react';
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
  DollarSign,
  Upload,
  Image as ImageIcon,
  FileText,
  Save,
  X,
  Loader2,
  Settings,
  Palette,
  Type,
  Download
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

interface SiteContent {
  id: string;
  type: 'text' | 'background' | 'image';
  key: string;
  value: string;
  label: string;
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
  const { profile, loading: authLoading } = useAuth();
  const { products: allProducts, loading: productsLoading, refetch: refetchProducts } = useProducts();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [siteContent, setSiteContent] = useState<SiteContent[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [productForm, setProductForm] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    image_url: '',
    stock: 0,
    category: 'corporate-gifts',
    is_active: true
  });

  // Initialize site content
  useEffect(() => {
    const defaultContent: SiteContent[] = [
      { id: '1', type: 'text', key: 'hero_title', value: 'APEX Promotional Products', label: 'Hero Section Title' },
      { id: '2', type: 'text', key: 'hero_subtitle', value: 'Your Brand, Our Expertise', label: 'Hero Section Subtitle' },
      { id: '3', type: 'text', key: 'company_name', value: 'APEX', label: 'Company Name' },
      { id: '4', type: 'text', key: 'company_tagline', value: 'Promotional Excellence', label: 'Company Tagline' },
      { id: '5', type: 'background', key: 'hero_background', value: '/api/placeholder/1920/1080', label: 'Hero Background Image' },
      { id: '6', type: 'background', key: 'main_background', value: '/api/placeholder/1920/1080', label: 'Main Background Image' },
      { id: '7', type: 'image', key: 'company_logo', value: '/Beige and Grey Minimalist Modern Bold Typographic Brand Logo (5).jpg', label: 'Company Logo' }
    ];
    
    // Load from localStorage or use defaults
    const saved = localStorage.getItem('site_content');
    setSiteContent(saved ? JSON.parse(saved) : defaultContent);
  }, []);

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

  useEffect(() => {
    loadOrders();
  }, []);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, isProductImage = false) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploadingImage(true);

    // Create a local URL for immediate preview
    const imageUrl = URL.createObjectURL(file);
    
    if (isProductImage) {
      setProductForm(prev => ({ ...prev, image_url: imageUrl }));
      toast.success('Product image uploaded successfully');
    }
    
    setUploadingImage(false);
  };

  const handleBackgroundUpload = (contentId: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.onchange = (event: any) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
          toast.error('Please select an image file');
          return;
        }

        const imageUrl = URL.createObjectURL(file);
        updateSiteContent(contentId, imageUrl);
        toast.success('Background image updated successfully');
      };
      fileInputRef.current.click();
    }
  };

  const handlePDFUpload = () => {
    if (pdfInputRef.current) {
      pdfInputRef.current.onchange = (event: any) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
          toast.error('Please select a PDF file');
          return;
        }

        // In a real app, you would upload to a server
        // For now, we'll just show a success message
        toast.success(`PDF "${file.name}" uploaded successfully`);
      };
      pdfInputRef.current.click();
    }
  };

  const updateSiteContent = (id: string, value: string) => {
    const updated = siteContent.map(item => 
      item.id === id ? { ...item, value } : item
    );
    setSiteContent(updated);
    localStorage.setItem('site_content', JSON.stringify(updated));
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (editingProduct) {
        await products.update(editingProduct.id, productForm);
        toast.success('Product updated successfully');
      } else {
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
      toast.success('Product deleted successfully');
      await refetchProducts();
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
    setEditingProduct(null);
    setShowProductForm(false);
    setProductForm({
      title: '',
      description: '',
      price: 0,
      image_url: '',
      stock: 0,
      category: 'corporate-gifts',
      is_active: true
    });
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await ordersApi.updateStatus(orderId, status);
      toast.success(`Order status updated to ${status}`);
      await loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const stats = {
    totalProducts: allProducts.length,
    activeProducts: allProducts.filter(p => p.is_active).length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Settings className="h-8 w-8 text-brand-red" />
              Admin Panel
            </h1>
            <p className="text-gray-400 mt-2">Manage your e-commerce store</p>
          </div>
          <Badge className="bg-brand-red text-white">
            Logged in as {profile?.full_name}
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-black/40 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Products</p>
                  <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/40 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Products</p>
                  <p className="text-2xl font-bold text-white">{stats.activeProducts}</p>
                </div>
                <Package className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Orders</p>
                  <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pending Orders</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">R{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

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
            <TabsTrigger value="content" className="data-[state=active]:bg-brand-red">
              <Type className="h-4 w-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="design" className="data-[state=active]:bg-brand-red">
              <Palette className="h-4 w-4 mr-2" />
              Design
            </TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-brand-red">
              <FileText className="h-4 w-4 mr-2" />
              Files
            </TabsTrigger>
          </TabsList>

          {/* Products Management */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Product Management</h2>
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
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title" className="text-white">Product Title</Label>
                        <Input
                          id="title"
                          value={productForm.title}
                          onChange={(e) => setProductForm(prev => ({ ...prev, title: e.target.value }))}
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
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <Label htmlFor="stock" className="text-white">Stock Quantity</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                          className="bg-gray-800 border-gray-700 text-white"
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <Switch
                          id="active"
                          checked={productForm.is_active}
                          onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, is_active: checked }))}
                        />
                        <Label htmlFor="active" className="text-white">Active Product</Label>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">Product Image</Label>
                      <div className="flex items-center space-x-4 mt-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="border-gray-700"
                        >
                          {uploadingImage ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Upload Image
                        </Button>
                        {productForm.image_url && (
                          <div className="text-sm text-green-400 flex items-center">
                            <ImageIcon className="h-4 w-4 mr-1" />
                            Image uploaded
                          </div>
                        )}
                      </div>
                      {productForm.image_url && (
                        <div className="mt-2">
                          <img 
                            src={productForm.image_url} 
                            alt="Product preview" 
                            className="w-24 h-24 object-cover rounded border border-gray-700"
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
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Products List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productsLoading ? (
                <div className="col-span-full flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
                </div>
              ) : (
                allProducts.map(product => (
                  <Card key={product.id} className="bg-black/40 border-gray-800">
                    <CardContent className="p-4">
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.title}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      )}
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-white truncate">{product.title}</h3>
                          <Badge 
                            variant={product.is_active ? "default" : "secondary"}
                            className={product.is_active ? "bg-green-600" : ""}
                          >
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-400 font-semibold">R{product.price}</span>
                          <span className="text-gray-400">Stock: {product.stock}</span>
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
            <h2 className="text-xl font-bold text-white">Order Management</h2>
            <div className="space-y-4">
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
                </div>
              ) : orders.length === 0 ? (
                <Card className="bg-black/40 border-gray-800">
                  <CardContent className="p-8 text-center">
                    <ShoppingCart className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No orders found</p>
                  </CardContent>
                </Card>
              ) : (
                orders.map(order => (
                  <Card key={order.id} className="bg-black/40 border-gray-800">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div>
                          <p className="text-sm text-gray-400">Order ID</p>
                          <p className="text-white font-mono text-sm">{order.id.slice(0, 8)}...</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Total</p>
                          <p className="text-green-400 font-semibold">R{order.total}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Status</p>
                          <Select 
                            value={order.status} 
                            onValueChange={(status) => updateOrderStatus(order.id, status as Order['status'])}
                          >
                            <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="pending" className="text-yellow-400">Pending</SelectItem>
                              <SelectItem value="shipped" className="text-blue-400">Shipped</SelectItem>
                              <SelectItem value="completed" className="text-green-400">Completed</SelectItem>
                              <SelectItem value="cancelled" className="text-red-400">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Date</p>
                          <p className="text-white text-sm">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Content Management */}
          <TabsContent value="content" className="space-y-4">
            <h2 className="text-xl font-bold text-white">Content Management</h2>
            <div className="space-y-4">
              {siteContent.filter(item => item.type === 'text').map(item => (
                <Card key={item.id} className="bg-black/40 border-gray-800">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <Label className="text-white">{item.label}</Label>
                      <Input
                        value={item.value}
                        onChange={(e) => updateSiteContent(item.id, e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Design Management */}
          <TabsContent value="design" className="space-y-4">
            <h2 className="text-xl font-bold text-white">Design & Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {siteContent.filter(item => item.type === 'background' || item.type === 'image').map(item => (
                <Card key={item.id} className="bg-black/40 border-gray-800">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <Label className="text-white">{item.label}</Label>
                      <div className="space-y-2">
                        <Button 
                          onClick={() => handleBackgroundUpload(item.id)}
                          className="w-full bg-brand-red hover:bg-red-600"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload New {item.type === 'background' ? 'Background' : 'Image'}
                        </Button>
                        {item.value && (
                          <div className="relative">
                            <img 
                              src={item.value} 
                              alt={item.label}
                              className="w-full h-32 object-cover rounded border border-gray-700"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Files Management */}
          <TabsContent value="files" className="space-y-4">
            <h2 className="text-xl font-bold text-white">File Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-black/40 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">PDF Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handlePDFUpload}
                    className="w-full bg-brand-red hover:bg-red-600"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload PDF
                  </Button>
                  <div className="text-sm text-gray-400">
                    Upload catalogs, price lists, or other PDF documents
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Bulk Product Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-brand-red hover:bg-red-600"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Upload Images
                  </Button>
                  <div className="text-sm text-gray-400">
                    Upload multiple product images at once
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, true)}
          className="hidden"
        />
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
        />
      </div>
    </div>
  );
}