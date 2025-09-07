# 🚀 Supabase Setup Guide for APEX E-commerce

This guide will help you set up your Supabase database with the complete e-commerce schema.

## 📋 Prerequisites

✅ **Completed**: Environment variables are configured  
✅ **Completed**: Supabase client is properly connected  
✅ **Completed**: Migration scripts are ready  

## 🗄️ Database Schema Overview

Your e-commerce platform includes these tables:

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `profiles` | User information | Admin roles, extends Supabase auth |
| `products` | Product catalog | Stock management, categories, ratings |
| `orders` | Order management | Status tracking, shipping addresses |
| `cart_items` | Shopping cart | Persistent across sessions |
| `wishlists` | User wishlists | Save for later functionality |
| `payment_methods` | Payment info | Multiple payment options |
| `admin_activity` | Audit logging | Track admin actions |
| `site_content` | Dynamic content | CMS functionality |
| `media_files` | File management | Images and documents |

## 🔧 Setup Instructions

### Step 1: Apply the Database Migration

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. Copy the contents of `supabase/migrations/20250907000000_final_consolidated_schema.sql`
5. Paste into the editor and click **Run**

**Option B: Using Supabase CLI**
```bash
# If you have Supabase CLI installed
supabase db push
```

### Step 2: Verify Setup

After applying the migration, run the test script:
```bash
cd supabase
node test-migration.js
```

### Step 3: Admin Access Setup

The migration automatically configures admin access:
- **Email**: `jantjieskurt7@gmail.com` 
- **Admin Status**: Automatically granted on signup
- **Capabilities**: Product management, order management, user management

## 🛡️ Security Features

### Row Level Security (RLS)
All tables have RLS enabled with proper policies:
- Users can only access their own data
- Admins have full access to manage content
- Public can view active products and site content

### Admin Roles
Two complementary approaches for maximum flexibility:
- `is_admin` boolean field for simple checks
- `role` text field for granular permissions ('admin', 'user', 'customer')

## 📊 Sample Data Included

The migration includes:
- **8 sample products** across different categories
- **Site content** (hero sections, contact info)
- **Proper categorization** (corporate-clothing, corporate-gifts, workwear, etc.)

## 🔍 Testing Your Setup

### 1. Database Connection Test
```javascript
// Test in browser console
import { supabase } from './client/lib/supabaseClient.ts';
const { data } = await supabase.from('products').select('*').limit(5);
console.log('Products:', data);
```

### 2. Admin Functionality Test
1. Sign up with the admin email: `jantjieskurt7@gmail.com`
2. Navigate to `/admin` route
3. Verify you can manage products and view orders

### 3. E-commerce Flow Test
1. Browse products on homepage
2. Add items to cart
3. Create test order
4. Check order appears in admin panel

## 🚨 Troubleshooting

### Common Issues

**"Table does not exist" errors**
- Ensure migration was applied successfully
- Check Supabase logs for any SQL errors

**"Permission denied" errors**
- Verify RLS policies are correctly applied
- Check user authentication status

**Admin access not working**
- Confirm signup with exact email: `jantjieskurt7@gmail.com`
- Check profiles table to verify `is_admin = true`

### Getting Help

If you encounter issues:
1. Check Supabase Dashboard logs
2. Verify environment variables are correct
3. Run the test script for detailed diagnostics

## 🎯 Next Steps

After successful setup:
1. **Test all functionality** - cart, orders, admin panel
2. **Customize products** - add your actual product catalog
3. **Configure payment** - integrate payment processors as needed
4. **Deploy** - your app is ready for production!

---

**Migration Status**: ✅ Ready to apply  
**Security**: ✅ RLS enabled on all tables  
**Admin Setup**: ✅ Automatic admin role assignment  
**Sample Data**: ✅ Included for testing  