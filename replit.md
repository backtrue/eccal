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
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```