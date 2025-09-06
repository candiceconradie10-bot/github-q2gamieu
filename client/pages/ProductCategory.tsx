import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductGrid } from "@/components/ProductGrid";
import { useProductsByCategory } from "@/hooks/useProducts";
import { getCategoryDisplayName } from "@/data/products";
import {
  Filter,
  Grid,
  List,
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

export default function ProductCategory() {
  const { category } = useParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState("all");

  const categoryDisplayName = getCategoryDisplayName(category || "");
  const { products, loading, error } = useProductsByCategory(category || "");

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by price range
    if (priceRange !== "all") {
      switch (priceRange) {
        case "under-100":
          filtered = filtered.filter(p => p.price < 100);
          break;
        case "100-500":
          filtered = filtered.filter(p => p.price >= 100 && p.price <= 500);
          break;
        case "over-500":
          filtered = filtered.filter(p => p.price > 500);
          break;
      }
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return filtered;
  }, [products, sortBy, priceRange]);

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
                {categoryDisplayName}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
              Premium <span className="gradient-text">{categoryDisplayName}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Discover our curated collection of high-quality {categoryDisplayName.toLowerCase()} 
              designed to meet your professional needs.
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8 p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* Price Range */}
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Price range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-100">Under R100</SelectItem>
                <SelectItem value="100-500">R100 - R500</SelectItem>
                <SelectItem value="over-500">Over R500</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex rounded-lg bg-white/10 border border-white/20 p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex-1 bg-transparent hover:bg-white/10"
              >
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex-1 bg-transparent hover:bg-white/10"
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center text-gray-300">
            <span className="text-sm">
              {loading ? "Loading..." : `${filteredProducts.length} products found`}
            </span>
          </div>
        </div>

        {/* Products Grid */}
        <ProductGrid
          products={filteredProducts}
          loading={loading}
          error={error}
          columns={viewMode === "grid" ? 3 : 2}
        />
      </div>
    </div>
  );
}