import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
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
  Receipt,
  RefreshCw,
  Rocket,
  Search,
  Settings as SettingsIcon,
  ShieldMinus,
  ShoppingBag,
  Tag,
  Tags,
  TrendingUp,
  Wallet,
  Warehouse,
} from "lucide-react";

// =============================================================================
// CONSTANTS
// =============================================================================

// Sheet ID is overridable via Vercel env var so the same code can serve any
// client. Fallback below is the Design Headquarters sheet for the default deploy.
const SHEET_ID =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SHEET_ID) ||
  "1qyG6ME0NxHBukxm--Kl3orRcwl3MBHSNWk2wEoPj9dI";

const LOGO_URL = "/logo.png";
const BRAND_NAME = "Design Headquarters";

// Structural tabs the dashboard expects (none are required — missing tabs just
// degrade specific modules gracefully).
const TAB_NAMES = {
  channelConfig: "channel_config",
  cogs: "cogs",
  fixedCostsMonthly: "fixed_costs_monthly",
  itemRef: "item_data_reference",
  // Ad reports — same naming as the FSN dashboard so existing exports map cleanly.
  spCampaigns: "Sponsored Products Campaigns",
  sbCampaigns: "Sponsored Brands Campaigns",
  sdCampaigns: "Sponsored Display Campaigns",
};

// How far back to look for monthly settlement tabs. Each candidate tab is
// fetched optimistically — missing ones just return empty.
const SETTLEMENT_LOOKBACK_MONTHS = 18;

// Channel registry (defaults). The channel_config sheet can override `enabled`
// and `account_label` for each channel; channels not listed below render in
// the Settings page as "unknown channel code".
const DEFAULT_CHANNELS = [
  { code: "amzsc", name: "Amazon Seller Central", enabled: true },
  { code: "amzvc", name: "Amazon Vendor Central", enabled: false },
  { code: "wmt1p", name: "Walmart 1P", enabled: false },
  { code: "wmt3p", name: "Walmart Marketplace", enabled: false },
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
  { code: "whatnot", name: "Whatnot", enabled: false },
];

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
    return parseGviz(text);
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
    // case-insensitive fallback — helpful when sheet headers vary in case
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

// Generate the trailing N month codes ending at "now", e.g. ["2026_05","2026_04",...]
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
// SETTLEMENT PARSER
// =============================================================================
// Amazon settlement files (V2 flat-file export) are at the transaction level.
// Each row is one of: Order, Refund, Adjustment, Order_Retrocharge, Service Fee.
// We flatten those into normalized "P&L line items" using description matching
// for the Adjustment rows.

const FEE_RULES = [
  // [match against description (lowercase), category]
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
];

function categorizeAdjustment(description) {
  const d = (description || "").toLowerCase();
  for (const [re, cat] of FEE_RULES) {
    if (re.test(d)) return cat;
  }
  return "other_fba_fees";
}

