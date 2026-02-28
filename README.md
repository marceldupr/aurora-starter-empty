# Aurora Empty Starter Kit (Next.js)

Minimal Next.js App Router project with Aurora SDK. Add drop-in components and build your custom storefront.

**Aurora** is an all-in-one, no-code platform for stores, marketplaces, CRMs, and more. Design your data, generate your app, automate workflows. Ship in hours, not months.

[**Sign up for Aurora**](https://aurora.mandeville.digital) — currently in beta testing and free.

## Setup

1. Copy `.env.example` to `.env.local`
2. Set `NEXT_PUBLIC_AURORA_API_URL` and `AURORA_API_KEY` (from Aurora Studio → API Keys)
3. `pnpm install && pnpm dev`

## Drop-in Components

Import from `@/components/blocks`:

- **HeroBlock** – `headline`, `subheadline`
- **TextBlock** – `content`
- **ImageBlock** – `src`, `alt`
- **CatalogList** – `tableSlug`, `title`, `limit`, `basePath` (async server component)

## SDK Usage

```ts
import { AuroraClient } from "@aurora-studio/sdk";

const aurora = new AuroraClient({
  baseUrl: process.env.NEXT_PUBLIC_AURORA_API_URL!,
  apiKey: process.env.AURORA_API_KEY!,
});

// List products
const { data } = await aurora.tables("products").records.list({ limit: 10 });
```

## Deploy to Vercel

From Aurora Studio: Settings → Storefront → Deploy to Vercel. Env vars are injected automatically.
