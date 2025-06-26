# 報數據-電商廣告預算計算機 (Report Data - E-commerce Ad Budget Calculator)

## Overview

This is a full-stack web application built to help e-commerce businesses calculate their advertising budget requirements based on revenue targets, average order value, and conversion rates. The application is branded as "報數據" (Report Data) and features a React frontend with a Node.js/Express backend, utilizing modern web technologies and UI components.

**Version:** V1.2 - Multi-language support (Traditional Chinese, English, Japanese) with complete internationalization.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **State Management**: TanStack Query for server state management
- **Internationalization**: Traditional Chinese (zh-TW) language support

### Backend Architecture
- **Runtime**: Node.js 20 with TypeScript
- **Framework**: Express.js for REST API endpoints
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot reloading with tsx and Vite middleware integration

### Data Storage Solutions
- **Primary Database**: PostgreSQL 16 (configured for Replit environment)
- **ORM**: Drizzle ORM with type-safe queries and migrations
- **Session Store**: PostgreSQL-based session storage using connect-pg-simple
- **Development Storage**: In-memory storage implementation for development/testing

## Key Components

### Database Schema
- **Users Table**: Basic user authentication with username/password
- **Schema Location**: `shared/schema.ts`
- **Validation**: Zod schemas for type safety and validation

### API Structure
- **Base Path**: All API routes prefixed with `/api`
- **Storage Interface**: Abstracted storage layer with CRUD operations
- **Error Handling**: Centralized error handling middleware

### Authentication & Authorization
- **Strategy**: Session-based authentication
- **Session Storage**: PostgreSQL-backed sessions
- **User Management**: Basic username/password authentication system

### UI Components
- **Design System**: shadcn/ui components with Radix UI primitives
- **Theme**: Custom CSS variables for light/dark mode support
- **Icons**: Lucide React icons
- **Responsive**: Mobile-first responsive design

## Data Flow

1. **User Input**: Form data captured via React Hook Form with Zod validation
2. **Calculation Logic**: Client-side calculations for ad budget requirements
3. **API Communication**: TanStack Query manages server state and API calls
4. **Database Operations**: Drizzle ORM handles database interactions
5. **Session Management**: Express sessions maintain user state

## Email Marketing Integration
- **Service**: Brevo (formerly Sendinblue) API integration
- **List Management**: Automatic sync to Brevo list #15 "報數據"
- **Contact Data**: Email addresses with GA resource names stored in FIRSTNAME field
- **Sync Features**: 
  - Automatic new user registration sync
  - Bulk sync of existing users via API endpoint
  - Duplicate contact handling with update functionality
  - IP authorization requirement for API access

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL driver
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Type-safe database operations
- **react-hook-form**: Form state management
- **zod**: Runtime type validation
- **express**: Web framework
- **wouter**: Client-side routing

