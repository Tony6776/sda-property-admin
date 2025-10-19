# Admin Backend Dashboard - Production Features

**URL:** https://tony6776.github.io/sda-property-admin/admin/dashboard
**Login:** https://tony6776.github.io/sda-property-admin/admin/login

---

## 🎯 Overview

The **Admin Backend Dashboard** is a complete property management system for SDA Enterprise with multi-tenant support, Airtable synchronization, and role-based access control.

**Status:** ✅ **PRODUCTION READY** (Phases 1-6 Complete)

---

## 🔐 Authentication & Access

### Login System
- **URL:** `/admin/login`
- **Features:**
  - Email/password authentication via Supabase Auth
  - Protected routes (automatic redirect if not authenticated)
  - Separate admin user table (`admin_users`)
  - Multi-tenant organization support

### User Management
- **URL:** `/admin/users`
- **Features:**
  - Create new admin users
  - Assign organization (Homelander, PLCG, Channel Agent)
  - Set role (Admin, Manager, Viewer)
  - Delete admin users
  - View user list with email, role, organization
  - Password management on creation

**Role Capabilities:**
- **Admin:** Full access to all features
- **Manager:** Can manage properties and sync
- **Viewer:** Read-only access

---

## 📊 Dashboard Features

### Main Dashboard (`/admin/dashboard`)

**Quick Stats Cards:**
- **Total Properties** - Count of all properties in database
- **Available Now** - Properties with status "available"
- **Last Sync** - Timestamp of last Airtable sync

**Property Management Section:**
- Property list table with filtering
- Quick status updates
- Edit/delete actions
- Real-time search
- Multi-tenant visibility toggles

**Airtable Sync Widget:**
- One-click sync from Airtable
- Live sync progress indicator
- Sync result notifications
- Error handling with detailed messages

**Quick Links Sidebar:**
- Add New Property
- Manage Admin Users
- View Public Site
- Open Airtable (external link)

**Implementation Status Tracker:**
- Shows completed phases (Phase 1-6)
- Visual progress indicators
- System readiness status

---

## 🏠 Property Management

### Property List (`PropertyListEnhanced` component)

**Display Features:**
- Table view with all properties
- Sort by: Name, Status, Type, Date
- Filter by: Status (all/available/rented/sold)
- Filter by: Type (all/house/apartment/townhouse)
- Search by name or address

**Table Columns:**
- Property Name
- Address
- Type (house/apartment/townhouse)
- Status with badge (available/rented/sold/under-contract)
- Bedrooms / Bathrooms
- Weekly Rent / Price
- SDA Category
- Organization
- Visibility (Participant/Investor sites)
- Actions (Edit/Delete)

**Quick Actions:**
- **Status Toggle** - Change property status directly from list
- **Edit** - Navigate to full property edit form
- **Delete** - Remove property with confirmation dialog
- **Refresh** - Reload property list

**Multi-Tenant Fields:**
- Organization assignment (Homelander/PLCG/Channel Agent)
- Audience targeting (participants/investors/both)
- Visibility toggles for participant site
- Visibility toggles for investor site

### Add Property (`/admin/properties/new`)

**Form Sections:**

1. **Basic Information**
   - Property Name *
   - Address *
   - Property Type * (house/apartment/townhouse/unit)
   - Status * (available/rented/sold/under-contract)

2. **Pricing**
   - Weekly Rent (for rentals)
   - Sale Price (for sales)
   - Currency (AUD default)

3. **Property Details**
   - Bedrooms
   - Bathrooms
   - Car Spaces
   - Land Size (sqm)
   - Building Size (sqm)

4. **SDA Information**
   - SDA Category (Improved Liveability/Fully Accessible/Robust/High Physical Support)
   - NDIS Registered (Yes/No)
   - Accessibility Features (wheelchair accessible, wide doorways, etc.)

5. **Location**
   - Suburb
   - State (NSW/VIC/QLD/SA/WA/TAS/NT/ACT)
   - Postcode
   - Latitude/Longitude (optional)

