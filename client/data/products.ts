import { Product } from "@/contexts/CartContext";

export const products: Product[] = [
  {
    id: 1,
    name: "Premium Corporate Polo Shirt",
    price: 249,
    image: "/api/placeholder/300/300",
    category: "corporate-clothing",
    description:
      "High-quality cotton polo shirt perfect for corporate branding. Available in multiple colors with embroidery options.",
    rating: 4.8,
    reviews: 124,
  },
  {
    id: 2,
    name: "Executive Gift Set",
    price: 599,
    image: "/api/placeholder/300/300",
    category: "corporate-gifts",
    description:
      "Luxury executive gift set including pen, notebook, and business card holder in premium leather.",
    rating: 4.9,
    reviews: 89,
  },
  {
    id: 3,
    name: "Safety Workwear Bundle",
    price: 1299,
    image: "/api/placeholder/300/300",
    category: "workwear",
    description:
      "Complete safety workwear package including high-visibility vest, hard hat, and safety boots.",
    rating: 4.7,
    reviews: 156,
  },
  {
    id: 4,
    name: "Custom Branded Cap",
    price: 89,
    image: "/api/placeholder/300/300",
    category: "headwear-and-accessories",
    description:
      "Adjustable cap with custom embroidery. Perfect for promotional events and corporate branding.",
    rating: 4.6,
    reviews: 203,
  },
  {
    id: 5,
    name: "Corporate Hoodie",
    price: 399,
    image: "/api/placeholder/300/300",
    category: "corporate-clothing",
    description:
      "Comfortable cotton hoodie with modern fit. Ideal for casual corporate wear and team building events.",
    rating: 4.5,
    reviews: 167,
  },
  {
    id: 6,
    name: "Promotional Tote Bag",
    price: 45,
    image: "/api/placeholder/300/300",
    category: "corporate-gifts",
    description:
      "Eco-friendly canvas tote bag perfect for promotional campaigns and corporate events.",
    rating: 4.4,
    reviews: 289,
  },
  {
    id: 7,
    name: "Steel Water Bottle",
    price: 179,
    image: "/api/placeholder/300/300",
    category: "corporate-gifts",
    description:
      "Insulated stainless steel water bottle with custom laser engraving options.",
    rating: 4.7,
    reviews: 198,
  },
  {
    id: 8,
    name: "Business Card Holder",
    price: 125,
    image: "/api/placeholder/300/300",
    category: "corporate-gifts",
    description:
      "Elegant metal business card holder with custom engraving. Professional and durable.",
    rating: 4.6,
    reviews: 145,
  },
  {
    id: 9,
    name: "Corporate T-Shirt",
    price: 159,
    image: "/api/placeholder/300/300",
    category: "corporate-clothing",
    description:
      "Premium cotton t-shirt available in various colors. Perfect for company uniforms and events.",
    rating: 4.5,
    reviews: 234,
  },
  {
    id: 10,
    name: "Leather Portfolio",
    price: 749,
    image: "/api/placeholder/300/300",
    category: "corporate-gifts",
    description:
      "Premium leather portfolio with notepad, pen holder, and business card slots.",
    rating: 4.8,
    reviews: 76,
  },
  {
    id: 11,
    name: "Safety Helmet",
    price: 299,
    image: "/api/placeholder/300/300",
    category: "workwear",
    description:
      "ANSI certified safety helmet with adjustable suspension and custom logo options.",
    rating: 4.9,
    reviews: 134,
  },
  {
    id: 12,
    name: "Fleece Jacket",
    price: 459,
    image: "/api/placeholder/300/300",
    category: "corporate-clothing",
    description:
      "Warm fleece jacket perfect for outdoor corporate events and team activities.",
    rating: 4.6,
    reviews: 188,
  },
];

export const categories = [
  {
    title: "Corporate Gifts",
    description: "Premium branded items for your business",
    image: "/api/placeholder/400/300",
    href: "/gifting",
    count: products.filter((p) => p.category === "corporate-gifts").length,
  },
  {
    title: "Clothing",
    description: "Professional apparel for your team",
    image: "/api/placeholder/400/300",
    href: "/corporate-clothing",
    count: products.filter((p) => p.category === "corporate-clothing").length,
  },
  {
    title: "Workwear",
    description: "Durable clothing for every industry",
    image: "/api/placeholder/400/300",
    href: "/workwear",
    count: products.filter((p) => p.category === "workwear").length,
  },
  {
    title: "Headwear & Accessories",
    description: "Caps, hats, and promotional accessories",
    image: "/api/placeholder/400/300",
    href: "/headwear",
    count: products.filter((p) => p.category === "headwear-and-accessories")
      .length,
  },
];

// Helper functions
export const getProductsByCategory = (category: string): Product[] => {
  return products.filter((product) => product.category === category);
};

export const getProductById = (id: number): Product | undefined => {
  return products.find((product) => product.id === id);
};

export const getFeaturedProducts = (limit: number = 4): Product[] => {
  return products.slice(0, limit);
};
