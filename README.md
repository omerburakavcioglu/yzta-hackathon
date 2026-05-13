<div align="center">

<img src="frontend/src/app/icon.svg" alt="Koopilot" width="96" height="96" />

# Koopilot

**The AI operations co-pilot for small businesses and producer cooperatives.**

_Turn a day of WhatsApp messages, scattered spreadsheets and "where is my order?" calls into a single, AI-assisted operations workspace._

[Live company dashboard](https://koopilot.site) · [Live consumer storefront](https://ege.koopilot.site) · [API](https://yzta-hackathon-ee2z.onrender.com/docs)

</div>

---

## 1. The problem we are solving

Small and mid-sized businesses (SMBs) and producer cooperatives still run their day-to-day operations almost entirely by hand:

- Customer requests arrive across e-mail, phone and messaging apps.
- Orders and stock are tracked in scattered spreadsheets — or on paper.
- Shipments are reconciled manually, one tracking number at a time.
- Process knowledge lives in one or two people's heads.

In practice this means an owner spends **2–3 hours a day** answering questions like _"where is my order?"_ or _"is this product still in stock?"_. By the time a stock-out is noticed, sales have already been lost. By the time a shipment delay surfaces, the customer is already angry.

The result is operational drag, inconsistent customer experience, and a hard ceiling on how far the business can grow without hiring overhead.

**Koopilot is built to remove that drag.**

## 2. What Koopilot is

Koopilot is a multi-tenant operations platform that combines three things into one product:

1. **An AI co-pilot for the business owner** — a single screen that summarises the day, flags critical stock, surfaces delayed shipments, and answers operational questions in natural language.
2. **A self-service experience for the end customer** — a branded storefront with an AI assistant that can answer "where is my order?" without a human in the loop.
3. **A platform layer for partners and operators** — multi-tenant by design, so each cooperative or SMB gets its own isolated workspace, customers and analytics.

The end-customer experience is shipped as a **fully branded storefront**, so a cooperative does not have to build its own website to benefit from the platform. The first reference deployment is **Ege Zeytincilik Kooperatifi**, a regional olive-oil cooperative — its consumer site is live at [ege.koopilot.site](https://ege.koopilot.site).

## 3. Who it is for

Koopilot is designed for:

- Small-scale e-commerce sellers running a **20–200 SKU** catalog.
- Boutique and regional retailers handling **10–100 orders per day**.
- **Producer cooperatives** in food, agriculture and handicraft verticals.
- Hybrid sellers with both a physical store and an online channel.

## 4. Product surfaces

Koopilot exposes three role-aware experiences, each tailored to its user.

### 4.1 Operations workspace (business owner / company role)

The owner's daily landing page is a single **AI Operations Brief** plus a small set of action-oriented panels.

What it answers, at a glance:
- How many orders came in overnight, and which ones are still in `preparing`?
- Which products fell below their critical stock threshold today?
- Which shipments are at risk of delay?
- What does the next 7 days of sales look like — and which items will stock out first?

Capabilities:
- **AI Operations Brief** — on-demand summary generated from the tenant's live data (orders, stock, shipments, forecast), in the language of the user.
- **Orders** — list, create, edit and cancel orders; status filtering; per-customer drill-down.
- **Inventory** — products with stock levels, critical thresholds, category breakdown; CRUD.
- **Critical stock** — auto-filtered list of products at or below threshold.
- **Delayed shipments** — risk-flagged shipments with carrier and ETA.
- **Forecast** — 7-day moving-average projection per product, days-until-stockout, suggested restock quantity.
- **Monthly reports** — historical operational snapshots.
- **Company assistant chat** — grounded LLM agent that answers operational questions against the tenant's data.

### 4.2 Customer experience (end customer role)

The customer-facing experience runs in two ways: the in-platform customer area and the branded public storefront.

In-platform:
- **My orders** — every order with live status, items, totals.
- **Order detail** — line items, carrier, tracking number, ETA, delay flag.
- **Customer assistant chat** — natural-language access to order status and product information, scoped strictly to the signed-in customer.

Branded storefront (Ege Zeytincilik reference deployment):
- Product catalog with category filters and sort.
- Cart, guest and registered checkout.
- Account area with order history and per-order tracking.
- Always-on chat assistant that can answer "where is my order?", "what's in stock?", and product questions — without escalating to a human.

### 4.3 Platform admin (operator role)

A platform-level view across every cooperative or company on Koopilot:
- Cross-tenant summary metrics (tenants, orders, revenue, customers).
- Per-tenant drill-down with the same operational view.
- Cross-tenant activity log.
- Cross-tenant order management for support purposes.

## 5. AI design

The AI layer is deliberately small, grounded and explainable. The goal is to be useful in production, not to put an LLM in front of every screen.

### 5.1 Operations Brief

A single endpoint (`GET /company/operation-summary`) builds a structured context object — today's orders, preparing orders, critical-stock products, delayed shipments, and the 7-day forecast — and asks the model to write a short, action-ordered daily brief.

Prompt rules (excerpt from [`backend/app/prompts/company_assistant.txt`](backend/app/prompts/company_assistant.txt)):

> - Respond in the language the user speaks (Turkish or English).
> - **Use ONLY the provided company data. Do NOT invent numbers, order IDs, or stock levels.**
> - If data is missing, say you could not find it.
> - Be concise, practical, and action-oriented.
> - Prioritise the most urgent items first.

In other words: the model never hallucinates business facts. Everything it says comes from a database fetch that happens **before** the call.

### 5.2 Role-scoped chat agents

Two assistants, two prompts, two scopes:

| Agent | Prompt | What it can see |
|---|---|---|
| Company assistant | [`company_assistant.txt`](backend/app/prompts/company_assistant.txt) | Tenant-scoped orders, inventory, shipments, forecasts |
| Customer assistant | [`customer_assistant.txt`](backend/app/prompts/customer_assistant.txt) | Only the signed-in customer's own orders + public product info |

The chat endpoints (`POST /company/chat`, `POST /customer/chat`, `POST /storefront/ege/chat`) build a fresh, scoped context object on every turn and feed it to the model with the user's message. The model is configured at `temperature=0.3` to keep answers conservative.

### 5.3 Forecasting

A deliberately simple, transparent model: a **7-day moving average** of `units_sold` per product (see [`backend/app/services/forecast_service.py`](backend/app/services/forecast_service.py)). For each SKU it returns:

- `average_daily_sales`
- `forecast_7_days`
- `days_until_stockout`
- `stock_risk` (true if `days_until_stockout ≤ 7`)
- `recommended_restock` (sized to cover two forecast windows)

Why this instead of a heavier model: forecasts that a non-technical operator cannot explain are forecasts they will not trust. A moving average plus a clear stock-out date is a far better fit for a 20-SKU cooperative than an opaque time-series net.

### 5.4 Why this shape works

- **Grounded** — every model call is preceded by a SQL fetch. The LLM is a writer, not a source of truth.
- **Multilingual** — prompts instruct the model to mirror the user's language (Turkish / English), which matches the reality of Turkish SMB owners.
- **Action-ordered** — the company prompt explicitly tells the model to lead with the most urgent item, not the prettiest sentence.
- **Cheap and fast** — `gpt-4o-mini`, `max_tokens=500`, no streaming gymnastics; the daily brief is generated in under two seconds.

## 6. Architecture

```
                    ┌────────────────────────────┐
                    │       Operator web         │ Next.js 14 (App Router)
                    │   (admin/company/customer) │ koopilot.site
                    └────────────┬───────────────┘
                                 │ HTTPS
┌──────────────────────┐         │       ┌─────────────────────┐
│   Consumer web       │─────────┼──────▶│      FastAPI        │
│  (branded storefront)│         │       │   (Python 3.11)     │
│ storefront-ege.app   │         │       │  Render deployment  │
└──────────────────────┘         │       └──────────┬──────────┘
                                 │                  │
                                 │                  │ x-tenant-id, x-role, x-user-id
                                 │                  │ filter every query
                                 ▼                  ▼
                       ┌───────────────────┐  ┌──────────────────┐
                       │  Supabase Postgres│  │  OpenAI gpt-4o-  │
                       │  (multi-tenant)   │  │     mini         │
                       └───────────────────┘  └──────────────────┘
```

### 6.1 Tech stack

| Layer | Choice | Why |
|---|---|---|
| Web (operator) | Next.js 14, App Router, TypeScript, Tailwind | Fast iteration, file-based routing, edge-deployable |
| Web (storefront) | Next.js 14, TypeScript, Tailwind | Same stack so frontend engineers can move freely |
| API | FastAPI on Python 3.11 | Type-checked endpoints, OpenAPI for free, async LLM calls |
| Database | Supabase Postgres | Hosted Postgres + row-level building blocks without DBA work |
| LLM | OpenAI `gpt-4o-mini` (Gemini-ready) | Cost/latency sweet spot; provider is pluggable in `ai_service.py` |
| Hosting (API) | Render | Single-region, simple `uvicorn` start command |
| Hosting (web) | Vercel | First-class Next.js support, preview deploys per branch |

### 6.2 Multi-tenant model

Every request to the operator API carries three headers:

| Header | Meaning |
|---|---|
| `x-role` | `admin` / `company` / `customer` |
| `x-tenant-id` | The cooperative / SMB the user belongs to |
| `x-user-id` | The acting profile id (for activity logs) |

Every backend query is scoped by `tenant_id` on the way out — admins are the only role that can see across tenants. Customers can additionally only see orders linked to their own `customer_id`. The storefront API is mounted under a per-tenant prefix (`/storefront/ege/...`) so the consumer surface is partitioned at the route level as well.

### 6.3 Data model

Ten core tables in [`supabase/schema.sql`](supabase/schema.sql):

| Table | Purpose |
|---|---|
| `tenants` | One row per cooperative or SMB on the platform |
| `profiles` | Platform identities — `admin` / `company` / `customer` |
| `customers` | End customers belonging to a tenant |
| `products` | Tenant catalog: name, category, stock, threshold, price |
| `orders` | Order header with status and total |
| `order_items` | Line items linking orders to products |
| `shipments` | Carrier, tracking number, status, delay flag |
| `sales_history` | Daily `units_sold` per product — feeds the forecast |
| `chat_messages` | Logged LLM conversations |
| `activity_logs` | Cross-tenant audit trail of meaningful events |

## 7. Reference deployment: Ege Zeytincilik Kooperatifi

The first live tenant is a regional olive-oil cooperative based in the Aegean.

<div align="center">

<img src="storefront-ege/src/app/icon.svg" alt="Ege Zeytincilik" width="72" height="72" />

</div>

The cooperative gets:

- A fully branded consumer storefront at [ege.koopilot.site](https://ege.koopilot.site) with its own logo, palette and product catalog.
- An always-on customer chat assistant that can answer order-status and product questions in Turkish.
- An operations workspace inside Koopilot itself for stock, orders, shipments and the AI daily brief.

The current catalog (representative Turkish 2026 retail prices):

| Product | Price |
|---|---|
| Natürel Sızma Zeytinyağı 1L | ₺350 |
| Soğuk Sıkım Erken Hasat 500ml | ₺250 |
| Organik Zeytinyağı 2L | ₺680 |
| Siyah Sele Zeytin 1kg | ₺195 |
| Çizik Yeşil Zeytin 1kg | ₺180 |
| Zeytin Ezmesi Sade 200g | ₺85 |

A second demo tenant, **Aura Candle Studio** (handmade scented candles), is included to demonstrate how the same product onboards a completely different vertical without code changes.

## 8. Repository layout

```
koopilot/
├── backend/                FastAPI services (Python 3.11)
│   └── app/
│       ├── routers/        admin / company / customer / storefront / demo
│       ├── services/       ai_service.py, forecast_service.py
│       ├── prompts/        LLM system prompts (TR + EN aware)
│       ├── auth_context.py header-based tenant/role extraction
│       ├── db.py           Supabase client factory
│       └── main.py         FastAPI app + router mounts
├── frontend/               Operator app (admin / company / customer)
│   └── src/app/            Next.js 14 App Router pages
├── storefront-ege/         Branded consumer storefront (reference tenant)
│   └── src/app/            Home, products, cart, checkout, account
├── supabase/
│   ├── schema.sql          Table definitions
│   ├── seed.sql            Demo data (Ege + Aura + 30 days of history)
│   └── migrations/         Idempotent updates applied to live DB
└── README.md
```

## 9. Running it locally

### 9.1 Database

1. Create a Supabase project.
2. In the SQL editor, run `supabase/schema.sql`, then `supabase/seed.sql`.
3. Copy the project URL and service-role key.

### 9.2 Backend

```bash
cd backend
cp .env.example .env
# Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload
```

- API: `http://localhost:8000`
- OpenAPI docs: `http://localhost:8000/docs`
- Python is pinned to **3.11.9** via [`backend/.python-version`](backend/.python-version) for deterministic builds on Render.

### 9.3 Operator web

```bash
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
npm install
npm run dev
```

- Operator app: `http://localhost:3000`

### 9.4 Consumer storefront

```bash
cd storefront-ege
# .env.local — NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
npm install
npm run dev
```

- Storefront: `http://localhost:3001` (or whichever port Next picks)

## 10. Environment variables

### Backend (`backend/.env`)

```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
OPENAI_API_KEY=<openai-key>
LLM_PROVIDER=openai
```

### Operator web (`frontend/.env.local`)

```
NEXT_PUBLIC_API_BASE_URL=<backend url>
```

### Storefront (`storefront-ege/.env.local`)

```
NEXT_PUBLIC_API_BASE_URL=<backend url>
```

`NEXT_PUBLIC_*` values are inlined into the client bundle at build time — changing them on the hosting platform requires a redeploy.

## 11. API reference

Selected endpoints. Full schema is auto-generated at `/docs` from the FastAPI app.

### Demo

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/demo-users` | Role selector for the demo home page |

### Admin

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/admin/summary` | Platform-wide metrics |
| `GET` | `/admin/tenants` | All tenants with metrics |
| `GET` | `/admin/tenants/{id}` | Per-tenant detail |
| `GET` | `/admin/activity-logs` | Cross-tenant activity feed |
| `GET/POST/PUT/DELETE` | `/admin/orders` | Cross-tenant order management |

### Company

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/company/dashboard` | Tenant dashboard data |
| `GET` | `/company/operation-summary` | AI-generated daily brief |
| `GET` | `/company/monthly-reports` | Monthly snapshots |
| `GET/POST/PUT/DELETE` | `/company/orders` | Tenant orders |
| `GET/POST/PUT/DELETE` | `/company/inventory` | Tenant catalog |
| `GET` | `/company/inventory/critical` | Below-threshold products |
| `GET` | `/company/shipments/delayed` | At-risk shipments |
| `GET` | `/company/forecast` | 7-day forecast per SKU |
| `POST` | `/company/chat` | Company assistant |

### Customer

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/customer/orders` | Customer's own orders |
| `GET` | `/customer/orders/{id}` | Order detail + shipment |
| `POST` | `/customer/chat` | Customer chatbot |

### Storefront (tenant-scoped, e.g. `/storefront/ege`)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/products` | Public catalog |
| `GET` | `/products/{id}` | Product detail |
| `POST` | `/signup`, `/login` | Customer auth |
| `GET` | `/me` | Current customer |
| `POST/GET` | `/orders`, `/orders/{id}` | Cart checkout + history |
| `GET` | `/track/{order_no}` | Public order tracking |
| `POST` | `/chat` | Storefront assistant |

## 12. Deployment

| Component | Where | How |
|---|---|---|
| API | Render | Root: `backend`. Build: `pip install -r requirements.txt`. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. |
| Operator web | Vercel | Root: `frontend`. Set `NEXT_PUBLIC_API_BASE_URL` to the Render URL. |
| Storefront | Vercel | Root: `storefront-ege`. Same env var. |
| Database | Supabase | Apply `schema.sql`, then `seed.sql`, then any `supabase/migrations/*.sql` that has not yet been applied. |

## 13. What is intentionally _not_ in the MVP

These are out of scope today, with notes on where they slot in next:

- **Real auth.** The platform currently uses a demo role selector that sends identity as request headers. A production deployment would slot Supabase Auth or Clerk into [`backend/app/auth_context.py`](backend/app/auth_context.py) without changing the API contract.
- **Heavier forecasting.** The current model is intentionally a 7-day moving average. Once a tenant accumulates a year of sales history, this swaps cleanly to a per-SKU Prophet / lightGBM job in `forecast_service.py`.
- **External integrations.** Carrier APIs, WhatsApp Business, e-mail-to-order pipelines and supplier outreach are designed for, but not wired in this build.
- **Multi-storefront templating.** Each tenant currently gets a hand-built storefront; the next step is theme + content extraction so a new cooperative can be onboarded by config.

## 14. Roadmap

1. **Channel ingestion** — pull customer messages from WhatsApp Business and e-mail into one inbox the assistant can act on.
2. **Carrier integration** — replace the manual `shipments` row with real carrier API polling and proactive delay alerts.
3. **Supplier outreach** — when forecast says "you will stock out in 4 days", draft a re-order e-mail to the producer.
4. **Storefront-as-a-service** — onboarding flow that spins up a branded `*.koopilot.shop` storefront from a config form.
5. **Per-SKU forecasting upgrade** — move from moving-average to seasonality-aware models as data accumulates.

## 15. Credits

Built by the Koopilot team. The Ege Zeytincilik storefront is included as a reference deployment with the cooperative's permission for the launch demo.