6. **Features**
   - Property features (air conditioning, heating, etc.)
   - Outdoor features (garden, balcony, etc.)
   - Multi-select checkboxes

7. **Multi-Tenant Settings**
   - Organization * (Homelander/PLCG/Channel Agent)
   - Target Audience * (participants/investors/both)
   - Visible on Participant Site (checkbox)
   - Visible on Investor Site (checkbox)

8. **Media**
   - Property Images (upload multiple)
   - Image preview
   - Drag & drop support
   - Delete images

9. **Description**
   - Full property description (rich text)
   - Marketing highlights

**Features:**
- Real-time validation
- Auto-save draft capability
- Image upload to Supabase Storage
- Multi-tenant assignment
- Accessibility metadata storage

### Edit Property (`/admin/properties/edit/:id`)

**Features:**
- Same form as "Add Property"
- Pre-populated with existing data
- Image management (view/delete/add)
- Version history tracking
- Last updated timestamp
- Updated by user tracking

**Additional Capabilities:**
- Change organization ownership
- Update visibility settings
- Modify Airtable sync mapping
- Archive/unarchive property

---

## ☁️ Airtable Integration

### Airtable Sync (`AirtableSync` component)

**Features:**
- One-click sync button
- Real-time sync progress
- Success/error notifications
- Automatic property creation/update
- Image URL import from Airtable
- Field mapping automation

**Sync Process:**
1. Calls Supabase Edge Function: `sync-airtable-properties`
2. Fetches all records from Airtable base `appbKYczBetBCdJKs`
3. Maps Airtable fields to Supabase schema
4. Creates new properties or updates existing (by airtable_id)
5. Downloads and stores images in Supabase Storage
6. Returns count of synced properties

**Mapped Fields:**
- Property Name → name
- Address → address
- Type → property_type
- Bedrooms → bedrooms
- Bathrooms → bathrooms
- Weekly Rent → weekly_rent
- Price → price
- Status → status
- SDA Category → sda_category
- Images → accessibility.images array
- Airtable Record ID → accessibility.airtable_id

**Error Handling:**
- Connection failures
- Invalid data formats
- Missing required fields
- Rate limiting
- Detailed error messages

---

## 🔒 Security Features

### Row Level Security (RLS)
- All admin operations secured with RLS policies
- Organization-based data isolation
- Role-based permissions enforcement
- Audit logging for all actions

### Admin Access Control
- Authenticated admin sessions only
- JWT token verification
- Auto-logout on session expiry
- Protected API endpoints

### Multi-Tenant Security
- Organization-scoped queries
- Visibility controls per property
- Audience targeting restrictions
- Cross-organization access prevention

### Audit Trail
- Property changes logged
- User actions tracked
- Timestamps for all modifications
- Created by / Updated by tracking

---

## 🛠️ Technical Architecture

### Database Schema

**Tables Used:**
- `admin_users` - Admin user profiles and roles
- `organizations` - Business entities (Homelander, PLCG, Channel Agent)
- `properties` - Property listings with multi-tenant fields
- `property_access_logs` - Audit trail for property access

**Key Fields:**
```sql
properties:
  - id (uuid, PK)
  - organization_id (FK → organizations)
  - name, address, property_type
  - status, weekly_rent, price
  - bedrooms, bathrooms, car_spaces
  - sda_category, accessibility (jsonb)
  - audience (participants/investors/both)
  - visible_on_participant_site (boolean)
  - visible_on_investor_site (boolean)
  - created_at, updated_at
  - created_by, updated_by
```

### Edge Functions

**sync-airtable-properties:**
- Endpoint: `supabase.functions.invoke('sync-airtable-properties')`
- Method: POST
- Auth: Required (admin JWT)
- Returns: `{ success: boolean, total_properties_synced: number }`

### Storage Buckets

**property-images:**
- Path structure: `{organization_id}/{property_id}/{filename}`
- Max file size: 10MB
- Allowed types: JPG, PNG, WebP
- RLS: Admin users only