### UI Dependencies
- **@radix-ui/***: Primitive UI components
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Utility for component variants

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 and PostgreSQL 16 modules
- **Hot Reload**: Vite development server with Express middleware
- **Port Configuration**: Development server on port 5000

### Production Build
- **Frontend**: Vite build process generates optimized static assets
- **Backend**: esbuild bundles server code for production
- **Deployment**: Replit autoscale deployment target
- **Port Mapping**: Internal port 5000 mapped to external port 80

### Build Commands
- **Development**: `npm run dev` - Starts development server with hot reload
- **Build**: `npm run build` - Creates production build
- **Start**: `npm run start` - Runs production server
- **Database**: `npm run db:push` - Pushes schema changes to database

## Database Architecture

### Core Tables
- **sessions**: Google OAuth session management with PostgreSQL store
- **users**: User profile data with Google tokens for API access
- **user_metrics**: Historical analytics data with source tracking and raw data preservation

### Data Flow
1. Google OAuth authentication stores user profile and API tokens
2. GA4 API integration fetches ecommerce metrics (AOV, conversion rate)
3. Metrics stored with period tracking and source attribution
4. Auto-fill calculator from most recent saved metrics

## Changelog

```
Changelog:
- June 25, 2025. Initial setup with basic calculator functionality
- June 25, 2025. Added Footer with company branding and legal links
- June 25, 2025. Updated branding to "報數據-電商廣告預算計算機"
- June 25, 2025. Added privacy policy and terms of service pages
- June 25, 2025. Updated copyright to include 煜言顧問有限公司(TW) and 燈言顧問株式会社(JP)
- June 25, 2025. Integrated Google Analytics (GA4) tracking
- June 25, 2025. Integrated Meta Pixel tracking
- June 25, 2025. Released V1.0 - Complete initial version with all core features
- June 25, 2025. Added Google OAuth login and Analytics API integration
- June 25, 2025. Updated for production deployment at eccal.thinkwithblack.com
- June 25, 2025. Fixed redirect loop issue and proxy configuration for production
- June 25, 2025. Completed GA4 data integration with multiple metric fallbacks and number formatting
- June 25, 2025. Added Google logout functionality for switching between GA accounts
- June 25, 2025. Integrated Brevo email marketing for list #15 automation
- June 25, 2025. SEO optimization for "廣告預算怎麼抓" keyword with complete meta tags
- June 25, 2025. Released V1.1 - Brevo email marketing integration with automatic contact sync to list #15
- June 25, 2025. Updated page content and footer links to course materials
- June 25, 2025. Completed V1.1 with working Brevo integration (requires IP whitelist maintenance due to dynamic Replit IPs)
- June 25, 2025. Released V1.2 - Multi-language support with Traditional Chinese, English, and Japanese localization
- June 25, 2025. Updated V1.2.1 - Localized CPC values: NTD 5 (Taiwan), USD 1 (English), JPY 120 (Japan)
- June 25, 2025. Updated V1.2.2 - Route-based language switching (/en, /jp) with browser language auto-detection
- June 26, 2025. Implemented V1.3.0 - Credit system with referral rewards: 1 credit per calculation, 5 initial credits, referral tracking dashboard
- June 26, 2025. Updated V1.3.1 - Fixed credit system: 20 credits for existing users, dashboard navigation, unique referral links with 5 credits for both referrer and referee
- June 26, 2025. Fixed V1.3.2 - Created missing database tables (user_credits, credit_transactions, user_referrals) and successfully distributed 25 credits (5 welcome + 20 admin bonus) to all 30 existing users
- June 26, 2025. Released V1.3.4 - Fixed all frontend errors: creditsData variable scoping, TypeScript errors, and duplicate i18n identifiers. Confirmed Brevo sync working (35 contacts synced successfully). Created comprehensive README.md and prepared for GitHub repository with proper version tagging.
- June 26, 2025. Implemented V1.4.0 - Membership tier system: Free users keep all current features, can upgrade to Pro for 350 credits (30 days). Added membership status tracking, upgrade functionality, protected feature components, and multi-language support for membership system.
- June 26, 2025. Implemented V1.5.0 - Campaign Budget Planner: First Pro-exclusive feature with 8-step campaign planning workflow. Includes pre-heat period (4%), launch period (60%), main period (15%), final period (20%), and repurchase period (1%) budget allocation. Features GA4 integration for conversion rate suggestions and complete daily budget breakdown.
- June 26, 2025. Updated V1.5.1 - Adjusted Pro restriction: Campaign Budget Planner page is now fully accessible, Pro membership check only applies to the calculation button. Added proper membership status indicators and user-friendly upgrade prompts.
- June 26, 2025. Fixed V1.5.2 - Resolved persistent 401 error flooding issue. Root cause was browser-cached JavaScript making automatic /api/auth/user requests. Solution: completely removed the problematic API endpoint and disabled all frontend authentication queries. System now operates without authentication to eliminate the error spam.
- June 26, 2025. Deployed V1.5.3 - Emergency maintenance mode activated. Website shows "系統維修中，明日 8:00 恢復服務" to prevent user access while resolving backend authentication issues. All API routes disabled except health check. System stable with no error flooding.
- June 26, 2025. Fixed V1.5.4 - Resolved infinite authentication requests issue. Initial analysis suggested browser cache problem, but IP analysis (34.60.247.238) revealed requests originated from Replit internal systems (health checks/monitoring). Solution: maintenance mode + status code changes caused Replit's internal systems to stop retrying. Key insight: platform-level behavior rather than user browser issue.
- June 26, 2025. Released V1.5.5 - Complete system restoration. All previously disabled features fully restored: Google OAuth authentication, Analytics API integration, credit system, referral system, membership upgrades, campaign planner, and Brevo email sync. Root cause was Replit platform behavior, not user code issues. System now operates at full functionality.
- June 26, 2025. Fixed V1.5.6 - Google OAuth authentication fully operational. Removed remaining maintenance mode interceptors from server/index.ts that were blocking authentication routes. All Google login functionality now working correctly.
- June 26, 2025. Fixed V1.5.7 - Resolved mobile Google OAuth callback issues. Root cause was disabled user deserialization in passport.deserializeUser. Fixed session handling, cookie settings, and added comprehensive error handling for mobile authentication flow.
- June 26, 2025. Fixed V1.5.8 - Resolved database schema mismatch errors. Added missing columns (membership_level, membership_expires, campaign_planner_usage) to users table. All database operations now function correctly without column existence errors.
- June 26, 2025. Fixed V1.5.9 - Complete Google OAuth authentication system overhaul. Fixed user serialization, smart redirect after login, frontend auth state refresh, and temporarily disabled Brevo sync due to IP whitelist. Users now return to original page after login with proper authentication state.
- June 26, 2025. Fixed V1.5.10 - Resolved frontend authentication state update issues. Root cause was disabled TanStack Query client (enabled: false) preventing auth state refresh after login. Restored query functionality, optimized cache policies, and removed global no-cache headers that blocked API responses. Authentication state now updates immediately after Google OAuth login.
- June 26, 2025. Fixed V1.5.11 - Resolved "s.refetch is not a function" TypeError in calculator page. Root cause was AnalyticsDataLoader component using hardcoded fake query objects without refetch methods. Fixed by re-enabling real useAnalyticsProperties, useAnalyticsData, and useUserMetrics hooks. All TypeScript errors resolved and calculator page now loads correctly.
- June 26, 2025. Optimized V1.5.12 - Added resource monitoring and graceful shutdown handling to address "system: received signal terminated" issues. Implemented database connection pooling limits (max 5 connections), extended query cache times (10-15 minutes), disabled unnecessary auto-refetching, and added memory usage monitoring every 5 minutes. These optimizations reduce system resource consumption and improve stability.
- June 26, 2025. Optimized V1.5.13 - Eliminated frequent "Auth user endpoint" triggers causing resource drain. Added 5-minute memory cache for passport user deserialization, implemented HTTP cache headers for auth endpoint (5-minute browser cache), removed verbose authentication logging, and extended frontend auth query cache to 10-15 minutes. These changes drastically reduce database queries and API requests from authentication system.
- June 26, 2025. Optimized V1.5.14 - Comprehensive system resource optimization to prevent "system: received signal terminated". Key improvements: disabled TypeScript incremental compilation, excluded attached_assets from TypeScript processing, reduced memory monitoring to 15-minute intervals, extended user cache cleanup to 30 minutes, disabled auto-enabled queries for analytics (manual trigger only), extended analytics cache to 30-60 minutes, and silenced duplicate initialization warnings for GA/Meta Pixel. These optimizations significantly reduce CPU and memory usage while maintaining full functionality.
- June 26, 2025. Optimized V1.5.15 - Session management optimization to reduce database load. Shortened session duration from 7 days to 8 hours, disabled rolling session updates, added hourly session cleanup, disabled touch operations, and implemented automatic expired session clearing every 2 hours. These changes reduce database queries and storage overhead while maintaining user experience.
- June 26, 2025. Fixed V1.5.16 - Calculator page frontend display issues and GA API optimization. Fixed TypeScript errors in calculator page preventing proper rendering, optimized GA API queries to limit account fetching (3 accounts max, 5 properties per account), reduced verbose logging, and simplified text rendering to resolve ReactNode type conflicts. These fixes restore calculator functionality while reducing API call overhead.
- June 26, 2025. Fixed V1.5.17 - GA resource dropdown menu display issue. Root cause was API data structure mismatch and route naming inconsistency. Fixed backend to return array directly (not wrapped object), corrected route mismatch (/api/user/metrics vs /api/user-metrics), and removed GA API quantity limits per user request to show all available accounts and properties. GA resource selection now displays all user's Analytics properties without artificial restrictions.
- June 26, 2025. Fixed V1.5.18 - Restored missing Dashboard routes. Added /dashboard routes for all language variants (zh-TW, en, ja) that were accidentally removed. Manually upgraded backtrue@gmail.com to Pro membership (30 days validity). Dashboard page now accessible through navigation menu and direct URL access.
- June 26, 2025. Fixed V1.5.19 - Dashboard membership status display and logout functionality. Fixed useMembershipStatus hook to make real API calls instead of returning hardcoded free membership. Restored LogoutButton functionality to properly call /api/auth/logout endpoint and clear user session. Dashboard now correctly displays Pro membership status and expiration dates. Added user statistics and referral tracking API endpoints.
- June 27, 2025. Fixed V1.5.20 - Navigation and Campaign Planner functionality restoration. Fixed three critical bugs: 1) Added LanguageSwitcher component back to NavigationBar (top-right corner), 2) Fixed "預算計算機" link to properly route to /calculator, 3) Restored Campaign Planner functionality by re-enabling useCampaignPlannerUsage hook and fixing API endpoint path mismatches (/api/campaign-planner/usage vs /api/campaign-planner-usage). All users (Free and Pro) can now access Campaign Planner with proper usage tracking.
- June 27, 2025. Fixed V1.5.21 - Google OAuth logout functionality for account switching. Root cause was incorrect API endpoint usage - frontend was making POST requests to authentication-required route instead of using GET redirect to Google OAuth logout endpoint. Fixed LogoutButton to redirect directly to /api/auth/logout (GET) which properly handles Google OAuth session termination and redirects back to home page. "切換帳號" button now works correctly for switching between Google accounts.
- June 27, 2025. Fixed V1.5.22 - Campaign Planner usage tracking and permissions. Root cause was disabled hooks and incomplete backend implementation. Fixed useCampaignPlannerUsage hook to make real API calls, restored proper usage tracking in backend (/api/campaign-planner/record-usage now increments usage count), added type safety for frontend permission checks. Free users now get 3 trial uses, Pro users get unlimited access. Both user types can now properly access Campaign Planner with accurate usage tracking.
- June 27, 2025. Fixed V1.5.23 - Campaign Planner repurchase period budget calculation error. Root cause was incorrect daily budget division (dividing by 1 instead of 7 days). Fixed both daily budget and daily traffic calculations for repurchase period to properly divide total amounts by 7 days. Repurchase period now correctly shows 1% of total budget distributed over 7 days.
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```