// Parse one settlement tab into a list of normalized rows. Each row carries the
// year_month from the tab name so all downstream filtering works by period.
function parseSettlementSheet(rows, ym) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  return rows.map((r) => {
    const type = normalizeText(pick(r, ["type", "Type"], "")).toLowerCase();
    const description = normalizeText(pick(r, ["description", "Description"], ""));
    const sku = normalizeText(pick(r, ["sku", "SKU"], ""));
    const quantity = normalizeNumber(pick(r, ["quantity", "Quantity"], 0));
    const productSales = normalizeNumber(pick(r, ["product sales", "Product Sales"], 0));
    const productSalesTax = normalizeNumber(
      pick(r, ["product sales tax", "Product Sales Tax"], 0)
    );
    const shippingCredits = normalizeNumber(
      pick(r, ["shipping credits", "Shipping Credits"], 0)
    );
    const giftWrapCredits = normalizeNumber(
      pick(r, ["gift wrap credits", "Gift Wrap Credits"], 0)
    );
    const promoRebates = normalizeNumber(
      pick(r, ["promotional rebates", "Promotional Rebates"], 0)
    );
    const marketplaceWithheld = normalizeNumber(
      pick(r, ["marketplace withheld tax", "Marketplace Withheld Tax"], 0)
    );
    const sellingFees = normalizeNumber(pick(r, ["selling fees", "Selling Fees"], 0));
    const fbaFees = normalizeNumber(pick(r, ["fba fees", "FBA Fees"], 0));
    const otherTransactionFees = normalizeNumber(
      pick(r, ["other transaction fees", "Other Transaction Fees"], 0)
    );
    const other = normalizeNumber(pick(r, ["other", "Other"], 0));
    const total = normalizeNumber(pick(r, ["total", "Total"], 0));
    const reportedUnitCost = normalizeNumber(pick(r, ["Unit Cost", "unit cost"], 0));
    return {
      ym,
      type,
      description,
      sku,
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

// =============================================================================
// COGS / FIXED COSTS / CHANNEL CONFIG PARSERS
// =============================================================================

function parseCogs(rows) {
  // Expected columns: sku, asin, title, unit_cost_landed, effective_date, notes
  // Also tolerates the format from the Hydrapeak sample: SKU, ASIN, TITLE,
  // PRODUCT COST (+ SHIPPING COST), DATE START, MARKETPLACE, SELLER.
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
    const effectiveDate = normalizeText(
      pick(r, ["effective_date", "Effective Date", "DATE START"], "")
    );
    const existing = map.get(sku);
    // Pick most recent effective_date if duplicates exist.
    if (!existing || (effectiveDate && effectiveDate > (existing.effectiveDate || ""))) {
      map.set(sku, { sku, asin, title, cost, effectiveDate });
    }
  }
  return map;
}

function parseFixedCostsMonthly(rows) {
  // Expected columns: month (YYYY-MM or YYYY_MM), channel, category, amount, notes
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
  // Build registry from defaults, then apply overrides from the sheet.
  const map = new Map();
  for (const c of DEFAULT_CHANNELS) {
    map.set(c.code, { ...c, accountLabel: "", currency: "USD" });
  }
  for (const r of rows || []) {
    const code = normalizeText(
      pick(r, ["channel_code", "code", "Channel Code"])
    ).toLowerCase();
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

// =============================================================================
// AD SPEND PARSER (campaign-level, sums by month)
// =============================================================================
// Bulk operations exports don't include a date column at the row level, so for
// now we treat the existing Sponsored Products / Brands / Display campaign
// reports as "current month" ad spend. When monthly ad reports become available
// we'll switch to month-stamped tabs (e.g., amzsc_ads_2026_02).

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
// Given parsed settlement rows, COGS map, fixed costs, and ad spend, compute a
// rolled-up P&L matching the line-item structure the team already produces in
// Excel. Result is one object per period covered.

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

function emptyPnL() {
  const o = {};
  for (const item of PNL_LINE_ITEMS) {
    if (!item.section) o[item.id] = 0;
  }
  return o;
}

function computePnLForPeriod(settlementRows, cogsMap, fixedCostsRows, adSpendForPeriod, ym) {
  const p = emptyPnL();
  for (const r of settlementRows) {
    if (r.ym !== ym) continue;
    if (r.type === "order") {
      p.sales += r.productSales;
      p.shipping_promo += r.shippingCredits + r.promoRebates;
      p.gift_wraps += r.giftWrapCredits;
      p.amazon_commissions += r.sellingFees;
      p.outbound_fba += r.fbaFees;
      p.sales_tax_collected += r.productSalesTax;
      p.marketplace_withheld_tax += r.marketplaceWithheld;
      // COGS — prefer landed cost from the cogs sheet, fall back to settlement Unit Cost.
      const cogsEntry = cogsMap.get(r.sku);
      const unitCost = cogsEntry ? cogsEntry.cost : r.reportedUnitCost;
      p.cogs += -1 * Math.abs(unitCost) * Math.abs(r.quantity);
    } else if (r.type === "refund") {
      p.refunds += r.productSales; // already negative in the file
      p.amazon_commissions += r.sellingFees;
      p.outbound_fba += r.fbaFees;
      p.sales_tax_collected += r.productSalesTax;
      p.marketplace_withheld_tax += r.marketplaceWithheld;
      // Refunded items: COGS reverses (we got the unit back, in theory)
      const cogsEntry = cogsMap.get(r.sku);
      const unitCost = cogsEntry ? cogsEntry.cost : r.reportedUnitCost;
      p.cogs += Math.abs(unitCost) * Math.abs(r.quantity);
    } else if (r.type === "adjustment") {
      const cat = r.adjustmentCategory;
      if (cat && p[cat] !== undefined) {
        p[cat] += r.total;
      } else if (cat) {
        p.other_fba_fees += r.total;
      }
    } else if (r.type === "service fee" || r.type === "service_fee") {
      // Catch-all for monthly storage / subscription rows that arrive as
      // "Service Fee" rather than "Adjustment" in some accounts.
      const cat = categorizeAdjustment(r.description);
      if (p[cat] !== undefined) p[cat] += r.total;
      else p.other_fba_fees += r.total;
    } else if (r.type === "order_retrocharge") {
      // Retrocharges show as small adjustments — keep them in commissions.
      p.amazon_commissions += r.sellingFees;
      p.sales_tax_collected += r.productSalesTax;
    }
  }

  // Personnel / other monthly costs from the fixed_costs_monthly sheet.
  for (const fc of fixedCostsRows || []) {
    if (fc.ym !== ym) continue;
    p.personnel += -1 * Math.abs(fc.amount);
  }

  // Advertising — for now applied as a single trailing-month total. We split
  // when month-stamped ad reports are available.
  p.advertising += -1 * Math.abs(adSpendForPeriod || 0);

  // Totals
  p.net_revenue =
    p.sales + p.shipping_promo + p.gift_wraps + p.refunds + p.reimbursements + p.liquidation;
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
  p.net_sales_tax = p.sales_tax_collected + p.marketplace_withheld_tax;
  p.gross_profit = p.net_revenue + p.total_cogs + p.total_general;
  p.gross_margin = p.net_revenue ? (p.gross_profit / p.net_revenue) * 100 : 0;
  p.net_profit = p.gross_profit + p.net_sales_tax + p.personnel;
  p.net_margin = p.net_revenue ? (p.net_profit / p.net_revenue) * 100 : 0;
  return p;
}

// Compute a P&L per ASIN/SKU for the period — drives the "P&L by Item" table.
function computePnLByAsin(settlementRows, cogsMap, ym) {
  const map = new Map();
  for (const r of settlementRows) {
    if (r.ym !== ym) continue;
    if (r.type !== "order" && r.type !== "refund") continue;
    const sku = r.sku || "(no sku)";
    const cogsEntry = cogsMap.get(sku);
    const asin = cogsEntry?.asin || "";
    const title = cogsEntry?.title || r.description || "";
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
// SORT HOOK + REUSABLE TABLE
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
    suffix === "%" ? pct(value) : suffix === "count" ? numberFmt(value) : currency(value);
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
              Required Google Sheet tabs:
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
// APP
// =============================================================================

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeChannel, setActiveChannel] = useState("amzsc");
  const [pnlPeriod, setPnlPeriod] = useState(""); // e.g. "2026_02"
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sheet data
  const [channelConfigSheet, setChannelConfigSheet] = useState([]);
  const [cogsSheet, setCogsSheet] = useState([]);
  const [fixedCostsSheet, setFixedCostsSheet] = useState([]);
  const [itemRefSheet, setItemRefSheet] = useState([]);
  const [spCampaigns, setSpCampaigns] = useState([]);
  const [sbCampaigns, setSbCampaigns] = useState([]);
  const [sdCampaigns, setSdCampaigns] = useState([]);
  // Map of `${channel}|${ym}` -> raw sheet rows
  const [settlementByMonth, setSettlementByMonth] = useState({});

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        // Static structural tabs first.
        const [chCfg, cogs, fixed, itemRef, spCamp, sbCamp, sdCamp] = await Promise.all([
          fetchSheet(TAB_NAMES.channelConfig),
          fetchSheet(TAB_NAMES.cogs),
          fetchSheet(TAB_NAMES.fixedCostsMonthly),
          fetchSheet(TAB_NAMES.itemRef),
          fetchSheet(TAB_NAMES.spCampaigns),
          fetchSheet(TAB_NAMES.sbCampaigns),
          fetchSheet(TAB_NAMES.sdCampaigns),
        ]);

        setChannelConfigSheet(chCfg);
        setCogsSheet(cogs);
        setFixedCostsSheet(fixed);
        setItemRefSheet(itemRef);
        setSpCampaigns(spCamp);
        setSbCampaigns(sbCamp);
        setSdCampaigns(sdCamp);

        // Discover settlement tabs by trying the trailing N month codes.
        // Currently scoped to amzsc; future channels follow the same pattern.
        const months = generateTrailingMonthCodes();
        const settlementResults = await Promise.all(
          months.map(async (ym) => ({
            ym,
            rows: await fetchSheet(`amzsc_settlement_${ym}`),
          }))
        );
        const settlementMap = {};
        for (const { ym, rows } of settlementResults) {
          if (rows && rows.length) settlementMap[`amzsc|${ym}`] = rows;
        }
        setSettlementByMonth(settlementMap);

        setError("");
      } catch (e) {
        setError(
          "Could not load Google Sheets data. Make sure the sheet is shared as 'Anyone with the link can view'."
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Channel registry — defaults overridden by sheet rows.
  const channels = useMemo(() => parseChannelConfig(channelConfigSheet), [channelConfigSheet]);
  const enabledChannels = useMemo(() => channels.filter((c) => c.enabled), [channels]);

  // Months that actually have data, per channel.
  const loadedMonthsByChannel = useMemo(() => {
    const out = {};
    for (const key of Object.keys(settlementByMonth)) {
      const [channel, ym] = key.split("|");
      out[channel] = out[channel] || [];
      out[channel].push(ym);
    }
    for (const ch of Object.keys(out)) {
      out[ch].sort().reverse(); // newest first
    }
    return out;
  }, [settlementByMonth]);

  // Auto-pick the latest month for the selected channel as the default period.
  useEffect(() => {
    const months = loadedMonthsByChannel[activeChannel] || [];
    if (!pnlPeriod && months.length) setPnlPeriod(months[0]);
  }, [loadedMonthsByChannel, activeChannel, pnlPeriod]);

  // Parse settlement rows for the selected channel only.
  const settlementRows = useMemo(() => {
    const out = [];
    for (const [key, rows] of Object.entries(settlementByMonth)) {
      const [channel, ym] = key.split("|");
      if (channel !== activeChannel) continue;
      out.push(...parseSettlementSheet(rows, ym));
    }
    return out;
  }, [settlementByMonth, activeChannel]);

  const cogsMap = useMemo(() => parseCogs(cogsSheet), [cogsSheet]);
  const fixedCosts = useMemo(() => parseFixedCostsMonthly(fixedCostsSheet), [fixedCostsSheet]);

  const adSpendCurrentMonth = useMemo(
    () => sumAdSpendFromCampaigns(spCampaigns, sbCampaigns, sdCampaigns),
    [spCampaigns, sbCampaigns, sdCampaigns]
  );

  const pnl = useMemo(() => {
    if (!pnlPeriod) return emptyPnL();
    return computePnLForPeriod(
      settlementRows,
      cogsMap,
      fixedCosts,
      adSpendCurrentMonth,
      pnlPeriod
    );
  }, [settlementRows, cogsMap, fixedCosts, adSpendCurrentMonth, pnlPeriod]);

  const pnlByAsin = useMemo(
    () => (pnlPeriod ? computePnLByAsin(settlementRows, cogsMap, pnlPeriod) : []),
    [settlementRows, cogsMap, pnlPeriod]
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

  // -------------------- TABS --------------------
  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "pnl", label: "P&L", icon: Wallet },
    { id: "buyBox", label: "Buy Box", icon: ShoppingBag },
    { id: "listingQuality", label: "Listing Quality", icon: FileText },
    { id: "returns", label: "Returns", icon: RefreshCw },
    { id: "launchTracker", label: "Launch Tracker", icon: Rocket },
    { id: "pricingParity", label: "Pricing Parity", icon: Tags },
    { id: "channelComparison", label: "Channel Comparison", icon: Globe },
    { id: "promotionsFees", label: "Promotions & Fees", icon: Receipt },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  // -------------------- LOADING STATE --------------------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading Google Sheets data...
      </div>
    );
  }

  // -------------------- LAYOUT --------------------
  const periodOptions = (loadedMonthsByChannel[activeChannel] || []).map((ym) => ({
    value: ym,
    label: ymToLabel(ym),
  }));

  const channelOptions = enabledChannels.length
    ? enabledChannels.map((c) => ({ value: c.code, label: c.name }))
    : [{ value: "amzsc", label: "Amazon Seller Central (default)" }];

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
              Channel
            </p>
            <select
              value={activeChannel}
              onChange={(e) => {
                setActiveChannel(e.target.value);
                setPnlPeriod("");
              }}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
            >
              {channelOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 space-y-1.5">
            {tabs.map((tab) => (
              <SidebarButton
                key={tab.id}
                active={activeTab === tab.id}
                icon={tab.icon}
                label={tab.label}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
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
                {(channels.find((c) => c.code === activeChannel) || {}).name ||
                  activeChannel}
                {" · "}Live from Google Sheets.
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
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Net Revenue (selected month)"
                  value={pnl.net_revenue}
                  icon={DollarSign}
                  tone="cyan"
                />
                <StatCard
                  label="Gross Profit"
                  value={pnl.gross_profit}
                  icon={TrendingUp}
                  tone={pnl.gross_profit >= 0 ? "emerald" : "rose"}
                />
                <StatCard
                  label="Net Profit"
                  value={pnl.net_profit}
                  icon={Wallet}
                  tone={pnl.net_profit >= 0 ? "emerald" : "rose"}
                />
                <StatCard
                  label="Net Margin"
                  value={pnl.net_margin}
                  suffix="%"
                  icon={BarChart3}
                  tone={pnl.net_margin >= 10 ? "emerald" : pnl.net_margin >= 0 ? "amber" : "rose"}
                />
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
                      return (
                        <div
                          key={c.code}
                          className={cn(
                            "rounded-2xl border p-4",
                            c.code === activeChannel
                              ? "border-cyan-400/40 bg-cyan-400/5"
                              : "border-slate-800 bg-slate-950"
                          )}
                        >
                          <p className="text-sm font-medium text-white">{c.name}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {months.length
                              ? `${months.length} months loaded · latest ${ymToShort(months[0])}`
                              : "No settlement data yet"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>

              <SectionCard
                title="Module Status"
                subtitle="What's wired up vs. waiting on data."
              >
                <ul className="space-y-2 text-sm">
                  <li>
                    ✅ <strong className="text-white">P&L</strong> — live for{" "}
                    {pnlPeriod ? ymToLabel(pnlPeriod) : "no period yet"}
                  </li>
                  <li>
                    🟡 <strong className="text-white">Buy Box, Listing Quality, Returns,
                    Launch Tracker, Pricing Parity, Channel Comparison, Promotions &
                    Fees</strong> — pages exist, awaiting their respective sheet tabs.
                    Open each to see exactly which tab to populate.
                  </li>
                </ul>
              </SectionCard>
            </div>
          )}

          {/* ===================== P&L ===================== */}
          {activeTab === "pnl" && (
            <PnLPage
              pnl={pnl}
              pnlPeriod={pnlPeriod}
              setPnlPeriod={setPnlPeriod}
              periodOptions={periodOptions}
              loadedMonths={loadedMonthsByChannel[activeChannel] || []}
              asinRows={asinSort.sortedRows}
              asinSort={asinSort}
              channelName={
                (channels.find((c) => c.code === activeChannel) || {}).name || activeChannel
              }
              hasCogs={cogsMap.size > 0}
              hasFixedCosts={fixedCosts.length > 0}
              hasAdSpend={adSpendCurrentMonth > 0}
            />
          )}

          {/* ===================== STUB MODULES ===================== */}
          {activeTab === "buyBox" && (
            <EmptyStateCard
              title="Buy Box Monitor"
              icon={ShoppingBag}
              body="Track % time held buy box / featured offer per ASIN, ASINs that lost the buy box in the last 7 days, and competitors who outbid you. Coming online once the buy-box report tabs are populated."
              requiredSheets={[
                "amzsc_buybox_<YYYY>_<MM>",
                "amzvc_buybox_<YYYY>_<MM> (when Vendor Central is added)",
                "wmt3p_featured_<YYYY>_<MM> (Walmart equivalent)",
              ]}
            />
          )}

          {activeTab === "listingQuality" && (
            <EmptyStateCard
              title="Listing Quality Scorecard"
              icon={FileText}
              body="One-time audit checklist per ASIN per channel: title compliance, ≥5 bullets, ≥1500 char description, A+ content live, ≥6 images, primary image white background, video, backend keywords, all variation children populated. Ranks issues by sales impact and produces a content punch list."
              requiredSheets={[
                "listing_quality (audit columns: sku, asin, channel, has_title, bullet_count, has_aplus, image_count, has_video, ...)",
              ]}
            />
          )}

          {activeTab === "returns" && (
            <EmptyStateCard
              title="Returns Dashboard"
              icon={RefreshCw}
              body="Return rate per ASIN, return $ as % of revenue, reason-code breakdown when available, and an alert for ASINs whose return rate is trending up. Also pulls in negative review velocity if available — paired data catches quality issues fastest."
              requiredSheets={[
                "amzsc_returns_<YYYY>_<MM>",
                "review_velocity (optional, weekly snapshot per ASIN)",
              ]}
            />
          )}

          {activeTab === "launchTracker" && (
            <EmptyStateCard
              title="Launch Tracker"
              icon={Rocket}
              body="Phase 1: launch checklist per new ASIN (listing live, A+ approved, photography done, campaigns built, vine reviews requested). Phase 2: post-launch metrics tracked against benchmarks (units day 30 / 60 / 90, BSR trajectory, review velocity, ROAS). Includes a small-multiples chart overlaying every recent launch on a 'days since launch' axis."
              requiredSheets={[
                "launch_tracker (sku, asin, channel, launch_date, checklist_status_*, ...)",
              ]}
            />
          )}

          {activeTab === "pricingParity" && (
            <EmptyStateCard
              title="Pricing Parity Monitor"
              icon={Tags}
              body="Detect MAP / parity drift across channels and third-party undercutting on Amazon. One row per SKU with a column per channel; flags rows out of parity above a tolerance you set."
              requiredSheets={[
                "pricing_snapshot_<YYYY>_<MM>_<DD> (sku, channel, price, sale_price, snapshot_date)",
              ]}
            />
          )}

          {activeTab === "channelComparison" && (
            <EmptyStateCard
              title="Channel Comparison"
              icon={Globe}
              body="Once the P&L module has at least two channels populated, this view lights up automatically — revenue, profit, margin, ad efficiency, and inventory turn side-by-side per channel."
              requiredSheets={[
                "Already-defined sheets — auto-populates once a second channel has settlement data loaded.",
              ]}
            />
          )}

          {activeTab === "promotionsFees" && (
            <EmptyStateCard
              title="Promotions & Fees"
              icon={Receipt}
              body="Active deals (Lightning, Best, Coupon, Subscribe & Save), discount %, lift in units, and net effect on profit. Also a fee creep audit: storage, long-term storage, removal, customer return, and 'Other' fees as $ and % of revenue, month over month, so silent fee increases get caught."
              requiredSheets={[
                "promotions (deal_type, sku, start_date, end_date, discount_pct, ...)",
                "Fee creep auto-derives from amzsc_settlement_* tabs once 6+ months are loaded.",
              ]}
            />
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
// SETTINGS PAGE
// =============================================================================

function SettingsPage({
  channels,
  loadedMonthsByChannel,
  cogsCount,
  fixedCostsCount,
  hasAdData,
  sheetId,
}) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Connected Sheet"
        subtitle="The Google Sheet ID this dashboard is reading from."
      >
        <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-sm">
          <code className="break-all text-cyan-300">{sheetId}</code>
          <a
            href={`https://docs.google.com/spreadsheets/d/${sheetId}/edit`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 shrink-0 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 hover:border-cyan-400 hover:text-cyan-300"
          >
            Open ↗
          </a>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Override per-deployment by setting <code>VITE_SHEET_ID</code> in Vercel env vars.
        </p>
      </SectionCard>

      <SectionCard
        title="Structural Sheets"
        subtitle="Status of the tabs the dashboard reads on every page."
      >
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <li className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-sm">
            <p className="font-mono text-cyan-300">channel_config</p>
            <p className="mt-1 text-slate-400">
              {channels.filter((c) => c.enabled).length} enabled · {channels.length} total
              registered
            </p>
          </li>
          <li className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-sm">
            <p className="font-mono text-cyan-300">cogs</p>
            <p className="mt-1 text-slate-400">
              {cogsCount} SKUs with landed costs
              {cogsCount === 0 ? " — populate for accurate margin" : ""}
            </p>
          </li>
          <li className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-sm">
            <p className="font-mono text-cyan-300">fixed_costs_monthly</p>
            <p className="mt-1 text-slate-400">
              {fixedCostsCount} entries
              {fixedCostsCount === 0 ? " — Personnel Expenses will show $0" : ""}
            </p>
          </li>
          <li className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-sm">
            <p className="font-mono text-cyan-300">Ad Reports</p>
            <p className="mt-1 text-slate-400">
              {hasAdData ? "Loaded" : "Not loaded"} · expects Sponsored Products /
              Brands / Display Campaigns tabs (bulk operations format)
            </p>
          </li>
        </ul>
      </SectionCard>

      <SectionCard
        title="Channel Settlement Status"
        subtitle="How many monthly settlement tabs have been discovered per channel."
      >
        <ul className="space-y-2 text-sm">
          {channels.map((c) => {
            const months = loadedMonthsByChannel[c.code] || [];
            return (
              <li
                key={c.code}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/40 p-3"
              >
                <span>
                  <span
                    className={cn(
                      "font-medium",
                      c.enabled ? "text-white" : "text-slate-500"
                    )}
                  >
                    {c.name}
                  </span>
                  <span className="ml-2 text-xs text-slate-500">({c.code})</span>
                </span>
                <span className="text-xs text-slate-400">
                  {months.length
                    ? `${months.length} months · latest ${ymToShort(months[0])}`
                    : c.enabled
                      ? "No settlement data yet"
                      : "Disabled"}
                </span>
              </li>
            );
          })}
        </ul>
      </SectionCard>
    </div>
  );
}
