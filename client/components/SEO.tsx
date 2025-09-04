import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  structuredData?: object;
}

export function SEO({
  title = "APEX - Africa's #1 Promotional Products Provider",
  description = "Premium corporate gifts, workwear & promotional items. 10,000+ products with custom branding services. Fast delivery across South Africa.",
  keywords = "corporate gifts, promotional products, workwear, custom branding, embroidery, printing, South Africa, APEX",
  image = "https://images.pexels.com/photos/4194843/pexels-photo-4194843.jpeg?auto=compress&cs=tinysrgb&w=1200",
  url = "https://apex-promotions.com",
  type = "website",
  structuredData,
}: SEOProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (
      name: string,
      content: string,
      property?: boolean,
    ) => {
      const selector = property
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;

      if (!meta) {
        meta = document.createElement("meta");
        if (property) {
          meta.setAttribute("property", name);
        } else {
          meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);

    // Open Graph tags
    updateMetaTag("og:title", title, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:image", image, true);
    updateMetaTag("og:url", url, true);
    updateMetaTag("og:type", type, true);

    // Twitter tags
    updateMetaTag("twitter:title", title, true);
    updateMetaTag("twitter:description", description, true);
    updateMetaTag("twitter:image", image, true);
    updateMetaTag("twitter:url", url, true);

    // Canonical URL
    let canonical = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // Structured Data
    if (structuredData) {
      let script = document.querySelector(
        'script[type="application/ld+json"]#dynamic-schema',
      );
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = "dynamic-schema";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, keywords, image, url, type, structuredData]);

  return null;
}

// Product Schema Generator
export const generateProductSchema = (product: any) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  description: product.description,
  image: product.image,
  sku: product.id?.toString(),
  brand: {
    "@type": "Brand",
    name: "APEX",
  },
  offers: {
    "@type": "Offer",
    price: product.price,
    priceCurrency: "ZAR",
    availability: "https://schema.org/InStock",
    seller: {
      "@type": "Organization",
      name: "APEX Promotional Products",
    },
  },
  aggregateRating: product.rating
    ? {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviews || 0,
      }
    : undefined,
});

// Category Schema Generator
export const generateCategorySchema = (category: string, products: any[]) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: category,
  description: `Premium ${category.toLowerCase()} and promotional products from APEX`,
  url: `https://apex-promotions.com/${category.toLowerCase().replace(" ", "-")}`,
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        url: `https://apex-promotions.com/product/${product.id}`,
        image: product.image,
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "ZAR",
        },
      },
    })),
  },
});

// FAQ Schema Generator
export const generateFAQSchema = (
  faqs: Array<{ question: string; answer: string }>,
) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});
