# Sohelix - Online Utility Tools

## Overview
A high-performance, SEO-optimized web application providing a comprehensive suite of online utility tools across categories: image processing, finance calculators, development utilities, and text manipulation. Most tools run entirely client-side for privacy.

## Tech Stack
- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4
- **Routing**: React Router Dom v7
- **Animations**: Framer Motion
- **AI Integration**: Google Generative AI (Gemini)
- **Package Manager**: npm

## Project Structure
- `src/components/tools/` - 50+ individual tool components
- `src/pages/` - Page-level components (Home, ToolPage, About, Blog, etc.)
- `src/constants/tools.ts` - Tool metadata and SEO configuration
- `src/routes.tsx` - Routing including programmatic SEO routes
- `src/lib/` - Shared utilities (finance, image processing)
- `src/hooks/` - Custom React hooks
- `scripts/` - SSG build pipeline scripts
- `public/` - Static assets

## Development
- Run: `npm run dev` (serves on port 5000)
- Build: `npm run build` (multi-stage SSG pipeline)

## Deployment
- Type: Static site
- Build command: `npm run build`
- Public directory: `dist`

## Environment Variables
- `GEMINI_API_KEY` - Required for AI-powered features
- `APP_URL` - The hosted URL for self-referential links
