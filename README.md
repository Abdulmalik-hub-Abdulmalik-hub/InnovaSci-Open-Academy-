# InnovaSci Open Academy

World-class Scientific Learning Management System (LMS) platform powered by **InnovaSci AI Labs**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-5-green)

## 🚀 Features

- **Comprehensive Course System**: Publish and manage courses with video content, materials, and assessments
- **Student Dashboard**: Track progress, manage certificates, and access personalized learning
- **Enterprise Admin Dashboard**: Full-featured admin panel with analytics, user management, and content control
- **Certificate Engine**: Automated certificate generation with verification codes
- **Newsletter System**: Email campaign automation with audience segmentation
- **Dark/Light Theme**: Beautiful UI with brand colors (Purple, Blue, Teal)
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Framer Motion Animations**: Smooth, modern animations throughout

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **ShadCN UI** - High-quality UI components
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

### Backend (Ready for NestJS Integration)
- **NestJS** - Progressive Node.js framework
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Primary database (via Supabase)
- **Redis** - Caching layer

### Integrations
- **Supabase** - Database, Auth, Storage
- **Cloudflare R2** - Object storage
- **Resend** - Email delivery
- **Paystack** - Payment processing

## 📁 Project Structure

```
innovasci-open-academy/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Admin & Student dashboards
│   │   └── page.tsx            # Public landing page
│   ├── components/
│   │   ├── home/              # Landing page components
│   │   ├── layout/             # Layout components
│   │   └── ui/                # ShadCN UI components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities & Supabase client
│   └── types/                  # TypeScript definitions
├── prisma/
│   └── schema.prisma          # Full database schema
└── assets/                     # Branding assets
    ├── academy-logo/
    └── innova-labs-logo/
```

## 🗄️ Database Schema

The database schema includes:
- **profiles** - User profiles and extended user data
- **roles/permissions** - RBAC system
- **courses/lessons/materials/videos** - Content management
- **enrollments/learning_progress** - Progress tracking
- **certificates** - Certificate engine
- **subscriptions/payments** - Billing
- **newsletters** - Email campaigns
- **notifications/audit_logs** - System events

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or Supabase)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Abdulmalik-hub-Abdulmalik-hub/InnovaSci-Open-Academy-.git
cd InnovaSci-Open-Academy-

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

## 📝 Environment Variables

See `.env.example` for all required environment variables.

### Paystack Configuration

1. Create a Paystack account at [paystack.com](https://paystack.com)
2. Get your API keys from Dashboard → Settings → API Keys
3. Configure webhook URL in Dashboard → Settings → Webhooks:
   ```
   https://your-domain.com/api/payments/webhook
   ```
4. Add the following to your `.env` file:
   ```
   PAYSTACK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
   PAYSTACK_WEBHOOK_SECRET=your_webhook_secret
   ```

### Payment Flow

The platform supports the following payment flows:
- **Course Enrollment**: One-time payment for course access
- **Certificate Purchase**: Payment for certificate generation
- **Subscriptions**: Recurring payments for Pro/Team plans

All payments are processed via Paystack's secure payment gateway.

## 🎨 Design System

### Brand Colors
- **Primary**: Purple (#7C3AED) - Future Tech/AI
- **Secondary**: Blue (#2563EB) - Trust/Intelligence  
- **Accent**: Teal (#0D9488) - Science/Research

### Typography
- **Font**: Inter (Google Fonts)

## 📄 License

This project is licensed under the MIT License.

---

**Powered by InnovaSci AI Labs**
