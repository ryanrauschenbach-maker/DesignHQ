import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Bell,
  Boxes,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  DollarSign,
  Download,
  FileText,
  Globe,
  Megaphone,
  Package,
  Percent,
  Receipt,
  RefreshCw,
  Rocket,
  Search,
  Settings as SettingsIcon,
  ShieldMinus,
  ShoppingBag,
  Tag,
  Tags,
  Target,
  TrendingUp,
  Wallet,
  Warehouse,
  Zap,
} from "lucide-react";

// =============================================================================
// CONSTANTS
// =============================================================================

const SHEET_ID =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SHEET_ID) ||
  "1qyG6ME0NxHBukxm--Kl3orRcwl3MBHSNWk2wEoPj9dI";

const LOGO_URL = "/logo.png";
const BRAND_NAME = "Design Headquarters";

const TAB_NAMES = {
  channelConfig: "channel_config",
  cogs: "cogs",
  fixedCostsMonthly: "fixed_costs_monthly",
  adsMonthly: "ads_monthly",
  itemRef: "item_data_reference",
  spCampaigns: "Sponsored Products Campaigns",
  sbCampaigns: "Sponsored Brands Campaigns",
  sdCampaigns: "Sponsored Display Campaigns",
  spSearchTerms: "SP Search Term Report",
  sbSearchTerms: "SB Search Term Report",
  inventoryFba: "inventory_fba",
  inventoryAwd: "inventory_awd",
  products30d: "products_30d",
  salesMonthly: "sales_monthly",
  fbmOnly: "FBM_only",
  spCampaigns7: "Sponsored Products Campaigns_7",
  sbCampaigns7: "Sponsored Brands Campaigns_7",
  sdCampaigns7: "Sponsored Display Campaigns_7",
  spCampaigns60: "Sponsored Products Campaigns_60",
  sbCampaigns60: "Sponsored Brands Campaigns_60",
  sdCampaigns60: "Sponsored Display Campaigns_60",
  // Walmart Connect bulk reports — three accounts × three windows + search terms
  wmt1pCampaigns7: "wmt1p_campaigns_7",
  wmt1pCampaigns30: "wmt1p_campaigns_30",
  wmt1pCampaigns60: "wmt1p_campaigns_60",
  wmt3pCampaigns7: "wmt3p_campaigns_7",
  wmt3pCampaigns30: "wmt3p_campaigns_30",
  wmt3pCampaigns60: "wmt3p_campaigns_60",
  wmtotherCampaigns7: "wmtother_campaigns_7",
  wmtotherCampaigns30: "wmtother_campaigns_30",
  wmtotherCampaigns60: "wmtother_campaigns_60",
  wmt1pSearchTerms: "wmt1p_search_terms",
  wmt1pSellthrough: "wmt1p_sellthrough",
  wmt3pSearchTerms: "wmt3p_search_terms",
  wmtotherSearchTerms: "wmtother_search_terms",
  // amzsc traffic exports — Detail Page Sales and Traffic by Child Item
  amzscTrafficPrefix: "amzsc_traffic_",
};

const SETTLEMENT_LOOKBACK_MONTHS = 18;

const DEFAULT_CHANNELS = [
  { code: "amzsc", name: "Amazon Seller Central", enabled: true },
  { code: "amzvc", name: "Amazon Vendor Central", enabled: false },
  { code: "wmt1p", name: "Walmart 1P", enabled: false },
  { code: "wmt3p", name: "Walmart Marketplace", enabled: false },
  { code: "wmtother", name: "Walmart Other", enabled: false },
  { code: "tgtdsv", name: "Target DSV", enabled: false },
  { code: "tgt3p", name: "Target Marketplace", enabled: false },
  { code: "macys", name: "Macy's Marketplace", enabled: false },
  { code: "wayfair", name: "Wayfair", enabled: false },
  { code: "ebay", name: "eBay", enabled: false },
  { code: "lowes", name: "Lowe's", enabled: false },
  { code: "homedepot", name: "Home Depot", enabled: false },
  { code: "kohls", name: "Kohl's", enabled: false },
  { code: "bestbuy", name: "Best Buy", enabled: false },
  { code: "mercadolibre", name: "Mercado Libre", enabled: false },
  { code: "shopify", name: "Shopify", enabled: false },
  { code: "tiktok", name: "TikTok Shop", enabled: false },
  { code: "temu", name: "Temu", enabled: false },
];

// Campaign Trends categorization thresholds
const CAMPAIGN_TARGET_ROAS = 3.0;
const CAMPAIGN_HIDDEN_GEM_ROAS = 4.0;
const CAMPAIGN_BLEEDING_SPEND = 50;
const CAMPAIGN_MIN_TREND_SPEND = 5;
const NEGATIVE_CLICK_THRESHOLD = 12;
const DAYS_TO_SHIP_TARGET = 60;
const DAYS_URGENT = 14;

// Alert thresholds
const ALERT_CVR_DROP_THRESHOLD = 20; // percent
const ALERT_AD_SPEND_THRESHOLD = 50; // dollars
const ALERT_INVENTORY_DAYS = 14;
const ALERT_RETURN_RATE_HIGH = 15; // percent
const ALERT_RETURN_RATE_NORMAL = 8; // percent

const PNL_LINE_ITEMS = [
  { id: "section_revenue", section: true, label: "Revenue" },
  { id: "sales", label: "Sales" },
  { id: "shipping_promo", label: "Shipping & Promotional Rebates" },
  { id: "gift_wraps", label: "Gift Wraps" },
  { id: "refunds", label: "Refunds" },
  { id: "reimbursements", label: "Reimbursements" },
  { id: "liquidation", label: "Liquidation" },
  { id: "net_revenue", label: "Net Revenue", emphasize: true, isTotal: true },
  { id: "section_cogs", section: true, label: "Cost of Goods" },
  { id: "cogs", label: "Cost of Goods" },
  { id: "total_cogs", label: "Total Cost of Goods Sold", emphasize: true, isTotal: true },
  { id: "section_general", section: true, label: "General Expenses" },
  { id: "amazon_commissions", label: "Amazon Product Commissions" },
  { id: "outbound_fba", label: "Outbound Shipping FBA" },
  { id: "advertising", label: "Amazon Advertising" },
  { id: "sales_tax_service_fee", label: "Sales Tax Service Fee" },
  { id: "inbound_shipping_fee", label: "Inbound Shipping Fee" },
  { id: "awd_fees", label: "AWD Transportation & Storage Fee" },
  { id: "fba_storage_fees", label: "FBA Storage Fees" },
  { id: "fba_inventory_fees", label: "FBA Inventory Fees" },
  { id: "fba_removal_fees", label: "FBA Removal Fees" },
  { id: "fba_customer_return_fees", label: "FBA Customer Return Fees" },
  { id: "premium_services_fee", label: "Premium Services Fee" },
  { id: "subscription_fee", label: "Amazon Subscription Fee" },
  { id: "vine_enrollment_fee", label: "Amazon Vine Enrollment Fee" },
  { id: "other_fba_fees", label: "Other FBA Fees" },
  { id: "total_general", label: "Total General Expenses", emphasize: true, isTotal: true },
  // Vendor Central deductions — populated from amzsc/amzvc settlement rows
  // tagged type=Adjustment with descriptions matching MDF / Chargebacks / etc.
  // Show $0 when no VC scope is active; live numbers when amzvc settlement
  // contains adjustment rows for those categories.
  { id: "section_vc_deductions", section: true, label: "Vendor Central Deductions" },
  { id: "vc_mdf", label: "MDF (Marketing Development Funds)" },
  { id: "vc_chargebacks", label: "Chargebacks" },
  { id: "vc_coop", label: "Co-op Contributions" },
  { id: "vc_shortages", label: "Shortages / Damage Claims" },
  { id: "vc_other_deductions", label: "Other VC Deductions" },
  { id: "total_vc_deductions", label: "Total VC Deductions", emphasize: true, isTotal: true },
  { id: "section_tax", section: true, label: "Sales Tax" },
  { id: "sales_tax_collected", label: "Sales Tax Collected" },
  { id: "marketplace_withheld_tax", label: "Marketplace Withheld Tax" },
  { id: "net_sales_tax", label: "Net Sales Tax", emphasize: true, isTotal: true },
  { id: "section_personnel", section: true, label: "Personnel & Other" },
  { id: "personnel", label: "Personnel Expenses" },
  { id: "section_bottom", section: true, label: "Bottom Line" },
  { id: "gross_profit", label: "Gross Profit", emphasize: true, isTotal: true },
  { id: "gross_margin", label: "Gross Margin", isPct: true },
  { id: "net_profit", label: "Net Profit", emphasize: true, isTotal: true },
  { id: "net_margin", label: "Net Margin", isPct: true },
];

const CAMPAIGN_CATEGORIES = [
  { id: "all", label: "All Campaigns", tone: "slate", action: "" },
  { id: "improving", label: "Improving", tone: "emerald", action: "Raise bids 10–20%" },
  { id: "declining", label: "Declining", tone: "rose", action: "Lower bids 10–20%" },
  { id: "bleeding", label: "Bleeding", tone: "amber", action: "Pause or add negatives" },
  { id: "hidden_gem", label: "Hidden Gem", tone: "cyan", action: "Raise daily budget" },
  { id: "monitor", label: "Monitor", tone: "slate", action: "No action — keep watching" },
];

const CATEGORY_TONE_CLASSES = {
  slate: "border-slate-700 bg-slate-900 text-slate-300",
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  rose: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  cyan: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
};

// =============================================================================
// SHEET HELPERS
// =============================================================================

function getSheetUrl(tabName, query = "select *") {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(
    tabName
  )}&headers=1&tq=${encodeURIComponent(query)}`;
}

function parseGviz(text) {
  const start = text.indexOf("(");
  const end = text.lastIndexOf(")");
  const json = JSON.parse(text.slice(start + 1, end));
  const cols = json.table.cols.map((c, i) => c.label || c.id || `col_${i}`);
  return json.table.rows.map((row) => {
    const out = {};
    cols.forEach((col, i) => {
      out[col] = row.c?.[i]?.v ?? null;
    });
    return out;
  });
}

async function fetchSheet(tabName) {
  try {
    const res = await fetch(getSheetUrl(tabName));
    if (!res.ok) return [];
    const text = await res.text();
    const rows = parseGviz(text);
    // gviz quirk: requesting a tab that doesn't exist silently returns gid 0
    // (channel_config). Treat that as "tab missing" for any other tab name, so
    // phantom tabs (e.g. amzsc_buybox_* months that were never created) don't
    // register as loaded data.
    if (
      tabName !== TAB_NAMES.channelConfig &&
      rows.length > 0 &&
      rows[0] &&
      Object.prototype.hasOwnProperty.call(rows[0], "channel_code")
    ) {
      return [];
    }
    return rows;
  } catch {
    return [];
  }
}

async function fetchSettlementSheet(tabName) {
  const HEADER_HINTS = [
    "date/time",
    "settlement id",
    "product sales",
    "selling fees",
    "fba fees",
    "order id",
    "(child) asin",
    "child asin",
    "sessions",
    "ordered product sales",
  ];
  // Hints that confirm a row of fetchSheet output looks like settlement/traffic data.
  // If at least 2 of these keys are present in the first row, we know fetchSheet's
  // headers=1 path correctly parsed the sheet. Otherwise we fall back to manual
  // preamble-skipping detection (Amazon's stock export has 9 preamble rows).
  const EXPECTED_KEYS = [
    "type", "Type",
    "sku", "SKU",
    "quantity", "Quantity",
    "product sales", "Product Sales",
    "selling fees", "Selling Fees",
    "fba fees", "FBA Fees",
    "(Child) ASIN", "Child ASIN", "(Parent) ASIN",
    "Sessions - Total", "Sessions",
    "Ordered Product Sales",
  ];

  // Path 1: standard fetchSheet (headers=1) — works when the sheet has its
  // real header in row 1 (no preamble). This is the case when a user pastes
  // CSV-cleaned data directly into the tab.
  try {
    const standardRows = await fetchSheet(tabName);
    if (standardRows && standardRows.length > 0) {
      const first = standardRows[0] || {};
      const matches = EXPECTED_KEYS.filter((k) => first[k] !== undefined).length;
      if (matches >= 2) return standardRows;
    }
  } catch {
    // fall through to manual detection
  }

  // Path 2: manual detection — handles Amazon's standard export (9-row preamble
  // before the real header).
  const baseUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(tabName)}`;
  try {
    const res = await fetch(`${baseUrl}&headers=0&tq=${encodeURIComponent("select *")}`);
    if (!res.ok) return [];
    const text = await res.text();
    const start = text.indexOf("(");
    const end = text.lastIndexOf(")");
    if (start < 0 || end < 0) return [];
    const json = JSON.parse(text.slice(start + 1, end));
    const allRows = (json.table?.rows || []).map(
      (r) => (r.c || []).map((cell) => (cell ? cell.v : null))
    );
    if (allRows.length === 0) return [];

    let headerIdx = -1;
    for (let i = 0; i < Math.min(20, allRows.length); i++) {
      const cells = (allRows[i] || []).map((v) => String(v ?? "").toLowerCase().trim());
      const matches = HEADER_HINTS.filter((hint) => cells.some((c) => c === hint || c.includes(hint))).length;
      if (matches >= 2) {
        headerIdx = i;
        break;
      }
    }
    if (headerIdx >= 0) {
      const headers = (allRows[headerIdx] || []).map((v) => String(v ?? "").trim());
      const dataRows = allRows.slice(headerIdx + 1).map((row) => {
        const obj = {};
        headers.forEach((h, i) => {
          if (h) obj[h] = row[i] ?? null;
        });
        return obj;
      });
      if (dataRows.length > 0) return dataRows;
    }
    return [];
  } catch {
    return [];
  }
}

// =============================================================================
// SMALL HELPERS
// =============================================================================

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function pick(obj, keys, fallback = null) {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") return obj[key];
    for (const k of Object.keys(obj)) {
      if (k.toLowerCase() === key.toLowerCase() && obj[k] !== null && obj[k] !== "") {
        return obj[k];
      }
    }
  }
  return fallback;
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return value;
  return Number(String(value).replace(/[$,%\s,]/g, "")) || 0;
}

// Short alias used by ported FSN modules / new pages.
const num = normalizeNumber;

function normalizeText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function currencyDetailed(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function numberFmt(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function pct(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function exportRowsToCsv(filename, rows, columns) {
  if (typeof window === "undefined") return;
  const headers = columns.map((c) => csvEscape(c.label)).join(",");
  const body = (rows || [])
    .map((row) =>
      columns
        .map((col) => csvEscape(col.accessor ? col.accessor(row) : row[col.key]))
        .join(",")
    )
    .join("\n");
  const blob = new Blob(["﻿", `${headers}\n${body}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// =============================================================================
// PERIOD HELPERS
// =============================================================================

function pad2(n) {
  return String(n).padStart(2, "0");
}

function ymToLabel(ym) {
  if (!ym) return "—";
  const [y, m] = ym.split("_");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function ymToShort(ym) {
  if (!ym) return "—";
  const [y, m] = ym.split("_");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function generateTrailingMonthCodes(monthsBack = SETTLEMENT_LOOKBACK_MONTHS) {
  const out = [];
  const now = new Date();
  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getFullYear()}_${pad2(d.getMonth() + 1)}`);
  }
  return out;
}

// =============================================================================
// SETTLEMENT & PARSERS
// =============================================================================

const FEE_RULES = [
  [/\bsubscription\b/, "subscription_fee"],
  [/long.term storage/, "fba_storage_fees"],
  [/\bstorage fee\b/, "fba_storage_fees"],
  [/inbound (transport|placement|shipping)/, "inbound_shipping_fee"],
  [/inbound services/, "inbound_shipping_fee"],
  [/awd /, "awd_fees"],
  [/sales tax service/, "sales_tax_service_fee"],
  [/inventory reimbursement/, "reimbursements"],
  [/\bvine\b/, "vine_enrollment_fee"],
  [/\bpremium\b/, "premium_services_fee"],
  [/disposal/, "fba_removal_fees"],
  [/removal/, "fba_removal_fees"],
  [/customer return/, "fba_customer_return_fees"],
  [/inventory placement/, "fba_inventory_fees"],
  [/liquidation/, "liquidation"],
  // Vendor Central deductions — these only apply when the row's channel is
  // amzvc (gated downstream in computePnLForPeriod). Patterns kept tight to
  // avoid accidental matches on Seller Central adjustment descriptions like
  // "FBA Inventory Reimbursement - Damaged:Warehouse".
  [/\bmdf\b|marketing development fund/, "vc_mdf"],
  [/\bcharge.?back/, "vc_chargebacks"],
  [/\bco.?op contribution|\bcooperative contribution/, "vc_coop"],
  [/\bpo damages?\b|\bvendor damages?\b|\bshort ship|\bshortage claim/, "vc_shortages"],
  [/\bprice protection|\bprice claim|\bterms of co-?op|\btoc deduction/, "vc_other_deductions"],
  [/\bvendor deduction|\bvc deduction|\bvendor adjustment/, "vc_other_deductions"],
];

function categorizeAdjustment(description) {
  const d = (description || "").toLowerCase();
  for (const [re, cat] of FEE_RULES) {
    if (re.test(d)) return cat;
  }
  return "other_fba_fees";
}

function parseSettlementSheet(rows, ym) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  return rows.map((r) => {
    const description = normalizeText(pick(r, ["description", "Description", "Product name", "product name"], ""));
    const sku = normalizeText(pick(r, ["sku", "SKU", "Merchant SKU", "Vendor SKU", "External ID"], ""));
    const asin = normalizeText(pick(r, ["asin", "ASIN", "(Child) ASIN", "Child ASIN"], ""));
    // VC PO exports use "Accepted quantity"; Walmart/etc. may use "units"
    const quantity = normalizeNumber(pick(r, ["quantity", "Quantity", "Accepted quantity", "Received quantity", "Confirmed Units", "units", "Units"], 0));
    // VC PO exports use "Total accepted cost" (Cost × Qty) as the revenue line
    const productSales = normalizeNumber(pick(r, ["product sales", "Product Sales", "Total accepted cost", "Total received cost", "Net Receipts", "Net Shipped GMS"], 0));
    // Type defaults to "order" when no explicit type column is present AND
    // there's a positive revenue (handles VC PO sheets which have no type col).
    const rawType = pick(r, ["type", "Type"], null);
    const type = rawType
      ? normalizeText(rawType).toLowerCase()
      : (productSales > 0 || quantity > 0 ? "order" : "");
    const productSalesTax = normalizeNumber(pick(r, ["product sales tax", "Product Sales Tax"], 0));
    const shippingCredits = normalizeNumber(pick(r, ["shipping credits", "Shipping Credits"], 0));
    const giftWrapCredits = normalizeNumber(pick(r, ["gift wrap credits", "Gift Wrap Credits"], 0));
    const promoRebates = normalizeNumber(pick(r, ["promotional rebates", "Promotional Rebates"], 0));
    const marketplaceWithheld = normalizeNumber(pick(r, ["marketplace withheld tax", "Marketplace Withheld Tax"], 0));
    const sellingFees = normalizeNumber(pick(r, ["selling fees", "Selling Fees"], 0));
    const fbaFees = normalizeNumber(pick(r, ["fba fees", "FBA Fees"], 0));
    const otherTransactionFees = normalizeNumber(pick(r, ["other transaction fees", "Other Transaction Fees"], 0));
    const other = normalizeNumber(pick(r, ["other", "Other"], 0));
    const total = normalizeNumber(pick(r, ["total", "Total"], 0));
    const reportedUnitCost = normalizeNumber(pick(r, ["Unit Cost", "unit cost"], 0));
    return {
      ym,
      type,
      description,
      sku,
      asin,
      quantity,
      productSales,
      productSalesTax,
      shippingCredits,
      giftWrapCredits,
      promoRebates,
      marketplaceWithheld,
      sellingFees,
      fbaFees,
      otherTransactionFees,
      other,
      total,
      reportedUnitCost,
      adjustmentCategory: type === "adjustment" ? categorizeAdjustment(description) : null,
    };
  });
}

function parseCogs(rows) {
  const map = new Map();
  for (const r of rows || []) {
    const sku = normalizeText(pick(r, ["sku", "SKU", "Sku"]));
    if (!sku) continue;
    const asin = normalizeText(pick(r, ["asin", "ASIN", "Asin"], ""));
    const title = normalizeText(pick(r, ["title", "Title", "TITLE", "description"], ""));
    const cost =
      normalizeNumber(pick(r, ["unit_cost_landed", "landed_cost", "Landed Cost"], 0)) ||
      normalizeNumber(pick(r, ["PRODUCT COST", "product cost"], 0)) +
        normalizeNumber(pick(r, ["SHIPPING COST", "shipping cost"], 0));
    const effectiveDate = normalizeText(pick(r, ["effective_date", "Effective Date", "DATE START"], ""));
    const existing = map.get(sku);
    if (!existing || (effectiveDate && effectiveDate > (existing.effectiveDate || ""))) {
      map.set(sku, { sku, asin, title, cost, effectiveDate });
    }
  }
  return map;
}

function parseFixedCostsMonthly(rows) {
  return (rows || []).map((r) => {
    let month = normalizeText(pick(r, ["month", "Month", "ym", "YM"], ""));
    month = month.replace("-", "_");
    return {
      ym: month,
      channel: normalizeText(pick(r, ["channel", "Channel"], "")),
      category: normalizeText(pick(r, ["category", "Category"], "")),
      amount: normalizeNumber(pick(r, ["amount", "Amount"], 0)),
      notes: normalizeText(pick(r, ["notes", "Notes"], "")),
    };
  });
}

function parseChannelConfig(rows) {
  const map = new Map();
  for (const c of DEFAULT_CHANNELS) {
    map.set(c.code, { ...c, accountLabel: "", currency: "USD" });
  }
  for (const r of rows || []) {
    const code = normalizeText(pick(r, ["channel_code", "code", "Channel Code"])).toLowerCase();
    if (!code) continue;
    const enabledRaw = normalizeText(pick(r, ["enabled", "Enabled"], "")).toLowerCase();
    const enabled = enabledRaw === "true" || enabledRaw === "yes" || enabledRaw === "1";
    const existing = map.get(code) || { code, name: code, enabled: false };
    map.set(code, {
      ...existing,
      name: normalizeText(pick(r, ["channel_name", "name", "Channel Name"], existing.name)),
      enabled,
      accountLabel: normalizeText(pick(r, ["account_label", "Account Label"], "")),
      currency: normalizeText(pick(r, ["currency", "Currency"], "USD")),
    });
  }
  return [...map.values()];
}

function sumAdSpendFromCampaigns(spRows, sbRows, sdRows) {
  let total = 0;
  for (const sheet of [spRows, sbRows, sdRows]) {
    for (const row of sheet || []) {
      const entity = normalizeText(pick(row, ["Entity", "entity"], "")).toLowerCase();
      if (entity !== "campaign") continue;
      total += normalizeNumber(pick(row, ["Spend", "Spend(USD)", "Cost"], 0));
    }
  }
  return total;
}

// =============================================================================
// P&L COMPUTATION
// =============================================================================

function emptyPnL() {
  const o = {};
  for (const item of PNL_LINE_ITEMS) {
    if (!item.section) o[item.id] = 0;
  }
  return o;
}

// Resolve a cogs entry by SKU first, then by ASIN as a fallback. Lets us
// match Vendor Central / Walmart rows that only have ASIN, not internal SKU.
function lookupCogs(cogsMap, cogsByAsin, sku, asin) {
  if (sku && cogsMap && cogsMap.get) {
    const bySku = cogsMap.get(sku);
    if (bySku) return bySku;
  }
  if (asin && cogsByAsin && cogsByAsin.get) {
    return cogsByAsin.get(String(asin).trim().toUpperCase()) || null;
  }
  return null;
}

function computePnLForPeriod(settlementRows, cogsMap, fixedCostsRows, adSpendForPeriod, ym, cogsByAsin, agreementsByChannel) {
  const p = emptyPnL();
  // Track per-channel revenue so agreements (percent deductions) can be applied
  // to the correct channel's revenue, not lumped Combined revenue.
  const salesByChannel = {};
  const addChannelSales = (channel, amt) => {
    if (!channel) return;
    salesByChannel[channel] = (salesByChannel[channel] || 0) + amt;
  };
  // Per-agreement deduction $ amounts, keyed by agreement name, so the P&L can
  // render each as a distinct line item in the VC Deductions section.
  p.agreement_deductions = {};
  for (const r of settlementRows) {
    if (r.ym !== ym) continue;
    if (r.type === "order") {
      p.sales += r.productSales;
      addChannelSales(r.channel, r.productSales);
      p.shipping_promo += r.shippingCredits + r.promoRebates;
      p.gift_wraps += r.giftWrapCredits;
      p.amazon_commissions += r.sellingFees;
      p.outbound_fba += r.fbaFees;
      p.sales_tax_collected += r.productSalesTax;
      p.marketplace_withheld_tax += r.marketplaceWithheld;
      const cogsEntry = lookupCogs(cogsMap, cogsByAsin, r.sku, r.asin);
      const unitCost = cogsEntry ? cogsEntry.cost : r.reportedUnitCost;
      p.cogs += -1 * Math.abs(unitCost) * Math.abs(r.quantity);
    } else if (r.type === "refund") {
      p.refunds += r.productSales;
      p.amazon_commissions += r.sellingFees;
      p.outbound_fba += r.fbaFees;
      p.sales_tax_collected += r.productSalesTax;
      p.marketplace_withheld_tax += r.marketplaceWithheld;
      const cogsEntry = lookupCogs(cogsMap, cogsByAsin, r.sku, r.asin);
      const unitCost = cogsEntry ? cogsEntry.cost : r.reportedUnitCost;
      p.cogs += Math.abs(unitCost) * Math.abs(r.quantity);
    } else if (r.type === "adjustment") {
      const cat = r.adjustmentCategory;
      // Channel-gate VC line items: a row tagged amzsc can never route to a
      // vc_* bucket (was causing cross-channel pollution). Non-VC rows that
      // happen to match a VC regex spill into other_fba_fees instead.
      const isVcCat = cat && cat.startsWith("vc_");
      if (isVcCat && r.channel !== "amzvc") {
        p.other_fba_fees += r.total;
      } else if (cat && p[cat] !== undefined) {
        p[cat] += r.total;
      } else if (cat) {
        p.other_fba_fees += r.total;
      }
    } else if (r.type === "service fee" || r.type === "service_fee") {
      const cat = categorizeAdjustment(r.description);
      const isVcCat = cat && cat.startsWith("vc_");
      if (isVcCat && r.channel !== "amzvc") {
        p.other_fba_fees += r.total;
      } else if (p[cat] !== undefined) {
        p[cat] += r.total;
      } else {
        p.other_fba_fees += r.total;
      }
    } else if (r.type === "order_retrocharge") {
      p.amazon_commissions += r.sellingFees;
      p.sales_tax_collected += r.productSalesTax;
    }
  }

  for (const fc of fixedCostsRows || []) {
    if (fc.ym !== ym) continue;
    p.personnel += -1 * Math.abs(fc.amount);
  }

  p.advertising += -1 * Math.abs(adSpendForPeriod || 0);

  // Apply per-channel agreement deductions (e.g., amzvc_agreements rows like
  // ["Freight Allowance", 0.03] become a 3%-of-VC-revenue deduction line).
  // Wrapped defensively — any unexpected data shape leaves deductions at $0
  // rather than crashing the entire P&L render.
  try {
    if (false && agreementsByChannel && typeof agreementsByChannel === "object") {
      for (const channel of Object.keys(agreementsByChannel)) {
        const channelSales = salesByChannel[channel] || 0;
        if (!channelSales || channelSales <= 0) continue;
        const agreements = agreementsByChannel[channel];
        if (!Array.isArray(agreements)) continue;
        for (const ag of agreements) {
          if (!ag || typeof ag.rate !== "number" || !ag.name) continue;
          const amt = -1 * Math.abs(ag.rate * channelSales);
          p.agreement_deductions[ag.name] = (p.agreement_deductions[ag.name] || 0) + amt;
          const nameLower = String(ag.name).toLowerCase();
          if (/\bmdf\b|marketing development/.test(nameLower)) p.vc_mdf += amt;
          else if (/charge.?back/.test(nameLower)) p.vc_chargebacks += amt;
          else if (/\bco.?op\b|cooperative/.test(nameLower)) p.vc_coop += amt;
          else if (/shortage|damage/.test(nameLower)) p.vc_shortages += amt;
          else p.vc_other_deductions += amt;
        }
      }
    }
  } catch (e) {
    // Swallow — agreements failure should never break the P&L
  }

  p.net_revenue = p.sales + p.shipping_promo + p.gift_wraps + p.refunds + p.reimbursements + p.liquidation;
  p.total_cogs = p.cogs;
  p.total_general =
    p.amazon_commissions +
    p.outbound_fba +
    p.advertising +
    p.sales_tax_service_fee +
    p.inbound_shipping_fee +
    p.awd_fees +
    p.fba_storage_fees +
    p.fba_inventory_fees +
    p.fba_removal_fees +
    p.fba_customer_return_fees +
    p.premium_services_fee +
    p.subscription_fee +
    p.vine_enrollment_fee +
    p.other_fba_fees;
  p.total_vc_deductions =
    p.vc_mdf +
    p.vc_chargebacks +
    p.vc_coop +
    p.vc_shortages +
    p.vc_other_deductions;
  p.net_sales_tax = p.sales_tax_collected + p.marketplace_withheld_tax;
  // VC deductions are negative dollars (adjustments) so they're additive here
  p.gross_profit = p.net_revenue + p.total_cogs + p.total_general + p.total_vc_deductions;
  p.gross_margin = p.net_revenue ? (p.gross_profit / p.net_revenue) * 100 : 0;
  p.net_profit = p.gross_profit + p.net_sales_tax + p.personnel;
  p.net_margin = p.net_revenue ? (p.net_profit / p.net_revenue) * 100 : 0;
  return p;
}

function computePnLByAsin(settlementRows, cogsMap, ym, cogsByAsin) {
  const map = new Map();
  for (const r of settlementRows) {
    if (r.ym !== ym) continue;
    if (r.type !== "order" && r.type !== "refund") continue;
    const sku = r.sku || "(no sku)";
    const cogsEntry = lookupCogs(cogsMap, cogsByAsin, r.sku, r.asin);
    const asin = (cogsEntry && cogsEntry.asin) || r.asin || "";
    const title = (cogsEntry && cogsEntry.title) || r.description || "";
    const unitCost = cogsEntry ? cogsEntry.cost : r.reportedUnitCost;
    const cur = map.get(sku) || {
      sku,
      asin,
      title,
      units: 0,
      revenue: 0,
      refunds: 0,
      sellingFees: 0,
      fbaFees: 0,
      cogs: 0,
    };
    if (r.type === "order") {
      cur.units += r.quantity;
      cur.revenue += r.productSales;
      cur.sellingFees += r.sellingFees;
      cur.fbaFees += r.fbaFees;
      cur.cogs += -1 * Math.abs(unitCost) * Math.abs(r.quantity);
    } else if (r.type === "refund") {
      cur.refunds += r.productSales;
      cur.units -= Math.abs(r.quantity);
      cur.sellingFees += r.sellingFees;
      cur.fbaFees += r.fbaFees;
      cur.cogs += Math.abs(unitCost) * Math.abs(r.quantity);
    }
    map.set(sku, cur);
  }
  return [...map.values()].map((row) => {
    const netRevenue = row.revenue + row.refunds;
    const contribution = netRevenue + row.sellingFees + row.fbaFees + row.cogs;
    return {
      ...row,
      netRevenue,
      contribution,
      margin: netRevenue ? (contribution / netRevenue) * 100 : 0,
    };
  });
}

// =============================================================================
// SORT HOOK + TABLE
// =============================================================================

function useSortableRows(rows, defaultConfig) {
  const [sortConfig, setSortConfig] = useState(defaultConfig || null);
  const handleSort = (key, type, accessor) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { ...prev, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, type, accessor, direction: "desc" };
    });
  };
  const sortedRows = useMemo(() => {
    if (!sortConfig?.key) return rows;
    const { key, direction, type = "text", accessor } = sortConfig;
    const dir = direction === "desc" ? -1 : 1;
    return [...rows].sort((a, b) => {
      const av = accessor ? accessor(a) : a[key];
      const bv = accessor ? accessor(b) : b[key];
      if (type === "number") {
        return (normalizeNumber(av) - normalizeNumber(bv)) * dir;
      }
      return (
        String(av ?? "").localeCompare(String(bv ?? ""), undefined, {
          numeric: true,
          sensitivity: "base",
        }) * dir
      );
    });
  }, [rows, sortConfig]);
  return { sortedRows, sortConfig, handleSort };
}

