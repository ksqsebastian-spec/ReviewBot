# Review Bot

A review generation platform that helps businesses collect authentic customer reviews. Customers select phrases describing their experience, and the tool combines them into a natural-sounding review they can copy to Google.

## Features

- **Review Generator**: Customers click descriptive phrases to build personalized reviews
- **Company Management**: Add multiple businesses with custom review descriptors
- **QR Code Support**: Generate QR codes for easy review page access
- **Email List**: Collect customer emails for review reminders
- **Analytics Dashboard**: Track review generation stats and SEO projections
- **FAQ & Best Practices**: Built-in guidance for ethical review collection

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel (recommended)

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ReviewBot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy your:
   - Project URL
   - Anon public key
3. Go to **SQL Editor** and run the contents of `supabase-schema.sql`

### 4. Configure environment variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Admin dashboard
│   ├── review/[slug]/      # Public review page
│   ├── signup/[slug]/      # Email signup page
│   └── faq/                # FAQ & best practices
├── components/             # React components
│   ├── ui/                 # Generic (Button, Card, Input)
│   ├── review/             # Review generator components
│   ├── forms/              # Form components
│   └── layout/             # Header, Footer, Sidebar
├── lib/                    # Utilities and config
│   ├── supabase/           # Database clients
│   ├── utils.js            # Helper functions
│   └── constants.js        # App constants
└── styles/                 # Global CSS
```

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel settings
4. Deploy

### Environment Variables for Production

Make sure to set these in your hosting platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Security Notes

- Never commit `.env.local` to version control
- The `SUPABASE_SERVICE_ROLE_KEY` has admin access - keep it secret
- For production, consider regenerating your Supabase keys

## License

Private - All rights reserved
