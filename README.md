# Aurora Empty Starter Kit (Next.js)

Minimal Next.js App Router project with Aurora SDK. Add drop-in components and build your custom storefront.

**Aurora** is an all-in-one, no-code platform for stores, marketplaces, CRMs, and more. Design your data, generate your app, automate workflows. Ship in hours, not months.

[**Sign up for Aurora**](https://aurora.mandeville.digital) - currently in beta testing and free.

## Setup

1. Copy `.env.example` to `.env.local`
2. Set `NEXT_PUBLIC_AURORA_API_URL`, `AURORA_API_KEY` (from Aurora Studio → API Keys), and `NEXT_PUBLIC_TENANT_SLUG` (for store/checkout features)
3. `pnpm install && pnpm dev`

## Drop-in Components

Import from `@/components/blocks`:

- **HeroBlock** - `headline`, `subheadline`
- **TextBlock** - `content`
- **ImageBlock** - `src`, `alt`
- **CatalogList** - `tableSlug`, `title`, `limit`, `basePath` (async server component)

## Holmes SDK – What You Can Do

**Holmes** is Aurora's real-time intent inference engine. It watches user behaviour (search, cart, browsing, time of day) and adapts your storefront. The SDK lets you:

1. **Load the Holmes script** – Holmes injects itself and starts collecting signals.
2. **Mark adaptive regions** – Use `data-holmes` attributes so Holmes can hide, highlight, or show UI based on inferred mission.
3. **Call Holmes Store APIs** – Recipes, tidbits, contextual hints, home personalization, category suggestions.
4. **Integrate with checkout** – Pass `holmes_session_id` and `holmes_mission_start_timestamp` for session attribution and time-to-completion metrics.

---

## Holmes SDK – How to Use It

### 1. Load the Holmes script

The template already loads Holmes when `NEXT_PUBLIC_AURORA_API_URL` and `NEXT_PUBLIC_TENANT_SLUG` are set:

```ts
import { getHolmesScriptUrl } from "@aurora-studio/sdk";
import Script from "next/script";

// In layout.tsx:
<Script
  src={getHolmesScriptUrl(process.env.NEXT_PUBLIC_AURORA_API_URL!, process.env.NEXT_PUBLIC_TENANT_SLUG!)}
  strategy="afterInteractive"
/>
```

Or use the client: `client.holmes.scriptUrl(tenantSlug)`.

### 2. Mark regions with data-holmes

Holmes applies CSS classes (`.holmes-hidden`, `.holmes-highlight`) to elements that match directive targets:

| data-holmes value   | When Holmes infers…              | Effect                          |
| ------------------- | -------------------------------- | ------------------------------- |
| `checkout-extras`   | User in a hurry                  | Hidden – compress checkout      |
| `cross-sell`        | User wants to complete quickly   | Hidden – hide upsells           |
| `recommendations`   | Browsing / discovery             | Shown or hidden                 |
| `payment`           | High intent to pay               | Highlighted                     |
| `basket-bundle`     | Bundle suggestion available      | Bundle suggestion in cart       |

### 3. Use the Aurora client

```ts
import { AuroraClient } from "@aurora-studio/sdk";

const client = new AuroraClient({
  baseUrl: process.env.NEXT_PUBLIC_AURORA_API_URL!,
  apiKey: process.env.AURORA_API_KEY!,
});

// List products
const { data } = await client.tables("products").records.list({ limit: 10 });

// Capabilities (store, site, holmes) – discover what's enabled
const caps = await client.capabilities();
```

---

## Holmes SDK – What's Available

### Capabilities (discovery)

| Method                 | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `client.capabilities()`| Returns `{ tenantSlug, features: { store?, site?, holmes? } }` |

### Core APIs (always available)

| Method                                      | Description                    |
| ------------------------------------------- | ------------------------------ |
| `client.tables.list()`                       | List tables                    |
| `client.tables(slug).records.list(opts)`    | List records                   |
| `client.tables(slug).records.get(id)`       | Get record                     |
| `client.store.config()`                      | Store config (enabled, branding)|

### Store APIs (when `features.store` is true)

| Method | Description |
| ------ | ----------- |
| `client.store.homePersonalization(sessionId)` | Holmes-driven home (hero + sections, `quickActions`, `missions`, `shoppingListTemplates`). Returns `activeMission` when inference ≥ 0.6: `{ key, label, confidence, band, summary, uiHints }` — use for mission bar, catalogue narrowing. |
| `client.store.holmesRecipe(slug)` | Cached recipe; AI fetch on miss. |
| `client.store.holmesTidbits(entity, entityType?)` | Tidbits for recipes, ingredients, products. |
| `client.store.holmesContextualHint({ sid, cartNames, currentProduct })` | "Paying attention" hint + product links. Guardrail rules (e.g. stir-fry + spaghetti → egg noodles) power micro-learning insights. |
| `client.store.categorySuggestions(sid)` | Holmes-driven category order. |
| `client.store.holmesRecipeProducts(recipe, limit?)` | Products for a recipe (paella, curry, pasta). |
| `client.store.holmesGoesWith(productId, limit?)` | Products that go well with a given product. |
| `client.store.holmesRecentRecipes(limit?)` | Recent recipes for discovery. |
| `client.store.checkout.sessions.create(params)` | Create checkout session (Stripe or ACME). |

### Holmes APIs (when `features.holmes` is true)

| Method | Description |
| ------ | ----------- |
| `client.holmes.infer(sessionId)` | Mission inference (mission, bundle, directives). |
| `client.holmes.offers(sessionId)` | Poll unconsumed offers for a session. |
| `client.holmes.chat.send(sessionId, message)` | Send a chat message. |
| `client.holmes.chat.list(sessionId)` | List chat messages. |
| `client.holmes.scriptUrl(tenantSlug?)` | Holmes script URL for embedding. |

### Checkout attribution (session → order)

When creating checkout sessions, pass `holmes_session_id` and `holmes_mission_start_timestamp` for Holmes analytics:

```ts
const sessionId = typeof window !== "undefined" && window.holmes?.getSessionId?.();
const missionStart = typeof window !== "undefined" && window.holmes?.getMissionStartTimestamp?.();

await client.store.checkout.sessions.create({
  successUrl,
  cancelUrl,
  lineItems,
  holmes_session_id: sessionId ?? undefined,
  holmes_mission_start_timestamp: missionStart ?? undefined,
});
```

### Exported helpers

| Export | Description |
| ------ | ----------- |
| `getHolmesScriptUrl(apiBase, tenantSlug)` | Standalone helper for Holmes script URL. Use at build/render time. |

---

## Intent-first How-tos

### Active Mission Bar

When `homePersonalization(sessionId)` returns `activeMission` (confidence ≥ 0.6), show a mission bar:

```ts
const home = await client.store.homePersonalization(sessionId);
if (home.activeMission) {
  // Render bar: home.activeMission.label, .confidence, .band, .summary
  // uiHints: emphasizeMissions, narrowCatalog, showMissionBar
}
```

Use `sessionStorage` + events for dismiss state so catalogue can restore full categories when dismissed.

### Mission-first Command Surface

Put mission chips ("Start here") first, search second. Headline: "What are you trying to do?" Use `missions` from home personalization for chips; `activeMission.uiHints.emphasizeMissions` when Holmes wants missions prominent.

### Catalogue Narrowing

When `activeMission.uiHints.narrowCatalog` is true and mission bar not dismissed, reorder categories by mission priority and add a "For your mission" section. See `aurora-starter-ecom` for `mission-catalogue-config` and `CatalogueFilters` integration.

### Guardrail Rules

Contextual hints use guardrail rules first (e.g. stir-fry + spaghetti → suggest egg noodles + insight). No extra API calls; `holmesContextualHint` returns rule-based hints when cart matches rules.

---

## Init (first-run)

The `init/` folder is for optional first-run schema provisioning. This template doesn't provision tables; see `init/README.md` if you want to add the same pattern as the e-commerce starter.

## Deploy

From Aurora Studio: Settings → App templates → Generate deploy credentials. Add the env vars to your host (Vercel, Railway, etc.).
