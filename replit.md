# E-commerce Ad Budget Calculator

## Overview

This is a full-stack web application built to help e-commerce businesses calculate their advertising budget requirements based on revenue targets, average order value, and conversion rates. The application features a React frontend with a Node.js/Express backend, utilizing modern web technologies and UI components.

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

## Changelog

```
Changelog:
- June 25, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```