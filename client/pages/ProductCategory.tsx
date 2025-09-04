import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ProductCard";
import { getProductsByCategory } from "@/data/products";
import {
  Filter,
  Grid,
  List,
  Star,
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Category URL to display name mapping
const getCategoryDisplayName = (categoryParam: string | undefined): string => {
  const categoryMap: Record<string, string> = {
    "corporate-gifts": "CLOTHING",
    "corporate-clothing": "WORKWEAR",
    workwear: "HEADWEAR",
    "headwear-and-accessories": "SAFETY GEAR",
    gifting: "GIFTING",
    display: "DISPLAY",
    footwear: "FOOTWEAR",
    "custom-products": "CUSTOM PRODUCTS",
  };

  return categoryParam
    ? categoryMap[categoryParam] || categoryParam.toUpperCase()
    : "PRODUCTS";
};

export default function ProductCategory() {
  const { category } = useParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categoryDisplayName = getCategoryDisplayName(category);
  const categoryProducts = category ? getProductsByCategory(category) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-black border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-brand-red transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">
              {categoryDisplayName}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Category Header */}
      <div className="relative bg-gradient-to-br from-black via-gray-900 to-black py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-red/10 via-transparent to-red-600/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,20,60,0.1),transparent_70%)]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <Badge className="bg-gradient-to-r from-brand-red to-red-600 text-white font-bold px-4 py-2 rounded-full border-0 shadow-lg">
                <Sparkles className="h-4 w-4 mr-2" />
                Premium Collection
              </Badge>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                {categoryDisplayName}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Discover our premium selection of
              <span className="text-brand-red font-semibold">
                &nbsp;{categoryDisplayName}&nbsp;
              </span>
              with professional custom branding options and industry-leading
              quality.
            </p>

            <div className="flex items-center justify-center space-x-8 pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-red">
                  {categoryProducts.length}+
                </div>
                <div className="text-sm text-gray-400">Products</div>
              </div>
              <div className="text-center ml-8">
                <div className="text-2xl font-bold text-brand-red">
                  Fast Delivery
                </div>
                <div className="text-sm text-gray-400">Nationwide</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-red">★ 4.9</div>
                <div className="text-sm text-gray-400">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Price Range</h4>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        Under R100
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        R100 - R250
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        R250 - R500
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        Over R500
                      </label>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Brand</h4>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        Alex Varga
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        Elevate
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        Slazenger
                      </label>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Color</h4>
                    <div className="flex flex-wrap gap-2">
                      {["Black", "White", "Navy", "Red", "Blue"].map(
                        (color) => (
                          <div
                            key={color}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
                            style={{
                              backgroundColor: color.toLowerCase(),
                            }}
                          />
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-black rounded-lg p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-gray-800">
              <div className="flex items-center space-x-4">
                <span className="text-muted-foreground">
                  Showing {categoryProducts.length} products
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <Select defaultValue="featured">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="rating">Customer Rating</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-gray-100" : ""}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-gray-100" : ""}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Product Grid */}
            <div
              className={
                viewMode === "grid"
                  ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
                  : "space-y-6"
              }
            >
              {categoryProducts.length > 0 ? (
                categoryProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="opacity-0 animate-fadeInUp"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: "forwards",
                    }}
                  >
                    <ProductCard product={product} size="md" />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="h-16 w-16 mx-auto mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414A1 1 0 0016 7.414V9a2 2 0 012 2v2a2 2 0 01-2 2h-2m0 0v2a2 2 0 002 2v0a2 2 0 002-2v-2"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-400 mb-6">
                    We couldn't find any products in this category. Try browsing
                    other categories or check back later.
                  </p>
                  <Link to="/">
                    <Button className="bg-brand-red hover:bg-brand-red/90">
                      Browse All Categories
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <Button variant="outline" disabled>
                  Previous
                </Button>
                <Button className="bg-brand-red">1</Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline">Next</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
