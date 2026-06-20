# Requirements Document

## 1. Application Overview

**Application Name**: Saksham Digi QR Menu

**Application Description**: A complete single-page application (SPA) enabling restaurant owners to create QR-based digital menus, manage restaurants, accept customer orders, and track revenue. Normal customers can browse restaurants and place orders by scanning QR codes. All data is stored in browser localStorage with no backend dependency.

**Technical Constraints**:
- Single-page application built with React 18, TypeScript, and Vite
- All data persistence via browser localStorage
- Client-side routing with React Router v6 using `useNavigate()` hook — NO full page reloads or `window.location` usage
- UI framework: shadcn/ui with Tailwind CSS
- QR code generation: qrcode.react library
- PDF/PNG export: html2canvas and jsPDF libraries
- Toast notifications: sonner library
- Icons: lucide-react
- Dark/Light theme toggle support
- CSS animations using `@keyframes` and `animation` classes (150ms–400ms transitions, NO Framer Motion)

**Brand Identity**:
- Logo URL: https://miaoda-conversation-file.s3cdn.medo.dev/user-bctx96g1udc0/app-cg8nvxlqtuyq/20260620/logo.png
- Primary color: Orange (#F97316)
- Dark mode background: Deep dark navy (#0B1120)
- Light mode background: Warm off-white (#FAFAF8)
- Accent color: Amber/gold for highlights
- Design language: Modern fintech/foodtech SaaS with glassmorphism, smooth animations, generous whitespace

---

## 2. Users and Usage Scenarios

### 2.1 Target Users

**Restaurant Owners**
- Create and manage restaurants
- Manage menu items and categories
- Receive and process customer orders
- Track revenue and analytics
- Generate QR codes for tables

**Normal Customers**
- Browse restaurants by location and rating
- Scan QR codes to view menus
- Place orders digitally
- Track order status
- Submit ratings and reviews

**Admin**
- Manage restaurant suspensions
- Assign subscription plans to owners
- Moderate reviews
- Configure site settings
- Enable maintenance mode

### 2.2 Core Usage Scenarios

**Scenario 1: Restaurant Owner Creates Digital Menu**
- Owner clicks Google Sign-In button (simulated OAuth)
- Verifies phone number
- Creates restaurant profile with logo and details (random 16-character alphanumeric slug auto-generated)
- Adds menu items with images and prices
- Generates branded QR code
- Downloads QR code as PNG or PDF for table placement

**Scenario 2: Customer Orders via QR Code**
- Customer scans QR code at restaurant table
- Browses menu and adds items to cart
- Provides name and phone number
- Selects payment method (Online/Cash)
- Submits order and tracks status
- Receives order acceptance or rejection notification
- Downloads PDF bill after order completion
- Optionally submits rating and review

**Scenario 3: Owner Manages Orders**
- Receives order notification with sound alert (ding.mp3)
- Reviews order details
- Accepts or rejects order (with reason if rejected)
- Marks order as completed
- Generates PDF bill for customer

---

## 3. Page Structure and Functionality

### 3.1 Page Hierarchy

```
/
├── /restaurants
├── /r/:slug (Public Restaurant Profile)
├── /m/:slug (Restaurant Menu)
├── /cart
├── /order/:orderId (Order Tracking)
├── /owner
│   ├── /owner/login
│   ├── /owner/verify-phone
│   ├── /owner/dashboard
│   ├── /owner/restaurants
│   ├── /owner/restaurants/create
│   ├── /owner/restaurants/:id/edit
│   ├── /owner/restaurants/:id/menu
│   ├── /owner/restaurants/:id/orders
│   ├── /owner/restaurants/:id/qr
│   └── /owner/profile
├── /admin1 (Admin Login)
├── /admin1/dashboard
├── /admin1/restaurants
├── /admin1/owners
├── /admin1/reviews
├── /admin1/settings
├── /privacy-policy
└── /cookie-policy
```

### 3.2 Home Page (/)

**Header**
- Left: Logo and site name Saksham Digi QR Menu
- Right: Add to Home Screen button (shown when `beforeinstallprompt` event fires), Get Started button (navigates to /owner/login using `useNavigate()`), Dark/Light theme toggle

**Hero Section**
- Full-screen hero with animated gradient background
- Large headline describing platform purpose
- Floating restaurant cards preview with entrance animations
- Call-to-action Get Started button

**Animated Stats Counter**
- Display total restaurants, orders, cities with counting animation

**Search Restaurants Section**
- Search bar with animated focus ring
- Navigates to /restaurants?q=searchTerm using `useNavigate()`

**Featured Restaurants Section**
- Display top-rated restaurants from localStorage in card grid
- Cards with food photography aspect ratio, hover zoom on image, rating badge overlay
- Smooth entrance animations (fade-up, staggered)
- Clicking card navigates to /r/:slug using `useNavigate()`

**Pricing Plans Section**
- Display three plan cards with subtle gradient backgrounds:
  - **Free Plan (₹0)**: 1 Restaurant, 20 Menu Items, QR Code Generation & Download, Customer Digital Ordering, Live Order Tracking, Daily & Monthly Earnings View, Customer Ratings & Reviews, PDF Receipt per Order
  - **Basic Plan (₹29/month)**: Up to 5 Restaurants, Unlimited Menu Items, Monthly Analytics Dashboard, Best Selling Items Report, Menu Categories Management, Order History & Filters (highlighted with Most Popular badge)
  - **Premium Plan (₹49/month)**: Unlimited Restaurants, Unlimited Menu Items, Lifetime Analytics, Popular Categories Insights, Most Active Hours Report, Custom Restaurant Theme Color
- Feature checkmarks for each plan
- Clicking Basic or Premium plan opens WhatsApp with pre-filled message I would like to purchase [plan name] plan using support number from settings

**Features Section**
- Display 9 feature icon cards with hover lift effect:
  - QR Menu Generator
  - Digital Ordering
  - Live Order Alerts
  - Revenue Analytics
  - Ratings & Reviews
  - PDF Receipts
  - QR Download
  - Multi-Restaurant
  - Dark Mode

**Footer**
- Links to Privacy Policy and Cookie Policy pages (navigate using `useNavigate()`)

### 3.3 Restaurants Page (/restaurants)

**Search and Filter**
- Search bar prominent at top with animated focus ring (from query parameter ?q=)
- Filter chips (not dropdowns) for location and rating

**Restaurant Display**
- Card grid with food photography aspect ratio, hover zoom on image, rating badge overlay
- Clicking card navigates to /r/:slug using `useNavigate()`

### 3.4 Public Restaurant Profile (/r/:slug)

**Restaurant Information**
- Display restaurant name, logo, location, phone number, overall rating

**Reviews Section**
- Display all customer reviews with star ratings and written feedback
- Filter chips for star rating (1, 2, 3, 4, 5)
- Show reviewer name (from order name)

### 3.5 Menu Page (/m/:slug)

**Suspended Restaurant Handling**
- If restaurant is suspended: display This restaurant is currently unavailable message

**Restaurant Header**
- Sticky header with logo, name, phone

**Menu Display**
- Search bar with animated focus ring
- Category tabs horizontal scrollable with active indicator
- Menu items: Large image cards, name + price prominent, smooth Add/Remove animation
- Add to Cart button for each item

**Cart Interaction**
- After adding item: show quantity controls (-/+) with smooth animation
- When quantity reaches 0: remove from cart and show Add to Cart button again
- Floating cart button with item count badge and bounce animation
- Clicking cart button navigates to /cart?restaurant=slug using `useNavigate()`

### 3.6 Cart and Order Page (/cart)

**Cart Summary**
- Clean order summary with item list in card
- Show total amount

**Customer Information Form**
- Name (required)
- Phone Number (required, validate: not 1234567890 or 0987654321, must be 10 digits)
- Payment method toggle (pill buttons): Cash or Online
  - If Online: display owner's payment information from restaurant data

**Order Submission**
- Order button prominent CTA
- Place Order button saves order to localStorage with random UUID as order ID
- Navigate to /order/:orderId using `useNavigate()`

### 3.7 Order Status Page (/order/:orderId)

**Order Status Display**
- Status timeline (Pending → Accepted → Completed/Rejected) with animated progress
- Poll localStorage every 2 seconds for status updates without page reload
- If Rejected: display rejection reason and restaurant phone number
- If Completed: show Download PDF Bill button

**PDF Bill**
- Professional styled PDF:
  - Logo at top center (restaurant logo image)
  - Restaurant name bold large
  - Location + Phone below
  - Horizontal rule
  - Order ID + Date (left/right columns)
  - Customer name + Payment method
  - Items table: Item | Qty | Amount columns with alternating row shading
  - TOTAL row bold at bottom
  - Footer italic disclaimer text: This bill is Generated by Saksham Digi QR Menu. This is not an official receipt. Ask original bill from owner.
  - Powered by Saksham Digi QR Menu

**Review Section**
- After order status changes to Completed: show review section (not popup)
- Optional star rating (1-5) and written review
- Submit saves review to localStorage

### 3.8 Owner Login (/owner/login)

**Authentication**
- Single Google Sign-In button (NO email input field)
- Simulated Google OAuth: clicking button auto-fills fake Google profile (name, email, profile picture) and stores owner in localStorage

**Post-Login Flow**
- If new owner: navigate to /owner/verify-phone using `useNavigate()`
- If existing owner: navigate to /owner/dashboard using `useNavigate()`

### 3.9 Phone Verification (/owner/verify-phone)

**Phone Number Input**
- Validate: not 1234567890 or 0987654321, must be 10 digits
- Save phone to owner profile in localStorage
- Navigate to /owner/dashboard using `useNavigate()`

### 3.10 Owner Dashboard (/owner/dashboard)

**Sidebar Navigation** (desktop) / **Bottom Drawer** (mobile)
- Dashboard, My Restaurants, Profile, Logout

**Stats Cards**
- Total restaurants, total orders, total revenue with subtle gradient backgrounds

**Your Restaurants Section**
- Restaurant cards with name, logo, location
- Inline quick action buttons: Orders, Menu, QR, Edit (navigate using `useNavigate()`)
- Real-time order badge counter in nav

**Platform Features Info Cards**
- Display feature cards
- Locked/blurred cards for features not included in current plan with upgrade CTA

### 3.11 Owner Restaurants List (/owner/restaurants)

**Restaurant Cards**
- Display all owned restaurants
- Same layout as dashboard restaurants section

**Create Restaurant Button**
- Disabled with message if Free plan limit reached (1 restaurant)
- Navigates to /owner/restaurants/create using `useNavigate()`

### 3.12 Create Restaurant (/owner/restaurants/create)

**Restaurant Form**
- Name (required)
- Logo upload (required, stored as base64 in localStorage)
- Location (required)
- Phone (required)

**Post-Creation**
- Generate random 16-character alphanumeric slug (e.g. AsOnl097ncdjk89u)
- Save to localStorage
- Navigate to /owner/restaurants/:id/menu using `useNavigate()`

### 3.13 Edit Restaurant (/owner/restaurants/:id/edit)

**Edit Form**
- Update name, logo (base64), location, phone

**Delete Restaurant**
- Delete button with confirmation dialog
- Deleting restaurant unlocks Free Plan slot
- Navigate to /owner/restaurants using `useNavigate()`

### 3.14 Restaurant Menu Management (/owner/restaurants/:id/menu)

**Single Page Layout**
- Categories sidebar (if categories exist) + items grid on one scrollable page

**Menu Items List**
- Display items grouped by category (if categories exist)
- Inline edit and delete actions per item

**Add Menu Item**
- Name (required)
- Image upload (required, stored as base64)
- Price (required)
- Category selection (if categories exist)

**Categories Management**
- Create, edit, delete categories inline
- Available on Basic and Premium plans only (show locked/blurred for Free plan with upgrade CTA)

**Free Plan Limit**
- Maximum 20 menu items

### 3.15 Restaurant Orders (/owner/restaurants/:id/orders)

**Order Notifications**
- Poll localStorage every 2 seconds for new orders without page reload
- Play ding.mp3 from /public/ding.mp3 when new order arrives (if file not found, use Web Audio API fallback tone)
- Show new order badge/notification

**Orders List**
- Display all orders in a list with customer name, items, total, status
- Filter chips for status (Basic/Premium only — show locked/blurred for Free plan with upgrade CTA)

**Order Actions**
- Inline accept/reject buttons
- Accept button: changes status to Accepted
- Reject button: opens dialog for rejection reason, changes status to Rejected
- Mark as Done button: changes status to Completed, generates PDF bill data

### 3.16 QR Code Generation (/owner/restaurants/:id/qr)

**Branded QR Code Component**
- Display restaurant logo (base64 image)
- Restaurant name
- Phone number
- Location
- QR code pointing to /m/:slug (random 16-character alphanumeric slug)
- By Saksham Digi QR Menu branding with logo

**Download Options**
- Download as PNG (using html2canvas)
- Download as PDF (using jsPDF)

### 3.17 Owner Profile (/owner/profile)

**Profile Management**
- Edit name, phone
- Display current plan (Free/Basic/Premium) and expiry date
- Upgrade Plan button (opens WhatsApp link)
- Delete Account button with confirmation dialog

### 3.18 Admin Login (/admin1)

**Authentication**
- Email and password form
- Credentials: sqrmadmin@srpdigitalstudios.qzz.io / sqrm15112010@
- Validate exact string match only (NO SQL injection bypass logic like 1=1)
- On success: save admin session to localStorage, navigate to /admin1/dashboard using `useNavigate()`

**Access Control**
- URL /admin shows error page (not found)
- URL /admin1 shows admin login

### 3.19 Admin Dashboard (/admin1/dashboard)

**Sidebar Navigation**
- Dashboard, Restaurants, Owners, Reviews, Settings, Logout

**Stats Overview**
- Display platform statistics

### 3.20 Admin Restaurants (/admin1/restaurants)

**Restaurants Table**
- Clean data table with all restaurants, owner email, status
- Inline action buttons: Suspend / Reactivate toggle per restaurant

### 3.21 Admin Owners (/admin1/owners)

**Owners Table**
- Clean data table with all owners, email, plan, plan expiry, restaurant count
- Inline action: Assign Plan dropdown (Free/Basic/Premium)
- Plan assignment updates immediately in localStorage

### 3.22 Admin Reviews (/admin1/reviews)

**Review Management**
- Select restaurant from dropdown
- Display all reviews for selected restaurant
- Inline delete review button (removes instantly from localStorage)

### 3.23 Site Settings (/admin1/settings)

**Settings Form**
- Grouped form sections:
  - Site name input
  - Support phone number
  - Support email
  - Logo upload (stored as base64)
  - Maintenance mode toggle
- Save button updates localStorage settings immediately

### 3.24 Privacy Policy Page (/privacy-policy)

**Content**
- Display privacy policy content

### 3.25 Cookie Policy Page (/cookie-policy)

**Content**
- Display cookie policy content

---

## 4. Business Rules and Logic

### 4.1 localStorage Data Structure

**localStorage Keys**:
- `sqrm_owners`: Array of owner objects
- `sqrm_current_owner`: Logged-in owner session
- `sqrm_restaurants`: Array of restaurant objects
- `sqrm_menu_items`: Array of menu items
- `sqrm_categories`: Array of categories
- `sqrm_orders`: Array of orders
- `sqrm_reviews`: Array of reviews
- `sqrm_admin_session`: Admin login session
- `sqrm_settings`: Site settings (name, support number, support email, maintenance mode)
- `sqrm_plans`: Owner plan assignments

### 4.2 Subscription Plan Rules

**Free Plan**
- Maximum 1 restaurant
- Maximum 20 menu items
- Includes: QR Code Generation & Download, Customer Digital Ordering, Live Order Tracking, Daily & Monthly Earnings View, Customer Ratings & Reviews, PDF Receipt per Order

**Basic Plan**
- Maximum 5 restaurants
- Unlimited menu items
- Includes: Monthly Analytics Dashboard, Best Selling Items Report, Menu Categories Management, Order History & Filters

**Premium Plan**
- Unlimited restaurants
- Unlimited menu items
- Includes: Lifetime Analytics, Popular Categories Insights, Most Active Hours Report, Custom Restaurant Theme Color

**Plan Assignment**
- Admin assigns plans to owners via /admin1/owners
- Plans expire 30 days after assignment
- Features unlock/lock immediately upon plan change
- Features not in current plan shown as locked/blurred with upgrade CTA

### 4.3 Order Flow

**Order Creation**
- Customer adds items to cart on /m/:slug
- Clicks cart button to navigate to /cart?restaurant=slug using `useNavigate()`
- Provides name, phone number, payment method
- Submits order: generates random UUID as order ID, saves to localStorage
- Navigates to /order/:orderId using `useNavigate()`

**Order Status Updates**
- Initial status: Pending
- Owner polls localStorage every 2 seconds for new orders without page reload
- Owner receives sound notification (ding.mp3 from /public/ding.mp3, fallback to Web Audio API tone) when new order arrives
- Owner can Accept or Reject:
  - Accept: status changes to Accepted
  - Reject: owner enters reason, status changes to Rejected
- Owner marks as Done: status changes to Completed, PDF bill data generated

**Real-time Synchronization**
- Customer polls localStorage every 2 seconds on /order/:orderId for status updates without page reload
- All status changes reflect instantly for both owner and customer

### 4.4 Review System

**Review Submission**
- Available only after order status changes to Completed
- Review section shown to customer on /order/:orderId
- Customer submits star rating (1-5) and optional written review
- Reviewer name shown as name provided during order
- Review saved to localStorage

**Review Display**
- All reviews displayed on /r/:slug
- Filter chips for star rating (1, 2, 3, 4, 5)

**Review Moderation**
- Admin can delete reviews via /admin1/reviews
- Deleted reviews removed instantly from localStorage

### 4.5 QR Code System

**QR Code Content**
- Links to /m/:slug (random 16-character alphanumeric slug)
- Branded design includes: Restaurant Name, Phone Number, Logo (base64), Location, By Saksham Digi QR Menu with logo

**Download Formats**
- PNG format (using html2canvas)
- PDF format (using jsPDF)
- Same branded design on both formats

### 4.6 Phone Number Validation

**Validation Rules**
- Reject fake numbers: 1234567890, 0987654321
- Must be 10 digits
- Required for owner account creation and customer orders

### 4.7 Payment Method Handling

**Online Payment**
- Display owner's payment information from restaurant data
- No payment gateway integration
- Customer completes payment outside platform

**Cash Payment**
- Customer pays in cash upon order delivery

### 4.8 Image Storage

**Image Upload**
- All uploaded images (restaurant logos, menu item images) stored as base64 strings in localStorage
- No external image hosting

### 4.9 Maintenance Mode

**Maintenance Mode Enabled**
- Show maintenance message to all users except admin session
- Message: We Are Doing Maintenance For Your Experience. It Won't Take That Long.

### 4.10 Suspended Restaurants

**Suspension Handling**
- Admin can suspend restaurants via /admin1/restaurants
- Suspended restaurants show This restaurant is currently unavailable on /m/:slug and /r/:slug

### 4.11 Dark/Light Mode

**Theme Toggle**
- Dark/Light mode toggle available in header
- Theme preference persisted in localStorage
- Dark mode background: Deep dark navy (#0B1120)
- Light mode background: Warm off-white (#FAFAF8)
- Primary color: Orange (#F97316)
- All text uses semantic tokens (`text-foreground`, `text-muted-foreground`) never hardcoded colors

### 4.12 PWA Features

**Progressive Web App**
- manifest.json with app icons
- Service Worker for offline caching
- Offline banner when navigator.onLine is false
- Banner disappears when reconnected
- Add to Home Screen button in header shown when `beforeinstallprompt` event fires

### 4.13 SEO

**Meta Tags**
- Use React Helmet for meta tags on each page

### 4.14 Routing and Navigation

**Client-Side Navigation**
- All navigation uses React Router `useNavigate()` hook
- NO full page reloads or `window.location.href` usage
- NO `window.location.reload()` usage

### 4.15 Slug Generation

**Random Alphanumeric Slugs**
- When restaurant is created: generate random 16-character alphanumeric slug (e.g. AsOnl097ncdjk89u)
- NOT human-readable slugs like /m/srp-menu
- Same for restaurant slug

### 4.16 UI Design Language

**Design Principles**
- Modern fintech/foodtech SaaS aesthetic
- Glassmorphism with subtle blur and border glow (`bg-white/5 backdrop-blur-md border border-white/10`) in dark mode
- Smooth entrance animations (fade-up, slide-in) using CSS `@keyframes` and `animation` classes (150ms–400ms transitions)
- Staggered card animations
- Large bold headings, generous whitespace
- Rounded corners: `rounded-2xl` and `rounded-3xl`
- Subtle gradients on hero sections and cards
- No plain white backgrounds — use layered depth

---

## 5. Exception and Boundary Cases

| Scenario | Handling |
|----------|----------|
| Owner attempts to create restaurant beyond Free plan limit (1 restaurant) | Disable Create Restaurant button with message indicating plan limit reached |
| Owner attempts to add menu item beyond Free plan limit (20 items) | Show error message indicating item limit reached, suggest upgrading plan |
| Customer submits order with invalid phone number (1234567890, 0987654321, or non-10-digit) | Show validation error, require valid phone number |
| Owner rejects order without providing reason | Require rejection reason before allowing status change |
| Customer loses internet connection during order | Show offline banner, allow viewing cached order status from localStorage |
| Admin deletes review | Review removed instantly from localStorage |
| Admin changes owner's plan | Features unlock/lock immediately based on new plan |
| Owner deletes restaurant on Free plan | Unlock Free plan slot, allow creating new restaurant |
| Customer scans QR code for suspended restaurant | Show This restaurant is currently unavailable message |
| Maintenance mode enabled | Show maintenance message to all users except admin session |
| Customer attempts to place order with empty cart | Show error message, require at least one item in cart |
| localStorage quota exceeded | Show error message indicating storage limit reached |
| Owner uploads non-image file as logo/menu item image | Show validation error, require image file |
| Plan expires after 30 days | Features automatically lock based on expired plan |
| Multiple tabs open with same owner session | Changes in one tab reflect in other tabs via localStorage events |
| ding.mp3 file not found in /public/ding.mp3 | Use Web Audio API fallback tone for order notification |
| Admin attempts SQL injection (e.g. 1=1) | Validate exact string match only, reject any input not matching sqrmadmin@srpdigitalstudios.qzz.io / sqrm15112010@ |
| User navigates using browser back/forward buttons | React Router handles navigation correctly without page reload |
| beforeinstallprompt event does not fire | Add to Home Screen button not shown in header |

---

## 6. Acceptance Criteria

1. Restaurant owner clicks Google Sign-In button (simulated OAuth auto-fills fake profile), verifies phone number (not 1234567890 or 0987654321)
2. Owner creates restaurant with name, logo (base64), location, and phone number, random 16-character alphanumeric slug auto-generated
3. Owner adds menu items with images (base64) and prices, respecting Free plan limit of 20 items
4. Owner generates branded QR code and downloads as PNG or PDF
5. Customer scans QR code, browses menu, adds items to cart, and places order with name, phone, and payment method (all navigation uses `useNavigate()`, no page reloads)
6. Owner receives order notification with ding.mp3 sound alert (fallback to Web Audio API tone if file not found), polls localStorage every 2 seconds without page reload
7. Owner accepts order, customer sees status change to Accepted instantly via polling without page reload
8. Owner marks order as Completed, generates professional PDF bill with logo, restaurant details, items table, and footer note
9. Customer downloads PDF bill and submits star rating and written review in review section
10. Admin logs in with sqrmadmin@srpdigitalstudios.qzz.io / sqrm15112010@ (exact string match validation), assigns Basic plan to owner, features unlock immediately

---

## 7. Out of Scope for This Release

- Backend server or database (all data in localStorage only)
- Real-time WebSocket or server-sent events (polling localStorage instead)
- Payment gateway integration for online payments
- Email notifications for orders
- SMS notifications for orders
- Integration with third-party delivery services
- Inventory management system
- Employee/staff management
- Table reservation system
- Loyalty program or rewards system
- Coupon or discount code system
- Advanced analytics beyond plan features
- Export data to Excel/CSV
- API for third-party integrations
- Custom domain support for individual restaurants
- White-label solution for franchises
- Multi-language support beyond English
- Mobile app (iOS/Android native apps)
- Image optimization or compression beyond base64 storage
- Cloud storage for images (all images stored as base64 in localStorage)
- User authentication via actual Google OAuth API (simulated with button click)
- Actual payment processing (owner payment info displayed only)
- Server-side validation or security measures
- Data backup or export functionality
- Multi-user collaboration for restaurant management
- Role-based access control beyond owner/admin distinction
- Framer Motion animations (use CSS `@keyframes` and `animation` classes only)
- Demo seed data (production ready with no seed data)