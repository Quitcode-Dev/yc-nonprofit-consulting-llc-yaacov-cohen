# yc-nonprofit-consulting-llc-yaacov-cohen

## Overview
A nonprofit consulting management platform built with Next.js, Supabase, and shadcn/ui.

## Tech Stack
- **Next.js 14** (App Router)
- **Supabase** (Auth + Database)
- **Tailwind CSS**
- **shadcn/ui**
- **Zustand**
- **TypeScript**

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key - server only |

## Project Structure

