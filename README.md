# Venue Membership MVP

A Next.js 14 membership platform with Supabase authentication, Stripe payments, and tier-based access control.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Payments:** Stripe
- **Styling:** Tailwind CSS

## Features

- 🔐 Authentication with Supabase
- 💳 Stripe payment integration
- 🎟️ Tiered membership system
- 📱 Responsive design
- 🔒 Row-level security (RLS)
- 🎨 Modern UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/projectpjd26-commits/venue-membership-mvp.git
cd venue-membership-mvp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

1. Create a new Supabase project
2. Run the SQL migrations in the Supabase SQL Editor
3. Enable Row Level Security (RLS) on all tables
4. Configure authentication providers

## Deployment

Deploy to Vercel:

```bash
vercel deploy
```

Or use the Vercel GitHub integration for automatic deployments.

## Project Structure

```
venue-membership-mvp/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   └── lib/
│       └── supabase/     # Supabase client utilities
│           ├── client.ts # Browser client
│           └── server.ts # Server client
├── middleware.ts         # Auth middleware
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

## Environment Variables

See `.env.example` for all required environment variables.

## License

MIT
