# Koopilot

Multi-tenant AI-powered operations assistant for small businesses.

## Overview

Koopilot supports three roles in one platform:
- **Admin** — monitors all companies and platform metrics
- **Company** — manages orders, inventory, shipments, and gets AI operation summaries
- **Customer** — tracks their own orders and chats with an AI assistant

## Demo Companies

| Company | Sector |
|---|---|
| Ege Olive Oil Cooperative | Food / Olive Oil |
| Aura Candle Studio | Handmade / Scented Candles |

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python |
| Database | Supabase PostgreSQL |
| AI | OpenAI gpt-4o-mini (or Gemini) |
| Forecasting | Simple 7-day moving average |

## Project Structure

```
koopilot/
  backend/         FastAPI backend
  frontend/        Next.js frontend
  supabase/        schema.sql + seed.sql
  README.md
```

## Setup

### 1. Supabase

1. Create a new Supabase project at supabase.com
2. Run `supabase/schema.sql` in the SQL editor
3. Run `supabase/seed.sql` in the SQL editor
4. Copy your project URL and service role key

### 2. Backend

```bash
cd backend
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs on `http://localhost:8000`

API docs: `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## Environment Variables

### Backend `.env`

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key
LLM_PROVIDER=openai
```

### Frontend `.env.local`

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Demo Flow

1. Open `http://localhost:3000`
2. Select a demo role card
3. **Admin**: see platform-wide metrics and activity logs
4. **Company**: view dashboard, click "Generate" for AI summary, explore forecast, use AI chat
5. **Customer**: view orders, expand for shipment details, ask the chatbot

## API Reference

| Endpoint | Description |
|---|---|
| `GET /demo-users` | Demo user list for role selector |
| `GET /admin/summary` | Platform metrics |
| `GET /admin/tenants` | All companies with metrics |
| `GET /admin/activity-logs` | Recent activity |
| `GET /company/dashboard` | Company dashboard data |
| `GET /company/operation-summary` | AI-generated daily summary |
| `GET /company/orders` | Company orders |
| `GET /company/inventory` | All products |
| `GET /company/inventory/critical` | Critical stock products |
| `GET /company/shipments/delayed` | Delayed shipments |
| `GET /company/forecast` | 7-day sales forecast |
| `POST /company/chat` | Company AI assistant |
| `GET /customer/orders` | Customer's own orders |
| `GET /customer/orders/{id}` | Order detail with shipment |
| `POST /customer/chat` | Customer chatbot |

## Architecture

```
Browser (Next.js)
    |  x-role / x-tenant-id / x-user-id headers
    v
FastAPI (Python)
    |  tenant-based filtering on every query
    v
Supabase PostgreSQL
    |
    v
OpenAI API (gpt-4o-mini)
```

## Key Design Decisions

- **No auth for MVP**: demo role selector sends context as headers
- **Tenant isolation**: every backend query filters by `tenant_id` from the header
- **AI grounding**: LLM only receives database-fetched data as context — no hallucinated facts
- **7-day moving average**: simple forecast, explainable and fast
