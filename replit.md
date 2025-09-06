# APEX E-Commerce Store

## Overview
A fully functional e-commerce platform built for APEX promotional products company. Transformed from a static promotional website into a complete online store with user authentication, shopping cart, order management, and admin panel.

## Current State
✅ **Completed** - Full e-commerce functionality ready for production deployment

## Recent Changes (September 6, 2025)
- ✅ **Complete Database Rebuild**: Fresh Supabase schema with products, users, orders, and cart_items tables
- ✅ **Authentication System**: Full Supabase Auth integration with signup/login/logout and user profiles
- ✅ **Dynamic Product System**: Products fetched from Supabase database instead of static data
- ✅ **Shopping Cart**: Persistent cart functionality that syncs with Supabase for authenticated users
- ✅ **Order Management**: Complete checkout flow with order creation and tracking
- ✅ **Admin Panel**: Secure admin interface for product and order management
- ✅ **Mobile Responsive**: Fully optimized for mobile devices with touch-friendly interface
- ✅ **Platform Independence**: Removed Replit-specific dependencies for universal deployment
- ✅ **Payment Simplification**: Temporarily disabled online payment processing (EFT and manual payment options available)

## Tech Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **UI Components**: Radix UI + Shadcn/UI
- **State Management**: React Context API
- **Deployment**: Netlify (configured)

## Project Architecture

### Database Schema
```sql
-- Users table (managed by Supabase Auth)
-- Profiles table with additional user data
-- Products table with inventory management
-- Orders table with order tracking
-- Cart_items table for persistent cart storage
```

### Key Features
1. **User Authentication**
   - Email/password signup and login
   - User profile management
   - Role-based access control (admin/user)

2. **Product Management**
   - Dynamic product catalog
   - Category-based organization
   - Stock management
   - Image handling

3. **Shopping Experience**
   - Persistent shopping cart
   - Real-time inventory checking
   - Mobile-optimized interface
   - Search and filtering

4. **Order Processing**
   - Secure checkout flow
   - Order history tracking
   - Status management
   - Email confirmation

5. **Admin Panel**
   - Product CRUD operations
   - Order management
   - User management
   - Analytics dashboard

## User Preferences
- **Design**: Preserve existing APEX branding and mobile-first approach
- **Authentication**: Seamless user experience with persistent sessions
- **Performance**: Fast loading with optimized images and lazy loading
- **Security**: Secure admin access and data protection

## Environment Variables Required
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development Setup
1. Install dependencies: `npm install`
2. Set up Supabase project and configure environment variables
3. Run database migrations: SQL files in `supabase/migrations/`
4. Start development server: `npm run dev`

## Deployment
- **Platform**: Netlify
- **Build Command**: `npm run build`
- **Publish Directory**: `client/dist`
- **Node Version**: 20
- **Environment Variables**: Configure Supabase credentials in Netlify dashboard

## Admin Access
- First user to register gets admin privileges automatically
- Admin panel accessible at `/admin` route
- Requires `is_admin: true` in user profile

## Next Steps for Production
1. ✅ Configure Supabase environment variables in hosting platform
2. ✅ Deploy to any hosting platform (Netlify, Vercel, etc.)
3. ⏳ Optional: Re-enable payment processing (Stripe/PayFast) when needed
4. ⏳ Optional: Set up email notifications for orders
5. ⏳ Optional: Add inventory alerts and automated stock management

## Payment Status
- **Current**: Manual payment processing (EFT/Bank transfer and arrange-later options)
- **Removed**: Stripe dependencies and card payment forms
- **Benefit**: Simpler deployment, no payment gateway setup required
- **Note**: Payment integration can be re-added when needed

## Support & Maintenance
- Database: Managed by Supabase with automatic backups
- Authentication: Handled by Supabase Auth
- Hosting: Netlify with automatic deployments from GitHub
- Monitoring: Built-in admin panel for order and inventory tracking