function SortableTable({ columns, rows, rowKey, sortConfig, onSort }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800 text-sm">
        <thead className="bg-slate-900/60">
          <tr>
            {columns.map((col) => {
              const isActive = sortConfig?.key === col.key;
              const dir = isActive ? sortConfig.direction : null;
              return (
                <th
                  key={col.key}
                  onClick={() =>
                    onSort && onSort(col.key, col.type, col.sortAccessor)
                  }
                  className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-cyan-300"
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.label}
                    {dir === "asc" ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : dir === "desc" ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronsUpDown className="h-3.5 w-3.5 text-slate-600" />
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900">
          {rows.map((row, i) => {
            const key =
              typeof rowKey === "function" ? rowKey(row) : row[rowKey] || `row-${i}`;
            return (
              <tr key={key} className="hover:bg-slate-900/40">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 align-middle text-slate-200">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// UI PRIMITIVES
// =============================================================================

function SidebarButton({ active, icon: Icon, label, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-sm transition",
        active
          ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
          : "border-transparent text-slate-300 hover:border-slate-800 hover:bg-slate-900"
      )}
    >
      <span className="inline-flex items-center gap-3">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      {badge ? (
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function SectionCard({ title, subtitle, children, right }) {
  return (
    <div className="min-w-0 rounded-3xl border border-slate-800 bg-slate-950 p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function CountCard({ label, value, icon: Icon, tone = "cyan" }) {
  const toneRing = {
    cyan: "border-cyan-500/30 bg-cyan-500/5 text-cyan-300",
    emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300",
    amber: "border-amber-500/30 bg-amber-500/5 text-amber-300",
    rose: "border-rose-500/30 bg-rose-500/5 text-rose-300",
    slate: "border-slate-700 bg-slate-900 text-slate-300",
  }[tone];
  return (
    <div className={cn("rounded-2xl border p-4", toneRing)}>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
        {Icon ? <Icon className="h-4 w-4" /> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">{numberFmt(value)}</p>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone = "cyan", suffix }) {
  const toneRing = {
    cyan: "border-cyan-500/30 bg-cyan-500/5 text-cyan-300",
    emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300",
    amber: "border-amber-500/30 bg-amber-500/5 text-amber-300",
    rose: "border-rose-500/30 bg-rose-500/5 text-rose-300",
    slate: "border-slate-700 bg-slate-900 text-slate-300",
  }[tone];
  const display =
    typeof value === "string"
      ? value
      : suffix === "%" ? pct(value) : suffix === "count" ? numberFmt(value) : currency(value);
  return (
    <div className={cn("rounded-2xl border p-4", toneRing)}>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
        {Icon ? <Icon className="h-4 w-4" /> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">{display}</p>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-wider text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
      >
        {options.map((opt) => (
          <option key={typeof opt === "string" ? opt : opt.value} value={typeof opt === "string" ? opt : opt.value}>
            {typeof opt === "string" ? opt : opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TogglePills({ value, onChange, options }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const optValue = typeof opt === "string" ? opt : opt.value;
        const optLabel = typeof opt === "string" ? opt : opt.label;
        return (
          <button
            key={optValue}
            onClick={() => onChange(optValue)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition",
              value === optValue
                ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                : "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
            )}
          >
            {optLabel}
          </button>
        );
      })}
    </div>
  );
}

function ExportButton({ filename, rows, columns, label = "Export" }) {
  const disabled = !rows || rows.length === 0;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => exportRowsToCsv(filename, rows, columns)}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition",
        disabled
          ? "cursor-not-allowed border-slate-800 bg-slate-900 text-slate-500"
          : "border-slate-700 bg-slate-900 text-slate-200 hover:border-cyan-400 hover:text-cyan-300"
      )}
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function MultiChannelWarning({ activeScope, channels, requiredChannel }) {
  if (activeScope.length <= 1 && (!requiredChannel || activeScope[0] === requiredChannel)) return null;
  if (activeScope.length === 1 && requiredChannel && activeScope[0] !== requiredChannel) {
    const ch = channels.find((c) => c.code === requiredChannel);
    return (
      <div className="mb-4 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-3 text-xs text-amber-200">
        <p className="font-medium">This page requires <strong>{ch?.name || requiredChannel}</strong> in scope.</p>
        <p className="mt-1 text-amber-300/80">Switch the channel scope in the sidebar to view this module.</p>
      </div>
    );
  }
  const first = activeScope[0];
  const ch = channels.find((c) => c.code === first);
  return (
    <div className="mb-4 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-3 text-xs text-amber-200">
      <p className="font-medium">Multi-channel scope active ({activeScope.length} channels) — this page is channel-specific.</p>
      <p className="mt-1 text-amber-300/80">
        Showing data for <strong>{ch?.name || first}</strong> only. Aggregating modules (P&L, Channel Comparison) sum across the full scope.
      </p>
    </div>
  );
}

function EmptyStateCard({ title, body, requiredSheets, icon: Icon = FileText }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950 p-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-cyan-300">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm text-slate-400">{body}</p>
        {requiredSheets && requiredSheets.length ? (
          <div className="mt-5 inline-block text-left">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Required data feeds:
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {requiredSheets.map((s) => (
                <li key={s} className="font-mono text-cyan-300">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// =============================================================================
// FSN HELPERS (from App-dc61debf.jsx)
// =============================================================================

function compactNumber(value) {
  const n = Number(value || 0);
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${Math.round(n)}`;
}

function daysLabel(days) {
  if (!Number.isFinite(days)) return "—";
  if (days >= 365) return `${(days / 365).toFixed(1)}y`;
  if (days >= 30) return `${(days / 30).toFixed(1)}mo`;
  return `${Math.round(days)}d`;
}

function extractAsin(text) {
  const normalized = normalizeText(text).toUpperCase();
  const match = normalized.match(/([A-Z0-9]{10})/);
  return match ? match[1] : "";
}

function extractAsins(text) {
  const normalized = normalizeText(text).toUpperCase();
  const matches = normalized.match(/[A-Z0-9]{10}/g);
  return matches ? Array.from(new Set(matches)) : [];
}

function inferImageUrl(row) {
  const explicit = normalizeText(
    pick(row, ["image url", "Image URL", "image_url", "Image Url"], "")
  );
  if (explicit) return explicit;
  const asin = normalizeText(pick(row, ["asin", "ASIN"], ""));
  return asin
    ? `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SL120_.jpg`
    : "";
}

function AsinImage({ src, title }) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        N/A
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title || "Product"}
      className="h-10 w-10 shrink-0 rounded-2xl border border-slate-800 bg-white object-contain p-1"
      onError={() => setErrored(true)}
      loading="lazy"
    />
  );
}

function percentChange(current, prior) {
  const c = normalizeNumber(current);
  const p = normalizeNumber(prior);
  if (p === 0) return null;
  return ((c - p) / p) * 100;
}

function parseCampaignBulkSheet(sheet, adType) {
  if (!Array.isArray(sheet)) return [];
  return sheet
    .filter((row) => normalizeText(pick(row, ["Entity", "entity"])).toLowerCase() === "campaign")
    .map((row) => {
      const spend = normalizeNumber(pick(row, ["Spend", "Spend(USD)", "Cost"]));
      const sales = normalizeNumber(
        pick(row, [
          "Sales",
          "Sales(USD)",
          "Attributed Sales",
          "Sales 7 Day Total Sales",
          "14 Day Total Sales",
          "Sales 14 Day Total Sales",
        ])
      );
      const clicks = normalizeNumber(pick(row, ["Clicks"]));
      const impressions = normalizeNumber(pick(row, ["Impressions"]));
      const orders = normalizeNumber(pick(row, ["Orders", "Orders (#)"]));
      return {
        adType,
        campaignName: normalizeText(pick(row, ["Campaign Name", "Campaign"])),
        state: normalizeText(pick(row, ["State", "Status"], "—")),
        impressions,
        clicks,
        spend,
        sales,
        orders,
        ctr: impressions ? (clicks / impressions) * 100 : 0,
        acos: sales ? (spend / sales) * 100 : 0,
        roas: spend ? sales / spend : 0,
      };
    });
}

// =============================================================================
// WALMART CONNECT BULK PARSERS — flexible header matching across 1P/3P/Other.
// Walmart Connect exports vary by account type: column names like "Cost"
// vs "Spend", "Attributed Sales 14d" vs "Sales", "Item ID" vs "Item Number"
// are normalized via pick() with broad fallbacks. Anywhere I made a guess at
// a column variant I left a TODO so it can be validated against a real export.
// =============================================================================

function parseWalmartCampaignBulkSheet(sheet, channelCode) {
  if (!Array.isArray(sheet) || sheet.length === 0) return [];
  return sheet
    .map((row) => {
      const campaignName = normalizeText(
        pick(row, ["Campaign Name", "Campaign", "campaign name", "campaign"], "")
      );
      if (!campaignName) return null;
      // TODO: validate against real export — Walmart often emits "Cost" not "Spend"
      const spend = normalizeNumber(
        pick(row, ["Spend", "Cost", "spend", "cost", "Spend (USD)", "Cost (USD)"], 0)
      );
      const sales = normalizeNumber(
        pick(row, [
          "Attributed Sales 14d",
          "Attributed Sales 30d",
          "Attributed Sales",
          "Sales",
          "Total Sales",
          "Revenue",
          "Sales (USD)",
        ], 0)
      );
      const clicks = normalizeNumber(pick(row, ["Clicks", "clicks"], 0));
      const impressions = normalizeNumber(pick(row, ["Impressions", "impressions"], 0));
      const orders = normalizeNumber(
        pick(row, ["Orders", "Attributed Orders 14d", "Attributed Orders", "orders"], 0)
      );
      return {
        adType: "Walmart Sponsored Products",
        channel: channelCode,
        campaignName,
        state: normalizeText(
          pick(row, ["Campaign Status", "Status", "State", "campaign status", "status"], "—")
        ),
        impressions,
        clicks,
        spend,
        sales,
        orders,
        ctr: impressions ? (clicks / impressions) * 100 : 0,
        acos: sales ? (spend / sales) * 100 : 0,
        roas: spend ? sales / spend : 0,
      };
    })
    .filter(Boolean);
}

function parseWalmartSearchTerms(sheet, channelCode) {
  if (!Array.isArray(sheet) || sheet.length === 0) return [];
  return sheet
    .map((row) => {
      const searchTerm = normalizeText(
        pick(
          row,
          ["Search Term", "Customer Search Term", "search term", "Query", "Search Query"],
          ""
        )
      );
      if (!searchTerm) return null;
      const spend = normalizeNumber(pick(row, ["Spend", "Cost", "spend", "cost"], 0));
      const sales = normalizeNumber(
        pick(row, [
          "Attributed Sales 14d",
          "Attributed Sales",
          "Sales",
          "Total Sales",
          "Revenue",
        ], 0)
      );
      return {
        adType: "Walmart Sponsored Products",
        channel: channelCode,
        campaign: normalizeText(pick(row, ["Campaign Name", "Campaign", "campaign"], "—")),
        adGroup: normalizeText(pick(row, ["Ad Group Name", "Ad Group", "ad group"], "—")),
        state: normalizeText(pick(row, ["Campaign Status", "Status", "State"], "—")),
        keywordText: normalizeText(pick(row, ["Keyword", "Bidded Keyword", "Keyword Text"], "")),
        matchType: normalizeText(pick(row, ["Match Type", "match type", "Bid Type"], "—")),
        searchTerm,
        clicks: normalizeNumber(pick(row, ["Clicks", "clicks"], 0)),
        spend,
        orders: normalizeNumber(
          pick(row, ["Orders", "Attributed Orders 14d", "Attributed Orders"], 0)
        ),
        units: normalizeNumber(pick(row, ["Units", "Attributed Units 14d", "Attributed Units"], 0)),
        sales,
        impressions: normalizeNumber(pick(row, ["Impressions", "impressions"], 0)),
        ctr: 0,
        cvr: 0,
      };
    })
    .filter(Boolean);
}

// =============================================================================
// TRAFFIC SHEET PARSER — Detail Page Sales and Traffic by Child Item.
// Header row auto-detection happens upstream in fetchSettlementSheet, so here
// the rows arrive shaped like { "Child ASIN": ..., "Sessions - Total": ..., ... }.
// Walmart equivalent could later use the same shape; for now this is amzsc-only.
// =============================================================================

function parseTrafficSheet(rows, ym) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((r) => {
      const asin = normalizeText(
        pick(r, [
          "(Child) ASIN",
          "Child ASIN",
          "child asin",
          "ASIN",
          "asin",
          "(Parent) ASIN",
        ], "")
      ).toUpperCase();
      if (!asin || !/^B0[A-Z0-9]{8}$/.test(asin)) return null;
      const sessions = normalizeNumber(
        pick(r, [
          "Sessions - Total",
          "Sessions Total",
          "Sessions",
          "sessions",
          "Sessions – Total",
        ], 0)
      );
      const pageViews = normalizeNumber(
        pick(r, ["Page Views - Total", "Page Views", "page views"], 0)
      );
      const buyBoxPct = normalizeNumber(
        pick(r, [
          "Featured Offer (Buy Box) Percentage",
          "Buy Box Percentage",
          "Buy Box %",
          "Featured Offer Percentage",
        ], 0)
      );
      const unitsOrdered = normalizeNumber(
        pick(r, ["Units Ordered", "units ordered", "Units"], 0)
      );
      const orderedSales = normalizeNumber(
        pick(r, [
          "Ordered Product Sales",
          "ordered product sales",
          "Ordered Product Sales – B2B",
        ], 0)
      );
      const orderItemSessionPct = normalizeNumber(
        pick(r, [
          "Order Item Session Percentage",
          "Order Item Session %",
          "Unit Session Percentage",
          "Conversion Rate",
        ], 0)
      );
      // Buy box % below 100 implies missed sessions = OOS proxy, in days.
      // 30-day month assumption. TODO: validate against real export.
      const oosDays = buyBoxPct > 0 && buyBoxPct <= 1
        ? Math.round((1 - buyBoxPct) * 30)
        : buyBoxPct > 1 && buyBoxPct <= 100
        ? Math.round((1 - buyBoxPct / 100) * 30)
        : 0;
      const asp = unitsOrdered > 0 ? orderedSales / unitsOrdered : 0;
      return {
        ym,
        asin,
        sessions,
        pageViews,
        buyBoxPct,
        unitsOrdered,
        orderedSales,
        orderItemSessionPct,
        asp,
        oosDays,
      };
    })
    .filter(Boolean);
}

function categorizeCampaign(trend) {
  const w7 = trend.windows["7"];
  const w30 = trend.windows["30"];
  const w60 = trend.windows["60"];

  if (!w30 || (w30.spend === 0 && w30.impressions === 0)) return "monitor";

  if (w30.spend >= CAMPAIGN_BLEEDING_SPEND && w30.orders === 0) {
    return "bleeding";
  }

  const haveAll =
    w7 && w60 &&
    w7.spend >= CAMPAIGN_MIN_TREND_SPEND &&
    w30.spend >= CAMPAIGN_MIN_TREND_SPEND &&
    w60.spend >= CAMPAIGN_MIN_TREND_SPEND;

  if (haveAll) {
    if (w7.roas > w30.roas && w30.roas > w60.roas && w7.roas >= CAMPAIGN_TARGET_ROAS) {
      return "improving";
    }
    if (w7.roas < w30.roas && w30.roas < w60.roas && w7.roas < CAMPAIGN_TARGET_ROAS) {
      return "declining";
    }
  }

  if (w30.roas >= CAMPAIGN_HIDDEN_GEM_ROAS && w30.spend < 200) {
    const supporting =
      (w60 && w60.spend >= CAMPAIGN_MIN_TREND_SPEND && w60.roas >= CAMPAIGN_TARGET_ROAS) ||
      (w7 && w7.spend >= CAMPAIGN_MIN_TREND_SPEND && w7.roas >= CAMPAIGN_TARGET_ROAS);
    if (supporting) return "hidden_gem";
  }

  return "monitor";
}

function parseInventoryRows(rows, referenceByAsin, channel) {
  return rows
    .map((row) => {
      const asin = normalizeText(
        pick(row, ["asin", "ASIN", "fnsku", "FNSKU", "msku", "MSKU"], "")
      ).toUpperCase();

      const ref = referenceByAsin.get(asin) || {};

      let units = 0;
      if (channel === "fba") {
        units = normalizeNumber(pick(row, ["afn-total-quantity", "AFN Total Quantity"], 0));
      } else if (channel === "awd") {
        const available = normalizeNumber(
          pick(row, ["Available in AWD (units)", "available in awd (units)"], 0)
        );
        const inbound = normalizeNumber(
          pick(row, ["Inbound to AWD (units)", "inbound to awd (units)"], 0)
        );
        units = available + inbound;
      }

      return {
        asin,
        shortTitle:
          ref.shortTitle ||
          asin ||
          normalizeText(pick(row, ["product-name", "Product Name", "title", "Title"], "Unknown")),
        brand: ref.brand || "",
        parentAsin: ref.parentAsin || "",
        itemType: ref.type || "",
        imageUrl:
          ref.imageUrl ||
          (asin ? `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SL120_.jpg` : ""),
        units,
      };
    })
    .filter((row) => row.asin || row.units > 0);
}

function CategoryPill({ categoryId }) {
  const cat = CAMPAIGN_CATEGORIES.find((c) => c.id === categoryId) || CAMPAIGN_CATEGORIES[5];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        CATEGORY_TONE_CLASSES[cat.tone] || CATEGORY_TONE_CLASSES.slate
      )}
    >
      {cat.label}
    </span>
  );
}

function urgencyPill(days) {
  if (!Number.isFinite(days)) {
    return (
      <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300">
        No sales
      </span>
    );
  }
  if (days < DAYS_URGENT) {
    return (
      <span className="rounded-full border border-rose-900 bg-rose-500/10 px-2.5 py-1 text-xs text-rose-300">
        Urgent
      </span>
    );
  }
  if (days < DAYS_TO_SHIP_TARGET) {
    return (
      <span className="rounded-full border border-amber-900 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300">
        Replenish
      </span>
    );
  }
  return (
    <span className="rounded-full border border-emerald-900 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">
      Healthy
    </span>
  );
}

function recommendationPill(row) {
  if (row.alreadyBlocked) {
    return (
      <span className="rounded-full border border-cyan-900 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
        Already blocked elsewhere
      </span>
    );
  }
  return (
    <span className="rounded-full border border-amber-900 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300">
      Add negative
    </span>
  );
}

// =============================================================================
// APP STATE & MAIN
// =============================================================================

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeScope, setActiveScope] = useState(["amzsc"]); // array of channel codes
  const [pnlPeriod, setPnlPeriod] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sheet data
  const [channelConfigSheet, setChannelConfigSheet] = useState([]);
  const [cogsSheet, setCogsSheet] = useState([]);
  const [fixedCostsSheet, setFixedCostsSheet] = useState([]);
  const [adsMonthlySheet, setAdsMonthlySheet] = useState([]);
  const [wmt1pSellthroughSheet, setWmt1pSellthroughSheet] = useState([]);
  const [itemRefSheet, setItemRefSheet] = useState([]);
  const [spCampaigns, setSpCampaigns] = useState([]);
  const [sbCampaigns, setSbCampaigns] = useState([]);
  const [sdCampaigns, setSdCampaigns] = useState([]);
  const [spSearchTerms, setSpSearchTerms] = useState([]);
  const [sbSearchTerms, setSbSearchTerms] = useState([]);
  const [inventoryFba, setInventoryFba] = useState([]);
  const [inventoryAwd, setInventoryAwd] = useState([]);
  const [products30d, setProducts30d] = useState([]);
  const [salesMonthly, setSalesMonthly] = useState([]);
  const [fbmOnly, setFbmOnly] = useState([]);
  const [spCampaigns7, setSpCampaigns7] = useState([]);
  const [sbCampaigns7, setSbCampaigns7] = useState([]);
  const [sdCampaigns7, setSdCampaigns7] = useState([]);
  const [spCampaigns60, setSpCampaigns60] = useState([]);
  const [sbCampaigns60, setSbCampaigns60] = useState([]);
  const [sdCampaigns60, setSdCampaigns60] = useState([]);
  // Walmart Connect bulk reports (1P / 3P / Other × 7/30/60 + search terms)
  const [wmt1pCampaigns7, setWmt1pCampaigns7] = useState([]);
  const [wmt1pCampaigns30, setWmt1pCampaigns30] = useState([]);
  const [wmt1pCampaigns60, setWmt1pCampaigns60] = useState([]);
  const [wmt3pCampaigns7, setWmt3pCampaigns7] = useState([]);
  const [wmt3pCampaigns30, setWmt3pCampaigns30] = useState([]);
  const [wmt3pCampaigns60, setWmt3pCampaigns60] = useState([]);
  const [wmtotherCampaigns7, setWmtotherCampaigns7] = useState([]);
  const [wmtotherCampaigns30, setWmtotherCampaigns30] = useState([]);
  const [wmtotherCampaigns60, setWmtotherCampaigns60] = useState([]);
  const [wmt1pSearchTermsRaw, setWmt1pSearchTermsRaw] = useState([]);
  const [wmt3pSearchTermsRaw, setWmt3pSearchTermsRaw] = useState([]);
  const [wmtotherSearchTermsRaw, setWmtotherSearchTermsRaw] = useState([]);
  // amzsc Detail Page Sales and Traffic by Child Item — { yyyy-mm: rows[] }
  const [trafficByMonth, setTrafficByMonth] = useState({});
  const [settlementByMonth, setSettlementByMonth] = useState({});
  // Per-channel deduction agreements (e.g., amzvc_agreements with rows like
  // ["Freight Allowance", 0.03], ["Roberts Fees", 0.10]). Applied as % of
  // that channel's revenue to compute deductions in the P&L.
  const [agreementsByChannel, setAgreementsByChannel] = useState({});
  // Stub-page data sources
  const [listingQualitySheet, setListingQualitySheet] = useState([]);
  const [pricingSnapshotSheet, setPricingSnapshotSheet] = useState([]);
  const [pricingSnapshotTabName, setPricingSnapshotTabName] = useState("");
  const [launchTrackerSheet, setLaunchTrackerSheet] = useState([]);
  const [promotionsSheet, setPromotionsSheet] = useState([]);
  const [buyBoxByMonth, setBuyBoxByMonth] = useState({});

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const safe = (tab) => fetchSheet(tab).catch(() => []);
        const [
          chCfg, cogs, fixed, itemRef,
          spCamp, sbCamp, sdCamp, spTerms, sbTerms,
          invFba, invAwd, prod30d, saleMon, fbmOnlySheet,
          spCamp7, sbCamp7, sdCamp7, spCamp60, sbCamp60, sdCamp60,
          w1p7, w1p30, w1p60, w3p7, w3p30, w3p60, woth7, woth30, woth60,
          w1pSt, w3pSt, wothSt,
          adsMon,
          w1pSell,
        ] = await Promise.all([
          fetchSheet(TAB_NAMES.channelConfig),
          fetchSheet(TAB_NAMES.cogs),
          fetchSheet(TAB_NAMES.fixedCostsMonthly),
          fetchSheet(TAB_NAMES.itemRef),
          fetchSheet(TAB_NAMES.spCampaigns),
          fetchSheet(TAB_NAMES.sbCampaigns),
          fetchSheet(TAB_NAMES.sdCampaigns),
          fetchSheet(TAB_NAMES.spSearchTerms),
          fetchSheet(TAB_NAMES.sbSearchTerms),
          fetchSheet(TAB_NAMES.inventoryFba),
          fetchSheet(TAB_NAMES.inventoryAwd),
          fetchSheet(TAB_NAMES.products30d),
          fetchSheet(TAB_NAMES.salesMonthly),
          safe(TAB_NAMES.fbmOnly),
          safe(TAB_NAMES.spCampaigns7),
          safe(TAB_NAMES.sbCampaigns7),
          safe(TAB_NAMES.sdCampaigns7),
          safe(TAB_NAMES.spCampaigns60),
          safe(TAB_NAMES.sbCampaigns60),
          safe(TAB_NAMES.sdCampaigns60),
          safe(TAB_NAMES.wmt1pCampaigns7),
          safe(TAB_NAMES.wmt1pCampaigns30),
          safe(TAB_NAMES.wmt1pCampaigns60),
          safe(TAB_NAMES.wmt3pCampaigns7),
          safe(TAB_NAMES.wmt3pCampaigns30),
          safe(TAB_NAMES.wmt3pCampaigns60),
          safe(TAB_NAMES.wmtotherCampaigns7),
          safe(TAB_NAMES.wmtotherCampaigns30),
          safe(TAB_NAMES.wmtotherCampaigns60),
          safe(TAB_NAMES.wmt1pSearchTerms),
          safe(TAB_NAMES.wmt3pSearchTerms),
          safe(TAB_NAMES.wmtotherSearchTerms),
          safe(TAB_NAMES.adsMonthly),
          safe(TAB_NAMES.wmt1pSellthrough),
        ]);

        setChannelConfigSheet(chCfg);
        setCogsSheet(cogs);
        setFixedCostsSheet(fixed);
        setItemRefSheet(itemRef);
        setSpCampaigns(spCamp);
        setSbCampaigns(sbCamp);
        setSdCampaigns(sdCamp);
        setSpSearchTerms(spTerms);
        setSbSearchTerms(sbTerms);
        setInventoryFba(invFba);
        setInventoryAwd(invAwd);
        setProducts30d(prod30d);
        setSalesMonthly(saleMon);
        setFbmOnly(fbmOnlySheet);
        setSpCampaigns7(spCamp7);
        setSbCampaigns7(sbCamp7);
        setSdCampaigns7(sdCamp7);
        setSpCampaigns60(spCamp60);
        setSbCampaigns60(sbCamp60);
        setSdCampaigns60(sdCamp60);
        setWmt1pCampaigns7(w1p7); setWmt1pCampaigns30(w1p30); setWmt1pCampaigns60(w1p60);
        setWmt3pCampaigns7(w3p7); setWmt3pCampaigns30(w3p30); setWmt3pCampaigns60(w3p60);
        setWmtotherCampaigns7(woth7); setWmtotherCampaigns30(woth30); setWmtotherCampaigns60(woth60);
        setWmt1pSearchTermsRaw(w1pSt); setWmt3pSearchTermsRaw(w3pSt); setWmtotherSearchTermsRaw(wothSt);
        setAdsMonthlySheet(adsMon);
        setWmt1pSellthroughSheet(w1pSell);

        const months = generateTrailingMonthCodes();
        // Multi-channel: fetch settlement tabs for every enabled channel.
        // Tab naming convention: `<channelCode>_settlement_<YYYY>_<MM>`.
        // Missing tabs return [] (safe), so unused channels just stay empty.
        const channelList = parseChannelConfig(chCfg).filter((c) => c.enabled).map((c) => c.code);
        const targetChannels = channelList.length > 0 ? channelList : ["amzsc"];
        const settlementPairs = [];
        for (const channel of targetChannels) {
          for (const ym of months) {
            settlementPairs.push({ channel, ym });
          }
        }
        // Throttle to ~6 concurrent gviz calls so we don't trigger 429 / 503
        // floods (gviz aggressively rate-limits parallel reads on large sheets).
        const runWithConcurrency = async (items, limit, worker) => {
          const out = new Array(items.length);
          let cursor = 0;
          const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
            while (true) {
              const i = cursor++;
              if (i >= items.length) return;
              try { out[i] = await worker(items[i]); }
              catch { out[i] = null; }
            }
          });
          await Promise.all(workers);
          return out;
        };
        const settlementResults = await runWithConcurrency(
          settlementPairs,
          6,
          async ({ channel, ym }) => ({
            channel,
            ym,
            rows: await fetchSettlementSheet(`${channel}_settlement_${ym}`),
          })
        );
        const settlementMap = {};
        for (const { channel, ym, rows } of settlementResults) {
          if (rows && rows.length) settlementMap[`${channel}|${ym}`] = rows;
        }

        // Master settlement tabs — `<channelCode>_settlement` with no month suffix.
        // Useful for channels where you maintain one big tab (e.g., Vendor Central
        // PO exports). Rows are auto-bucketed into monthly slots using their
        // `date/time` column. Falls back gracefully if a master tab is missing.
        const masterResults = await Promise.all(
          targetChannels.map(async (channel) => ({
            channel,
            rows: await safe(`${channel}_settlement`),
          }))
        );
        for (const { channel, rows } of masterResults) {
          if (!rows || rows.length === 0) continue;
          for (const r of rows) {
            const dateStr = pick(r, ["date/time", "Date/Time", "date", "Date", "PO Date", "po date", "order date", "Order Date", "Window End Date", "ship date", "Ship Date"], "");
            const d = dateStr ? new Date(dateStr) : null;
            if (!d || isNaN(d)) continue;
            const ym = `${d.getFullYear()}_${pad2(d.getMonth() + 1)}`;
            const key = `${channel}|${ym}`;
            if (!settlementMap[key]) settlementMap[key] = [];
            settlementMap[key].push(r);
          }
        }
        setSettlementByMonth(settlementMap);

        // Per-channel agreements (e.g., amzvc_agreements). Each tab is a
        // simple 2-column list: deduction name + rate (0.03 = 3% of revenue).
        // No header required — first row is data. Used to auto-compute
        // VC deductions like Freight Allowance, Roberts Fees, etc.
        const agreementResults = await Promise.all(
          targetChannels.map(async (channel) => ({
            channel,
            rows: await safe(`${channel}_agreements`),
          }))
        );
        const agreementsMap = {};
        try {
          for (const { channel, rows } of agreementResults) {
            if (!rows || rows.length === 0) continue;
            const list = [];
            for (const r of rows) {
              if (!r || typeof r !== "object") continue;
              const keys = Object.keys(r);
              let name = null;
              let rate = null;
              for (const k of keys) {
                const v = r[k];
                if (v === null || v === undefined || v === "") continue;
                const asNum = Number(v);
                if (!isNaN(asNum) && Math.abs(asNum) > 0 && Math.abs(asNum) < 1.5) {
                  rate = asNum;
                } else if (typeof v === "string" || (typeof v === "number" && !isFinite(asNum))) {
                  if (!name) name = String(v).trim();
                }
              }
              // Also extract from gviz column labels (handles no-header case)
              if (!name && keys.length >= 1 && keys[0]) name = String(keys[0]).trim();
              if ((rate === null || rate === 0) && keys.length >= 2 && keys[1]) {
                const v2 = Number(keys[1]);
                if (!isNaN(v2) && v2 !== 0 && Math.abs(v2) < 1.5) rate = v2;
              }
              if (name && typeof rate === "number" && rate !== 0) {
                list.push({ name, rate });
              }
            }
            if (list.length > 0) agreementsMap[channel] = list;
          }
        } catch (e) {
          // Swallow — agreements failure should not block dashboard load
        }
        setAgreementsByChannel(agreementsMap);

        // Traffic exports — same monthly cadence, header-row auto-detect.
        const trafficResults = await Promise.all(
          months.map(async (ym) => ({
            ym,
            rows: await fetchSettlementSheet(`${TAB_NAMES.amzscTrafficPrefix}${ym}`),
          }))
        );
        const trafficMap = {};
        for (const { ym, rows } of trafficResults) {
          if (rows && rows.length) trafficMap[ym] = rows;
        }
        setTrafficByMonth(trafficMap);

        // Buy box exports — monthly. Use fetchSheet directly (these tabs are
        // user-maintained with headers in row 1, no Amazon preamble to skip).
        const buyBoxResults = await Promise.all(
          months.map(async (ym) => ({
            ym,
            rows: await safe(`amzsc_buybox_${ym}`),
          }))
        );
        const buyBoxMap = {};
        for (const { ym, rows } of buyBoxResults) {
          if (rows && rows.length) buyBoxMap[ym] = rows;
        }
        setBuyBoxByMonth(buyBoxMap);

        // Listing quality + launch tracker + promotions — single sheets.
        const [lq, lt, promo] = await Promise.all([
          safe("listing_quality"),
          safe("launch_tracker"),
          safe("promotions"),
        ]);
        setListingQualitySheet(lq);
        setLaunchTrackerSheet(lt);
        setPromotionsSheet(promo);

        // Pricing snapshot — try a single canonical tab first, then walk back
        // a small number of recent dates if not found. User keeps a daily or
        // weekly snapshot tab named pricing_snapshot[_<YYYY>_<MM>_<DD>].
        let snapshot = await safe("pricing_snapshot");
        let snapshotName = snapshot && snapshot.length ? "pricing_snapshot" : "";
        if (!snapshot || !snapshot.length) {
          const today = new Date();
          for (let i = 0; i < 14; i++) {
            const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
            const tab = `pricing_snapshot_${d.getFullYear()}_${pad2(d.getMonth() + 1)}_${pad2(d.getDate())}`;
            const rows = await safe(tab);
            if (rows && rows.length) { snapshot = rows; snapshotName = tab; break; }
          }
        }
        setPricingSnapshotSheet(snapshot || []);
        setPricingSnapshotTabName(snapshotName);

        setError("");
      } catch (e) {
        setError(
          "Could not load channel data. Please refresh the page — if the issue persists, the data source may be temporarily unavailable."
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const channels = useMemo(() => parseChannelConfig(channelConfigSheet), [channelConfigSheet]);
  const enabledChannels = useMemo(() => channels.filter((c) => c.enabled), [channels]);

  const loadedMonthsByChannel = useMemo(() => {
    const out = {};
    for (const key of Object.keys(settlementByMonth)) {
      const [channel, ym] = key.split("|");
      out[channel] = out[channel] || [];
      out[channel].push(ym);
    }
    for (const ch of Object.keys(out)) {
      out[ch].sort().reverse();
    }
    return out;
  }, [settlementByMonth]);

  useEffect(() => {
    // Union of months across every channel in active scope, latest first.
    const set = new Set();
    for (const c of activeScope) {
      for (const ym of loadedMonthsByChannel[c] || []) set.add(ym);
    }
    const months = Array.from(set).sort().reverse();
    if (!pnlPeriod && months.length) setPnlPeriod(months[0]);
  }, [loadedMonthsByChannel, activeScope, pnlPeriod]);

  // Channels that share an account with another seller — settlement rows are
  // filtered to only SKUs/ASINs present in the user's cogs sheet (their
  // catalog). Add a channel code here to apply the same filter elsewhere.
  const SHARED_ACCOUNT_CHANNELS = useMemo(() => new Set(["amzvc"]), []);

  const cogsMap = useMemo(() => parseCogs(cogsSheet), [cogsSheet]);
  // Secondary lookup by ASIN — used when settlement rows have ASIN but no
  // internal SKU (Vendor Central Net PPM exports, Walmart, etc.).
  const cogsByAsin = useMemo(() => {
    const map = new Map();
    for (const entry of cogsMap.values()) {
      if (entry && entry.asin) map.set(String(entry.asin).trim().toUpperCase(), entry);
    }
    return map;
  }, [cogsMap]);

  // Build an ASIN allowlist from cogs (covers cases where settlement rows have
  // ASIN but no Vendor SKU, e.g. Vendor Central Sales Diagnostic exports).
  const cogsAsinSet = useMemo(() => {
    const set = new Set();
    for (const entry of cogsMap.values()) {
      if (entry && entry.asin) set.add(String(entry.asin).trim().toUpperCase());
    }
    return set;
  }, [cogsMap]);

  const settlementRows = useMemo(() => {
    const out = [];
    for (const [key, rows] of Object.entries(settlementByMonth)) {
      const [channel, ym] = key.split("|");
      // Include every channel in active scope — drives Combined P&L
      if (!activeScope.includes(channel)) continue;
      const parsed = parseSettlementSheet(rows, ym).map((r) => ({ ...r, channel }));
      // For shared accounts, filter to only rows whose SKU or ASIN appears in
      // cogs. This is how Vendor Central / shared marketplace data gets cleaned
      // without manual pre-filtering.
      const filtered = SHARED_ACCOUNT_CHANNELS.has(channel)
        ? parsed.filter((r) => {
            const hasSku = r.sku && cogsMap.has(r.sku);
            const hasAsin = r.asin && cogsAsinSet.has(String(r.asin).trim().toUpperCase());
            // Fee/adjustment rows have no sku — keep them so totals stay sane
            const isFeeOrAdjustment = !r.sku && !r.asin && (r.type === "adjustment" || r.type.includes("fee") || r.type.includes("service"));
            return hasSku || hasAsin || isFeeOrAdjustment;
          })
        : parsed;
      out.push(...filtered);
    }
    return out;
  }, [settlementByMonth, activeScope, SHARED_ACCOUNT_CHANNELS, cogsMap, cogsAsinSet]);
  const fixedCosts = useMemo(() => parseFixedCostsMonthly(fixedCostsSheet), [fixedCostsSheet]);

  // Amazon SP/SB/SD campaign tabs are amzsc-only data — only charge that ad
  // spend to the P&L / Overview when Amazon SC is actually in scope. Walmart
  // ad data lives in the wmt*_campaigns_* tabs (30d snapshots, not monthly)
  // and is surfaced in Campaign Trends / Search Terms instead.
  const adSpendCurrentMonth = useMemo(
    () =>
      activeScope.includes("amzsc")
        ? sumAdSpendFromCampaigns(spCampaigns, sbCampaigns, sdCampaigns)
        : 0,
    [activeScope, spCampaigns, sbCampaigns, sdCampaigns]
  );

  // Month-bucketed Amazon ad spend for the selected P&L period, from the
  // ads_monthly tab (BigQuery vw_dhq_ads_monthly: client-P&L actuals through
  // 2026_06, daily ad reports thereafter). Falls back to the 30d campaign
  // rollup only when the tab is missing entirely, so older sheets still work.
  const adSpendForPeriod = useMemo(() => {
    if (!activeScope.includes("amzsc")) return 0;
    if (!Array.isArray(adsMonthlySheet) || adsMonthlySheet.length === 0) return adSpendCurrentMonth;
    const row = adsMonthlySheet.find(
      (r) => normalizeText(pick(r, ["month", "Month"], "")) === pnlPeriod
    );
    return row ? Math.abs(normalizeNumber(pick(row, ["spend", "Spend"], 0))) : 0;
  }, [activeScope, adsMonthlySheet, adSpendCurrentMonth, pnlPeriod]);

  const pnl = useMemo(() => {
    if (!pnlPeriod) return emptyPnL();
    return computePnLForPeriod(settlementRows, cogsMap, fixedCosts, adSpendForPeriod, pnlPeriod, cogsByAsin, agreementsByChannel);
  }, [settlementRows, cogsMap, cogsByAsin, fixedCosts, adSpendForPeriod, pnlPeriod, agreementsByChannel]);

  const pnlByAsin = useMemo(
    () => (pnlPeriod ? computePnLByAsin(settlementRows, cogsMap, pnlPeriod, cogsByAsin) : []),
    [settlementRows, cogsMap, cogsByAsin, pnlPeriod]
  );

  const filteredAsinRows = useMemo(() => {
    if (!query) return pnlByAsin;
    const q = query.toLowerCase();
    return pnlByAsin.filter((r) =>
      `${r.sku} ${r.asin} ${r.title}`.toLowerCase().includes(q)
    );
  }, [pnlByAsin, query]);

  const asinSort = useSortableRows(filteredAsinRows, {
    key: "revenue",
    type: "number",
    direction: "desc",
  });

  // FSN / Amazon-specific data
  const referenceByAsin = useMemo(() => {
    const map = new Map();
    itemRefSheet.forEach((row) => {
      const asin = normalizeText(pick(row, ["asin", "ASIN"])).toUpperCase();
      if (!asin) return;
      map.set(asin, {
        asin,
        parentAsin: normalizeText(pick(row, ["parent asin", "Parent ASIN"], "")),
        shortTitle: normalizeText(pick(row, ["short title", "Short Title"], "")),
        brand: normalizeText(pick(row, ["brand", "Brand"], "")),
        type: normalizeText(pick(row, ["type", "Type", "item type", "Item Type"], "")),
        imageUrl: inferImageUrl(row),
      });
    });
    return map;
  }, [itemRefSheet]);

  const fbmOnlyAsins = useMemo(() => {
    const set = new Set();
    fbmOnly.forEach((row) => {
      const asin = pick(row, ["ASIN", "asin", "Asin"], "");
      const trimmed = String(asin || "").trim().toUpperCase();
      if (trimmed) set.add(trimmed);
    });
    return set;
  }, [fbmOnly]);

  const isFbmOnly = (asin) =>
    fbmOnlyAsins.has(String(asin || "").trim().toUpperCase());

  // Walmart parsed campaigns (per account × per window) — used for Campaign Trends
  // and merged into Search Terms / Targeting when Walmart accounts are in scope.
  const walmartCampaignsByWindow = useMemo(() => {
    const inScope = (code) => activeScope.includes(code);
    return {
      "7": [
        ...(inScope("wmt1p") ? parseWalmartCampaignBulkSheet(wmt1pCampaigns7, "wmt1p") : []),
        ...(inScope("wmt3p") ? parseWalmartCampaignBulkSheet(wmt3pCampaigns7, "wmt3p") : []),
        ...(inScope("wmtother") ? parseWalmartCampaignBulkSheet(wmtotherCampaigns7, "wmtother") : []),
      ],
      "30": [
        ...(inScope("wmt1p") ? parseWalmartCampaignBulkSheet(wmt1pCampaigns30, "wmt1p") : []),
        ...(inScope("wmt3p") ? parseWalmartCampaignBulkSheet(wmt3pCampaigns30, "wmt3p") : []),
        ...(inScope("wmtother") ? parseWalmartCampaignBulkSheet(wmtotherCampaigns30, "wmtother") : []),
      ],
      "60": [
        ...(inScope("wmt1p") ? parseWalmartCampaignBulkSheet(wmt1pCampaigns60, "wmt1p") : []),
        ...(inScope("wmt3p") ? parseWalmartCampaignBulkSheet(wmt3pCampaigns60, "wmt3p") : []),
        ...(inScope("wmtother") ? parseWalmartCampaignBulkSheet(wmtotherCampaigns60, "wmtother") : []),
      ],
    };
  }, [
    activeScope,
    wmt1pCampaigns7, wmt1pCampaigns30, wmt1pCampaigns60,
    wmt3pCampaigns7, wmt3pCampaigns30, wmt3pCampaigns60,
    wmtotherCampaigns7, wmtotherCampaigns30, wmtotherCampaigns60,
  ]);

  const walmartUnifiedSearchTerms = useMemo(() => {
    const out = [];
    if (activeScope.includes("wmt1p")) out.push(...parseWalmartSearchTerms(wmt1pSearchTermsRaw, "wmt1p"));
    if (activeScope.includes("wmt3p")) out.push(...parseWalmartSearchTerms(wmt3pSearchTermsRaw, "wmt3p"));
    if (activeScope.includes("wmtother")) out.push(...parseWalmartSearchTerms(wmtotherSearchTermsRaw, "wmtother"));
    return out;
  }, [activeScope, wmt1pSearchTermsRaw, wmt3pSearchTermsRaw, wmtotherSearchTermsRaw]);

  // Whether Amazon-Seller-Central campaign data is in scope (drives whether
  // SP/SB/SD bulk sheets get merged into the unified Search Terms / Trends).
  const includeAmazonAds = useMemo(() => activeScope.includes("amzsc"), [activeScope]);

  // Campaign Trends — merge Amazon (when amzsc in scope) + Walmart (when any wmt account in scope)
  const campaignsByWindow = useMemo(() => {
    const amzn = (rows, adType) => (includeAmazonAds ? parseCampaignBulkSheet(rows, adType) : []);
    return {
      "7": [
        ...amzn(spCampaigns7, "Sponsored Products"),
        ...amzn(sbCampaigns7, "Sponsored Brands"),
        ...amzn(sdCampaigns7, "Sponsored Display"),
        ...walmartCampaignsByWindow["7"],
      ],
      "30": [
        ...amzn(spCampaigns, "Sponsored Products"),
        ...amzn(sbCampaigns, "Sponsored Brands"),
        ...amzn(sdCampaigns, "Sponsored Display"),
        ...walmartCampaignsByWindow["30"],
      ],
      "60": [
        ...amzn(spCampaigns60, "Sponsored Products"),
        ...amzn(sbCampaigns60, "Sponsored Brands"),
        ...amzn(sdCampaigns60, "Sponsored Display"),
        ...walmartCampaignsByWindow["60"],
      ],
    };
  }, [
    includeAmazonAds,
    spCampaigns, sbCampaigns, sdCampaigns,
    spCampaigns7, sbCampaigns7, sdCampaigns7,
    spCampaigns60, sbCampaigns60, sdCampaigns60,
    walmartCampaignsByWindow,
  ]);

  const campaignTrends = useMemo(() => {
    const map = new Map();
    for (const w of ["7", "30", "60"]) {
      for (const r of campaignsByWindow[w]) {
        if (!r.campaignName) continue;
        const key = `${r.adType}||${r.campaignName}`;
        const existing = map.get(key) || {
          adType: r.adType,
          campaignName: r.campaignName,
          state: r.state,
          windows: {},
        };
        existing.windows[w] = r;
        if (w === "7" && r.state) existing.state = r.state;
        else if (!existing.state && r.state) existing.state = r.state;
        map.set(key, existing);
      }
    }
    return [...map.values()].map((trend) => ({
      ...trend,
      category: categorizeCampaign(trend),
    }));
  }, [campaignsByWindow]);

  // Inventory
  const fbaInventoryRows = useMemo(
    () => parseInventoryRows(inventoryFba, referenceByAsin, "fba"),
    [inventoryFba, referenceByAsin]
  );

  const awdInventoryRows = useMemo(
    () => parseInventoryRows(inventoryAwd, referenceByAsin, "awd"),
    [inventoryAwd, referenceByAsin]
  );

  const salesByAsin30d = useMemo(() => {
    const map = new Map();
    products30d.forEach((row) => {
      const asin = normalizeText(
        pick(row, ["(Child) ASIN", "Child ASIN", "child asin", "ASIN", "asin"], "")
      ).toUpperCase();
      if (!asin) return;
      const ref = referenceByAsin.get(asin) || {};
      const unitsOrdered = normalizeNumber(
        pick(row, ["Units Ordered", "units ordered", "Ordered Product Sales Units"], 0)
      );
      const current = map.get(asin) || {
        asin,
        shortTitle: ref.shortTitle || asin,
        brand: ref.brand || "",
        parentAsin: ref.parentAsin || "",
        itemType: ref.type || "",
        imageUrl:
          ref.imageUrl ||
          `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SL120_.jpg`,
        units30d: 0,
      };
      current.units30d += unitsOrdered;
      map.set(asin, current);
    });
    return map;
  }, [products30d, referenceByAsin]);

  const inventoryByAsin = useMemo(() => {
    const map = new Map();
    const upsert = (rows, channel) => {
      rows.forEach((row) => {
        if (!row.asin) return;
        const current = map.get(row.asin) || {
          asin: row.asin,
          shortTitle: row.shortTitle,
          brand: row.brand,
          parentAsin: row.parentAsin,
          itemType: row.itemType,
          imageUrl: row.imageUrl,
          fbaUnits: 0,
          awdUnits: 0,
        };
        if (channel === "fba") current.fbaUnits += row.units;
        if (channel === "awd") current.awdUnits += row.units;
        map.set(row.asin, current);
      });
    };
    upsert(fbaInventoryRows, "fba");
    upsert(awdInventoryRows, "awd");

    return [...map.values()].map((row) => {
      const salesRef = salesByAsin30d.get(row.asin) || {};
      const units30d = normalizeNumber(salesRef.units30d);
      const unitsPerDay = units30d / 30;
      const totalUnits = row.fbaUnits + row.awdUnits;
      const daysOfCover = unitsPerDay > 0 ? totalUnits / unitsPerDay : Number.POSITIVE_INFINITY;
      return {
        ...row,
        units30d,
        unitsPerDay,
        totalUnits,
        daysOfCover,
        urgency: !Number.isFinite(daysOfCover)
          ? "no_sales"
          : daysOfCover < DAYS_URGENT
          ? "urgent"
          : daysOfCover < DAYS_TO_SHIP_TARGET
          ? "replenish"
          : "healthy",
      };
    });
  }, [fbaInventoryRows, awdInventoryRows, salesByAsin30d]);

  // Search Terms
  const spExistingNegatives = useMemo(() => {
    return spCampaigns
      .filter((row) => {
        const entity = normalizeText(pick(row, ["Entity", "entity"])).toLowerCase();
        const matchType = normalizeText(pick(row, ["Match Type"])).toLowerCase();
        return entity.includes("negative") || matchType.includes("negative");
      })
      .map((row) => ({
        adType: "Sponsored Products",
        entity: normalizeText(pick(row, ["Entity"])),
        campaign: normalizeText(pick(row, ["Campaign Name (Informational only)", "Campaign Name"], "—")),
        adGroup: normalizeText(pick(row, ["Ad Group Name (Informational only)", "Ad Group Name"], "—")),
        term: normalizeText(pick(row, ["Keyword Text", "Product Targeting Expression"], "")),
        matchType: normalizeText(pick(row, ["Match Type"], "—")),
        state: normalizeText(pick(row, ["State"], "—")),
      }))
      .filter((row) => row.term);
  }, [spCampaigns]);

  const sbExistingNegatives = useMemo(() => {
    return sbCampaigns
      .filter((row) => {
        const entity = normalizeText(pick(row, ["Entity", "entity"])).toLowerCase();
        const matchType = normalizeText(pick(row, ["Match Type"])).toLowerCase();
        return entity.includes("negative") || matchType.includes("negative");
      })
      .map((row) => ({
        adType: "Sponsored Brands",
        entity: normalizeText(pick(row, ["Entity"])),
        campaign: normalizeText(pick(row, ["Campaign Name (Informational only)", "Campaign Name"], "—")),
        adGroup: normalizeText(pick(row, ["Ad Group Name (Informational only)", "Ad Group Name"], "—")),
        term: normalizeText(pick(row, ["Keyword Text", "Product Targeting Expression"], "")),
        matchType: normalizeText(pick(row, ["Match Type"], "—")),
        state: normalizeText(pick(row, ["State"], "—")),
      }))
      .filter((row) => row.term);
  }, [sbCampaigns]);

  const existingNegatives = useMemo(() => {
    return [...spExistingNegatives, ...sbExistingNegatives];
  }, [spExistingNegatives, sbExistingNegatives]);

  const existingNegativeSet = useMemo(() => {
    return new Set(existingNegatives.map((row) => `${row.adType}||${row.term.toLowerCase()}`));
  }, [existingNegatives]);

  const unifiedSearchTerms = useMemo(() => {
    const sp = spSearchTerms.map((row) => ({
      adType: "Sponsored Products",
      campaign: normalizeText(pick(row, ["Campaign Name (Informational only)"], "—")),
      adGroup: normalizeText(pick(row, ["Ad Group Name (Informational only)"], "—")),
      state: normalizeText(pick(row, ["State"], "—")),
      keywordText: normalizeText(pick(row, ["Keyword Text"], "")),
      matchType: normalizeText(pick(row, ["Match Type"], "—")),
      searchTerm: normalizeText(pick(row, ["Customer Search Term"], "")),
      clicks: normalizeNumber(pick(row, ["Clicks"], 0)),
      spend: normalizeNumber(pick(row, ["Spend"], 0)),
      orders: normalizeNumber(pick(row, ["Orders"], 0)),
      units: normalizeNumber(pick(row, ["Units"], 0)),
      sales: normalizeNumber(pick(row, ["Sales"], 0)),
      impressions: normalizeNumber(pick(row, ["Impressions"], 0)),
      ctr: normalizeNumber(pick(row, ["Click-through Rate"], 0)) * 100,
      cvr: normalizeNumber(pick(row, ["Conversion Rate"], 0)) * 100,
    }));

    const sb = sbSearchTerms.map((row) => ({
      adType: "Sponsored Brands",
      campaign: normalizeText(pick(row, ["Campaign Name (Informational only)"], "—")),
      adGroup: normalizeText(pick(row, ["Ad Group Name (Informational only)"], "—")),
      state: normalizeText(pick(row, ["State"], "—")),
      keywordText: normalizeText(pick(row, ["Keyword Text"], "")),
      matchType: normalizeText(pick(row, ["Match Type"], "—")),
      searchTerm: normalizeText(pick(row, ["Customer Search Term"], "")),
      clicks: normalizeNumber(pick(row, ["Clicks"], 0)),
      spend: normalizeNumber(pick(row, ["Spend"], 0)),
      orders: normalizeNumber(pick(row, ["Orders"], 0)),
      units: normalizeNumber(pick(row, ["Units"], 0)),
      sales: normalizeNumber(pick(row, ["Sales"], 0)),
      impressions: normalizeNumber(pick(row, ["Impressions"], 0)),
      ctr: normalizeNumber(pick(row, ["Click-through Rate"], 0)) * 100,
      cvr: normalizeNumber(pick(row, ["Conversion Rate"], 0)) * 100,
    }));

    const amazon = includeAmazonAds ? [...sp, ...sb] : [];
    return [...amazon, ...walmartUnifiedSearchTerms].filter((row) => row.searchTerm);
  }, [spSearchTerms, sbSearchTerms, includeAmazonAds, walmartUnifiedSearchTerms]);

  // Traffic decomposition input — Map<ASIN, Map<YYYY-MM, {sessions, asp, cvr, oosDays, ...}>>
  const trafficByAsinByMonth = useMemo(() => {
    const out = new Map();
    for (const [ym, rows] of Object.entries(trafficByMonth)) {
      const parsed = parseTrafficSheet(rows, ym);
      for (const r of parsed) {
        const inner = out.get(r.asin) || new Map();
        // If multiple rows per ASIN per month (parent vs child), sum sessions/units
        // and recompute ASP / CVR from sums.
        const cur = inner.get(ym) || {
          ym, asin: r.asin,
          sessions: 0, pageViews: 0, unitsOrdered: 0, orderedSales: 0,
          buyBoxPctSum: 0, buyBoxPctCount: 0, oosDays: 0,
        };
        cur.sessions += r.sessions;
        cur.pageViews += r.pageViews;
        cur.unitsOrdered += r.unitsOrdered;
        cur.orderedSales += r.orderedSales;
        if (r.buyBoxPct > 0) {
          cur.buyBoxPctSum += r.buyBoxPct;
          cur.buyBoxPctCount += 1;
        }
        cur.oosDays = Math.max(cur.oosDays, r.oosDays);
        inner.set(ym, cur);
        out.set(r.asin, inner);
      }
    }
    // Finalize derived metrics per cell
    for (const inner of out.values()) {
      for (const cell of inner.values()) {
        cell.asp = cell.unitsOrdered > 0 ? cell.orderedSales / cell.unitsOrdered : 0;
        cell.cvr = cell.sessions > 0 ? cell.unitsOrdered / cell.sessions : 0;
        cell.buyBoxPct = cell.buyBoxPctCount > 0 ? cell.buyBoxPctSum / cell.buyBoxPctCount : 0;
      }
    }
    return out;
  }, [trafficByMonth]);

  const recommendedNegatives = useMemo(() => {
    return unifiedSearchTerms
      .filter((row) => row.clicks >= NEGATIVE_CLICK_THRESHOLD && row.orders === 0 && row.units === 0)
      .map((row) => ({
        ...row,
        suggestedNegativeType:
          row.matchType && row.matchType.toLowerCase().includes("broad")
            ? "Negative Phrase"
            : "Negative Exact",
        alreadyBlocked: existingNegativeSet.has(`${row.adType}||${row.searchTerm.toLowerCase()}`),
      }))
      .sort((a, b) => b.spend - a.spend);
  }, [unifiedSearchTerms, existingNegativeSet]);

  // Tabs
  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "whatChanged", label: "What Changed?", icon: Activity },
    { id: "alerts", label: "Alerts", icon: Bell },
    { id: "pnl", label: "P&L", icon: Wallet },
    { id: "advertising", label: "Advertising", icon: Megaphone },
    { id: "campaignTrends", label: "Campaign Trends", icon: TrendingUp },
    { id: "targeting", label: "Targeting", icon: Search },
    { id: "searchTerms", label: "Search Terms", icon: ShieldMinus },
    { id: "inventory", label: "Inventory", icon: Warehouse },
    { id: "catalog", label: "Catalog", icon: Package },
    { id: "buyBox", label: "Buy Box", icon: ShoppingBag },
    { id: "listingQuality", label: "Listing Quality", icon: FileText },
    { id: "returns", label: "Returns", icon: RefreshCw },
    { id: "sellThrough", label: "1P Sell-Through", icon: Boxes },
    { id: "launchTracker", label: "Launch Tracker", icon: Rocket },
    { id: "pricingParity", label: "Pricing Parity", icon: Tags },
    { id: "channelComparison", label: "Channel Comparison", icon: Globe },
    { id: "promotionsFees", label: "Promotions & Fees", icon: Receipt },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ].filter((t) => t.id !== "sellThrough" || activeScope.includes("wmt1p"));

  // Period options = union of months across every channel currently in scope.
  // Must come BEFORE any early-return so React's hook ordering stays stable
  // between loading=true and loading=false renders. (Was breaking with #310.)
  const periodOptions = useMemo(() => {
    const set = new Set();
    for (const c of activeScope) {
      for (const ym of loadedMonthsByChannel[c] || []) set.add(ym);
    }
    return Array.from(set).sort().reverse().map((ym) => ({
      value: ym,
      label: ymToLabel(ym),
    }));
  }, [activeScope, loadedMonthsByChannel]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading live channel data...
      </div>
    );
  }

  const channelOptions = enabledChannels.length
    ? enabledChannels.map((c) => ({ value: c.code, label: c.name }))
    : [{ value: "amzsc", label: "Amazon Seller Central (default)" }];

  // Channel scope selection
  const scopeLabel = activeScope.length === 1
    ? activeScope[0] === "amzsc" ? "Amazon SC" : activeScope[0]
    : activeScope.length === 2 && activeScope.includes("amzsc") && activeScope.includes("amzvc") ? "Amazon Combined"
    : activeScope.length > 1 && activeScope.every((c) => c.startsWith("wmt")) ? "Walmart Combined"
    : `${activeScope.length} channels`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="border-r border-slate-900 bg-slate-950/80 p-5 backdrop-blur xl:sticky xl:top-0 xl:h-screen">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-white p-1.5">
                <img
                  src={LOGO_URL}
                  alt="Client Logo"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{BRAND_NAME}</p>
                <p className="text-sm text-slate-400">Multi-Channel Dashboard</p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-[11px] uppercase tracking-wider text-slate-500">
              Channel Scope
            </p>
            <div className="space-y-2">
              {(() => {
                const amazonGroup = channels.filter((c) => ["amzsc", "amzvc"].includes(c.code) && c.enabled).map((c) => c.code);
                const walmartGroup = channels.filter((c) => ["wmt1p", "wmt3p", "wmtother"].includes(c.code) && c.enabled).map((c) => c.code);
                const allEnabled = enabledChannels.map((c) => c.code);
                const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
                const isAmazonCombined = amazonGroup.length > 0 && sameSet(activeScope, amazonGroup);
                const isWalmartCombined = walmartGroup.length > 0 && sameSet(activeScope, walmartGroup);
                const isAllChannels = allEnabled.length > 0 && sameSet(activeScope, allEnabled);
                const isSingle = activeScope.length === 1 && !isAmazonCombined && !isWalmartCombined && !isAllChannels;
                const isCustom = !isAmazonCombined && !isWalmartCombined && !isAllChannels && !isSingle;

                const setSingle = (code) => setActiveScope([code]);
                const toggleInScope = (code) => {
                  setActiveScope((prev) => {
                    const next = prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code];
                    return next.length === 0 ? [code] : next;
                  });
                };

                return (
                  <>
                    <button
                      onClick={() => amazonGroup.length && setActiveScope(amazonGroup)}
                      disabled={amazonGroup.length === 0}
                      className={cn(
                        "block w-full text-left px-3 py-2 rounded-2xl border text-xs transition disabled:opacity-40 disabled:cursor-not-allowed",
                        isAmazonCombined
                          ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                          : "border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900"
                      )}
                    >
                      Amazon Combined {amazonGroup.length > 0 && <span className="text-slate-500">({amazonGroup.length})</span>}
                    </button>
                    <button
                      onClick={() => walmartGroup.length && setActiveScope(walmartGroup)}
                      disabled={walmartGroup.length === 0}
                      className={cn(
                        "block w-full text-left px-3 py-2 rounded-2xl border text-xs transition disabled:opacity-40 disabled:cursor-not-allowed",
                        isWalmartCombined
                          ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                          : "border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900"
                      )}
                    >
                      Walmart Combined {walmartGroup.length > 0 && <span className="text-slate-500">({walmartGroup.length})</span>}
                    </button>
                    <button
                      onClick={() => allEnabled.length && setActiveScope(allEnabled)}
                      disabled={allEnabled.length === 0}
                      className={cn(
                        "block w-full text-left px-3 py-2 rounded-2xl border text-xs transition disabled:opacity-40 disabled:cursor-not-allowed",
                        isAllChannels
                          ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                          : "border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900"
                      )}
                    >
                      All Channels {allEnabled.length > 0 && <span className="text-slate-500">({allEnabled.length})</span>}
                    </button>
                    <select
                      value={isSingle ? activeScope[0] : "__none__"}
                      onChange={(e) => {
                        if (e.target.value && e.target.value !== "__none__") setSingle(e.target.value);
                      }}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                    >
                      <option value="__none__">Pick a single channel…</option>
                      {enabledChannels.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                    <details className="rounded-2xl border border-slate-800 bg-slate-950" open={isCustom}>
                      <summary className="cursor-pointer list-none px-3 py-2 text-xs text-slate-300 hover:bg-slate-900 rounded-2xl">
                        Custom… {isCustom && <span className="text-cyan-300">({activeScope.length} selected)</span>}
                      </summary>
                      <div className="space-y-1 px-3 pb-3 pt-1">
                        {enabledChannels.length === 0 && (
                          <p className="text-xs text-slate-500">No enabled channels in <code>channel_config</code>.</p>
                        )}
                        {enabledChannels.map((c) => {
                          const checked = activeScope.includes(c.code);
                          return (
                            <label key={c.code} className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1 text-xs text-slate-300 hover:bg-slate-900">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleInScope(c.code)}
                                className="h-3.5 w-3.5 accent-cyan-400"
                              />
                              <span className="flex-1 truncate">{c.name}</span>
                              <span className="font-mono text-[10px] text-slate-500">{c.code}</span>
                            </label>
                          );
                        })}
                      </div>
                    </details>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="mt-5 space-y-1.5">
            {tabs.map((tab) => {
              // Amazon-only pages (read SP/SB/SD bulk sheets directly).
              const amzscOnly = ["advertising", "inventory", "catalog"];
              // Channel-aware pages (Amazon OR any Walmart account).
              const channelAware = ["campaignTrends", "targeting", "searchTerms"];
              const hasAmzsc = activeScope.includes("amzsc");
              const hasWalmart = activeScope.some((c) => ["wmt1p", "wmt3p", "wmtother"].includes(c));
              let isVisible = true;
              if (amzscOnly.includes(tab.id)) isVisible = hasAmzsc;
              else if (channelAware.includes(tab.id)) isVisible = hasAmzsc || hasWalmart;
              if (!isVisible) return null;
              return (
                <SidebarButton
                  key={tab.id}
                  active={activeTab === tab.id}
                  icon={tab.icon}
                  label={tab.label}
                  onClick={() => setActiveTab(tab.id)}
                />
              );
            })}
          </div>
        </aside>

        {/* Main */}
        <main className="p-4 md:p-6 xl:p-8">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                {BRAND_NAME} Dashboard
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                {scopeLabel} · Live channel data, synced hourly.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search SKU, ASIN, title..."
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-10 py-3 text-sm text-white outline-none placeholder:text-slate-500 md:w-80"
                />
              </div>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh data
              </button>
            </div>
          </div>

          {error ? (
            <div className="mb-6 rounded-2xl border border-rose-900 bg-rose-500/10 p-4 text-sm text-rose-300">
              {error}
            </div>
          ) : null}

          {/* ===================== OVERVIEW ===================== */}
          {activeTab === "overview" && (() => {
            // Pre-compute Overview data: monthly trend, top movers, top alerts
            const monthlySalesByYm = {};
            for (const r of settlementRows) {
              if (r.type !== "order") continue;
              monthlySalesByYm[r.ym] = (monthlySalesByYm[r.ym] || 0) + (r.productSales || 0);
            }
            const trendMonths = Object.keys(monthlySalesByYm).sort();
            const trendValues = trendMonths.map((m) => monthlySalesByYm[m]);
            const trendMax = Math.max(...trendValues, 1);
            const latestSales = trendValues[trendValues.length - 1] || 0;
            const priorSales = trendValues[trendValues.length - 2] || 0;
            const momChange = priorSales > 0 ? ((latestSales - priorSales) / priorSales) * 100 : 0;

            // Inventory urgency snapshot
            const urgentInv = inventoryByAsin.filter((r) => r.urgency === "urgent").length;
            const replenishInv = inventoryByAsin.filter((r) => r.urgency === "replenish").length;

            // Quick health roll-up of every module
            const moduleStatus = [
              { name: "P&L", live: settlementRows.length > 0, detail: settlementRows.length > 0 ? `${settlementRows.length.toLocaleString()} rows · ${pnlPeriod ? ymToLabel(pnlPeriod) : "—"}` : "Add settlement data" },
              { name: "Advertising", live: spCampaigns.length > 0 || sbCampaigns.length > 0 || sdCampaigns.length > 0, detail: `${spCampaigns.length + sbCampaigns.length + sdCampaigns.length} campaign rows` },
              { name: "Campaign Trends", live: (spCampaigns7.length || spCampaigns60.length || sbCampaigns7.length || sbCampaigns60.length) > 0, detail: "7/30/60-day trend data" },
              { name: "Targeting", live: spCampaigns.length > 0, detail: `${spCampaigns.length} SP rows` },
              { name: "Search Terms", live: spSearchTerms.length > 0 || sbSearchTerms.length > 0, detail: `${spSearchTerms.length + sbSearchTerms.length} term rows` },
              { name: "Inventory", live: inventoryByAsin.length > 0, detail: `${inventoryByAsin.length} ASINs tracked` },
              { name: "Catalog", live: spCampaigns.length > 0 && itemRefSheet.length > 0, detail: `${itemRefSheet.length} ref rows` },
              { name: "Listing Quality", live: listingQualitySheet.length > 0, detail: `${listingQualitySheet.length} audits` },
              { name: "Returns", live: settlementRows.length > 0, detail: "Auto-derived from settlement" },
              { name: "Launch Tracker", live: launchTrackerSheet.length > 0, detail: `${launchTrackerSheet.length} launches` },
              { name: "Pricing Parity", live: pricingSnapshotSheet.length > 0, detail: pricingSnapshotTabName || "pricing_snapshot" },
              { name: "Buy Box", live: Object.keys(buyBoxByMonth).length > 0, detail: `${Object.keys(buyBoxByMonth).length} months` },
              { name: "Promotions & Fees", live: promotionsSheet.length > 0 || settlementRows.length > 0, detail: `${promotionsSheet.length} deals` },
              { name: "What Changed", live: settlementRows.length > 0, detail: trafficByAsinByMonth.size > 0 ? "Full traffic decomposition" : "Settlement-only" },
              { name: "Alerts", live: settlementRows.length > 0 || inventoryByAsin.length > 0, detail: "Auto-recomputed each load" },
              { name: "Channel Comparison", live: Object.keys(loadedMonthsByChannel).length >= 2, detail: `${Object.keys(loadedMonthsByChannel).length} channels with data` },
            ];

            return (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Net Revenue (selected month)"
                  value={pnl.net_revenue || 0}
                  icon={DollarSign}
                  tone="cyan"
                />
                <StatCard
                  label="Gross Profit"
                  value={pnl.gross_profit || 0}
                  icon={TrendingUp}
                  tone={(pnl.gross_profit || 0) >= 0 ? "emerald" : "rose"}
                />
                <StatCard
                  label="Net Profit"
                  value={pnl.net_profit || 0}
                  icon={Wallet}
                  tone={(pnl.net_profit || 0) >= 0 ? "emerald" : "rose"}
                />
                <StatCard
                  label="Net Margin"
                  value={pnl.net_margin || 0}
                  suffix="%"
                  icon={BarChart3}
                  tone={(pnl.net_margin || 0) >= 10 ? "emerald" : (pnl.net_margin || 0) >= 0 ? "amber" : "rose"}
                />
              </div>

              {trendMonths.length >= 2 && (
                <SectionCard
                  title="Revenue Trend"
                  subtitle={`Product sales by month — ${trendMonths.length} months in scope${momChange !== 0 ? `, MoM ${momChange >= 0 ? "+" : ""}${momChange.toFixed(1)}%` : ""}`}
                >
                  <div className="flex items-end justify-between gap-1 overflow-x-auto pb-2" style={{ minHeight: 140 }}>
                    {trendMonths.map((ym, i) => {
                      const v = trendValues[i];
                      const h = Math.max(4, (v / trendMax) * 120);
                      const isLatest = i === trendMonths.length - 1;
                      return (
                        <div key={ym} className="flex flex-1 min-w-[40px] flex-col items-center gap-1">
                          <div className="text-[10px] font-mono text-slate-400">{currency(v)}</div>
                          <div
                            className={cn("w-full rounded-t", isLatest ? "bg-cyan-400" : "bg-slate-700")}
                            style={{ height: `${h}px` }}
                            title={`${ymToLabel(ym)}: ${currency(v)}`}
                          />
                          <div className="text-[10px] text-slate-500">{ymToShort(ym)}</div>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Urgent Inventory</p>
                    <AlertTriangle className="h-4 w-4 text-rose-300" />
                  </div>
                  <p className="mt-2 font-mono text-2xl text-white">{urgentInv}</p>
                  <p className="text-xs text-slate-400">ASINs under 14 days of cover</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Replenish Watchlist</p>
                    <Package className="h-4 w-4 text-amber-300" />
                  </div>
                  <p className="mt-2 font-mono text-2xl text-white">{replenishInv}</p>
                  <p className="text-xs text-slate-400">ASINs under 60 days of cover</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Ad Spend (current)</p>
                    <Megaphone className="h-4 w-4 text-cyan-300" />
                  </div>
                  <p className="mt-2 font-mono text-2xl text-white">{currency(adSpendCurrentMonth)}</p>
                  <p className="text-xs text-slate-400">From SP/SB/SD campaigns in scope</p>
                </div>
              </div>

              <SectionCard
                title="Loaded Channels"
                subtitle="Channels currently enabled via the channel_config sheet."
              >
                {enabledChannels.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No channels enabled yet. Add rows to the{" "}
                    <code className="text-cyan-300">channel_config</code> sheet to switch
                    them on.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                    {enabledChannels.map((c) => {
                      const months = loadedMonthsByChannel[c.code] || [];
                      const inScope = activeScope.includes(c.code);
                      let detail;
                      if (months.length) {
                        detail = `${months.length} months loaded · latest ${ymToShort(months[0])}`;
                      } else if (c.code === "wmt1p") {
                        const stWeeks = new Set(
                          (wmt1pSellthroughSheet || []).map((r) => String(pick(r, ["week_ending", "Week Ending"], "")))
                        ).size;
                        const adRows = Array.isArray(wmt1pCampaigns30) ? wmt1pCampaigns30.length : 0;
                        const parts = [];
                        if (stWeeks > 1) parts.push(`Sell-through: ${stWeeks} weeks`);
                        if (adRows > 0) parts.push("ads live");
                        detail = parts.length ? parts.join(" · ") : "No sales data yet";
                      } else if (c.code === "shopify") {
                        detail = "Pipeline connected · data syncing";
                      } else {
                        detail = "No settlement data yet";
                      }
                      return (
                        <div
                          key={c.code}
                          className={cn(
                            "rounded-2xl border p-4",
                            inScope
                              ? "border-cyan-400/40 bg-cyan-400/5"
                              : "border-slate-800 bg-slate-950"
                          )}
                        >
                          <p className="text-sm font-medium text-white">{c.name}</p>
                          <p className="mt-1 text-xs text-slate-400">{detail}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>

              <SectionCard
                title="Module Status"
                subtitle="Live data status for every page. Green = receiving data; amber = needs sheet population."
              >
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {moduleStatus.map((m) => (
                    <div
                      key={m.name}
                      className={cn(
                        "flex items-start gap-3 rounded-2xl border p-3",
                        m.live ? "border-emerald-400/20 bg-emerald-400/5" : "border-amber-400/20 bg-amber-400/5"
                      )}
                    >
                      <div className={cn("mt-0.5 h-2 w-2 flex-shrink-0 rounded-full", m.live ? "bg-emerald-400" : "bg-amber-400")} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">{m.name}</p>
                        <p className="text-xs text-slate-400">{m.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          );
          })()}

          {/* ===================== WHAT CHANGED? ===================== */}
          {activeTab === "whatChanged" && (
            <WhatChangedPage
              settlementRows={settlementRows}
              cogsMap={cogsMap}
              referenceByAsin={referenceByAsin}
              trafficByAsinByMonth={trafficByAsinByMonth}
            />
          )}

          {/* ===================== ALERTS ===================== */}
          {activeTab === "alerts" && (
            <AlertsPage
              settlementRows={settlementRows}
              inventoryByAsin={inventoryByAsin}
              cogsMap={cogsMap}
              referenceByAsin={referenceByAsin}
              trafficByAsinByMonth={trafficByAsinByMonth}
            />
          )}

          {/* ===================== P&L ===================== */}
          {activeTab === "pnl" && (() => {
            // Build loaded-months union across active scope, latest first.
            const monthSet = new Set();
            for (const c of activeScope) {
              for (const ym of loadedMonthsByChannel[c] || []) monthSet.add(ym);
            }
            const loadedMonthsUnion = Array.from(monthSet).sort().reverse();
            // Multi-channel-aware label
            const channelLabel = (() => {
              if (activeScope.length === 1) {
                const ch = channels.find((c) => c.code === activeScope[0]);
                return ch ? ch.name : activeScope[0];
              }
              const amzGroup = ["amzsc", "amzvc"];
              const wmtGroup = ["wmt1p", "wmt3p", "wmtother"];
              if (activeScope.every((c) => amzGroup.includes(c)) && activeScope.length === 2) return "Amazon Combined";
              if (activeScope.every((c) => wmtGroup.includes(c))) return "Walmart Combined";
              const enabledCodes = channels.filter((c) => c.enabled).map((c) => c.code);
              if (activeScope.length === enabledCodes.length && enabledCodes.every((c) => activeScope.includes(c))) return "All Channels Combined";
              return `Combined: ${activeScope.length} channels`;
            })();
            return (
              <PnLPage
                pnl={pnl}
                pnlPeriod={pnlPeriod}
                setPnlPeriod={setPnlPeriod}
                periodOptions={periodOptions}
                loadedMonths={loadedMonthsUnion}
                asinRows={asinSort.sortedRows}
                asinSort={asinSort}
                channelName={channelLabel}
                hasCogs={cogsMap.size > 0}
                hasFixedCosts={fixedCosts.length > 0}
                hasAdSpend={adSpendForPeriod > 0}
              />
            );
          })()}

          {/* ===================== ADVERTISING (FSN) ===================== */}
          {activeTab === "advertising" && (
            <>
              <MultiChannelWarning activeScope={activeScope} channels={channels} requiredChannel="amzsc" />
              <AdvertisingPage
                spCampaigns={spCampaigns}
                sbCampaigns={sbCampaigns}
                sdCampaigns={sdCampaigns}
              />
            </>
          )}

          {/* ===================== CAMPAIGN TRENDS (channel-aware) ===================== */}
          {activeTab === "campaignTrends" && (
            <CampaignTrendsPage campaignTrends={campaignTrends} />
          )}

          {/* ===================== TARGETING (channel-aware) ===================== */}
          {activeTab === "targeting" && (
            <TargetingPage
              spCampaigns={spCampaigns}
              referenceByAsin={referenceByAsin}
            />
          )}

          {/* ===================== SEARCH TERMS (channel-aware) ===================== */}
          {activeTab === "searchTerms" && (
            <SearchTermsPage
              recommendedNegatives={recommendedNegatives}
              unifiedSearchTerms={unifiedSearchTerms}
            />
          )}

          {/* ===================== INVENTORY (FSN) ===================== */}
          {activeTab === "inventory" && (
            <>
              <MultiChannelWarning activeScope={activeScope} channels={channels} requiredChannel="amzsc" />
              <InventoryPage
                inventoryByAsin={inventoryByAsin}
              />
            </>
          )}

          {/* ===================== CATALOG (FSN) ===================== */}
          {activeTab === "catalog" && (
            <>
              <MultiChannelWarning activeScope={activeScope} channels={channels} requiredChannel="amzsc" />
              <CatalogPage
                spCampaigns={spCampaigns}
                sbCampaigns={sbCampaigns}
                sdCampaigns={sdCampaigns}
                referenceByAsin={referenceByAsin}
                isFbmOnly={isFbmOnly}
              />
            </>
          )}

          {/* ===================== BUY BOX ===================== */}
          {activeTab === "buyBox" && (
            <BuyBoxPage buyBoxByMonth={buyBoxByMonth} referenceByAsin={referenceByAsin} />
          )}

          {/* ===================== LISTING QUALITY ===================== */}
          {activeTab === "listingQuality" && (
            <ListingQualityPage rows={listingQualitySheet} activeScope={activeScope} />
          )}

          {/* ===================== RETURNS ===================== */}
          {activeTab === "returns" && (
            <ReturnsPage settlementRows={settlementRows} cogsMap={cogsMap} referenceByAsin={referenceByAsin} />
          )}

          {/* ===================== 1P SELL-THROUGH ===================== */}
          {activeTab === "sellThrough" && (
            <SellThroughPage rows={wmt1pSellthroughSheet} />
          )}

          {/* ===================== LAUNCH TRACKER ===================== */}
          {activeTab === "launchTracker" && (
            <LaunchTrackerPage rows={launchTrackerSheet} settlementRows={settlementRows} referenceByAsin={referenceByAsin} />
          )}

          {/* ===================== PRICING PARITY ===================== */}
          {activeTab === "pricingParity" && (
            <PricingParityPage rows={pricingSnapshotSheet} snapshotName={pricingSnapshotTabName} channels={channels} />
          )}

          {/* ===================== CHANNEL COMPARISON ===================== */}
          {activeTab === "channelComparison" && (
            <ChannelComparisonPage
              settlementByMonth={settlementByMonth}
              cogsMap={cogsMap}
              fixedCosts={fixedCosts}
              channels={channels}
              activeScope={activeScope}
              pnlPeriod={pnlPeriod}
            />
          )}

          {/* ===================== PROMOTIONS & FEES ===================== */}
          {activeTab === "promotionsFees" && (
            <PromotionsFeesPage promotions={promotionsSheet} settlementRows={settlementRows} />
          )}

          {/* ===================== SETTINGS ===================== */}
          {activeTab === "settings" && (
            <SettingsPage
              channels={channels}
              loadedMonthsByChannel={loadedMonthsByChannel}
              cogsCount={cogsMap.size}
              fixedCostsCount={fixedCosts.length}
              hasAdData={!!(spCampaigns.length || sbCampaigns.length || sdCampaigns.length)}
              sheetId={SHEET_ID}
              settlementByMonth={settlementByMonth}
              trafficByMonth={trafficByMonth}
              settlementRows={settlementRows}
              spCampaignsCount={spCampaigns.length}
              sbCampaignsCount={sbCampaigns.length}
              sdCampaignsCount={sdCampaigns.length}
              listingQualityCount={listingQualitySheet.length}
              pricingSnapshotCount={pricingSnapshotSheet.length}
              launchTrackerCount={launchTrackerSheet.length}
              promotionsCount={promotionsSheet.length}
              buyBoxByMonth={buyBoxByMonth}
              inventoryFbaCount={inventoryFba.length}
              inventoryAwdCount={inventoryAwd.length}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// =============================================================================
// PnL PAGE
// =============================================================================

function PnLPage({
  pnl,
  pnlPeriod,
  setPnlPeriod,
  periodOptions,
  loadedMonths,
  asinRows,
  asinSort,
  channelName,
  hasCogs,
  hasFixedCosts,
  hasAdSpend,
}) {
  if (loadedMonths.length === 0) {
    return (
      <EmptyStateCard
        title="P&L — no settlement data yet"
        icon={Wallet}
        body={`The P&L module computes revenue, fees, COGS, and profit directly from monthly Amazon settlement exports. Drop your settlement file for any month into a sheet tab and refresh. ${channelName} has no months loaded yet.`}
        requiredSheets={[
          "amzsc_settlement_<YYYY>_<MM>  (one tab per month)",
          "cogs  (sku, asin, unit_cost_landed, effective_date)",
          "fixed_costs_monthly  (month, channel, category, amount)",
          "channel_config  (channel_code, channel_name, enabled, account_label)",
        ]}
      />
    );
  }

  const formatCell = (id, value) => {
    const meta = PNL_LINE_ITEMS.find((i) => i.id === id);
    if (meta?.isPct) return pct(value);
    return currencyDetailed(value);
  };

  const pnlExportColumns = [
    { key: "label", label: "Line Item" },
    { key: "amount", label: "Amount", accessor: (r) => Number((r.amount || 0).toFixed(2)) },
  ];
  const pnlExportRows = PNL_LINE_ITEMS.filter((i) => !i.section).map((i) => ({
    label: i.label,
    amount: pnl[i.id],
  }));

  const asinColumns = [
    {
      key: "sku",
      label: "SKU",
      type: "text",
      render: (r) => (
        <div>
          <div className="font-medium text-cyan-300">{r.sku || "—"}</div>
          {r.asin ? <div className="text-xs text-slate-400">{r.asin}</div> : null}
        </div>
      ),
    },
    {
      key: "title",
      label: "Title",
      type: "text",
      render: (r) => (
        <div className="max-w-xs truncate text-xs text-slate-300">{r.title || "—"}</div>
      ),
    },
    { key: "units", label: "Units", type: "number", render: (r) => numberFmt(r.units) },
    {
      key: "revenue",
      label: "Revenue",
      type: "number",
      render: (r) => currency(r.revenue),
    },
    {
      key: "refunds",
      label: "Refunds",
      type: "number",
      render: (r) => currency(r.refunds),
    },
    {
      key: "netRevenue",
      label: "Net Rev",
      type: "number",
      render: (r) => currency(r.netRevenue),
    },
    {
      key: "cogs",
      label: "COGS",
      type: "number",
      render: (r) => currency(r.cogs),
    },
    {
      key: "sellingFees",
      label: "Comm.",
      type: "number",
      render: (r) => currency(r.sellingFees),
    },
    {
      key: "fbaFees",
      label: "FBA Fees",
      type: "number",
      render: (r) => currency(r.fbaFees),
    },
    {
      key: "contribution",
      label: "Contribution",
      type: "number",
      render: (r) => (
        <span className={cn(r.contribution >= 0 ? "text-emerald-300" : "text-rose-300")}>
          {currency(r.contribution)}
        </span>
      ),
    },
    {
      key: "margin",
      label: "Margin",
      type: "number",
      render: (r) => (
        <span className={cn(r.margin >= 0 ? "text-emerald-300" : "text-rose-300")}>
          {pct(r.margin)}
        </span>
      ),
    },
  ];

  const asinExportColumns = [
    { key: "sku", label: "SKU" },
    { key: "asin", label: "ASIN" },
    { key: "title", label: "Title" },
    { key: "units", label: "Units" },
    { key: "revenue", label: "Revenue", accessor: (r) => Number(r.revenue.toFixed(2)) },
    { key: "refunds", label: "Refunds", accessor: (r) => Number(r.refunds.toFixed(2)) },
    {
      key: "netRevenue",
      label: "Net Revenue",
      accessor: (r) => Number(r.netRevenue.toFixed(2)),
    },
    { key: "cogs", label: "COGS", accessor: (r) => Number(r.cogs.toFixed(2)) },
    {
      key: "sellingFees",
      label: "Selling Fees",
      accessor: (r) => Number(r.sellingFees.toFixed(2)),
    },
    { key: "fbaFees", label: "FBA Fees", accessor: (r) => Number(r.fbaFees.toFixed(2)) },
    {
      key: "contribution",
      label: "Contribution",
      accessor: (r) => Number(r.contribution.toFixed(2)),
    },
    { key: "margin", label: "Margin %", accessor: (r) => Number(r.margin.toFixed(2)) },
  ];

  return (
    <div className="space-y-6">
      <SectionCard
        title="P&L Statement"
        subtitle={`${channelName} · ${pnlPeriod ? ymToLabel(pnlPeriod) : "Select a period"}`}
        right={
          <div className="flex items-center gap-3">
            <div className="min-w-[200px]">
              <FilterSelect
                label="Period"
                value={pnlPeriod}
                onChange={setPnlPeriod}
                options={periodOptions}
              />
            </div>
            <ExportButton
              filename={`pnl_${pnlPeriod}.csv`}
              rows={pnlExportRows}
              columns={pnlExportColumns}
            />
          </div>
        }
      >
        {!hasCogs && (
          <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-300">
            COGS sheet is empty — Cost of Goods is using Amazon's reported Unit Cost from
            the settlement file. Populate the <code>cogs</code> tab with your landed cost
            per SKU for accurate profit numbers.
          </div>
        )}
        {!hasFixedCosts && (
          <div className="mb-4 rounded-2xl border border-slate-700 bg-slate-900 p-3 text-xs text-slate-400">
            <code>fixed_costs_monthly</code> tab is empty — Personnel Expenses will show
            $0. Add a row per month for any recurring fixed costs (agency fees, subscriptions, etc.).
          </div>
        )}
        {!hasAdSpend && (
          <div className="mb-4 rounded-2xl border border-slate-700 bg-slate-900 p-3 text-xs text-slate-400">
            No ad spend detected from <code>Sponsored Products / Brands / Display Campaigns</code>
            tabs — Amazon Advertising line will show $0 until those are populated.
          </div>
        )}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <tbody className="divide-y divide-slate-900">
              {PNL_LINE_ITEMS.map((item) => {
                if (item.section) {
                  return (
                    <tr key={item.id} className="bg-slate-900/40">
                      <td
                        colSpan={2}
                        className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400"
                      >
                        {item.label}
                      </td>
                    </tr>
                  );
                }
                const value = pnl[item.id] ?? 0;
                const isNegative = value < 0;
                return (
                  <tr key={item.id} className={cn(item.emphasize && "bg-slate-900/20")}>
                    <td
                      className={cn(
                        "px-4 py-2",
                        item.emphasize ? "font-semibold text-white" : "text-slate-300"
                      )}
                    >
                      {item.label}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2 text-right font-mono tabular-nums",
                        item.emphasize ? "font-semibold text-white" : "text-slate-200",
                        isNegative && !item.isPct && "text-rose-300",
                        item.id === "net_profit" && value >= 0 && "text-emerald-300"
                      )}
                    >
                      {formatCell(item.id, value)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        title="P&L by Item"
        subtitle="Per-SKU contribution margin for the selected period."
        right={
          <ExportButton
            filename={`pnl_by_item_${pnlPeriod}.csv`}
            rows={asinRows}
            columns={asinExportColumns}
          />
        }
      >
        {asinRows.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-sm text-slate-400">
            No SKU activity for this period.
          </div>
        ) : (
          <SortableTable
            rowKey="sku"
            columns={asinColumns}
            rows={asinRows}
            sortConfig={asinSort.sortConfig}
            onSort={asinSort.handleSort}
          />
        )}
      </SectionCard>
    </div>
  );
}

// =============================================================================
// FSN PAGES (Advertising, Campaign Trends, Search Terms, Inventory, Catalog)
// =============================================================================

function AdvertisingPage({ spCampaigns, sbCampaigns, sdCampaigns }) {
  const allCampaigns = useMemo(() => {
    const sp = (spCampaigns || [])
      .filter((row) => normalizeText(pick(row, ["Entity", "entity"])).toLowerCase() === "campaign")
      .map((row) => {
        const spend = normalizeNumber(pick(row, ["Spend", "Cost"]));
        const sales = normalizeNumber(pick(row, ["Sales", "Attributed Sales"]));
        return {
          adType: "Sponsored Products",
          campaignName: normalizeText(pick(row, ["Campaign Name"])),
          state: normalizeText(pick(row, ["State"], "—")),
          spend,
          sales,
          orders: normalizeNumber(pick(row, ["Orders"])),
          impressions: normalizeNumber(pick(row, ["Impressions"])),
          clicks: normalizeNumber(pick(row, ["Clicks"])),
          roas: spend ? sales / spend : 0,
        };
      });
    const sb = (sbCampaigns || [])
      .filter((row) => normalizeText(pick(row, ["Entity", "entity"])).toLowerCase() === "campaign")
      .map((row) => {
        const spend = normalizeNumber(pick(row, ["Spend", "Cost"]));
        const sales = normalizeNumber(pick(row, ["Sales", "Attributed Sales"]));
        return {
          adType: "Sponsored Brands",
          campaignName: normalizeText(pick(row, ["Campaign Name"])),
          state: normalizeText(pick(row, ["State"], "—")),
          spend,
          sales,
          orders: normalizeNumber(pick(row, ["Orders"])),
          impressions: normalizeNumber(pick(row, ["Impressions"])),
          clicks: normalizeNumber(pick(row, ["Clicks"])),
          roas: spend ? sales / spend : 0,
        };
      });
    const sd = (sdCampaigns || [])
      .filter((row) => normalizeText(pick(row, ["Entity", "entity"])).toLowerCase() === "campaign")
      .map((row) => {
        const spend = normalizeNumber(pick(row, ["Spend", "Cost"]));
        const sales = normalizeNumber(pick(row, ["Sales", "Attributed Sales"]));
        return {
          adType: "Sponsored Display",
          campaignName: normalizeText(pick(row, ["Campaign Name"])),
          state: normalizeText(pick(row, ["State"], "—")),
          spend,
          sales,
          orders: normalizeNumber(pick(row, ["Orders"])),
          impressions: normalizeNumber(pick(row, ["Impressions"])),
          clicks: normalizeNumber(pick(row, ["Clicks"])),
          roas: spend ? sales / spend : 0,
        };
      });
    return [...sp, ...sb, ...sd];
  }, [spCampaigns, sbCampaigns, sdCampaigns]);

  const summary = useMemo(() => {
    return {
      spend: allCampaigns.reduce((s, r) => s + r.spend, 0),
      sales: allCampaigns.reduce((s, r) => s + r.sales, 0),
      orders: allCampaigns.reduce((s, r) => s + r.orders, 0),
      count: allCampaigns.length,
    };
  }, [allCampaigns]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Spend" value={summary.spend} icon={Megaphone} />
        <StatCard label="Total Sales" value={summary.sales} icon={DollarSign} />
        <CountCard label="Active Campaigns" value={summary.count} icon={BarChart3} />
        <StatCard label="ROAS" value={summary.spend ? summary.sales / summary.spend : 0} suffix="x" icon={TrendingUp} />
      </div>

      <SectionCard title="Campaigns" subtitle="All active campaigns across all ad types">
        {allCampaigns.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-sm text-slate-400">
            No campaigns loaded yet. Populate the Sponsored Products / Brands / Display Campaigns tabs.
          </div>
        ) : (
          <div className="space-y-2">
            {allCampaigns.slice(0, 20).map((row, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/40 p-3">
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">{row.campaignName || "—"}</p>
                  <p className="text-xs text-slate-400">{row.adType} • {row.state}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-cyan-300">{currency(row.spend)}</p>
                  <p className="text-xs text-slate-400">{row.roas && row.roas > 0 ? row.roas.toFixed(2) : "—"}x ROAS</p>
                </div>
              </div>
            ))}
            {allCampaigns.length > 20 && (
              <p className="text-center text-xs text-slate-500 pt-2">+{allCampaigns.length - 20} more campaigns</p>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function CampaignTrendsPage({ campaignTrends }) {
  return (
    <SectionCard
      title="Campaign Trends"
      subtitle="7/30/60-day ROAS trending: Improving → Declining, Hidden Gems, Bleeding campaigns."
    >
      {campaignTrends.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-sm text-slate-400">
          No campaign data loaded yet. Populate Sponsored Products / Brands / Display Campaigns sheets.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {campaignTrends.slice(0, 6).map((trend) => (
            <div key={`${trend.adType}||${trend.campaignName}`} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-cyan-300">{trend.campaignName}</p>
                  <p className="text-xs text-slate-400">{trend.adType}</p>
                </div>
                <CategoryPill categoryId={trend.category} />
              </div>
              <p className="mt-2 text-sm text-slate-300">Action: {CAMPAIGN_CATEGORIES.find(c => c.id === trend.category)?.action || "Monitor"}</p>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function SearchTermsPage({ recommendedNegatives, unifiedSearchTerms }) {
  const count = recommendedNegatives.length;
  return (
    <SectionCard
      title="Recommended Negatives"
      subtitle={`${count} search terms with ≥${NEGATIVE_CLICK_THRESHOLD} clicks and zero orders`}
    >
      {recommendedNegatives.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-sm text-slate-400">
          No recommended negatives (all high-click terms are converting).
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          {recommendedNegatives.slice(0, 5).map((row, i) => (
            <div key={i} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/40 p-3">
              <div>
                <p className="font-medium text-white">{row.searchTerm}</p>
                <p className="text-xs text-slate-400">{row.campaign} · {row.adType}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-cyan-300">{currency(row.spend)}</p>
                <p className="text-xs text-slate-400">{numberFmt(row.clicks)} clicks</p>
              </div>
            </div>
          ))}
          {recommendedNegatives.length > 5 && (
            <p className="text-xs text-slate-500 text-center">
              +{recommendedNegatives.length - 5} more
            </p>
          )}
        </div>
      )}
    </SectionCard>
  );
}

// =============================================================================
// INVENTORY PAGE (FSN port — days of cover, urgency pills, exports)
// =============================================================================

function InventoryPage({ inventoryByAsin = [] }) {
  if (!inventoryByAsin.length) {
    return (
      <EmptyStateCard
        title="Inventory"
        icon={Warehouse}
        body="Days-of-cover by ASIN across FBA + AWD, with urgency pills (urgent < 14d, replenish < 60d). Includes CSV export."
        requiredSheets={["inventory_fba", "inventory_awd", "products_30d", "item_data_reference"]}
      />
    );
  }
  const urgent = inventoryByAsin.filter((r) => r.urgency === "urgent");
  const replenish = inventoryByAsin.filter((r) => r.urgency === "replenish");
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CountCard label="Total FBA Units" value={inventoryByAsin.reduce((s, r) => s + (r.fbaUnits || 0), 0)} icon={Warehouse} />
        <CountCard label="Urgent (< 14d)" value={urgent.length} icon={AlertTriangle} tone="rose" />
        <CountCard label="Replenish (< 60d)" value={replenish.length} icon={Package} tone="amber" />
        <CountCard label="Total Products" value={inventoryByAsin.length} icon={Boxes} tone="slate" />
      </div>
      <SectionCard
        title="Low-Cover Inventory"
        subtitle="ASINs with less than 60 days of stock, sorted by urgency."
        right={
          <ExportButton
            filename="inventory-low-cover.csv"
            rows={inventoryByAsin.filter((r) => r.daysOfCover < DAYS_TO_SHIP_TARGET)}
            columns={[
              { key: "asin", label: "ASIN" },
              { key: "shortTitle", label: "Title" },
              { key: "fbaUnits", label: "FBA" },
              { key: "awdUnits", label: "AWD" },
              { key: "daysOfCover", label: "Days Cover" },
              { key: "urgency", label: "Urgency" },
            ]}
          />
        }
      >
        {inventoryByAsin.filter((r) => r.daysOfCover < DAYS_TO_SHIP_TARGET).length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-sm text-slate-400">All inventory levels look healthy.</div>
        ) : (
          <div className="space-y-2 text-sm">
            {inventoryByAsin
              .filter((r) => r.daysOfCover < DAYS_TO_SHIP_TARGET)
              .sort((a, b) => (a.daysOfCover || 0) - (b.daysOfCover || 0))
              .slice(0, 25)
              .map((row) => (
                <div key={row.asin} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/40 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <AsinImage src={row.imageUrl} title={row.shortTitle} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-cyan-300">{row.asin}</p>
                      <p className="truncate text-xs text-slate-400">{row.shortTitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-white">{daysLabel(row.daysOfCover)}</p>
                    {urgencyPill(row.daysOfCover)}
                  </div>
                </div>
              ))}
          </div>
        )}
      </SectionCard>
      <SectionCard
        title="All Inventory"
        subtitle={`${inventoryByAsin.length} ASINs across FBA + AWD`}
        right={
          <ExportButton
            filename="inventory-all.csv"
            rows={inventoryByAsin}
            columns={[
              { key: "asin", label: "ASIN" },
              { key: "shortTitle", label: "Title" },
              { key: "fbaUnits", label: "FBA Units" },
              { key: "awdUnits", label: "AWD Units" },
              { key: "daysOfCover", label: "Days of Cover" },
              { key: "urgency", label: "Urgency" },
            ]}
          />
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="px-3 py-2">ASIN</th>
                <th className="px-3 py-2 text-right">FBA</th>
                <th className="px-3 py-2 text-right">AWD</th>
                <th className="px-3 py-2 text-right">Days Cover</th>
                <th className="px-3 py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventoryByAsin.slice(0, 250).map((row) => (
                <tr key={row.asin} className="border-b border-slate-900 hover:bg-slate-900/30">
                  <td className="px-3 py-2 font-mono text-cyan-300">{row.asin}</td>
                  <td className="px-3 py-2 text-right font-mono text-white">{row.fbaUnits}</td>
                  <td className="px-3 py-2 text-right font-mono text-white">{row.awdUnits}</td>
                  <td className="px-3 py-2 text-right font-mono text-white">{daysLabel(row.daysOfCover)}</td>
                  <td className="px-3 py-2 text-right">{urgencyPill(row.daysOfCover)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// =============================================================================
// TARGETING PAGE (FSN port — competitor ASIN targets from SP campaigns)
// =============================================================================

function TargetingPage({ spCampaigns = [], referenceByAsin }) {
  const targets = useMemo(() => {
    if (!spCampaigns.length) return [];
    // SP bulk export rows use Amazon's verbose column labels — pick() with broad
    // fallbacks across the keyword / target / product-targeting variants.
    return spCampaigns
      .filter((c) => {
        const entity = normalizeText(pick(c, ["Entity", "entity"], "")).toLowerCase();
        // Keep keyword + product targeting rows, drop campaign/ad-group/portfolio shells
        return entity.includes("keyword") || entity.includes("product targeting") || entity === "target";
      })
      .map((c) => {
        const tgt = normalizeText(
          pick(c, ["Keyword Text", "Product Targeting Expression", "Target", "keyword", "targeting"], "")
        );
        const m = String(tgt).match(/B0[A-Z0-9]{8}/);
        const asin = m ? m[0] : null;
        const ref = asin && referenceByAsin && referenceByAsin.get ? referenceByAsin.get(asin) : null;
        const spend = num(pick(c, ["Spend", "Spend(USD)", "Cost"], 0));
        const sales = num(pick(c, ["Sales", "Sales(USD)", "14 Day Total Sales", "Sales 14 Day Total Sales", "Attributed Sales"], 0));
        const clicks = num(pick(c, ["Clicks"], 0));
        const impressions = num(pick(c, ["Impressions"], 0));
        const orders = num(pick(c, ["Orders", "Orders (#)"], 0));
        return {
          targeting: tgt || "—",
          asin,
          campaign: normalizeText(pick(c, ["Campaign Name (Informational only)", "Campaign Name", "Campaign"], "—")),
          impressions,
          clicks,
          spend,
          sales,
          orders,
          acos: spend > 0 && sales > 0 ? (spend / sales) * 100 : 0,
          roas: spend > 0 ? sales / spend : 0,
          imageUrl: ref ? ref.imageUrl : undefined,
          title: ref ? ref.title : undefined,
        };
      })
      .filter((t) => t.targeting !== "—" && (t.spend > 0 || t.clicks > 0))
      .sort((a, b) => b.spend - a.spend);
  }, [spCampaigns, referenceByAsin]);

  if (!targets.length) {
    return (
      <EmptyStateCard
        title="Targeting"
        icon={Target}
        body="Per-target performance for SP campaigns. Highlights competitor ASIN targets and recommends bid adjustments based on ROAS."
        requiredSheets={["Sponsored Products Campaigns"]}
      />
    );
  }
  const totalSpend = targets.reduce((s, t) => s + t.spend, 0);
  const totalSales = targets.reduce((s, t) => s + t.sales, 0);
  const totalOrders = targets.reduce((s, t) => s + t.orders, 0);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CountCard label="Total Targets" value={targets.length} icon={Target} />
        <StatCard label="Spend" value={currency(totalSpend)} icon={DollarSign} />
        <StatCard label="Sales" value={currency(totalSales)} icon={TrendingUp} tone="emerald" />
        <StatCard
          label="ACoS"
          value={totalSales > 0 ? `${((totalSpend / totalSales) * 100).toFixed(1)}%` : "—"}
          icon={Percent}
          tone={totalSpend / Math.max(totalSales, 1) > 0.35 ? "rose" : "cyan"}
        />
      </div>
      <SectionCard
        title="Targets by Spend"
        subtitle={`${targets.length} targets · ${totalOrders} orders`}
        right={
          <ExportButton
            filename="targeting.csv"
            rows={targets}
            columns={[
              { key: "targeting", label: "Target" },
              { key: "asin", label: "ASIN" },
              { key: "campaign", label: "Campaign" },
              { key: "clicks", label: "Clicks" },
              { key: "spend", label: "Spend" },
              { key: "sales", label: "Sales" },
              { key: "orders", label: "Orders" },
              { key: "acos", label: "ACoS %", accessor: (r) => Number((r.acos || 0).toFixed(2)) },
              { key: "roas", label: "ROAS", accessor: (r) => Number((r.roas || 0).toFixed(2)) },
            ]}
          />
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="px-3 py-2">Target</th>
                <th className="px-3 py-2 text-right">Clicks</th>
                <th className="px-3 py-2 text-right">Spend</th>
                <th className="px-3 py-2 text-right">Sales</th>
                <th className="px-3 py-2 text-right">ACoS</th>
                <th className="px-3 py-2 text-right">ROAS</th>
                <th className="px-3 py-2 text-right">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {targets.slice(0, 100).map((t, i) => {
                let rec = "Hold";
                let recTone = "text-slate-300";
                if (t.spend > 50 && t.orders === 0) { rec = "Pause / negate"; recTone = "text-rose-300"; }
                else if (t.roas >= 4) { rec = "Increase bid 15%"; recTone = "text-emerald-300"; }
                else if (t.roas > 0 && t.roas < 1) { rec = "Decrease bid 25%"; recTone = "text-amber-300"; }
                return (
                  <tr key={`${t.targeting}-${i}`} className="border-b border-slate-900 hover:bg-slate-900/30">
                    <td className="px-3 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        {t.asin ? <AsinImage src={t.imageUrl} title={t.title} /> : null}
                        <div className="min-w-0">
                          <p className="truncate font-mono text-cyan-300">{t.targeting}</p>
                          <p className="truncate text-xs text-slate-500">{t.campaign}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-white">{t.clicks}</td>
                    <td className="px-3 py-2 text-right font-mono text-white">{currency(t.spend)}</td>
                    <td className="px-3 py-2 text-right font-mono text-white">{currency(t.sales)}</td>
                    <td className="px-3 py-2 text-right font-mono text-white">{t.acos > 0 ? `${t.acos.toFixed(1)}%` : "—"}</td>
                    <td className="px-3 py-2 text-right font-mono text-white">{t.roas > 0 ? t.roas.toFixed(2) : "—"}</td>
                    <td className={cn("px-3 py-2 text-right text-xs", recTone)}>{rec}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// =============================================================================
// CATALOG PAGE (FSN port — product-level performance with FBM-only flag)
// =============================================================================

function CatalogPage({ spCampaigns = [], sbCampaigns = [], sdCampaigns = [], referenceByAsin, isFbmOnly }) {
  const rows = useMemo(() => {
    const byAsin = new Map();
    const all = [...spCampaigns, ...sbCampaigns, ...sdCampaigns];
    for (const c of all) {
      const tgt = String(c.targeting || c.keyword || c.name || c.campaignName || "");
      const m = tgt.match(/B0[A-Z0-9]{8}/);
      const asin = c.asin || (m ? m[0] : null);
      if (!asin) continue;
      const cur = byAsin.get(asin) || { asin, impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 };
      cur.impressions += num(c.impressions);
      cur.clicks += num(c.clicks);
      cur.spend += num(c.spend);
      cur.sales += num(c.sales);
      cur.orders += num(c.orders);
      byAsin.set(asin, cur);
    }
    const out = [];
    for (const [asin, agg] of byAsin) {
      const ref = (referenceByAsin && referenceByAsin.get && referenceByAsin.get(asin)) || {};
      out.push({
        ...agg,
        title: ref.title || "",
        shortTitle: ref.shortTitle || ref.title || "",
        sku: ref.sku || "",
        imageUrl: ref.imageUrl,
        fbm: typeof isFbmOnly === "function" ? !!isFbmOnly(asin) : false,
        acos: agg.spend > 0 && agg.sales > 0 ? (agg.spend / agg.sales) * 100 : 0,
        roas: agg.spend > 0 ? agg.sales / agg.spend : 0,
      });
    }
    out.sort((a, b) => b.spend - a.spend);
    return out;
  }, [spCampaigns, sbCampaigns, sdCampaigns, referenceByAsin, isFbmOnly]);

  if (!rows.length) {
    return (
      <EmptyStateCard
        title="Catalog"
        icon={Boxes}
        body="Per-ASIN ad performance with FBM-only flagging. Aggregates SP, SB, and SD spend/sales by ASIN and joins to item_data_reference for titles and images."
        requiredSheets={[
          "Sponsored Products Campaigns",
          "Sponsored Brands Campaigns",
          "Sponsored Display Campaigns",
          "item_data_reference",
          "FBM_only",
        ]}
      />
    );
  }
  const totalSpend = rows.reduce((s, r) => s + r.spend, 0);
  const totalSales = rows.reduce((s, r) => s + r.sales, 0);
  const fbmCount = rows.filter((r) => r.fbm).length;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CountCard label="ASINs Advertised" value={rows.length} icon={Boxes} />
        <CountCard label="FBM-only ASINs" value={fbmCount} icon={Tags} tone="amber" />
        <StatCard label="Spend" value={currency(totalSpend)} icon={DollarSign} />
        <StatCard label="Sales" value={currency(totalSales)} icon={TrendingUp} tone="emerald" />
      </div>
      <SectionCard
        title="Catalog Performance"
        subtitle={`${rows.length} ASINs · ${fbmCount} FBM-only`}
        right={
          <ExportButton
            filename="catalog.csv"
            rows={rows}
            columns={[
              { key: "asin", label: "ASIN" },
              { key: "sku", label: "SKU" },
              { key: "title", label: "Title" },
              { key: "fbm", label: "FBM Only", accessor: (r) => (r.fbm ? "Y" : "N") },
              { key: "clicks", label: "Clicks" },
              { key: "spend", label: "Spend" },
              { key: "sales", label: "Sales" },
              { key: "orders", label: "Orders" },
              { key: "acos", label: "ACoS %", accessor: (r) => Number((r.acos || 0).toFixed(2)) },
              { key: "roas", label: "ROAS", accessor: (r) => Number((r.roas || 0).toFixed(2)) },
            ]}
          />
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="px-3 py-2">ASIN</th>
                <th className="px-3 py-2 text-right">Clicks</th>
                <th className="px-3 py-2 text-right">Spend</th>
                <th className="px-3 py-2 text-right">Sales</th>
                <th className="px-3 py-2 text-right">Orders</th>
                <th className="px-3 py-2 text-right">ACoS</th>
                <th className="px-3 py-2 text-right">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 200).map((r) => (
                <tr key={r.asin} className="border-b border-slate-900 hover:bg-slate-900/30">
                  <td className="px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <AsinImage src={r.imageUrl} title={r.shortTitle} />
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 truncate font-mono text-cyan-300">
                          {r.asin}
                          {r.fbm && <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-[10px] text-amber-300">FBM</span>}
                        </p>
                        <p className="truncate text-xs text-slate-500">{r.shortTitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-white">{r.clicks}</td>
                  <td className="px-3 py-2 text-right font-mono text-white">{currency(r.spend)}</td>
                  <td className="px-3 py-2 text-right font-mono text-white">{currency(r.sales)}</td>
                  <td className="px-3 py-2 text-right font-mono text-white">{r.orders}</td>
                  <td className="px-3 py-2 text-right font-mono text-white">{r.acos > 0 ? `${r.acos.toFixed(1)}%` : "—"}</td>
                  <td className="px-3 py-2 text-right font-mono text-white">{r.roas > 0 ? r.roas.toFixed(2) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// =============================================================================
// WHAT CHANGED? PAGE — period-over-period sales/profit decomposition
// =============================================================================

function WhatChangedPage({ settlementRows = [], cogsMap, referenceByAsin, trafficByAsinByMonth }) {
  const [period, setPeriod] = useState("MoM");
  const hasTraffic = trafficByAsinByMonth && trafficByAsinByMonth.size > 0;

  const monthlyByAsin = useMemo(() => {
    const map = new Map();
    for (const r of settlementRows) {
      // settlement rows use SKU, not ASIN — translate via cogsMap
      const sku = r.sku;
      if (!sku) continue;
      const cogsEntry = cogsMap && cogsMap.get ? cogsMap.get(sku) : null;
      const asin = (cogsEntry && cogsEntry.asin) || sku;
      if (!asin) continue;
      // r.ym is YYYY_MM from parseSettlementSheet — keep underscored to match
      // trafficByAsinByMonth keys (also YYYY_MM)
      const ym = String(r.ym || "");
      if (!ym || ym.length !== 7) continue;
      const inner = map.get(asin) || new Map();
      const cur = inner.get(ym) || { units: 0, sales: 0, refunds: 0, refundUnits: 0, fees: 0 };
      const units = Math.abs(r.quantity || 0);
      const productSales = r.productSales || 0;
      const sellingFees = r.sellingFees || 0;
      const fbaFees = r.fbaFees || 0;
      const type = String(r.type || "").toLowerCase();
      if (type === "refund") {
        cur.refunds += Math.abs(productSales);
        cur.refundUnits += units;
        cur.fees += Math.abs(sellingFees) + Math.abs(fbaFees);
      } else if (type === "order") {
        cur.units += units;
        cur.sales += productSales;
        cur.fees += Math.abs(sellingFees) + Math.abs(fbaFees);
      }
      inner.set(ym, cur);
      map.set(asin, inner);
    }
    return map;
  }, [settlementRows, cogsMap]);

  const movers = useMemo(() => {
    const out = [];
    const allMonths = new Set();
    for (const inner of monthlyByAsin.values()) for (const m of inner.keys()) allMonths.add(m);
    if (trafficByAsinByMonth) {
      for (const inner of trafficByAsinByMonth.values()) for (const m of inner.keys()) allMonths.add(m);
    }
    const months = Array.from(allMonths).sort();
    if (months.length < 2) return out;
    const cur = months[months.length - 1];
    const prev = months[months.length - 2];

    // Union of ASINs across settlement and traffic
    const allAsins = new Set(monthlyByAsin.keys());
    if (trafficByAsinByMonth) for (const a of trafficByAsinByMonth.keys()) allAsins.add(a);

    for (const asin of allAsins) {
      const inner = monthlyByAsin.get(asin) || new Map();
      const c = inner.get(cur) || { units: 0, sales: 0, refunds: 0, fees: 0 };
      const p = inner.get(prev) || { units: 0, sales: 0, refunds: 0, fees: 0 };
      const dSales = c.sales - p.sales;
      const dUnits = c.units - p.units;
      const aspCur = c.units > 0 ? c.sales / c.units : 0;
      const aspPrev = p.units > 0 ? p.sales / p.units : 0;
      const dAsp = aspCur - aspPrev;
      const cogs = (cogsMap && cogsMap.get && cogsMap.get(asin)) || 0;
      const cmCur = c.sales - c.refunds - c.fees - cogs * c.units;
      const cmPrev = p.sales - p.refunds - p.fees - cogs * p.units;
      const dCm = cmCur - cmPrev;
      const ref = (referenceByAsin && referenceByAsin.get && referenceByAsin.get(asin)) || {};

      // Traffic-side metrics — sessions, CVR, OOS days deltas if available
      const tInner = trafficByAsinByMonth ? trafficByAsinByMonth.get(asin) : null;
      const tc = (tInner && tInner.get(cur)) || null;
      const tp = (tInner && tInner.get(prev)) || null;
      const sessionsCur = tc ? tc.sessions : 0;
      const sessionsPrev = tp ? tp.sessions : 0;
      const dSessions = sessionsCur - sessionsPrev;
      const sessionsPctChange = sessionsPrev > 0 ? (dSessions / sessionsPrev) * 100 : 0;
      const cvrCur = tc ? tc.cvr : 0;
      const cvrPrev = tp ? tp.cvr : 0;
      const dCvr = cvrCur - cvrPrev;
      const oosCur = tc ? tc.oosDays : 0;
      const oosPrev = tp ? tp.oosDays : 0;
      const dOos = oosCur - oosPrev;

      // Decompose drivers using traffic when available, settlement-only otherwise.
      let driver = "Mixed";
      let attribution;
      if (tc || tp) {
        // Compare relative magnitudes of traffic vs CVR vs price contributions.
        const trafficContribution = Math.abs(dSessions * Math.max(cvrPrev, 0.01) * Math.max(aspPrev, 1));
        const cvrContribution = Math.abs(dCvr * Math.max(sessionsPrev, 1) * Math.max(aspPrev, 1));
        const priceContribution = Math.abs(dAsp * Math.max(c.units, 1));
        const oosContribution = Math.abs(dOos * (Math.max(sessionsPrev, 1) / 30) * Math.max(cvrPrev, 0.01) * Math.max(aspPrev, 1));
        const max = Math.max(trafficContribution, cvrContribution, priceContribution, oosContribution);
        if (max === oosContribution && dOos > 0) driver = "Stockout";
        else if (max === trafficContribution) driver = dSessions < 0 ? "Traffic drop" : "Traffic gain";
        else if (max === cvrContribution) driver = dCvr < 0 ? "CVR drop" : "CVR lift";
        else driver = dAsp < 0 ? "Price cut" : "Price increase";

        const sessionsLabel = sessionsPctChange === 0 ? "sessions steady"
          : `${sessionsPctChange > 0 ? "+" : ""}${sessionsPctChange.toFixed(0)}% sessions`;
        const cvrLabel = Math.abs(dCvr) < 0.001 ? "CVR steady"
          : `CVR ${dCvr >= 0 ? "+" : ""}${(dCvr * 100).toFixed(1)}pp`;
        const stockoutLabel = dOos > 0 ? `, ${dOos}d more OOS` : "";

        attribution = dSales >= 0
          ? `Up ${currency(dSales)} — ${sessionsLabel}, ${cvrLabel}${stockoutLabel}`
          : `Down ${currency(Math.abs(dSales))} — ${sessionsLabel}, ${cvrLabel}${stockoutLabel}`;
      } else {
        if (dUnits !== 0 || dAsp !== 0) {
          if (Math.abs(dAsp * Math.max(c.units, 1)) > Math.abs(dUnits * Math.max(aspPrev, 1))) driver = "Price change";
          else driver = dUnits < 0 ? "Volume drop" : "Volume gain";
        }
        attribution = dSales >= 0
          ? `Up ${currency(dSales)} — ${dUnits >= 0 ? "+" + dUnits : dUnits} units, ASP ${dAsp >= 0 ? "+" : ""}${currency(dAsp)}`
          : `Down ${currency(Math.abs(dSales))} — ${dUnits} units, ASP ${dAsp >= 0 ? "+" : ""}${currency(dAsp)}`;
      }

      out.push({
        asin,
        title: ref.shortTitle || ref.title || "",
        imageUrl: ref.imageUrl,
        prevSales: p.sales,
        curSales: c.sales,
        dSales,
        dUnits,
        dAsp,
        dCm,
        dSessions,
        dCvr,
        dOos,
        sessionsPctChange,
        driver,
        attribution,
        cmAttribution: dCm >= 0
          ? `Up ${currency(dCm)} contribution`
          : `Down ${currency(Math.abs(dCm))} contribution`,
      });
    }
    return out;
  }, [monthlyByAsin, cogsMap, referenceByAsin, trafficByAsinByMonth]);

  if (!settlementRows.length) {
    return (
      <EmptyStateCard
        title="What Changed?"
        icon={Activity}
        body="Per-ASIN week-over-week and month-over-month sales delta, decomposed into traffic, CVR, price, and OOS days. Profit decomposition attributes shifts to ad spend, fee creep, return rate, and margin."
        requiredSheets={[
          "amzsc_settlement_<YYYY>_<MM>",
          "amzsc_traffic_<YYYY>_<MM>  (Detail Page Sales and Traffic by Child Item — for full traffic/CVR decomposition)",
        ]}
      />
    );
  }

  const sortedBySales = [...movers].sort((a, b) => b.dSales - a.dSales);
  const topGrowers = sortedBySales.filter((m) => m.dSales > 0).slice(0, 5);
  const sortedByProfit = [...movers].sort((a, b) => a.dCm - b.dCm);
  const topLeaks = sortedByProfit.filter((m) => m.dCm < 0).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">What Changed?</h2>
          <p className="text-sm text-slate-400">{period === "WoW" ? "Week over week" : "Month over month"} - based on settlement data.</p>
        </div>
        <TogglePills
          value={period}
          onChange={setPeriod}
          options={[{ value: "WoW", label: "Week" }, { value: "MoM", label: "Month" }]}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard title="Top 5 Drivers of Growth" subtitle="Largest positive sales delta">
          {topGrowers.length === 0 ? (
            <p className="text-sm text-slate-400">No positive movers in the latest period.</p>
          ) : (
            <div className="space-y-2">
              {topGrowers.map((m) => (
                <div key={m.asin} className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-3">
                  <div className="flex items-center gap-3">
                    <AsinImage src={m.imageUrl} title={m.title} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-cyan-300">{m.asin}</p>
                      <p className="truncate text-xs text-slate-400">{m.title}</p>
                    </div>
                    <p className="font-mono text-emerald-300">{currency(m.dSales)}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-300">{m.attribution}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
        <SectionCard title="Top 5 Profit Leaks" subtitle="Largest contribution-margin decline">
          {topLeaks.length === 0 ? (
            <p className="text-sm text-slate-400">No profit leaks detected.</p>
          ) : (
            <div className="space-y-2">
              {topLeaks.map((m) => (
                <div key={m.asin} className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-3">
                  <div className="flex items-center gap-3">
                    <AsinImage src={m.imageUrl} title={m.title} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-cyan-300">{m.asin}</p>
                      <p className="truncate text-xs text-slate-400">{m.title}</p>
                    </div>
                    <p className="font-mono text-rose-300">{currency(m.dCm)}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-300">{m.cmAttribution}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
      <SectionCard
        title="All Movers"
        subtitle={`${movers.length} ASINs with period-over-period change${hasTraffic ? "" : " (settlement-only — populate amzsc_traffic_<YYYY>_<MM> for full decomposition)"}`}
        right={
          <ExportButton
            filename="what-changed.csv"
            rows={movers}
            columns={[
              { key: "asin", label: "ASIN" },
              { key: "title", label: "Title" },
              { key: "prevSales", label: "Prev Sales" },
              { key: "curSales", label: "Cur Sales" },
              { key: "dSales", label: "Delta Sales" },
              { key: "dUnits", label: "Delta Units" },
              { key: "dAsp", label: "Delta ASP" },
              { key: "dSessions", label: "Delta Sessions" },
              { key: "dCvr", label: "Delta CVR", accessor: (r) => Number(((r.dCvr || 0) * 100).toFixed(2)) },
              { key: "dOos", label: "Delta OOS Days" },
              { key: "dCm", label: "Delta Contribution" },
              { key: "driver", label: "Driver" },
            ]}
          />
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="px-3 py-2">ASIN</th>
                <th className="px-3 py-2 text-right">Δ Sales</th>
                <th className="px-3 py-2 text-right">Δ Units</th>
                <th className="px-3 py-2 text-right">Δ ASP</th>
                {hasTraffic && <th className="px-3 py-2 text-right">Δ Sessions</th>}
                {hasTraffic && <th className="px-3 py-2 text-right">Δ CVR</th>}
                {hasTraffic && <th className="px-3 py-2 text-right">Δ OOS</th>}
                <th className="px-3 py-2 text-right">Δ Contribution</th>
                <th className="px-3 py-2 text-right">Driver</th>
              </tr>
            </thead>
            <tbody>
              {[...movers]
                .sort((a, b) => Math.abs(b.dSales) - Math.abs(a.dSales))
                .slice(0, 100)
                .map((m) => (
                  <tr key={m.asin} className="border-b border-slate-900 hover:bg-slate-900/30">
                    <td className="px-3 py-2 font-mono text-cyan-300">{m.asin}</td>
                    <td className={cn("px-3 py-2 text-right font-mono", m.dSales >= 0 ? "text-emerald-300" : "text-rose-300")}>{currency(m.dSales)}</td>
                    <td className="px-3 py-2 text-right font-mono text-white">{m.dUnits}</td>
                    <td className="px-3 py-2 text-right font-mono text-white">{currency(m.dAsp)}</td>
                    {hasTraffic && <td className={cn("px-3 py-2 text-right font-mono", m.dSessions >= 0 ? "text-emerald-300" : "text-rose-300")}>{m.dSessions}</td>}
                    {hasTraffic && <td className={cn("px-3 py-2 text-right font-mono", m.dCvr >= 0 ? "text-emerald-300" : "text-rose-300")}>{(m.dCvr * 100).toFixed(2)}pp</td>}
                    {hasTraffic && <td className={cn("px-3 py-2 text-right font-mono", m.dOos <= 0 ? "text-emerald-300" : "text-rose-300")}>{m.dOos}d</td>}
                    <td className={cn("px-3 py-2 text-right font-mono", m.dCm >= 0 ? "text-emerald-300" : "text-rose-300")}>{currency(m.dCm)}</td>
                    <td className="px-3 py-2 text-right text-xs text-slate-300">{m.driver}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// =============================================================================
// ALERTS PAGE — six detection rules, grouped by severity
// =============================================================================

function AlertsPage({ settlementRows = [], inventoryByAsin = [], cogsMap, referenceByAsin, trafficByAsinByMonth }) {
  const AD_SPEND_NO_ORDERS = 50;
  const INVENTORY_DAYS = 14;
  const RETURN_RATE_HIGH = 0.15;
  const RETURN_RATE_BASE = 0.08;
  const CVR_DROP_THRESHOLD = 0.20; // 20% relative drop
  const hasTraffic = trafficByAsinByMonth && trafficByAsinByMonth.size > 0;

  const alerts = useMemo(() => {
    const out = [];
    for (const r of inventoryByAsin) {
      if (r.daysOfCover != null && r.daysOfCover < INVENTORY_DAYS) {
        const sev = r.daysOfCover < 7 ? "high" : "medium";
        out.push({
          rule: "Low inventory cover",
          severity: sev,
          asin: r.asin,
          title: r.shortTitle,
          imageUrl: r.imageUrl,
          impact: `${Math.round(r.daysOfCover)} days of cover (${r.fbaUnits} FBA + ${r.awdUnits} AWD)`,
          action: r.daysOfCover < 7 ? "Place replenishment order today - risk of stockout" : "Schedule shipment within the week",
          dollarImpact: 0,
        });
      }
    }
    const monthlyByAsin = new Map();
    for (const r of settlementRows) {
      const asin = r.asin || r.ASIN;
      if (!asin) continue;
      const dateStr = r.postedDate || r.posted_date || r.date;
      const d = dateStr ? new Date(dateStr) : null;
      if (!d || isNaN(d)) continue;
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const inner = monthlyByAsin.get(asin) || new Map();
      const cur = inner.get(ym) || { orders: 0, refunds: 0, sales: 0 };
      const type = String(r.transactionType || r.type || "").toLowerCase();
      const units = Math.abs(num(r.quantity || r.qty || r.units));
      if (type.includes("refund")) cur.refunds += units;
      else if (type.includes("order")) {
        cur.orders += units;
        cur.sales += num(r.amount || r.total);
      }
      inner.set(ym, cur);
      monthlyByAsin.set(asin, inner);
    }
    for (const [asin, inner] of monthlyByAsin) {
      const months = Array.from(inner.keys()).sort();
      if (months.length < 2) continue;
      const cur = inner.get(months[months.length - 1]);
      const trailing = months.slice(-4, -1).map((m) => inner.get(m)).filter(Boolean);
      const curRate = cur.orders > 0 ? cur.refunds / cur.orders : 0;
      const trailingOrders = trailing.reduce((s, m) => s + m.orders, 0);
      const trailingRefunds = trailing.reduce((s, m) => s + m.refunds, 0);
      const trailingRate = trailingOrders > 0 ? trailingRefunds / trailingOrders : 0;
      if (curRate > RETURN_RATE_HIGH && trailingRate < RETURN_RATE_BASE && cur.orders >= 5) {
        const ref = (referenceByAsin && referenceByAsin.get && referenceByAsin.get(asin)) || {};
        out.push({
          rule: "Return rate spike",
          severity: "high",
          asin,
          title: ref.shortTitle || ref.title,
          imageUrl: ref.imageUrl,
          impact: `${(curRate * 100).toFixed(1)}% returns this month vs ${(trailingRate * 100).toFixed(1)}% trailing 3M`,
          action: "Audit listing photos, sizing, and recent reviews - quality or expectation mismatch likely",
          dollarImpact: cur.refunds * (cur.sales / Math.max(cur.orders, 1)),
        });
      }
    }
    if (hasTraffic) {
      // Real CVR-drop rule — month-over-month per ASIN (WoW would need weekly tabs).
      for (const [asin, inner] of trafficByAsinByMonth) {
        const months = Array.from(inner.keys()).sort();
        if (months.length < 2) continue;
        const c = inner.get(months[months.length - 1]);
        const p = inner.get(months[months.length - 2]);
        if (!c || !p) continue;
        if (p.cvr <= 0 || c.sessions < 100) continue; // need meaningful baseline + traffic
        const drop = (p.cvr - c.cvr) / p.cvr;
        if (drop >= CVR_DROP_THRESHOLD) {
          const ref = (referenceByAsin && referenceByAsin.get && referenceByAsin.get(asin)) || {};
          const sev = drop >= 0.40 ? "high" : "medium";
          out.push({
            rule: "CVR drop",
            severity: sev,
            asin,
            title: ref.shortTitle || ref.title,
            imageUrl: ref.imageUrl,
            impact: `CVR fell ${(drop * 100).toFixed(0)}% MoM (${(p.cvr * 100).toFixed(1)}% → ${(c.cvr * 100).toFixed(1)}%, ${c.sessions} sessions)`,
            action: "Check listing changes, recent reviews, price moves, and competitor activity",
            dollarImpact: 0,
          });
        }
      }
    } else {
      out.push({
        rule: "CVR drop > 20% MoM",
        severity: "low",
        asin: null,
        title: "Stub - traffic data not yet wired",
        impact: "Pending amzsc_traffic_<YYYY>_<MM> tabs (need Sessions and Order Item Session %)",
        action: "Populate traffic export tabs to enable detection",
        dollarImpact: 0,
        stub: true,
      });
    }
    out.push({
      rule: `Ad spend >= $${AD_SPEND_NO_ORDERS} with zero orders`,
      severity: "low",
      asin: null,
      title: "Stub - requires per-ASIN ad spend rollup over a 30d window",
      impact: "Wire products_30d / sales_monthly to enable",
      action: "Once 30d ad rollup is live, this rule auto-activates",
      dollarImpact: 0,
      stub: true,
    });
    out.push({
      rule: "Buy Box loss",
      severity: "low",
      asin: null,
      title: "Stub - buy box data not yet wired",
      impact: "Pending amzsc_buybox_<YYYY>_<MM> tabs",
      action: "Populate buy box snapshot tabs to enable detection",
      dollarImpact: 0,
      stub: true,
    });
    out.push({
      rule: "Price parity drift",
      severity: "low",
      asin: null,
      title: "Stub - pricing snapshot not yet wired",
      impact: "Pending pricing_snapshot_<YYYY>_<MM>_<DD> tabs",
      action: "Populate pricing snapshots to enable detection",
      dollarImpact: 0,
      stub: true,
    });
    return out;
  }, [settlementRows, inventoryByAsin, referenceByAsin, trafficByAsinByMonth, hasTraffic]);

  const high = alerts.filter((a) => a.severity === "high");
  const medium = alerts.filter((a) => a.severity === "medium");
  const low = alerts.filter((a) => a.severity === "low");

  const renderGroup = (label, list, tone) => (
    <SectionCard title={`${label} (${list.length})`}>
      {list.length === 0 ? (
        <p className="text-sm text-slate-400">No {label.toLowerCase()} alerts.</p>
      ) : (
        <div className="space-y-2">
          {list.map((a, i) => (
            <div
              key={`${a.rule}-${a.asin || i}`}
              className={cn(
                "rounded-2xl border p-3",
                tone === "rose" ? "border-rose-400/20 bg-rose-400/5"
                  : tone === "amber" ? "border-amber-400/20 bg-amber-400/5"
                  : "border-slate-800 bg-slate-900/40",
                a.stub && "opacity-60"
              )}
            >
              <div className="flex items-center gap-3">
                {a.imageUrl ? <AsinImage src={a.imageUrl} title={a.title} /> : <AlertCircle className="h-6 w-6 text-slate-400" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{a.rule}{a.stub && " (stub)"}</p>
                  {a.asin && <p className="truncate font-mono text-xs text-cyan-300">{a.asin} · {a.title}</p>}
                  <p className="mt-1 text-xs text-slate-300">{a.impact}</p>
                  <p className="mt-1 text-xs text-slate-400"><strong>Action:</strong> {a.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <CountCard label="High Severity" value={high.length} icon={AlertCircle} tone="rose" />
        <CountCard label="Medium Severity" value={medium.length} icon={Bell} tone="amber" />
        <CountCard label="Low Severity" value={low.length} icon={Bell} tone="slate" />
      </div>
      <div className="flex justify-end">
        <ExportButton
          filename="alerts.csv"
          rows={alerts}
          columns={[
            { key: "rule", label: "Rule" },
            { key: "severity", label: "Severity" },
            { key: "asin", label: "ASIN" },
            { key: "title", label: "Title" },
            { key: "impact", label: "Impact" },
            { key: "action", label: "Recommended Action" },
          ]}
        />
      </div>
      {renderGroup("High", high, "rose")}
      {renderGroup("Medium", medium, "amber")}
      {renderGroup("Low", low, "slate")}
    </div>
  );
}

// =============================================================================
// SETTINGS PAGE
// =============================================================================

function SettingsPage({
  channels = [], loadedMonthsByChannel = {}, cogsCount, fixedCostsCount, hasAdData, sheetId,
  settlementByMonth = {}, trafficByMonth = {}, settlementRows = [],
  spCampaignsCount = 0, sbCampaignsCount = 0, sdCampaignsCount = 0,
  listingQualityCount = 0, pricingSnapshotCount = 0, launchTrackerCount = 0,
  promotionsCount = 0, buyBoxByMonth = {}, inventoryFbaCount = 0, inventoryAwdCount = 0,
}) {
  // Diagnostics: row count loaded per settlement / traffic month
  const settlementRowsByMonth = useMemo(() => {
    const map = {};
    for (const [key, rows] of Object.entries(settlementByMonth)) {
      const [, ym] = key.split("|");
      map[ym] = (map[ym] || 0) + (rows ? rows.length : 0);
    }
    return map;
  }, [settlementByMonth]);

  const trafficRowsByMonth = useMemo(() => {
    const map = {};
    for (const [ym, rows] of Object.entries(trafficByMonth)) {
      map[ym] = rows ? rows.length : 0;
    }
    return map;
  }, [trafficByMonth]);

  const buyBoxRowsByMonth = useMemo(() => {
    const map = {};
    for (const [ym, rows] of Object.entries(buyBoxByMonth)) {
      map[ym] = rows ? rows.length : 0;
    }
    return map;
  }, [buyBoxByMonth]);

  const allMonths = useMemo(() => {
    const set = new Set([
      ...Object.keys(settlementRowsByMonth),
      ...Object.keys(trafficRowsByMonth),
      ...Object.keys(buyBoxRowsByMonth),
    ]);
    return Array.from(set).sort().reverse();
  }, [settlementRowsByMonth, trafficRowsByMonth, buyBoxRowsByMonth]);

  return (
    <div className="space-y-6">
      <SectionCard title="Workspace" subtitle="What this dashboard is currently reading from.">
        <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-slate-500">Brand</dt>
            <dd className="mt-1 text-white">Design Headquarters</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-slate-500">Sheet ID</dt>
            <dd className="mt-1 break-all font-mono text-cyan-300">{sheetId}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-slate-500">COGS rows</dt>
            <dd className="mt-1 text-white">{cogsCount}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-slate-500">Fixed cost rows</dt>
            <dd className="mt-1 text-white">{fixedCostsCount}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-slate-500">Ad data</dt>
            <dd className="mt-1 text-white">{hasAdData ? "Loaded" : "Not loaded"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-slate-500">Settlement rows in active scope</dt>
            <dd className={cn("mt-1", settlementRows.length > 0 ? "text-emerald-300" : "text-rose-300")}>
              {settlementRows.length.toLocaleString()}
            </dd>
          </div>
        </dl>
      </SectionCard>

      <SectionCard
        title="Data Diagnostics — rows loaded per source"
        subtitle="If P&L or other modules aren't populating, this is the first place to look. 0 rows = the gviz fetch returned empty for that tab."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2 text-right">Rows loaded</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-900">
                <td className="px-3 py-2 text-white">cogs</td>
                <td className="px-3 py-2 text-right font-mono">{cogsCount.toLocaleString()}</td>
                <td className={cn("px-3 py-2 text-xs", cogsCount > 0 ? "text-emerald-300" : "text-rose-300")}>
                  {cogsCount > 0 ? "Loaded" : "Empty / not fetched"}
                </td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="px-3 py-2 text-white">fixed_costs_monthly</td>
                <td className="px-3 py-2 text-right font-mono">{fixedCostsCount.toLocaleString()}</td>
                <td className={cn("px-3 py-2 text-xs", fixedCostsCount > 0 ? "text-emerald-300" : "text-amber-300")}>
                  {fixedCostsCount > 0 ? "Loaded" : "Empty — Personnel will show $0"}
                </td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="px-3 py-2 text-white">Sponsored Products Campaigns</td>
                <td className="px-3 py-2 text-right font-mono">{spCampaignsCount.toLocaleString()}</td>
                <td className={cn("px-3 py-2 text-xs", spCampaignsCount > 0 ? "text-emerald-300" : "text-amber-300")}>
                  {spCampaignsCount > 0 ? "Loaded" : "Empty"}
                </td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="px-3 py-2 text-white">Sponsored Brands Campaigns</td>
                <td className="px-3 py-2 text-right font-mono">{sbCampaignsCount.toLocaleString()}</td>
                <td className={cn("px-3 py-2 text-xs", sbCampaignsCount > 0 ? "text-emerald-300" : "text-slate-400")}>
                  {sbCampaignsCount > 0 ? "Loaded" : "Empty"}
                </td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="px-3 py-2 text-white">Sponsored Display Campaigns</td>
                <td className="px-3 py-2 text-right font-mono">{sdCampaignsCount.toLocaleString()}</td>
                <td className={cn("px-3 py-2 text-xs", sdCampaignsCount > 0 ? "text-emerald-300" : "text-slate-400")}>
                  {sdCampaignsCount > 0 ? "Loaded" : "Empty"}
                </td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="px-3 py-2 text-white">inventory_fba</td>
                <td className="px-3 py-2 text-right font-mono">{inventoryFbaCount.toLocaleString()}</td>
                <td className={cn("px-3 py-2 text-xs", inventoryFbaCount > 0 ? "text-emerald-300" : "text-amber-300")}>
                  {inventoryFbaCount > 0 ? "Loaded" : "Empty"}
                </td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="px-3 py-2 text-white">inventory_awd</td>
                <td className="px-3 py-2 text-right font-mono">{inventoryAwdCount.toLocaleString()}</td>
                <td className={cn("px-3 py-2 text-xs", inventoryAwdCount > 0 ? "text-emerald-300" : "text-slate-400")}>
                  {inventoryAwdCount > 0 ? "Loaded" : "Empty"}
                </td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="px-3 py-2 text-white">listing_quality</td>
                <td className="px-3 py-2 text-right font-mono">{listingQualityCount.toLocaleString()}</td>
                <td className={cn("px-3 py-2 text-xs", listingQualityCount > 0 ? "text-emerald-300" : "text-slate-400")}>
                  {listingQualityCount > 0 ? "Loaded" : "Empty"}
                </td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="px-3 py-2 text-white">pricing_snapshot</td>
                <td className="px-3 py-2 text-right font-mono">{pricingSnapshotCount.toLocaleString()}</td>
                <td className={cn("px-3 py-2 text-xs", pricingSnapshotCount > 0 ? "text-emerald-300" : "text-slate-400")}>
                  {pricingSnapshotCount > 0 ? "Loaded" : "Empty"}
                </td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="px-3 py-2 text-white">launch_tracker</td>
                <td className="px-3 py-2 text-right font-mono">{launchTrackerCount.toLocaleString()}</td>
                <td className={cn("px-3 py-2 text-xs", launchTrackerCount > 0 ? "text-emerald-300" : "text-slate-400")}>
                  {launchTrackerCount > 0 ? "Loaded" : "Empty"}
                </td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="px-3 py-2 text-white">promotions</td>
                <td className="px-3 py-2 text-right font-mono">{promotionsCount.toLocaleString()}</td>
                <td className={cn("px-3 py-2 text-xs", promotionsCount > 0 ? "text-emerald-300" : "text-slate-400")}>
                  {promotionsCount > 0 ? "Loaded" : "Empty"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        title="Monthly tabs"
        subtitle="Per-month row counts for settlement, traffic, and buy-box. 0 rows on a month means that tab is empty or the gviz fetch failed."
      >
        {allMonths.length === 0 ? (
          <p className="text-sm text-slate-400">No monthly tabs loaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-3 py-2">Month</th>
                  <th className="px-3 py-2 text-right">Settlement rows</th>
                  <th className="px-3 py-2 text-right">Traffic rows</th>
                  <th className="px-3 py-2 text-right">Buy box rows</th>
                </tr>
              </thead>
              <tbody>
                {allMonths.map((ym) => {
                  const s = settlementRowsByMonth[ym] || 0;
                  const t = trafficRowsByMonth[ym] || 0;
                  const b = buyBoxRowsByMonth[ym] || 0;
                  return (
                    <tr key={ym} className="border-b border-slate-900">
                      <td className="px-3 py-2 font-mono text-cyan-300">{ymToShort(ym)}</td>
                      <td className={cn("px-3 py-2 text-right font-mono", s > 0 ? "text-emerald-300" : "text-rose-300")}>{s.toLocaleString()}</td>
                      <td className={cn("px-3 py-2 text-right font-mono", t > 0 ? "text-emerald-300" : "text-slate-500")}>{t.toLocaleString()}</td>
                      <td className={cn("px-3 py-2 text-right font-mono", b > 0 ? "text-emerald-300" : "text-slate-500")}>{b.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Channels" subtitle="From channel_config.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {channels.map((c) => {
            const months = loadedMonthsByChannel[c.code] || [];
            return (
              <div key={c.code} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-3">
                <p className="text-sm font-medium text-white">{c.name}</p>
                <p className="font-mono text-xs text-cyan-300">{c.code}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {c.enabled ? "enabled" : "disabled"} · {months.length} months loaded
                </p>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

// =============================================================================
// LISTING QUALITY SCORECARD
// =============================================================================

function ListingQualityPage({ rows = [], activeScope = [] }) {
  const audits = useMemo(() => {
    if (!Array.isArray(rows) || rows.length === 0) return [];
    return rows.map((r) => {
      const channel = normalizeText(pick(r, ["channel", "Channel"], ""));
      const checks = {
        title: !!pick(r, ["title_compliant"], false),
        bullets: num(pick(r, ["bullet_count"], 0)) >= 5,
        description: num(pick(r, ["description_length"], 0)) >= 1500,
        aplus: !!pick(r, ["has_aplus"], false),
        images: num(pick(r, ["image_count"], 0)) >= 6,
        whiteBg: !!pick(r, ["image_main_white_bg"], false),
        video: !!pick(r, ["has_video"], false),
        backendKw: !!pick(r, ["backend_keywords_filled"], false),
        variations: !!pick(r, ["variation_complete"], true),
      };
      const passed = Object.values(checks).filter(Boolean).length;
      const total = Object.keys(checks).length;
      const score = Math.round((passed / total) * 100);
      return {
        sku: normalizeText(pick(r, ["sku"], "")),
        asin: normalizeText(pick(r, ["asin"], "")),
        channel,
        title: normalizeText(pick(r, ["title"], "")),
        brand: normalizeText(pick(r, ["brand"], "")),
        auditDate: normalizeText(pick(r, ["audit_date"], "")),
        bulletCount: num(pick(r, ["bullet_count"], 0)),
        descriptionLength: num(pick(r, ["description_length"], 0)),
        imageCount: num(pick(r, ["image_count"], 0)),
        units30d: num(pick(r, ["units_30d"], 0)),
        revenue30d: num(pick(r, ["revenue_30d"], 0)),
        priorityOverride: normalizeText(pick(r, ["priority_override"], "")),
        checks,
        passed,
        total,
        score,
        failedChecks: Object.entries(checks).filter(([, v]) => !v).map(([k]) => k),
      };
    }).filter((a) => a.asin);
  }, [rows]);

  const filtered = useMemo(() => {
    if (!activeScope.length) return audits;
    return audits.filter((a) => !a.channel || activeScope.includes(a.channel));
  }, [audits, activeScope]);

  if (audits.length === 0) {
    return (
      <EmptyStateCard
        title="Listing Quality Scorecard"
        icon={FileText}
        body="One-time audit checklist per ASIN per channel: title compliance, ≥5 bullets, ≥1500 char description, A+ content live, ≥6 images, primary image white background, video, backend keywords, all variation children populated. Ranks issues by sales impact and produces a content punch list."
        requiredSheets={["listing_quality (40-column schema — see listing_quality_columns.xlsx)"]}
      />
    );
  }

  // Punch list: failing audits sorted by revenue impact
  const punchList = [...filtered]
    .filter((a) => a.passed < a.total)
    .sort((a, b) => b.revenue30d - a.revenue30d);
  const passing = filtered.filter((a) => a.passed === a.total).length;
  const avgScore = filtered.length > 0 ? Math.round(filtered.reduce((s, a) => s + a.score, 0) / filtered.length) : 0;

  // Per-check pass rate
  const checkLabels = {
    title: "Title compliant",
    bullets: "≥5 bullets",
    description: "≥1500 char description",
    aplus: "A+ content live",
    images: "≥6 images",
    whiteBg: "Main image white bg",
    video: "Video present",
    backendKw: "Backend keywords filled",
    variations: "Variations complete",
  };
  const checkStats = Object.keys(checkLabels).map((key) => {
    const passed = filtered.filter((a) => a.checks[key]).length;
    return { key, label: checkLabels[key], passed, total: filtered.length, rate: filtered.length ? (passed / filtered.length) * 100 : 0 };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CountCard label="ASINs Audited" value={filtered.length} icon={FileText} />
        <CountCard label="Fully Passing" value={passing} icon={FileText} tone="emerald" />
        <CountCard label="Need Fixes" value={punchList.length} icon={AlertTriangle} tone="amber" />
        <StatCard label="Avg Score" value={`${avgScore}%`} icon={BarChart3} tone={avgScore >= 80 ? "emerald" : avgScore >= 60 ? "amber" : "rose"} />
      </div>

      <SectionCard title="Per-Check Pass Rate" subtitle="How many ASINs pass each individual check">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {checkStats.map((s) => (
            <div key={s.key} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white">{s.label}</p>
                <p className={cn("font-mono text-sm", s.rate >= 80 ? "text-emerald-300" : s.rate >= 50 ? "text-amber-300" : "text-rose-300")}>
                  {s.rate.toFixed(0)}%
                </p>
              </div>
              <p className="mt-1 text-xs text-slate-400">{s.passed} / {s.total} passing</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div className={cn("h-full", s.rate >= 80 ? "bg-emerald-400" : s.rate >= 50 ? "bg-amber-400" : "bg-rose-400")} style={{ width: `${s.rate}%` }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Punch List"
        subtitle={`${punchList.length} ASINs with fixes needed, ranked by revenue impact`}
        right={
          <ExportButton
            filename="listing-quality-punch-list.csv"
            rows={punchList}
            columns={[
              { key: "asin", label: "ASIN" },
              { key: "sku", label: "SKU" },
              { key: "channel", label: "Channel" },
              { key: "title", label: "Title" },
              { key: "score", label: "Score %" },
              { key: "failedChecks", label: "Failed Checks", accessor: (r) => r.failedChecks.map((k) => checkLabels[k]).join(" / ") },
              { key: "revenue30d", label: "Revenue 30d" },
              { key: "units30d", label: "Units 30d" },
              { key: "priorityOverride", label: "Priority" },
            ]}
          />
        }
      >
        {punchList.length === 0 ? (
          <p className="text-sm text-emerald-300">All audited ASINs pass every check.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-3 py-2">ASIN</th>
                  <th className="px-3 py-2">Channel</th>
                  <th className="px-3 py-2 text-right">Score</th>
                  <th className="px-3 py-2">Failing Checks</th>
                  <th className="px-3 py-2 text-right">Revenue 30d</th>
                  <th className="px-3 py-2 text-right">Priority</th>
                </tr>
              </thead>
              <tbody>
                {punchList.slice(0, 200).map((a) => (
                  <tr key={`${a.asin}-${a.channel}`} className="border-b border-slate-900 hover:bg-slate-900/30">
                    <td className="px-3 py-2">
                      <p className="font-mono text-cyan-300">{a.asin}</p>
                      <p className="truncate text-xs text-slate-500" style={{ maxWidth: 280 }}>{a.title}</p>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-300">{a.channel || "—"}</td>
                    <td className={cn("px-3 py-2 text-right font-mono", a.score >= 80 ? "text-emerald-300" : a.score >= 60 ? "text-amber-300" : "text-rose-300")}>{a.score}%</td>
                    <td className="px-3 py-2 text-xs text-rose-300">
                      {a.failedChecks.map((k) => checkLabels[k]).join(", ")}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-white">{currency(a.revenue30d)}</td>
                    <td className="px-3 py-2 text-right text-xs text-slate-300">{a.priorityOverride || (a.revenue30d > 5000 ? "high" : a.revenue30d > 1000 ? "medium" : "low")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// =============================================================================
// PRICING PARITY MONITOR
// =============================================================================

// =============================================================================
// 1P SELL-THROUGH (Scintilla store POS + eComm, weekly by item)
// =============================================================================

function parseSellthroughWeek(v) {
  if (v == null) return "";
  const s = String(v).trim();
  const m = s.match(/^Date\((\d+),(\d+),(\d+)/);
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]), Number(m[3]));
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  }
  return s.slice(0, 10);
}

function SellThroughPage({ rows = [] }) {
  const parsed = useMemo(
    () =>
      rows
        .map((r) => ({
          week: parseSellthroughWeek(pick(r, ["week_ending", "Week Ending"], "")),
          month: normalizeText(pick(r, ["month", "Month"], "")),
          item: normalizeText(pick(r, ["walmart_item_number", "Item #", "item"], "")),
          name: normalizeText(pick(r, ["item_name", "Item Name"], "")),
          storeUnits: normalizeNumber(pick(r, ["store_units"], 0)),
          storeSales: normalizeNumber(pick(r, ["store_sales"], 0)),
          ecommUnits: normalizeNumber(pick(r, ["ecomm_units"], 0)),
          ecommSales: normalizeNumber(pick(r, ["ecomm_sales"], 0)),
        }))
        .filter((r) => r.week && r.month),
    [rows]
  );

  const months = useMemo(
    () => Array.from(new Set(parsed.map((r) => r.month))).sort().reverse(),
    [parsed]
  );
  const [selMonth, setSelMonth] = useState("");
  const activeMonth = selMonth || months[0] || "";

  const totals = useMemo(() => {
    const t = { storeUnits: 0, storeSales: 0, ecommUnits: 0, ecommSales: 0 };
    for (const r of parsed) {
      t.storeUnits += r.storeUnits;
      t.storeSales += r.storeSales;
      t.ecommUnits += r.ecommUnits;
      t.ecommSales += r.ecommSales;
    }
    return t;
  }, [parsed]);

  const byMonth = useMemo(() => {
    const map = new Map();
    for (const r of parsed) {
      const m = map.get(r.month) || { month: r.month, storeUnits: 0, storeSales: 0, ecommUnits: 0, ecommSales: 0 };
      m.storeUnits += r.storeUnits;
      m.storeSales += r.storeSales;
      m.ecommUnits += r.ecommUnits;
      m.ecommSales += r.ecommSales;
      map.set(r.month, m);
    }
    return Array.from(map.values()).sort((a, b) => (a.month < b.month ? 1 : -1));
  }, [parsed]);

  const itemsForMonth = useMemo(() => {
    const map = new Map();
    for (const r of parsed) {
      if (r.month !== activeMonth) continue;
      const m = map.get(r.item) || { item: r.item, name: r.name, storeUnits: 0, storeSales: 0, ecommUnits: 0, ecommSales: 0 };
      m.storeUnits += r.storeUnits;
      m.storeSales += r.storeSales;
      m.ecommUnits += r.ecommUnits;
      m.ecommSales += r.ecommSales;
      if (!m.name && r.name) m.name = r.name;
      map.set(r.item, m);
    }
    return Array.from(map.values())
      .filter((m) => m.storeUnits || m.storeSales || m.ecommUnits || m.ecommSales)
      .sort((a, b) => b.storeSales + b.ecommSales - (a.storeSales + a.ecommSales));
  }, [parsed, activeMonth]);

  const recentWeeks = useMemo(() => {
    const map = new Map();
    for (const r of parsed) {
      const m = map.get(r.week) || { week: r.week, storeUnits: 0, storeSales: 0, ecommUnits: 0, ecommSales: 0 };
      m.storeUnits += r.storeUnits;
      m.storeSales += r.storeSales;
      m.ecommUnits += r.ecommUnits;
      m.ecommSales += r.ecommSales;
      map.set(r.week, m);
    }
    return Array.from(map.values()).sort((a, b) => (a.week < b.week ? 1 : -1)).slice(0, 13);
  }, [parsed]);

  if (!parsed.length) {
    return (
      <EmptyStateCard
        title="1P Sell-Through"
        body="No Walmart 1P sell-through rows loaded yet. This module reads Scintilla store POS + eComm data synced hourly from BigQuery."
        requiredSheets={["wmt1p_sellthrough"]}
        icon={Boxes}
      />
    );
  }

  const monthLabel = (m) => {
    const [y, mo] = m.split("_");
    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${names[Number(mo) - 1] || mo} ${y}`;
  };

  const thCls = "px-3 py-2 text-right text-[11px] uppercase tracking-wider text-slate-500";
  const tdCls = "px-3 py-2 text-right text-sm text-slate-200";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Walmart 1P Sell-Through</h2>
        <p className="mt-1 text-sm text-slate-400">
          Store POS (in-store, pickup, delivery, ship-from-store) + eComm shipped sales, by Walmart week.
          Source: Scintilla · trailing 52 weeks · latest week ending {recentWeeks[0]?.week || "—"}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Store POS $ (52wk)" value={totals.storeSales} icon={DollarSign} tone="cyan" />
        <StatCard label="Store Units (52wk)" value={totals.storeUnits} icon={Boxes} tone="emerald" suffix="count" />
        <StatCard label="eComm Net $ (52wk)" value={totals.ecommSales} icon={ShoppingBag} tone="amber" />
        <StatCard
          label="% of $ In-Store"
          value={totals.storeSales + totals.ecommSales > 0 ? (totals.storeSales / (totals.storeSales + totals.ecommSales)) * 100 : 0}
          icon={Percent}
          tone="slate"
          suffix="%"
        />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-white">Monthly Trend</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wider text-slate-500">Month</th>
                <th className={thCls}>Store Units</th>
                <th className={thCls}>Store POS $</th>
                <th className={thCls}>eComm Units</th>
                <th className={thCls}>eComm Net $</th>
                <th className={thCls}>Total $</th>
              </tr>
            </thead>
            <tbody>
              {byMonth.map((m) => (
                <tr key={m.month} className="border-b border-slate-800/60">
                  <td className="px-3 py-2 text-left text-sm text-white">{monthLabel(m.month)}</td>
                  <td className={tdCls}>{numberFmt(m.storeUnits)}</td>
                  <td className={tdCls}>{currency(m.storeSales)}</td>
                  <td className={tdCls}>{numberFmt(m.ecommUnits)}</td>
                  <td className={tdCls}>{currency(m.ecommSales)}</td>
                  <td className={cn(tdCls, "font-semibold text-white")}>{currency(m.storeSales + m.ecommSales)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">By Item</h3>
          <FilterSelect
            label="Month"
            value={activeMonth}
            onChange={setSelMonth}
            options={months.map((m) => ({ value: m, label: monthLabel(m) }))}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wider text-slate-500">Item #</th>
                <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wider text-slate-500">Item</th>
                <th className={thCls}>Store Units</th>
                <th className={thCls}>Store POS $</th>
                <th className={thCls}>eComm Units</th>
                <th className={thCls}>eComm Net $</th>
              </tr>
            </thead>
            <tbody>
              {itemsForMonth.map((m) => (
                <tr key={m.item} className="border-b border-slate-800/60">
                  <td className="px-3 py-2 text-left text-sm text-slate-400">{m.item}</td>
                  <td className="px-3 py-2 text-left text-sm text-white">{m.name}</td>
                  <td className={tdCls}>{numberFmt(m.storeUnits)}</td>
                  <td className={tdCls}>{currency(m.storeSales)}</td>
                  <td className={tdCls}>{numberFmt(m.ecommUnits)}</td>
                  <td className={tdCls}>{currency(m.ecommSales)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-white">Recent Weeks (all items)</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wider text-slate-500">Week Ending</th>
                <th className={thCls}>Store Units</th>
                <th className={thCls}>Store POS $</th>
                <th className={thCls}>eComm Net $</th>
                <th className={thCls}>Total $</th>
              </tr>
            </thead>
            <tbody>
              {recentWeeks.map((w) => (
                <tr key={w.week} className="border-b border-slate-800/60">
                  <td className="px-3 py-2 text-left text-sm text-white">{w.week}</td>
                  <td className={tdCls}>{numberFmt(w.storeUnits)}</td>
                  <td className={tdCls}>{currency(w.storeSales)}</td>
                  <td className={tdCls}>{currency(w.ecommSales)}</td>
                  <td className={cn(tdCls, "font-semibold text-white")}>{currency(w.storeSales + w.ecommSales)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PricingParityPage({ rows = [], snapshotName = "", channels = [] }) {
  const TOLERANCE = 0.05; // 5% — flag prices outside this band of the median

  const skuByChannel = useMemo(() => {
    const map = new Map(); // sku -> { sku, title, prices: { channel: { price, sale_price, snapshot_date } } }
    for (const r of rows || []) {
      const sku = normalizeText(pick(r, ["sku", "SKU"], ""));
      if (!sku) continue;
      const channel = normalizeText(pick(r, ["channel", "Channel"], ""));
      const price = num(pick(r, ["price", "Price"], 0));
      const salePrice = num(pick(r, ["sale_price", "Sale Price"], 0));
      const date = normalizeText(pick(r, ["snapshot_date", "Snapshot Date", "date"], ""));
      const cur = map.get(sku) || { sku, title: normalizeText(pick(r, ["title", "Title"], "")), prices: {} };
      cur.prices[channel || "unknown"] = { price, salePrice, date };
      map.set(sku, cur);
    }
    return [...map.values()];
  }, [rows]);

  if (!rows || rows.length === 0) {
    return (
      <EmptyStateCard
        title="Pricing Parity Monitor"
        icon={Tags}
        body={`Detect MAP / parity drift across channels and third-party undercutting. One row per SKU with a column per channel; flags any channel out of parity by more than ${(TOLERANCE * 100).toFixed(0)}%.`}
        requiredSheets={[
          "pricing_snapshot  (or pricing_snapshot_<YYYY>_<MM>_<DD>) with columns: sku, channel, price, sale_price, snapshot_date",
        ]}
      />
    );
  }

  // Compute parity flags
  const channelCodes = Array.from(new Set(skuByChannel.flatMap((r) => Object.keys(r.prices))));
  const flagged = skuByChannel.map((row) => {
    const prices = channelCodes.map((c) => row.prices[c]?.price || 0).filter((p) => p > 0);
    if (prices.length < 2) return { ...row, drift: 0, outOfParity: false };
    const median = [...prices].sort((a, b) => a - b)[Math.floor(prices.length / 2)];
    const drift = Math.max(...prices.map((p) => Math.abs(p - median) / median));
    return { ...row, median, drift, outOfParity: drift > TOLERANCE };
  });

  const flaggedRows = flagged.filter((r) => r.outOfParity).sort((a, b) => b.drift - a.drift);
  const totalSkus = flagged.length;
  const okCount = flagged.filter((r) => !r.outOfParity && Object.keys(r.prices).length >= 2).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CountCard label="SKUs in Snapshot" value={totalSkus} icon={Tags} />
        <CountCard label="In Parity" value={okCount} icon={Tags} tone="emerald" />
        <CountCard label="Out of Parity" value={flaggedRows.length} icon={AlertTriangle} tone="rose" />
        <StatCard label="Snapshot" value={snapshotName || "—"} icon={Tags} />
      </div>

      <SectionCard
        title="Out-of-Parity SKUs"
        subtitle={`Flagged when any channel drifts > ${(TOLERANCE * 100).toFixed(0)}% from the median price`}
        right={
          <ExportButton
            filename="pricing-parity.csv"
            rows={flagged}
            columns={[
              { key: "sku", label: "SKU" },
              { key: "title", label: "Title" },
              ...channelCodes.map((c) => ({ key: c, label: `${c} price`, accessor: (r) => r.prices[c]?.price || "" })),
              { key: "median", label: "Median" },
              { key: "drift", label: "Max drift %", accessor: (r) => Number((r.drift * 100).toFixed(2)) },
              { key: "outOfParity", label: "Flagged", accessor: (r) => r.outOfParity ? "Y" : "N" },
            ]}
          />
        }
      >
        {flaggedRows.length === 0 ? (
          <p className="text-sm text-emerald-300">No SKUs out of parity in this snapshot.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-3 py-2">SKU</th>
                  {channelCodes.map((c) => <th key={c} className="px-3 py-2 text-right">{c}</th>)}
                  <th className="px-3 py-2 text-right">Median</th>
                  <th className="px-3 py-2 text-right">Drift</th>
                </tr>
              </thead>
              <tbody>
                {flaggedRows.slice(0, 200).map((row) => (
                  <tr key={row.sku} className="border-b border-slate-900 hover:bg-slate-900/30">
                    <td className="px-3 py-2">
                      <p className="font-mono text-cyan-300">{row.sku}</p>
                      <p className="truncate text-xs text-slate-500" style={{ maxWidth: 280 }}>{row.title}</p>
                    </td>
                    {channelCodes.map((c) => {
                      const p = row.prices[c]?.price || 0;
                      const median = row.median || 0;
                      const off = median > 0 ? Math.abs(p - median) / median > TOLERANCE : false;
                      return (
                        <td key={c} className={cn("px-3 py-2 text-right font-mono", p === 0 ? "text-slate-600" : off ? "text-rose-300" : "text-slate-300")}>
                          {p > 0 ? currencyDetailed(p) : "—"}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-right font-mono text-white">{currencyDetailed(row.median || 0)}</td>
                    <td className="px-3 py-2 text-right font-mono text-rose-300">{(row.drift * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// =============================================================================
// RETURNS DASHBOARD
// =============================================================================

function ReturnsPage({ settlementRows = [], cogsMap, referenceByAsin }) {
  const byAsin = useMemo(() => {
    const map = new Map();
    for (const r of settlementRows) {
      const sku = r.sku;
      if (!sku) continue;
      const cogsEntry = cogsMap?.get?.(sku);
      const asin = cogsEntry?.asin || "";
      const ref = asin && referenceByAsin?.get ? referenceByAsin.get(asin) : null;
      const cur = map.get(sku) || {
        sku,
        asin,
        title: cogsEntry?.title || ref?.shortTitle || ref?.title || "",
        imageUrl: ref?.imageUrl,
        orders: 0,
        units: 0,
        revenue: 0,
        refunds: 0,
        refundUnits: 0,
        refundDollars: 0,
      };
      if (r.type === "order") {
        cur.orders += 1;
        cur.units += Math.abs(r.quantity || 0);
        cur.revenue += r.productSales || 0;
      } else if (r.type === "refund") {
        cur.refunds += 1;
        cur.refundUnits += Math.abs(r.quantity || 0);
        cur.refundDollars += Math.abs(r.productSales || 0);
      }
      map.set(sku, cur);
    }
    return [...map.values()].map((row) => ({
      ...row,
      returnRate: row.units > 0 ? row.refundUnits / row.units : 0,
      revenuePct: row.revenue > 0 ? row.refundDollars / row.revenue : 0,
    }));
  }, [settlementRows, cogsMap, referenceByAsin]);

  if (!settlementRows || settlementRows.length === 0) {
    return (
      <EmptyStateCard
        title="Returns Dashboard"
        icon={RefreshCw}
        body="Return rate per SKU/ASIN, return $ as % of revenue, and an alert for ASINs whose return rate is trending up. Auto-derived from settlement data."
        requiredSheets={["amzsc_settlement_<YYYY>_<MM>"]}
      />
    );
  }

  const totalUnits = byAsin.reduce((s, r) => s + r.units, 0);
  const totalRefundUnits = byAsin.reduce((s, r) => s + r.refundUnits, 0);
  const totalRevenue = byAsin.reduce((s, r) => s + r.revenue, 0);
  const totalRefundDollars = byAsin.reduce((s, r) => s + r.refundDollars, 0);
  const overallReturnRate = totalUnits > 0 ? totalRefundUnits / totalUnits : 0;
  const overallRevenuePct = totalRevenue > 0 ? totalRefundDollars / totalRevenue : 0;

  const sortedRows = [...byAsin]
    .filter((r) => r.units >= 5)
    .sort((a, b) => b.returnRate - a.returnRate);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Overall Return Rate" value={`${(overallReturnRate * 100).toFixed(1)}%`} icon={RefreshCw} tone={overallReturnRate > 0.10 ? "rose" : "cyan"} />
        <StatCard label="Refund $ / Revenue" value={`${(overallRevenuePct * 100).toFixed(1)}%`} icon={DollarSign} tone={overallRevenuePct > 0.10 ? "rose" : "cyan"} />
        <CountCard label="Total Refund Units" value={totalRefundUnits} icon={RefreshCw} tone="amber" />
        <StatCard label="Total Refund $" value={currency(totalRefundDollars)} icon={DollarSign} tone="rose" />
      </div>

      <SectionCard
        title="Returns by SKU"
        subtitle={`${sortedRows.length} SKUs with ≥5 orders, sorted by return rate`}
        right={
          <ExportButton
            filename="returns-by-sku.csv"
            rows={sortedRows}
            columns={[
              { key: "sku", label: "SKU" },
              { key: "asin", label: "ASIN" },
              { key: "title", label: "Title" },
              { key: "units", label: "Units Sold" },
              { key: "refundUnits", label: "Refund Units" },
              { key: "returnRate", label: "Return Rate %", accessor: (r) => Number((r.returnRate * 100).toFixed(2)) },
              { key: "revenue", label: "Revenue" },
              { key: "refundDollars", label: "Refund $" },
            ]}
          />
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="px-3 py-2">SKU / ASIN</th>
                <th className="px-3 py-2 text-right">Units</th>
                <th className="px-3 py-2 text-right">Refunds</th>
                <th className="px-3 py-2 text-right">Return Rate</th>
                <th className="px-3 py-2 text-right">Refund $</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.slice(0, 200).map((r) => (
                <tr key={r.sku} className="border-b border-slate-900 hover:bg-slate-900/30">
                  <td className="px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {r.imageUrl ? <AsinImage src={r.imageUrl} title={r.title} /> : null}
                      <div className="min-w-0">
                        <p className="font-mono text-cyan-300">{r.sku}</p>
                        <p className="truncate text-xs text-slate-500" style={{ maxWidth: 320 }}>{r.asin}{r.title ? " · " + r.title : ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-white">{r.units}</td>
                  <td className="px-3 py-2 text-right font-mono text-white">{r.refundUnits}</td>
                  <td className={cn("px-3 py-2 text-right font-mono", r.returnRate > 0.15 ? "text-rose-300" : r.returnRate > 0.08 ? "text-amber-300" : "text-emerald-300")}>{(r.returnRate * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right font-mono text-rose-300">{currency(r.refundDollars)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// =============================================================================
// BUY BOX MONITOR
// =============================================================================

function BuyBoxPage({ buyBoxByMonth = {}, referenceByAsin }) {
  const months = Object.keys(buyBoxByMonth).sort().reverse();
  if (months.length === 0) {
    return (
      <EmptyStateCard
        title="Buy Box Monitor"
        icon={ShoppingBag}
        body="% of time held buy box / featured offer per ASIN, ASINs that lost the buy box recently, and competitors who outbid you."
        requiredSheets={[
          "amzsc_buybox_<YYYY>_<MM>  with columns: ASIN, Buy Box %, Snapshot Date  (one row per ASIN per snapshot day or month)",
        ]}
      />
    );
  }
  const latest = months[0];
  const prev = months[1];
  const parseRow = (r) => {
    const asin = normalizeText(pick(r, ["ASIN", "asin", "(Child) ASIN", "Child ASIN"], "")).toUpperCase();
    if (!asin) return null;
    const pct = num(pick(r, ["Buy Box %", "Buy Box Percentage", "Featured Offer Percentage", "buy_box_pct"], 0));
    return { asin, pct: pct > 1 ? pct / 100 : pct };
  };
  const latestRows = (buyBoxByMonth[latest] || []).map(parseRow).filter(Boolean);
  const prevRows = prev ? (buyBoxByMonth[prev] || []).map(parseRow).filter(Boolean) : [];
  const prevByAsin = new Map(prevRows.map((r) => [r.asin, r.pct]));

  const enriched = latestRows.map((r) => {
    const ref = referenceByAsin?.get?.(r.asin) || {};
    const prevPct = prevByAsin.get(r.asin);
    return {
      ...r,
      title: ref.shortTitle || ref.title || "",
      imageUrl: ref.imageUrl,
      prevPct,
      delta: prevPct != null ? r.pct - prevPct : null,
    };
  });

  const lost = enriched.filter((r) => r.delta != null && r.delta < -0.05).sort((a, b) => a.delta - b.delta);
  const lowHolders = enriched.filter((r) => r.pct < 0.80).sort((a, b) => a.pct - b.pct);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CountCard label="ASINs Tracked" value={enriched.length} icon={ShoppingBag} />
        <CountCard label="Lost Buy Box (>5pp)" value={lost.length} icon={AlertTriangle} tone="rose" />
        <CountCard label="Holders < 80%" value={lowHolders.length} icon={ShoppingBag} tone="amber" />
        <StatCard label="Latest Snapshot" value={ymToShort(latest)} icon={ShoppingBag} />
      </div>

      <SectionCard
        title="Recent Buy Box Losses"
        subtitle={prev ? `Comparing ${ymToShort(latest)} vs ${ymToShort(prev)}` : "Need a prior month for delta comparison"}
      >
        {lost.length === 0 ? (
          <p className="text-sm text-emerald-300">No significant buy box drops.</p>
        ) : (
          <div className="space-y-2">
            {lost.slice(0, 20).map((r) => (
              <div key={r.asin} className="flex items-center justify-between rounded-2xl border border-rose-400/20 bg-rose-400/5 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <AsinImage src={r.imageUrl} title={r.title} />
                  <div className="min-w-0">
                    <p className="truncate font-mono text-cyan-300">{r.asin}</p>
                    <p className="truncate text-xs text-slate-400">{r.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-white">{(r.pct * 100).toFixed(0)}% buy box</p>
                  <p className="font-mono text-xs text-rose-300">{(r.delta * 100).toFixed(1)}pp vs prior</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="All ASINs"
        subtitle={`${enriched.length} ASINs in latest snapshot`}
        right={
          <ExportButton
            filename="buybox.csv"
            rows={enriched}
            columns={[
              { key: "asin", label: "ASIN" },
              { key: "title", label: "Title" },
              { key: "pct", label: "Buy Box %", accessor: (r) => Number((r.pct * 100).toFixed(2)) },
              { key: "prevPct", label: "Prior %", accessor: (r) => r.prevPct != null ? Number((r.prevPct * 100).toFixed(2)) : "" },
              { key: "delta", label: "Delta pp", accessor: (r) => r.delta != null ? Number((r.delta * 100).toFixed(2)) : "" },
            ]}
          />
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="px-3 py-2">ASIN</th>
                <th className="px-3 py-2 text-right">Buy Box %</th>
                <th className="px-3 py-2 text-right">Prior %</th>
                <th className="px-3 py-2 text-right">Δ pp</th>
              </tr>
            </thead>
            <tbody>
              {[...enriched].sort((a, b) => a.pct - b.pct).slice(0, 200).map((r) => (
                <tr key={r.asin} className="border-b border-slate-900 hover:bg-slate-900/30">
                  <td className="px-3 py-2 font-mono text-cyan-300">{r.asin}</td>
                  <td className={cn("px-3 py-2 text-right font-mono", r.pct >= 0.95 ? "text-emerald-300" : r.pct >= 0.80 ? "text-amber-300" : "text-rose-300")}>{(r.pct * 100).toFixed(0)}%</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-300">{r.prevPct != null ? `${(r.prevPct * 100).toFixed(0)}%` : "—"}</td>
                  <td className={cn("px-3 py-2 text-right font-mono", r.delta == null ? "text-slate-500" : r.delta >= 0 ? "text-emerald-300" : "text-rose-300")}>
                    {r.delta != null ? `${(r.delta * 100).toFixed(1)}pp` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// =============================================================================
// LAUNCH TRACKER
// =============================================================================

function LaunchTrackerPage({ rows = [], settlementRows = [], referenceByAsin }) {
  const launches = useMemo(() => {
    return (rows || []).map((r) => {
      const asin = normalizeText(pick(r, ["asin", "ASIN"], "")).toUpperCase();
      if (!asin) return null;
      const launchDate = normalizeText(pick(r, ["launch_date", "Launch Date"], ""));
      const ld = launchDate ? new Date(launchDate) : null;
      const daysSinceLaunch = ld && !isNaN(ld) ? Math.floor((Date.now() - ld.getTime()) / 86400000) : null;
      const ref = referenceByAsin?.get?.(asin) || {};
      const checklist = {
        listing: !!pick(r, ["listing_live", "checklist_listing_live"], false),
        aplus: !!pick(r, ["aplus_approved", "checklist_aplus"], false),
        photography: !!pick(r, ["photography_done", "checklist_photography"], false),
        campaigns: !!pick(r, ["campaigns_built", "checklist_campaigns"], false),
        vine: !!pick(r, ["vine_requested", "checklist_vine"], false),
      };
      const checklistPct = Object.values(checklist).filter(Boolean).length / Object.keys(checklist).length;
      // Pull units sold for this ASIN by looking up by SKU through cogs (best effort).
      const sku = normalizeText(pick(r, ["sku", "SKU"], ""));
      let unitsTotal = 0;
      let revenueTotal = 0;
      for (const sr of settlementRows) {
        if (sr.type !== "order") continue;
        if (sku && sr.sku === sku) {
          unitsTotal += Math.abs(sr.quantity || 0);
          revenueTotal += sr.productSales || 0;
        }
      }
      return {
        asin,
        sku,
        title: ref.shortTitle || ref.title || normalizeText(pick(r, ["title", "Title"], "")),
        imageUrl: ref.imageUrl,
        channel: normalizeText(pick(r, ["channel", "Channel"], "")),
        launchDate,
        daysSinceLaunch,
        checklist,
        checklistPct,
        unitsTotal,
        revenueTotal,
        notes: normalizeText(pick(r, ["notes", "Notes"], "")),
      };
    }).filter(Boolean);
  }, [rows, settlementRows, referenceByAsin]);

  if (launches.length === 0) {
    return (
      <EmptyStateCard
        title="Launch Tracker"
        icon={Rocket}
        body="Per-ASIN launch checklist + post-launch units / revenue tracking. Best for ASINs in their first 90 days."
        requiredSheets={[
          "launch_tracker  with columns: sku, asin, channel, launch_date, listing_live, aplus_approved, photography_done, campaigns_built, vine_requested, notes",
        ]}
      />
    );
  }

  const new30 = launches.filter((l) => l.daysSinceLaunch != null && l.daysSinceLaunch <= 30);
  const new90 = launches.filter((l) => l.daysSinceLaunch != null && l.daysSinceLaunch <= 90);
  const incomplete = launches.filter((l) => l.checklistPct < 1).sort((a, b) => a.checklistPct - b.checklistPct);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CountCard label="Active Launches" value={launches.length} icon={Rocket} />
        <CountCard label="< 30 days" value={new30.length} icon={Rocket} tone="emerald" />
        <CountCard label="< 90 days" value={new90.length} icon={Rocket} tone="cyan" />
        <CountCard label="Incomplete Checklists" value={incomplete.length} icon={AlertTriangle} tone="amber" />
      </div>

      <SectionCard title="Open Checklists" subtitle="Items still on the launch punch list, lowest completion first">
        {incomplete.length === 0 ? (
          <p className="text-sm text-emerald-300">All tracked launches have completed checklists.</p>
        ) : (
          <div className="space-y-2">
            {incomplete.slice(0, 20).map((l) => (
              <div key={l.asin} className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-3">
                <div className="flex items-center gap-3">
                  <AsinImage src={l.imageUrl} title={l.title} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-cyan-300">{l.asin}</p>
                    <p className="truncate text-xs text-slate-400">{l.title}</p>
                  </div>
                  <p className="font-mono text-amber-300">{Math.round(l.checklistPct * 100)}%</p>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Pending: {Object.entries(l.checklist).filter(([, v]) => !v).map(([k]) => k).join(", ") || "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Launch Performance"
        subtitle="Units and revenue since launch (settlement-derived)"
        right={
          <ExportButton
            filename="launch-tracker.csv"
            rows={launches}
            columns={[
              { key: "asin", label: "ASIN" },
              { key: "sku", label: "SKU" },
              { key: "title", label: "Title" },
              { key: "channel", label: "Channel" },
              { key: "launchDate", label: "Launch Date" },
              { key: "daysSinceLaunch", label: "Days Since Launch" },
              { key: "checklistPct", label: "Checklist %", accessor: (r) => Math.round(r.checklistPct * 100) },
              { key: "unitsTotal", label: "Units" },
              { key: "revenueTotal", label: "Revenue" },
            ]}
          />
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="px-3 py-2">ASIN</th>
                <th className="px-3 py-2">Launch Date</th>
                <th className="px-3 py-2 text-right">Days Live</th>
                <th className="px-3 py-2 text-right">Checklist</th>
                <th className="px-3 py-2 text-right">Units</th>
                <th className="px-3 py-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {launches.slice(0, 200).map((l) => (
                <tr key={l.asin} className="border-b border-slate-900 hover:bg-slate-900/30">
                  <td className="px-3 py-2">
                    <p className="font-mono text-cyan-300">{l.asin}</p>
                    <p className="truncate text-xs text-slate-500" style={{ maxWidth: 280 }}>{l.title}</p>
                  </td>
                  <td className="px-3 py-2 font-mono text-slate-300">{l.launchDate || "—"}</td>
                  <td className="px-3 py-2 text-right font-mono text-white">{l.daysSinceLaunch != null ? l.daysSinceLaunch : "—"}</td>
                  <td className={cn("px-3 py-2 text-right font-mono", l.checklistPct === 1 ? "text-emerald-300" : l.checklistPct >= 0.5 ? "text-amber-300" : "text-rose-300")}>
                    {Math.round(l.checklistPct * 100)}%
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-white">{l.unitsTotal}</td>
                  <td className="px-3 py-2 text-right font-mono text-white">{currency(l.revenueTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// =============================================================================
// CHANNEL COMPARISON
// =============================================================================

function ChannelComparisonPage({ settlementByMonth = {}, cogsMap, fixedCosts = [], channels = [], activeScope = [], pnlPeriod }) {
  // Group settlement rows by channel for the active period.
  const byChannel = useMemo(() => {
    const out = {};
    for (const [key, rows] of Object.entries(settlementByMonth)) {
      const [channel, ym] = key.split("|");
      if (pnlPeriod && ym !== pnlPeriod) continue;
      const parsed = parseSettlementSheet(rows, ym);
      if (!parsed.length) continue;
      const adSpend = 0; // ad spend split-by-channel not yet tracked separately; brief flagged
      const pnl = computePnLForPeriod(parsed, cogsMap, fixedCosts, adSpend, ym);
      out[channel] = pnl;
    }
    return out;
  }, [settlementByMonth, cogsMap, fixedCosts, pnlPeriod]);

  const channelCodes = Object.keys(byChannel);
  if (channelCodes.length < 1) {
    return (
      <EmptyStateCard
        title="Channel Comparison"
        icon={Globe}
        body={`Side-by-side P&L per channel for the active period. ${pnlPeriod ? `Currently looking at ${ymToLabel(pnlPeriod)}.` : "Select a period in the P&L module."} Lights up automatically once 2+ channels have settlement data loaded for the same month.`}
        requiredSheets={[
          "Already-defined sheets — auto-populates once a second channel has settlement data loaded for the same month.",
        ]}
      />
    );
  }

  const lineItems = ["sales", "refunds", "net_revenue", "total_cogs", "amazon_commissions", "outbound_fba", "advertising", "total_general", "gross_profit", "gross_margin", "net_profit", "net_margin"];
  const labelFor = (id) => PNL_LINE_ITEMS.find((i) => i.id === id)?.label || id;
  const isPctRow = (id) => !!PNL_LINE_ITEMS.find((i) => i.id === id)?.isPct;

  return (
    <div className="space-y-6">
      <SectionCard
        title={`Channel P&L Comparison · ${pnlPeriod ? ymToLabel(pnlPeriod) : "—"}`}
        subtitle={`${channelCodes.length} channel${channelCodes.length === 1 ? "" : "s"} with data this period`}
        right={
          <ExportButton
            filename="channel-comparison.csv"
            rows={lineItems.map((id) => {
              const r = { line_item: labelFor(id) };
              for (const ch of channelCodes) r[ch] = byChannel[ch][id];
              return r;
            })}
            columns={[
              { key: "line_item", label: "Line Item" },
              ...channelCodes.map((ch) => ({ key: ch, label: ch })),
            ]}
          />
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="px-3 py-2">Line Item</th>
                {channelCodes.map((ch) => {
                  const ce = channels.find((c) => c.code === ch);
                  return (
                    <th key={ch} className="px-3 py-2 text-right">
                      <div>{ce?.name || ch}</div>
                      <div className="font-mono text-[10px] text-slate-500">{ch}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {lineItems.map((id) => (
                <tr key={id} className="border-b border-slate-900">
                  <td className="px-3 py-2 text-slate-300">{labelFor(id)}</td>
                  {channelCodes.map((ch) => {
                    const v = byChannel[ch][id] || 0;
                    return (
                      <td key={ch} className="px-3 py-2 text-right font-mono text-white">
                        {isPctRow(id) ? `${v.toFixed(1)}%` : currency(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// =============================================================================
// PROMOTIONS & FEES
// =============================================================================

function PromotionsFeesPage({ promotions = [], settlementRows = [] }) {
  const deals = useMemo(() => {
    return (promotions || []).map((r) => ({
      dealType: normalizeText(pick(r, ["deal_type", "Deal Type"], "")),
      sku: normalizeText(pick(r, ["sku", "SKU"], "")),
      asin: normalizeText(pick(r, ["asin", "ASIN"], "")),
      startDate: normalizeText(pick(r, ["start_date", "Start Date"], "")),
      endDate: normalizeText(pick(r, ["end_date", "End Date"], "")),
      discountPct: num(pick(r, ["discount_pct", "Discount %"], 0)),
      notes: normalizeText(pick(r, ["notes", "Notes"], "")),
    })).filter((d) => d.sku || d.asin);
  }, [promotions]);

  const today = new Date();
  const isActive = (d) => {
    const s = d.startDate ? new Date(d.startDate) : null;
    const e = d.endDate ? new Date(d.endDate) : null;
    if (s && !isNaN(s) && s > today) return false;
    if (e && !isNaN(e) && e < today) return false;
    return true;
  };
  const active = deals.filter(isActive);

  // Fee creep audit — month over month from settlement
  const feeByMonth = useMemo(() => {
    const map = new Map();
    const FEE_BUCKETS = ["fba_storage_fees", "fba_inventory_fees", "fba_removal_fees", "fba_customer_return_fees", "other_fba_fees", "subscription_fee", "premium_services_fee", "amazon_commissions"];
    for (const r of settlementRows) {
      const ym = r.ym;
      const inner = map.get(ym) || { ym, revenue: 0, fees: {} };
      if (r.type === "order") inner.revenue += r.productSales || 0;
      const cat = r.adjustmentCategory;
      if (cat && FEE_BUCKETS.includes(cat)) {
        inner.fees[cat] = (inner.fees[cat] || 0) + (r.total || 0);
      } else if (r.type === "order" || r.type === "refund") {
        inner.fees.amazon_commissions = (inner.fees.amazon_commissions || 0) + (r.sellingFees || 0);
      }
      map.set(ym, inner);
    }
    return [...map.values()].sort((a, b) => a.ym.localeCompare(b.ym));
  }, [settlementRows]);

  const hasData = deals.length > 0 || feeByMonth.length > 0;
  if (!hasData) {
    return (
      <EmptyStateCard
        title="Promotions & Fees"
        icon={Receipt}
        body="Active deals (Lightning, Best, Coupon, Subscribe & Save) and a fee creep audit MoM. Fee creep auto-derives from settlement once 2+ months are loaded."
        requiredSheets={[
          "promotions  with columns: deal_type, sku, asin, start_date, end_date, discount_pct, notes",
          "amzsc_settlement_<YYYY>_<MM>  (you already have this)",
        ]}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CountCard label="Active Deals" value={active.length} icon={Receipt} />
        <CountCard label="All Deals (history)" value={deals.length} icon={Receipt} tone="slate" />
        <CountCard label="Fee Months Tracked" value={feeByMonth.length} icon={Wallet} tone="cyan" />
        <StatCard label="Latest Month" value={feeByMonth.length > 0 ? ymToShort(feeByMonth[feeByMonth.length - 1].ym) : "—"} icon={Wallet} />
      </div>

      <SectionCard title="Active Deals" subtitle={`${active.length} live as of today`}>
        {active.length === 0 ? (
          <p className="text-sm text-slate-400">No active promotions in the sheet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-3 py-2">Month</th>
                  <th className="px-3 py-2 text-right">Revenue</th>
                  <th className="px-3 py-2 text-right">Storage</th>
                  <th className="px-3 py-2 text-right">Inventory</th>
                  <th className="px-3 py-2 text-right">Removal</th>
                  <th className="px-3 py-2 text-right">Cust. Return</th>
                  <th className="px-3 py-2 text-right">Other FBA</th>
                  <th className="px-3 py-2 text-right">Selling Fees</th>
                  <th className="px-3 py-2 text-right">Total Fees / Rev</th>
                </tr>
              </thead>
              <tbody>
                {feeByMonth.map((m) => {
                  const totalFees = Object.values(m.fees).reduce((s, v) => s + Math.abs(v || 0), 0);
                  const pct = m.revenue > 0 ? (totalFees / m.revenue) * 100 : 0;
                  return (
                    <tr key={m.ym} className="border-b border-slate-900 hover:bg-slate-900/30">
                      <td className="px-3 py-2 font-mono text-cyan-300">{ymToShort(m.ym)}</td>
                      <td className="px-3 py-2 text-right font-mono text-white">{currency(m.revenue)}</td>
                      <td className="px-3 py-2 text-right font-mono text-white">{currency(m.fees.fba_storage_fees || 0)}</td>
                      <td className="px-3 py-2 text-right font-mono text-white">{currency(m.fees.fba_inventory_fees || 0)}</td>
                      <td className="px-3 py-2 text-right font-mono text-white">{currency(m.fees.fba_removal_fees || 0)}</td>
                      <td className="px-3 py-2 text-right font-mono text-white">{currency(m.fees.fba_customer_return_fees || 0)}</td>
                      <td className="px-3 py-2 text-right font-mono text-white">{currency(m.fees.other_fba_fees || 0)}</td>
                      <td className="px-3 py-2 text-right font-mono text-white">{currency(m.fees.amazon_commissions || 0)}</td>
                      <td className={cn("px-3 py-2 text-right font-mono", pct > 30 ? "text-rose-300" : pct > 20 ? "text-amber-300" : "text-emerald-300")}>{pct.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
