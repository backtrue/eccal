# 📊 Eccal - E-commerce Ad Analytics Platform

[![Version](https://img.shields.io/badge/version-4.3.0-blue.svg)](https://github.com/your-repo/eccal)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-20+-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.6+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/react-18.3+-61dafb.svg)](https://reactjs.org/)

> A professional multi-language e-commerce advertising analytics platform that provides advanced performance tracking, intelligent insights, and comprehensive budget planning through seamless API integrations.

## 🌟 Features

### 🔍 Facebook Ads Health Check (AI-Powered)
- **Multilingual AI Diagnosis** - Personalized AI assistants for Chinese, English, and Japanese
- **Real Facebook Data Integration** - OAuth 2.0 integration with Facebook Marketing API
- **Comprehensive Metrics Analysis** - Daily spend, purchases, ROAS, and CTR analytics
- **Hero Post Analysis** - High-performing ad creative identification and recommendations
- **Smart Budget Recommendations** - AI-driven optimization suggestions for underperforming campaigns

### 💰 Ad Budget Calculator (GA4 Integration)
- **Google Analytics 4 Integration** - Automated data import for accurate calculations
- **Multi-Currency Support** - TWD, USD, JPY with localized CPC settings
- **Target ROAS Calculation** - Automatic ROI projection and planning
- **PDCA Plan Management** - Save and manage budget plans for strategic planning
- **Responsive Design** - Mobile-first interface with complete accessibility

### 🚀 Campaign Budget Planner (Premium Feature)
- **Dynamic Budget Allocation** - Intelligent distribution for 3-60 day campaigns
- **5-Phase Planning System** - Pre-heat, Launch, Main, Final, and Repurchase periods
- **Membership Tiers** - Free users get 3 trials, Pro users unlimited access
- **Advanced Backend Architecture** - Service layer design ensuring calculation accuracy
- **Project Management** - Complete campaign planning storage and retrieval

### 🎯 User Management & Monetization
- **Credit System** - 30 credits for new users, 1 credit per calculation
- **Referral Program** - Reward-based user acquisition (100/50 credits per referral)
- **Pro Membership** - 350 credits upgrade with annual auto-renewal
- **Stripe Integration** - Secure multi-currency subscription payments
- **JWT Authentication** - Stateless authentication with 7-day token validity

### 🌍 Internationalization
- **Traditional Chinese** (Default) - `/zh-TW` routes
- **English** - `/en` routes  
- **Japanese** - `/jp` routes
- **Complete Localization** - UI, AI recommendations, error messages
- **Cultural Adaptation** - Currency, date formats, and business terminology

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe component development
- **Vite** for lightning-fast development and optimized production builds
- **Tailwind CSS** + **shadcn/ui** for modern, accessible design system
- **Wouter** for lightweight client-side routing
- **TanStack Query** for efficient server state management
- **Radix UI** primitives for accessibility-first components

### Backend
- **Node.js 20** with TypeScript for modern server-side development
- **Express.js** RESTful API with middleware architecture
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL 16** with connection pooling and optimization
- **JWT Authentication** for scalable, stateless sessions
- **OpenAI GPT-4** for intelligent AI-powered recommendations

### External Integrations
- **Facebook Marketing API** for real advertising data
- **Google Analytics 4 API** for e-commerce metrics
- **Google OAuth 2.0** for secure user authentication
- **Brevo (Sendinblue)** for automated email marketing
- **Stripe** for subscription billing and payment processing
- **Meta Pixel** for comprehensive user tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Google Analytics 4 account
- Facebook Developer App
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/eccal.git
cd eccal

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and configuration

# Initialize database
npm run db:push

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/eccal

# Google Services
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook Services
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# AI Services
OPENAI_API_KEY=your_openai_api_key

# Email Marketing
BREVO_API_KEY=your_brevo_api_key

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Analytics & Tracking
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_META_PIXEL_ID=your_meta_pixel_id

# Security
JWT_SECRET=your_secure_jwt_secret
```

## 📁 Project Structure

```
eccal/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Express backend
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic services
│   ├── db/               # Database configuration
│   └── middleware/       # Express middleware
├── shared/               # Shared types and schemas
│   ├── schema.ts         # Drizzle database schema
│   └── types.ts          # TypeScript type definitions
└── docs/                 # Documentation
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build            # Build for production
npm start               # Start production server

# Database
npm run db:push         # Push schema changes to database
npm run db:studio       # Open Drizzle Studio

# Type Checking
npm run check           # Run TypeScript type checking

# Utilities
npm run sync:brevo      # Sync users to Brevo email list
npm run export:users    # Export user data to CSV
```

## 🌐 API Documentation

### Authentication Endpoints
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/facebook` - Facebook OAuth login
- `GET /api/auth/logout` - User logout
- `GET /api/auth/refresh` - Refresh JWT token

### Core Features
- `GET /api/calculator/data` - Get GA4 data for budget calculation
- `POST /api/campaign-planner/calculate` - Generate campaign budget plan
- `GET /api/fbaudit/accounts` - List Facebook ad accounts
- `POST /api/fbaudit/analyze` - Perform health check analysis

### User Management
- `GET /api/user/profile` - Get user profile
- `POST /api/user/credits/spend` - Deduct user credits
- `GET /api/user/referrals` - Get referral statistics
- `POST /api/membership/upgrade` - Upgrade to Pro membership

## 📊 Database Schema

The application uses PostgreSQL with the following core tables:

- **users** - User profiles and authentication data
- **user_credits** - Credit balance and transaction history
- **user_referrals** - Referral tracking and rewards
- **plan_results** - Saved budget calculations and campaigns
- **fb_health_checks** - Facebook advertising analysis results
- **subscriptions** - Stripe subscription management

## 🔒 Security Features

- **JWT Authentication** with secure HTTP-only cookies
- **CORS Protection** with configurable allowed origins
- **SQL Injection Prevention** using parameterized queries
- **Rate Limiting** on sensitive API endpoints
- **Environment Variable Validation** for secure configuration
- **HTTPS Enforcement** in production environment

## 🌍 Multi-Language Support

The platform supports three languages with complete localization:

- **Traditional Chinese (zh-TW)** - Default language with Taiwan-specific features
- **English (en)** - International market support with USD pricing
- **Japanese (jp)** - Japan market with JPY pricing and business terminology

Each language includes:
- Localized UI text and error messages
- Currency-specific pricing and calculations
- AI personalities adapted to cultural context
- Region-specific business terminology

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
- Configure environment variables for production
- Set up PostgreSQL database with connection pooling
- Configure domain and SSL certificates
- Set up monitoring and logging

### Recommended Infrastructure
- **Hosting**: Replit, Vercel, or Railway
- **Database**: Neon, Supabase, or managed PostgreSQL
- **CDN**: Cloudflare for static assets
- **Monitoring**: Application performance monitoring tools

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- TypeScript for all new code
- ESLint + Prettier for code formatting
- Comprehensive unit tests for new features
- Documentation updates for API changes

## 📈 Performance & Analytics

- **42+ Active Users** across multiple regions
- **Multi-language AI** recommendation system
- **Real-time Facebook** ad account integration
- **Automated subscription** billing system
- **Three core services** fully operational

## 📞 Support & Contact

- **Documentation**: [User Guide](https://eccal.thinkwithblack.com/help)
- **Issues**: [GitHub Issues](https://github.com/your-username/eccal/issues)
- **Email**: support@thinkwithblack.com
- **Website**: [https://eccal.thinkwithblack.com](https://eccal.thinkwithblack.com)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 API enabling intelligent recommendations
- **Facebook** for Marketing API access
- **Google** for Analytics and OAuth services
- **Stripe** for secure payment processing
- **The Open Source Community** for amazing tools and libraries

---

**© 2025 Think With Black Consultancy. All rights reserved.**

Made with ❤️ by the Eccal Team