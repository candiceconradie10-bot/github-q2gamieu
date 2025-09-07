import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/OptimizedImage";
import { SEO, generateFAQSchema } from "@/components/SEO";
import { EditableText, EditableImage } from "@/components/EditableText";
import { useEditing } from "@/contexts/EditingContext";
import { categories } from "@/data/products";
import { useProducts } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/ProductGrid";
import {
  ArrowRight,
  Star,
  Truck,
  Shield,
  Award,
  Users,
  Gift,
  Shirt,
  Briefcase,
  Sparkles,
  Zap,
  TrendingUp,
  Rocket,
  CheckCircle,
  Globe,
  Heart,
  Target,
  Flame,
  Download,
  Eye,
  ShoppingBag,
  BookOpen,
  MousePointer,
  Play,
  Coffee,
  Crown,
  Layers,
  ChevronLeft,
  ChevronRight,
  Pause,
} from "lucide-react";

export default function Index() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const { products: allProducts, loading, error } = useProducts();
  const { getContent } = useEditing();
  
  // Filter products based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery || !allProducts.length) return [];
    
    const query = searchQuery.toLowerCase().trim();
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
  }, [searchQuery, allProducts]);

  // Featured products (random selection of 6 products)
  const featuredProducts = useMemo(() => {
    if (!allProducts.length) return [];
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  }, [allProducts]);

  // SEO structured data for FAQ
  const faqData = [
    {
      question: "What types of promotional products does APEX offer?",
      answer:
        "APEX offers over 10,000+ promotional products including corporate gifts, workwear, headwear, safety gear, custom clothing, and branded accessories with professional embroidery and printing services.",
    },
    {
      question: "Do you provide custom branding services?",
      answer:
        "Yes, we provide professional custom branding services including embroidery, screen printing, laser engraving, and digital printing on all our promotional products.",
    },
    {
      question: "What is your delivery time across South Africa?",
      answer:
        "We offer fast delivery across South Africa with turnaround times typically ranging from 48 hours to 7 working days depending on the product and customization requirements.",
    },
    {
      question: "Do you offer bulk discounts for large orders?",
      answer:
        "Yes, we offer competitive bulk pricing for large orders. Contact our sales team at +27 76 035 5295 or apex@w-o-s.co.za for custom quotes on bulk orders.",
    },
  ];

  const featuredCategories = categories.slice(0, 6);

  // Marketing slideshow banners - using dynamic content
  const marketingSlides = [
    {
      id: 1,
      title: getContent("hero_slide_1_title", "Gear Up, Stand Out"),
      subtitle: getContent("hero_slide_1_subtitle", "Spring Fashion Collection"),
      description: getContent("hero_slide_1_description", 
        "Embrace the lively spirit of spring with our newest fashion collection, featuring vibrant colors and elegance"),
      backgroundImage: getContent("hero_slide_1_bg",
        "https://images.pexels.com/photos/33737019/pexels-photo-33737019.jpeg?auto=compress&cs=tinysrgb&w=1920"),
      cta: getContent("hero_slide_1_cta", "Shop Collection"),
      link: "/corporate-gifts",
    },
    {
      id: 2,
      title: getContent("hero_slide_2_title", "Professional Excellence"),
      subtitle: getContent("hero_slide_2_subtitle", "APEX Collection"),
      description: getContent("hero_slide_2_description",
        "Discover our premium range of professional workwear and corporate solutions designed for modern businesses"),
      backgroundImage: getContent("hero_slide_2_bg",
        "https://images.pexels.com/photos/8486911/pexels-photo-8486911.jpeg?auto=compress&cs=tinysrgb&w=1920"),
      cta: getContent("hero_slide_2_cta", "Explore APEX"),
      link: "/corporate-clothing",
    },
    {
      id: 3,
      title: getContent("hero_slide_3_title", "W.O.S APEX"),
      subtitle: getContent("hero_slide_3_subtitle", "Complete Solutions"),
      description: getContent("hero_slide_3_description",
        "From workwear to safety equipment, discover our comprehensive range of professional products and services"),
      backgroundImage: getContent("hero_slide_3_bg",
        "https://images.pexels.com/photos/4194843/pexels-photo-4194843.jpeg?auto=compress&cs=tinysrgb&w=1920"),
      cta: getContent("hero_slide_3_cta", "View All Products"),
      link: "/custom-products",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-advance slideshow
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % marketingSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, marketingSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % marketingSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + marketingSlides.length) % marketingSlides.length,
    );
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="APEX - Africa's #1 Promotional Products Provider | Corporate Gifts, Workwear & Custom Branding"
        description="Premium corporate gifts, workwear, headwear & promotional items. 10,000+ products with professional custom branding, embroidery & printing services. Fast delivery across South Africa."
        keywords="corporate gifts, promotional products, workwear, custom branding, embroidery, printing, promotional items, corporate clothing, headwear, safety gear, South Africa, APEX, branded merchandise"
        structuredData={generateFAQSchema(faqData)}
      />

      {/* Marketing Slideshow Hero Section */}
      <section className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden">
        {/* Slideshow Container */}
        <div className="relative w-full h-full">
          {marketingSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide
                  ? "opacity-100 transform translate-x-0"
                  : index < currentSlide
                    ? "opacity-0 transform -translate-x-full"
                    : "opacity-0 transform translate-x-full"
              }`}
            >
              {/* Background Image - Editable */}
              <EditableImage
                contentKey={`hero_slide_${slide.id}_bg`}
                defaultValue={slide.backgroundImage}
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              />
              <div className="absolute inset-0 bg-black/25" />

              {/* Background Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_70%)] animate-float" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_60%)] animate-floatReverse" />

              {/* Grid pattern */}
              <div className="absolute inset-0 grid-pattern opacity-20" />

              {/* Content - Buttons positioned at bottom */}
              <div className="relative h-full flex items-end justify-center">
                <div className="container mx-auto px-4 pb-16 sm:pb-20 relative z-10">
                  <div className="text-center max-w-2xl mx-auto">
                    {/* CTA Buttons at bottom */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 justify-center px-4 sm:px-0">
                      <a href="#about-section" className="w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full min-h-[56px] bg-transparent border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 font-bold px-6 py-4 sm:px-8 rounded-xl backdrop-blur-lg transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-base sm:text-lg active:bg-white/20"
                        >
                          <Play className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                          <span className="text-sm sm:text-base font-bold">
                            Learn More
                          </span>
                        </Button>
                      </a>
                      <a href="#catalogue-section" className="w-full sm:w-auto">
                        <Button
                          size="lg"
                          className="w-full min-h-[56px] bg-white/20 backdrop-blur-lg border border-white/30 text-white hover:bg-white/30 hover:border-white/50 font-bold px-6 py-4 sm:px-8 rounded-xl shadow-xl mobile-shadow transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-base sm:text-lg active:bg-white/40"
                        >
                          <ShoppingBag className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                          <span className="text-sm sm:text-base font-bold">
                            View All Products
                          </span>
                          <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        <div className="absolute inset-0 flex items-center justify-between p-4 sm:p-6 pointer-events-none">
          {/* Previous Button */}
          <Button
            onClick={prevSlide}
            variant="ghost"
            size="sm"
            className="pointer-events-auto bg-black/30 backdrop-blur-lg border border-white/20 text-white hover:bg-black/50 hover:border-white/40 rounded-full min-w-[48px] min-h-[48px] p-3 sm:p-4 transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation active:bg-black/60"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          {/* Next Button */}
          <Button
            onClick={nextSlide}
            variant="ghost"
            size="sm"
            className="pointer-events-auto bg-black/30 backdrop-blur-lg border border-white/20 text-white hover:bg-black/50 hover:border-white/40 rounded-full min-w-[48px] min-h-[48px] p-3 sm:p-4 transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation active:bg-black/60"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
          {/* Slide Indicators */}
          <div className="flex space-x-2">
            {marketingSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`min-w-[44px] min-h-[44px] w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all duration-300 touch-manipulation p-2 ${
                  index === currentSlide
                    ? "bg-white shadow-lg scale-125"
                    : "bg-white/40 hover:bg-white/60 active:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Play/Pause Button */}
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            variant="ghost"
            size="sm"
            className="bg-black/30 backdrop-blur-lg border border-white/20 text-white hover:bg-black/50 hover:border-white/40 rounded-full min-w-[44px] min-h-[44px] p-3 transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation active:bg-black/60"
            aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about-section"
        className="py-16 sm:py-20 lg:py-32 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,20,60,0.1),transparent_70%)]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* About Content */}
            <div className="space-y-8 animate-fadeInLeft">
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-brand-red/20 to-red-600/20 text-brand-red border border-brand-red/30 font-bold px-4 py-2 rounded-full">
                  <Heart className="h-4 w-4 mr-2" />
                  About APEX
                </Badge>
                <EditableText
                  contentKey="about_title"
                  defaultValue="Welcome to W.O.S APEX"
                  as="h2"
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight"
                >
                  Welcome to
                  <span className="gradient-text"> W.O.S APEX</span>
                </EditableText>
              </div>

              <EditableText
                contentKey="about_description"
                defaultValue="At W.O.S APEX we believe your clothing should work as hard as you do, and look good doing it. W.O.S APEX is your one-stop online destination for premium clothing, durable workwear and curated gifting. Driven by W.O.S, W.O.S APEX stands at the intersection of function and flare."
                as="p"
                className="text-lg md:text-xl text-gray-300 leading-relaxed"
                multiline
                maxLength={500}
              />
              <EditableText
                contentKey="about_subtitle"
                defaultValue="Welcome to W.O.S APEX"
                as="p"
                className="text-lg md:text-xl text-gray-300 leading-relaxed mt-4"
                maxLength={100}
              />

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 mobile-glass">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-brand-red to-red-600 shadow-lg">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      Quality First
                    </h3>
                    <p className="text-gray-400">
                      Premium materials and craftsmanship in every product
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 mobile-glass">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      Expert Team
                    </h3>
                    <p className="text-gray-400">
                      Professional designers and branding specialists
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 mobile-glass">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg">
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      Fast Service
                    </h3>
                    <p className="text-gray-400">
                      Quick turnaround times nationwide
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 mobile-glass">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Guaranteed</h3>
                    <p className="text-gray-400">
                      100% satisfaction guarantee on all orders
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* About Visual */}
            <div className="relative animate-fadeInRight">
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-red/30 to-red-600/30 rounded-3xl blur-2xl opacity-60 animate-pulse" />
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mobile-glass">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-green-600/20 border border-green-500/30">
                    <div className="text-3xl md:text-4xl font-black text-white">
                      10K+
                    </div>
                    <div className="text-gray-300 font-semibold">Products</div>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-600/20 border border-blue-500/30">
                    <div className="text-3xl md:text-4xl font-black text-white">
                      1000+
                    </div>
                    <div className="text-gray-300 font-semibold">Clients</div>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-600/20 border border-purple-500/30">
                    <div className="text-3xl md:text-4xl font-black text-white">
                      24/7
                    </div>
                    <div className="text-gray-300 font-semibold">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results Section - Only show when there's a search query */}
      {searchQuery && (
        <section className="py-16 sm:py-20 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Search Results for "{searchQuery}"
              </h2>
              <p className="text-gray-300">
                {loading ? (
                  "Searching products..."
                ) : searchResults.length > 0 ? (
                  `Found ${searchResults.length} product${searchResults.length !== 1 ? 's' : ''}`
                ) : (
                  "No products found. Try adjusting your search terms."
                )}
              </p>
            </div>
            
            <ProductGrid 
              products={searchResults}
              loading={loading}
              error={error}
              columns={3}
            />
            
            {!loading && searchResults.length === 0 && (
              <div className="text-center mt-12">
                <p className="text-gray-400 mb-6">
                  Try browsing our categories or searching for different keywords.
                </p>
                <Link to="/">
                  <Button className="bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red">
                    Browse All Categories
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Products Section - Only show when not searching */}
      {!searchQuery && featuredProducts.length > 0 && (
        <section className="py-16 sm:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <Badge className="bg-gradient-to-r from-brand-red/20 to-red-600/20 text-brand-red border border-brand-red/30 font-bold px-4 py-2 rounded-full mb-4">
                <Sparkles className="h-4 w-4 mr-2" />
                Featured Products
              </Badge>
              <EditableText
                contentKey="featured_products_title"
                defaultValue="Trending Now"
                as="h2"
                className="text-3xl sm:text-4xl font-bold text-white mb-4"
                maxLength={50}
              />
              <EditableText
                contentKey="featured_products_description"
                defaultValue="Discover our most popular products chosen by customers like you"
                as="p"
                className="text-gray-300 max-w-2xl mx-auto"
                maxLength={200}
              />
            </div>
            
            <ProductGrid 
              products={featuredProducts}
              loading={loading}
              error={error}
              featured={true}
              columns={3}
            />
            
            <div className="text-center mt-12">
              <Link to="/corporate-gifts">
                <Button className="bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  View All Products
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Catalogue Section */}
      <section
        id="catalogue-section"
        className="py-16 sm:py-20 lg:py-32 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black to-gray-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,20,60,0.15),transparent_70%)]" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center space-y-6 mb-16 animate-fadeInUp">
            <Badge className="bg-gradient-to-r from-brand-red/20 to-red-600/20 text-brand-red border border-brand-red/30 font-bold px-4 py-2 rounded-full">
              <BookOpen className="h-4 w-4 mr-2" />
              Our Catalogue
            </Badge>
            <EditableText
              contentKey="catalogue_title"
              defaultValue="Explore Our Premium Collections"
              as="h2"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight"
              multiline
              maxLength={100}
            >
              Explore Our
              <span className="gradient-text"> Premium</span>
              <br />
              Collections
            </EditableText>
            <EditableText
              contentKey="catalogue_description"
              defaultValue="Discover thousands of premium promotional products, corporate gifts, and custom branding solutions designed to elevate your business presence."
              as="p"
              className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
              multiline
              maxLength={300}
            />
          </div>

          {/* Categories Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {featuredCategories.map((category, index) => (
              <Link
                key={category.href || `${category.title}-${index}`}
                to={category.href}
                className="group animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:border-brand-red/50 transition-all duration-500 hover:scale-105 mobile-card overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative h-48 md:h-56 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                      <OptimizedImage
                        src={category.image}
                        alt={category.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        width={400}
                        height={300}
                        quality={90}
                      />

                      {/* Floating Icon */}
                      <div className="absolute top-4 right-4 z-20 p-3 rounded-xl bg-gradient-to-r from-brand-red to-red-600 shadow-xl group-hover:scale-110 transition-transform duration-300">
                        {category.title.includes("Gift") ? (
                          <Gift className="h-6 w-6 text-white" />
                        ) : category.title.includes("Clothing") ? (
                          <Shirt className="h-6 w-6 text-white" />
                        ) : (
                          <Briefcase className="h-6 w-6 text-white" />
                        )}
                      </div>

                      {/* Product Count Badge */}
                      <div className="absolute top-4 left-4 z-20">
                        <Badge className="bg-black/50 backdrop-blur-lg text-white border-0 font-bold px-3 py-1">
                          <Layers className="h-3 w-3 mr-1" />
                          {category.count}+ Products
                        </Badge>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-brand-red transition-colors duration-300">
                          {category.title}
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                          {category.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Eye className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            View Collection
                          </span>
                        </div>
                        <ArrowRight className="h-5 w-5 text-brand-red group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Download Catalogues Section */}
          <div className="text-center space-y-8 animate-fadeInUp">
            <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-gradient-to-r from-brand-red/20 to-red-600/20 backdrop-blur-xl border border-red-500/30 mobile-glass">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Browse Our Catalogues
              </h3>
              <p className="text-gray-300 mb-6">
                Download our comprehensive product catalogues to explore our
                full range of offerings.
              </p>
              <div className="relative inline-block">
                <select className="appearance-none bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red text-white font-bold px-8 py-4 pr-12 rounded-xl shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-0 outline-none">
                  <option value="">Download Catalogue</option>
                  <option value="corporate-gifts">
                    Corporate Gifts Catalogue
                  </option>
                  <option value="clothing">Clothing Catalogue</option>
                  <option value="workwear">Workwear Catalogue</option>
                  <option value="headwear">
                    Headwear & Accessories Catalogue
                  </option>
                  <option value="safety">Safety Equipment Catalogue</option>
                  <option value="custom">Custom Branding Solutions</option>
                </select>
                <Download className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