---

## 📈 Admin Workflows

### Daily Operations

1. **Check Dashboard Stats**
   - View total properties
   - Check available listings
   - Review recent changes

2. **Sync from Airtable** (as needed)
   - Click "Sync from Airtable" button
   - Wait for completion notification
   - Review sync results

3. **Manage Properties**
   - Add new listings via form
   - Update existing properties
   - Change status (available → rented)
   - Delete outdated listings

4. **Multi-Tenant Management**
   - Assign properties to organizations
   - Set audience targeting
   - Control visibility on participant/investor sites

### Property Publishing Workflow

1. **Create Property** in Airtable OR Admin Dashboard
2. **Sync** to Supabase (if using Airtable)
3. **Set Visibility**:
   - Check "Visible on Participant Site" for participant-facing properties
   - Check "Visible on Investor Site" for investor opportunities
4. **Set Audience**: participants/investors/both
5. **Assign Organization**: Homelander/PLCG/Channel Agent
6. **Publish** (status = "available")

Properties are now live on:
- Public property listing page
- Participant portal (if visible_on_participant_site = true)
- Investor portal (if visible_on_investor_site = true)

### User Management Workflow

1. **Navigate to Admin Users** (`/admin/users`)
2. **Click "Add Admin User"**
3. **Fill Form**:
   - Email (will be login username)
   - Password (min 8 characters)
   - Full Name
   - Organization (Homelander/PLCG/Channel Agent)
   - Role (Admin/Manager/Viewer)
4. **Create User** - User can now login
5. **Manage Existing Users** - Edit roles or delete users as needed

---

## 🎨 User Interface

### Design System
- shadcn/ui component library
- Tailwind CSS styling
- Responsive layout (desktop/tablet/mobile)
- Dark mode support
- Accessibility compliant (WCAG 2.1 AA)

### Components Used
- Cards for stat displays
- Tables for property lists
- Forms with validation
- Dialogs for create/edit
- Alert dialogs for confirmations
- Badges for status indicators
- Select dropdowns for filters
- Loading spinners for async operations

---

## 🚀 Deployment

**Production URL:**
- Public Site: https://tony6776.github.io/sda-property-admin
- Admin Login: https://tony6776.github.io/sda-property-admin/admin/login
- Admin Dashboard: https://tony6776.github.io/sda-property-admin/admin/dashboard

**Deployment Process:**
1. Code pushed to GitHub (`main` branch)
2. GitHub Actions workflow triggers
3. Build process runs (`npm run build`)
4. Static files deployed to GitHub Pages
5. Live in ~30-40 seconds

**Environment Variables:**
```bash
VITE_SUPABASE_URL=https://bqvptfdxnrzculgjcnjo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_AIRTABLE_API_KEY=[configured in Supabase Edge Functions]
VITE_AIRTABLE_BASE_ID=appbKYczBetBCdJKs
```

---

## 📋 Feature Checklist

### Phase 1-6 (All Complete ✅)

**Phase 1: Public Website Cleanup** ✅
- Removed admin features from public pages
- Created clean separation

**Phase 2: Admin Authentication** ✅
- Login system with Supabase Auth
- Admin user profiles
- Protected routes

**Phase 3: Admin Dashboard** ✅
- Main dashboard with stats
- Property list component
- Airtable sync widget

**Phase 4: Property Management** ✅
- Add property form (multi-tenant)
- Edit property form
- Image upload system

**Phase 5: Backend Security** ✅
- Row Level Security (RLS) policies
- Organization-based access control
- Audit logging

**Phase 6: User Management** ✅
- Admin user management page
- Create/delete admin users
- Role assignment

---

## 🔮 Available Extensions (Not Built Yet)

### Participant Management Features (Recommended Next)
These features would integrate with Phase 2 (Participant Portal):

