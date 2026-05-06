# Design HQ Dashboard (Multi-Channel)

A multi-channel e-commerce dashboard. Reads everything from a single Google Sheet — no
backend, no database. Deploys to Vercel from a GitHub repo.

## What's in this v1

- **Channel registry** driven by a `channel_config` sheet tab. Each channel has a code
  (`amzsc`, `wmt3p`, etc.) and an `enabled` flag. Sidebar channel selector only shows
  enabled channels.
- **P&L module** (live) — computes Revenue, COGS, fees, advertising, taxes, personnel
  expenses, gross profit, and net profit from monthly Amazon settlement files. Output
  matches the line-item structure your team already uses in Excel.
- **Stub pages** for: Buy Box, Listing Quality, Returns, Launch Tracker, Pricing
  Parity, Channel Comparison, Promotions & Fees. Each shows exactly which Google Sheet
  tab(s) need to be populated to light up that module.
- **Settings page** showing what's loaded, which channels are enabled, and which months
  of settlement data have been discovered.
- **CSV export** on the P&L statement and the per-SKU P&L.

## Setup

### 1. Create a new GitHub repo and push this code

```bash
cd design-hq-dashboard
git init
git add .
git commit -m "Initial dashboard"
git branch -M main
git remote add origin https://github.com/<your-account>/design-hq-dashboard.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to vercel.com → New Project → Import this GitHub repo.
2. Framework preset: **Vite** (auto-detected).
3. Build command: `npm run build` (default).
4. Output directory: `dist` (default).
5. Add an environment variable (optional):
   - `VITE_SHEET_ID` = your Google Sheet ID (overrides the default in `App.jsx`)
6. Deploy.

### 3. Make sure the Google Sheet is shared

The sheet must be shared as **"Anyone with the link can view"** for the dashboard to
read it via the gviz API.

## Required Google Sheet tabs

### Always required

- **`channel_config`** — one row per channel:
  - `channel_code` (e.g. `amzsc`), `channel_name`, `enabled` (true/false), `account_label`, `currency`
- **`cogs`** — one row per SKU:
  - `sku`, `asin`, `title`, `unit_cost_landed`, `effective_date`, `notes`
- **`fixed_costs_monthly`** — recurring fixed costs:
  - `month` (`YYYY-MM` or `YYYY_MM`), `channel`, `category`, `amount`, `notes`

### For each Amazon Seller Central month

- **`amzsc_settlement_<YYYY>_<MM>`** — one tab per month. Paste the raw V2
  flat-file settlement export from Seller Central verbatim.

### For ad spend (matches the FSN dashboard convention)

- `Sponsored Products Campaigns`
- `Sponsored Brands Campaigns`
- `Sponsored Display Campaigns`

## Sheet ID

The dashboard ships pointed at the Design HQ sheet by default. Override with
the `VITE_SHEET_ID` env var in Vercel for any other client deploy.

## Logo

Drop a `logo.png` file into the `public/` folder and it'll show in the sidebar. Missing
logo is silently hidden.

## Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.
