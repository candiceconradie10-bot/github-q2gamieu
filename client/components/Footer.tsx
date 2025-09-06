import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function Footer() {
  const productCategories = [
    "Corporate Gifts",
    "Hampers",
    "Gift Sets",
    "Corporate Clothing",
    "Headwear & Accessories",
    "Workwear",
    "Display",
    "Custom Products",
  ];

  const customerService = [
    "Contact Us",
    "FAQ",
    "Shipping Information",
    "Returns & Exchanges",
    "Track Your Order",
    "Bulk Orders",
    "Custom Quotes",
  ];

  const companyInfo = [
    // Company links removed as requested
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img
                src="/Beige and Grey Minimalist Modern Bold Typographic Brand Logo (5).jpg"
                alt="APEX Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              W.O.S APEX is your one-stop online destination for premium
              clothing, durable workwear and curated gifting. Driven by W.O.S,
              W.O.S APEX stands at the intersection of function and flare.
              Welcome to APEX
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-brand-red" />
                <span>Cape Town, South Africa</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-brand-red" />
                <span>+27 76 035 5295</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-brand-red" />
                <span>apex@w-o-s.co.za</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-brand-red" />
                <span>Mon-Fri: 8AM-5PM</span>
              </div>
            </div>
          </div>

          {/* Product Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              {productCategories.map((category) => (
                <li key={category}>
                  <Link
                    to={`/${category.toLowerCase().replace(/\s+/g, "-").replace("&", "and")}`}
                    className="text-gray-300 hover:text-white text-sm transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              {customerService.map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase().replace(/\s+/g, "-").replace("&", "and")}`}
                    className="text-gray-300 hover:text-white text-sm transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Connected</h3>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Subscribe to our newsletter for the latest deals and product
                updates.
              </p>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
                <Button className="bg-brand-red hover:bg-brand-red/90">
                  Subscribe
                </Button>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Follow Us</h4>
                <div className="flex space-x-3">
                  <Link
                    to="#"
                    className="bg-gray-800 hover:bg-brand-red p-2 rounded transition-colors"
                  >
                    <Facebook className="h-4 w-4" />
                  </Link>
                  <Link
                    to="#"
                    className="bg-gray-800 hover:bg-brand-red p-2 rounded transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                  </Link>
                  <Link
                    to="#"
                    className="bg-gray-800 hover:bg-brand-red p-2 rounded transition-colors"
                  >
                    <Instagram className="h-4 w-4" />
                  </Link>
                  <Link
                    to="#"
                    className="bg-gray-800 hover:bg-brand-red p-2 rounded transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Links */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {companyInfo.map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase().replace(/\s+/g, "-").replace("&", "and")}`}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 Apex. All rights reserved. |{" "}
              <Link to="/privacy-policy" className="hover:text-white">
                Privacy Policy
              </Link>{" "}
              |{" "}
              <Link to="/terms" className="hover:text-white">
                Terms of Service
              </Link>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Secure Payment</span>
              <div className="flex space-x-2">
                <div className="bg-gray-800 px-2 py-1 rounded text-xs">
                  VISA
                </div>
                <div className="bg-gray-800 px-2 py-1 rounded text-xs">MC</div>
                <div className="bg-gray-800 px-2 py-1 rounded text-xs">EFT</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
