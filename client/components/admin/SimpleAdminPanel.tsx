import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { products, Product } from '@/lib/supabaseClient';
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
  Upload,
  Image as ImageIcon,
  FileText,
  Save,
  X,
  Loader2,
  Settings,
  Palette,
  Type,
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

export default function SimpleAdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

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

  // Load products directly from Supabase
  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const data = await products.getAllForAdmin();
      setAllProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback to direct fetch if helper fails
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products?select=*`, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAllProducts(data);
        }
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
        toast.error('Failed to load products');
      }
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  // Simple admin check - if user is logged in, treat as admin for demo
  const isAdmin = user?.email === 'jantjieskurt7@gmail.com' || user?.email?.includes('admin');

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

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-red-500/10 border-red-500/20">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Please Sign In</h1>
            <p className="text-gray-300">You need to be logged in to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-red-500/10 border-red-500/20">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
            <p className="text-gray-300">You don't have permission to access the admin panel.</p>
            <p className="text-gray-400 text-sm mt-2">Logged in as: {user.email}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploadingImage(true);
    const imageUrl = URL.createObjectURL(file);
    setProductForm(prev => ({ ...prev, image_url: imageUrl }));
    toast.success('Image uploaded successfully');
    setUploadingImage(false);
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

        toast.success(`PDF "${file.name}" uploaded successfully`);
      };
      pdfInputRef.current.click();
    }
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
      
      await loadProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await products.delete(productId);
      toast.success('Product deleted successfully');
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
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

  const resetForm = () => {
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

  const stats = {
    totalProducts: allProducts.length,
    activeProducts: allProducts.filter(p => p.is_active).length,
    totalRevenue: allProducts.reduce((sum, product) => sum + (product.price * product.reviews_count), 0)
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
            Logged in as {user.email}
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <p className="text-sm text-gray-400">Estimated Revenue</p>
                  <p className="text-2xl font-bold text-white">R{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/40">
            <TabsTrigger value="products" className="data-[state=active]:bg-brand-red">
              <Package className="h-4 w-4 mr-2" />
              Products
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
                            Image set
                          </div>
                        )}
                      </div>
                      <Input
                        placeholder="Or paste image URL"
                        value={productForm.image_url}
                        onChange={(e) => setProductForm(prev => ({ ...prev, image_url: e.target.value }))}
                        className="mt-2 bg-gray-800 border-gray-700 text-white"
                      />
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
                          alt={product.name}
                          className="w-full h-32 object-cover rounded mb-3"
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
                          <span className="text-green-400 font-semibold">R{product.price}</span>
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

          {/* Design Management */}
          <TabsContent value="design" className="space-y-4">
            <h2 className="text-xl font-bold text-white">Design Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-black/40 border-gray-800">
                <CardContent className="p-4">
                  <Label className="text-white">Hero Background Image</Label>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full mt-2 bg-brand-red hover:bg-red-600"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Background
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-gray-800">
                <CardContent className="p-4">
                  <Label className="text-white">Company Logo</Label>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full mt-2 bg-brand-red hover:bg-red-600"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </CardContent>
              </Card>
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
          onChange={handleImageUpload}
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