**Lead Management Dashboard:**
- View all participant signups
- Lead quality scores (0-100)
- Engagement levels (cold/warm/hot)
- Journey progress tracking
- Filter by status, score, engagement
- Export to CSV

**Document Verification Workflow:**
- Review uploaded NDIS plans
- Verify photo IDs
- Approve income proofs
- Mark documents as verified/rejected
- Request additional documents
- Send notifications to participants

**Property Match Management:**
- View all property-participant matches
- Override AI match scores
- Manually create matches
- Bulk matching operations
- Match quality analytics

**Communication Tools:**
- Send email to participants
- Automated follow-up campaigns
- Match notification emails
- Document request reminders

**Analytics Dashboard:**
- Signup conversion rates
- Document upload completion rates
- Time-to-interest metrics
- Popular property types
- Geographic demand heatmaps

### Investor Portal Management (Phase 3)
- Investor lead management
- ROI calculator results view
- Portfolio tracking admin
- Market intelligence data management

### Advanced Features
- Bulk property import (CSV)
- Property comparison tool
- Advanced search filters
- Saved search queries
- Automated property alerts
- Integration with CRM systems
- API access for third-party tools

---

## 🐛 Known Limitations

**Current Scope:**
- Admin dashboard focuses on property management only
- No participant lead management UI yet (data exists, UI not built)
- No investor management UI yet (Phase 3 pending)
- No bulk operations (single property at a time)
- No export to CSV functionality
- No advanced analytics/reporting

**Data Dependencies:**
- Airtable sync requires correct API key configuration
- Image uploads depend on Supabase Storage bucket setup
- RLS policies require organizations table to be populated

---

## 📞 Admin Support

### Login Issues
**Problem:** Cannot login
**Solutions:**
1. Check admin_users table has record with your email
2. Verify password meets requirements (min 8 chars)
3. Check Supabase Auth logs for error details
4. Try password reset flow

### Sync Issues
**Problem:** Airtable sync fails
**Solutions:**
1. Verify Airtable API key is set in Supabase Edge Function secrets
2. Check Airtable base ID matches `appbKYczBetBCdJKs`
3. Review Edge Function logs in Supabase Dashboard
4. Ensure Airtable table has required fields

### Property Not Showing
**Problem:** Property added but not visible on public site
**Solutions:**
1. Check status = "available"
2. Verify visible_on_participant_site = true (if targeting participants)
3. Check organization_id matches expected org
4. Ensure audience field is set correctly
5. Clear browser cache

---

## 📊 Current Status

**Total Admin Files:** 7 (1,949 lines of code)

**Admin Pages:**
- Login: 154 lines
- Dashboard: 238 lines
- PropertyNew: 46 lines (redirects to form)
- PropertyEdit: 457 lines
- AdminUsers: 445 lines

**Admin Components:**
- PropertyListEnhanced: 485 lines
- AirtableSync: 124 lines

**Production Status:** ✅ **FULLY OPERATIONAL**

**Next Recommended Phase:** Participant Lead Management (integrate with existing participant portal data)

---

## 🎯 Quick Start Guide

### For New Admins

1. **Get Login Credentials**
   - Request admin account from system administrator
   - Receive email and temporary password

2. **First Login**
   - Go to https://tony6776.github.io/sda-property-admin/admin/login
   - Enter email and password
   - You'll be redirected to dashboard

3. **Dashboard Tour**
   - Top: Stats cards (properties count)
   - Left: Property list with actions
   - Right: Airtable sync widget + quick links

4. **Add Your First Property**
   - Click "Add New Property" button
   - Fill required fields (name, address, type, status)
   - Set multi-tenant fields (organization, audience, visibility)
   - Upload images
   - Click "Create Property"

5. **Sync from Airtable** (if using)
   - Click "Sync from Airtable" in sidebar
   - Wait for completion message
   - Check property list refreshed

6. **Manage Properties**
   - Click Edit icon to modify
   - Click status dropdown to change availability
   - Click Delete to remove (with confirmation)

---

**Production Ready - Start Managing Properties Now** 🎉
