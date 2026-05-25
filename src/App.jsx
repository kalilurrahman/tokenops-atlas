import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { lazy, Suspense, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckSquare,
  ClipboardList,
  Code2,
  Database,
  Download,
  FileCode2,
  FileDown,
  FileText,
  FolderDown,
  Gauge,
  Layers,
  LineChart,
  Package,
  ShieldCheck,
  Target,
  WalletCards,
  Zap
} from "lucide-react";
import { marked } from "marked";
import guideRaw from "./guide.md?raw";
import content from "./tokenops_content.json";
import "./style.css";

const TokenOpsDashboard = lazy(() => import("./TokenOpsDashboard"));

const providerPresets = {
  openai: { premiumInput: 5, premiumOutput: 15, cheapInput: 0.15, cheapOutput: 0.6, label: "OpenAI mix" },
  anthropic: { premiumInput: 3, premiumOutput: 15, cheapInput: 0.8, cheapOutput: 4, label: "Anthropic mix" },
  google: { premiumInput: 1.25, premiumOutput: 10, cheapInput: 0.075, cheapOutput: 0.3, label: "Google mix" }
};

const operatingPillars = [
  { icon: Gauge, title: "Visibility", body: "Know which services, features, teams, and use cases consume tokens and at what cost." },
  { icon: Target, title: "Optimization", body: "Reduce waste through prompt engineering, model tiering, caching, and context management." },
  { icon: ShieldCheck, title: "Governance", body: "Embed token economics into budgets, alerts, reviews, and architecture decisions." }
];

const playbook = [
  { title: "Instrument every call", body: "Tag requests by team, service, feature, environment, model, and outcome." },
  { title: "Allocate spend", body: "Join usage metadata with billing data so token costs become accountable." },
  { title: "Improve token yield", body: "Target 80%+ useful output by reducing retries, irrelevant context, and discarded generations." },
  { title: "Operate continuously", body: "Review budgets, anomalies, model choices, and optimization backlog every month." }
];

/* ─── Template file content for client-side generation ─── */

const templateContents = {
  "request-tagging-schema.yaml": `# TokenOps: Request Tagging Schema
# Configure metadata for every LLM API call at the gateway level.

global:
  required_tags:
    - team
    - service
    - feature
    - environment
    - model
    - use_case
    - cost_center

services:
  email_generator:
    features:
      subject_line_optimization:
        model: gpt-4o-mini
        max_tokens_per_day: 100_000_000
        timeout: 5s
        tags:
          team: marketing
          use_case: content-generation
          cost_center: product-marketing
      body_generation:
        model: gpt-4o
        max_tokens_per_day: 50_000_000
        timeout: 10s
        tags:
          team: marketing
          use_case: content-generation
          cost_center: product-marketing

  support_chatbot:
    features:
      faq_response:
        model: gpt-4o-mini
        max_tokens_per_day: 200_000_000
        timeout: 8s
        tags:
          team: support
          use_case: customer-support
          cost_center: customer-success
      escalation_analysis:
        model: claude-3.5-sonnet
        max_tokens_per_day: 20_000_000
        timeout: 15s
        tags:
          team: support
          use_case: complex-reasoning
          cost_center: customer-success

  data_pipeline:
    features:
      customer_classification:
        model: llama-3.1-70b
        max_tokens_per_day: 500_000_000
        timeout: 30s
        batch_eligible: true
        tags:
          team: data
          use_case: classification
          cost_center: data-platform
`,

  "monthly-cost-review.md": `# Monthly TokenOps Cost Review
## Meeting Template — 60 Minutes

### Pre-Meeting Preparation
- [ ] Pull total spend by team from cost warehouse
- [ ] Calculate month-over-month token velocity change
- [ ] Identify top 3 cost drivers
- [ ] Flag any anomalies (daily cost > avg + 2σ)
- [ ] Update optimization backlog status

---

### 1. Metrics Review (15 min)

| Metric | Last Month | This Month | Trend |
|--------|-----------|------------|-------|
| Total monthly spend | $ | $ | |
| Blended cost/token | $ | $ | |
| Token yield rate | % | % | |
| Cache hit rate | % | % | |
| API error rate | % | % | |

**Discussion prompts:**
- Which services drove the biggest cost changes?
- Are any teams exceeding 80% of their token budget?
- Did per-token pricing change from providers?

---

### 2. Optimization Progress (15 min)

| Initiative | Owner | Status | Impact |
|-----------|-------|--------|--------|
| | | | |

**Discussion prompts:**
- What optimizations shipped this month?
- What measurable savings resulted?
- Any quality regressions from cost changes?

---

### 3. Budget Forecast (10 min)

| Team | Budget | Actual | Forecast EOQ | Status |
|------|--------|--------|-------------|--------|
| | | | | |

**Discussion prompts:**
- Are we on track for quarterly targets?
- Do any budgets need adjustment?

---

### 4. Priorities for Next Month (15 min)

| Priority | Owner | Expected Savings | Deadline |
|----------|-------|-----------------|----------|
| 1. | | | |
| 2. | | | |
| 3. | | | |

---

### Action Items

| Action | Owner | Due Date |
|--------|-------|----------|
| | | |
`,

  "model-selection-matrix.md": `# Model Selection Decision Matrix

## Routing Table

| Task Type | Examples | Baseline Model | Cheaper Alternative | Quality Threshold | Testing Steps | Expected Savings |
|-----------|----------|---------------|--------------------|--------------------|--------------|-----------------|
| Classification | Sentiment, spam, category | GPT-4o Mini | Llama 3.1 70B | ≥94% accuracy | Test on 1,000 cases | 60–95% |
| Extraction | Entity parsing, field extraction | Claude Sonnet | GPT-4o Mini | ≥97% accuracy | Validate on 500 cases | 50–80% |
| Summarization | Condense, bullets, synopsis | Claude Sonnet | GPT-4o Mini | Human eval ≥4/5 | Eval on 50 samples | 40–70% |
| Generation | Email, content, copy | GPT-4o | GPT-4o Mini | A/B test CTR | A/B 10% traffic | 30–60% |
| Complex Reasoning | Analysis, strategy | GPT-4o | Claude Sonnet | Expert review | 100 hard cases | 10–30% |
| Code Generation | Functions, scripts | Claude Sonnet | GPT-4o Mini | Pass rate ≥95% | Test suite pass rate | 40–70% |

## Routing Logic

\`\`\`
function routeRequest(task, complexity, userTier):
  if task == "classification":
    return "llama-3.1-70b"
  elif task == "extraction" and complexity == "low":
    return "gpt-4o-mini"
  elif task in ["summarization", "generation"]:
    return "gpt-4o-mini" if userTier != "enterprise" else "gpt-4o"
  elif task == "complex_reasoning":
    return "gpt-4o"
  else:
    return "gpt-4o-mini"  # default to cost-efficient
\`\`\`

## A/B Testing Protocol

1. Shadow-test cheaper model on 10% of traffic
2. Compare quality metrics for 7 days minimum
3. If quality meets threshold, increase to 50%
4. Full rollout after 14 days with stable metrics
5. Set up alerting for quality regression
`,

  "architecture-decision-record.md": `# Architecture Decision Record: [Feature Name]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated
**Deciders:** [List stakeholders]

---

## Context

Describe the business need and technical context for this AI feature.

## Cost Analysis

| Metric | Estimate |
|--------|----------|
| Tokens per request | ___ input + ___ output |
| Daily requests (projected) | |
| Daily token cost | |
| Monthly token cost | |
| Model | |

## Unit Economics

| Metric | Value |
|--------|-------|
| Manual cost per task | $ |
| Automated cost per task | $ |
| Cost savings per task | $ |
| Break-even volume | tasks/month |
| ROI at projected volume | x |

## Model Selection Rationale

Why this model was chosen over alternatives. Include benchmark results.

## Optimization Roadmap

| Quarter | Initiative | Expected Savings |
|---------|-----------|-----------------|
| Q1 | Semantic caching for repeated queries | 40–50% on cache-eligible traffic |
| Q2 | Model tiering for simple subtasks | 30% blended reduction |
| Q3 | Context trimming + prompt compression | 20% input reduction |
| Q4 | Batch processing for async workloads | 50% on batch-eligible |

**Target:** ___% total cost reduction by end of year

## Risk Assessment

| Scenario | Monthly Impact | Mitigation |
|----------|---------------|------------|
| Cost doubles (2x) | $ | |
| Cost triples (3x) | $ | |
| Volume grows 5x | $ | |
| Provider outage | | Failover to secondary model |

## Decision

State the decision and rationale.

## Consequences

What trade-offs are accepted. What follow-up actions are needed.
`,

  "prompt-optimization-checklist.md": `# Prompt Optimization Checklist

Complete before deploying any new or modified system prompt.

## Compression
- [ ] Removed redundant instructions (no duplication across sections)
- [ ] Compressed examples (one short example, not many verbose ones)
- [ ] Removed meta-instructions (instructions about how to follow instructions)
- [ ] Moved static context to templates (injected at call time, not baked in)

## Format
- [ ] Using structured output format (JSON, not prose) where applicable
- [ ] Set output length constraints (max tokens, bullet count, character limit)
- [ ] Enforced formatting in code rather than in prompt where possible

## Validation
- [ ] Tested output quality on 100+ representative test cases
- [ ] Compared token cost with previous prompt version
- [ ] A/B tested on 10%+ of production traffic for 7+ days
- [ ] Verified no quality regression in key metrics

## Operations
- [ ] Documented compression decisions (what changed and why)
- [ ] Set up monitoring alerts for quality degradation
- [ ] Scheduled 30-day review to reassess prompt performance
`,

  "budget-guardrails.yaml": `# TokenOps: Budget Guardrails Configuration
# Enforce token budgets with soft alerts and hard limits.

global_defaults:
  alert_threshold_pct: 80
  hard_limit_pct: 110
  review_cycle: monthly
  currency: USD

alert_channels:
  slack: "#tokenops-alerts"
  email:
    - finops@company.com
    - engineering-leads@company.com
  pagerduty:
    service_key: "tok-ops-budget"
    severity: warning

service_budgets:
  support_chatbot:
    monthly_token_budget: 10_000_000_000
    soft_alert: 8_000_000_000    # 80%
    hard_limit: 11_000_000_000   # 110%
    owners:
      - alice@company.com
      - bob@company.com
    escalation: vp-product@company.com
    model_allowlist:
      - gpt-4o-mini
      - gpt-4o

  data_enrichment:
    monthly_token_budget: 5_000_000_000
    soft_alert: 4_000_000_000
    hard_limit: 5_500_000_000
    owners:
      - carol@company.com
    escalation: dir-engineering@company.com
    batch_only: true

  content_generator:
    monthly_token_budget: 2_000_000_000
    soft_alert: 1_600_000_000
    hard_limit: 2_200_000_000
    owners:
      - dave@company.com
    escalation: vp-marketing@company.com

exception_process:
  approval_required_from: finance-partner
  max_temporary_increase_pct: 25
  temporary_increase_duration_days: 14
  documentation_required: true
`,

  "instrumentation-checklist.md": `# Instrumentation Checklist

Complete before launching any LLM-powered feature to production.

## Tagging
- [ ] All API calls tagged with metadata (team, service, feature, model)
- [ ] Tags include environment (dev / staging / production)
- [ ] Tags include use_case category (classification, generation, reasoning)
- [ ] Tags include cost_center for financial allocation
- [ ] Metadata logged to observability system (DataDog, Splunk, etc.)

## Cost Tracking
- [ ] Logs flow from gateway to cost data warehouse
- [ ] Allocation reports built and validated against provider billing
- [ ] Cost per request metric calculated and available
- [ ] Token yield rate tracked (valuable output / total tokens)

## Governance
- [ ] Token budget set and documented
- [ ] Budget enforced at API gateway level
- [ ] Soft alerts configured at 80% of budget
- [ ] Hard limits configured at 110% of budget
- [ ] Escalation contacts documented

## Operations
- [ ] Monthly cost review meeting scheduled
- [ ] Team trained on dashboard and metrics
- [ ] Quality metrics baseline established
- [ ] Optimization plan drafted with quarterly targets
- [ ] Alert runbooks documented
`,

  "token-pricing-reference.md": `# Token Pricing Reference — May 2026

## Major Providers & Models

| Provider | Model | Input Rate | Output Rate | Context Window | Best For |
|----------|-------|-----------|-------------|---------------|----------|
| OpenAI | GPT-4o | $5/1M | $15/1M | 128K | Complex reasoning, analysis |
| OpenAI | GPT-4o Mini | $0.15/1M | $0.60/1M | 128K | General tasks, cost-sensitive |
| Anthropic | Claude 3.5 Sonnet | $3/1M | $15/1M | 200K | Long context, nuance |
| Anthropic | Claude 3.5 Haiku | $0.80/1M | $4/1M | 200K | Fast, cheap classification |
| Google | Gemini 2.0 Flash | $0.075/1M | $0.30/1M | 1M | High-volume, longer contexts |
| Meta | Llama 3.1 70B | $0.40/1M | $0.60/1M | 128K | On-prem or via provider |
| Mistral | Mistral Large | $2/1M | $6/1M | 128K | European compliance |

## Cost Calculation Formulas

### Cost Per Request
\`\`\`
Cost = (input_tokens × input_rate / 1M) + (output_tokens × output_rate / 1M)

Example: 2,000 input + 500 output, GPT-4o
= (2,000 × $5/1M) + (500 × $15/1M)
= $0.010 + $0.0075
= $0.0175 per request
\`\`\`

### Monthly Forecast
\`\`\`
Monthly cost = daily_requests × cost_per_request × 30
= 100,000 × $0.0175 × 30
= $52,500/month
\`\`\`

### Blended Rate
\`\`\`
Blended = total_cost / total_tokens
= (input_tokens × input_rate + output_tokens × output_rate) / total_tokens
\`\`\`

## Discounts
- **Batch API:** 50% discount (2–4 hour processing delay)
- **Volume tiers:** 20–50% at enterprise scale
- **Prompt caching:** Cached prefix tokens billed at reduced rate
`,

  "implementation-playbook.md": `# TokenOps Implementation Playbook

## Phase 1: Baseline Audit (Weeks 1–2)

### Step 1: Inventory All LLM API Calls
Identify every service calling an LLM API. Output: spreadsheet with service name, endpoint, model, team, volume estimate, use case.

### Step 2: Calculate Current Baseline
Pull from provider billing:
- Total tokens (input + output)
- Total cost
- Average tokens per call
- Blended cost per token = Total Cost / Total Tokens

### Step 3: Identify Optimization Targets
Priority Score = (Monthly Tokens) × (Estimated Savings %) / (Quality Risk)

Focus on: high-volume endpoints, excessive context retrieval, frontier models on simple tasks, batch-eligible workloads.

---

## Phase 2: Instrumentation (Weeks 2–4)

### Step 1: Define Tagging Schema
Minimum: team, service, feature, environment, model, use_case, cost_center

### Step 2: Deploy API Gateway
Centralized gateway (LiteLLM, custom middleware) that intercepts all calls, adds metadata, logs to observability, enforces rate limits.

### Step 3: Set Up Cost Tracking
Join metadata logs with billing data. Store in data warehouse. Build allocation reports by team, service, feature, model.

---

## Phase 3: Allocation & Reporting (Weeks 3–5)

### Step 1: Build Cost Allocation Reports
Query cost warehouse by team, service, feature. Calculate blended cost per token by dimension.

### Step 2: Define Chargeback Model
Showback (informational) for first 3 months, then transition to chargeback.

### Step 3: Build Self-Serve Dashboard
Engineering view: cost by service, model usage, yield rate, anomalies.
Finance view: team allocation, trends, budget vs actual.
Product view: cost per feature, unit economics.

---

## Phase 4: Optimization (Weeks 5–8)

Key strategies in priority order:
1. **Model tiering** — Route to cheapest model meeting quality threshold (30–60% savings)
2. **Semantic caching** — Cache responses for similar queries (40–80% on repetitive workloads)
3. **Context trimming** — Reduce retrieved chunks, summarize history (30–60% input reduction)
4. **Prompt compression** — Remove redundancy from system prompts (20–50% reduction)
5. **Output constraints** — Force structured, shorter responses (20–40% output reduction)
6. **Batch processing** — Move async workloads to batch API (50% discount)

---

## Phase 5: Governance (Weeks 8–12)

### Organizational Structure
- TokenOps lead (strategy & facilitation)
- Platform engineer (tooling & dashboards)
- Finance partner (allocation & budgets)

### Review Cadence
- Monthly: Cost review meeting (60 min)
- Quarterly: Budget adjustment
- Annually: Budget targets aligned to growth plans

### Budget Enforcement
- Soft alerts at 80% of budget
- Hard limits at 110%
- Exception process requires finance approval
`
};

/* ─── Utility: download file from content ─── */
function downloadFile(filename, fileContent) {
  const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadAllTemplates() {
  Object.entries(templateContents).forEach(([filename, fileContent], i) => {
    setTimeout(() => downloadFile(filename, fileContent), i * 200);
  });
}

/* ─── Icon helpers ─── */
const formatIcons = {
  YAML: FileCode2,
  Markdown: FileText,
  Guide: BookOpen,
  CSV: ClipboardList,
  SQL: Database,
  PDF: FileDown
};

const formatBadgeClass = {
  YAML: "badge-yaml",
  Markdown: "badge-md",
  Guide: "badge-guide",
  CSV: "badge-csv",
  SQL: "badge-yaml",
  PDF: "badge-csv"
};

const categoryIconClass = {
  Engineering: "",
  Finance: "finance",
  Governance: "",
  Document: "doc"
};

/* ─── Model pricing data for Toolkit ─── */
const modelPricingData = {
  "GPT-4o": { input: 5, output: 15 },
  "GPT-4o Mini": { input: 0.15, output: 0.60 },
  "Claude 3.5 Sonnet": { input: 3, output: 15 },
  "Claude 3.5 Haiku": { input: 0.80, output: 4 },
  "Gemini 2.0 Flash": { input: 0.075, output: 0.30 },
  "Llama 3.1 70B": { input: 0.40, output: 0.60 }
};

/* ─── Prompt Compressor (from TokenOps Platform codebase) ─── */
function compressPrompt(text) {
  const changes = [];
  let current = text;
  const originalLength = current.length;

  // Collapse whitespace
  const step1 = current.replace(/\s+/g, " ").trim();
  if (step1.length < current.length) changes.push(`Collapsed whitespace: -${current.length - step1.length} chars`);
  current = step1;

  // Remove polite fluff
  const fluffPatterns = [/\b(please|kindly|could you|would you|i'd like you to)\b/gi, /\b(thanks|thank you|appreciate it)\b/gi, /\b(just|simply|basically|actually)\b/gi];
  for (const pattern of fluffPatterns) current = current.replace(pattern, "");
  const step2 = current.replace(/\s+/g, " ").trim();
  if (step2.length < step1.length) changes.push(`Removed fluff words: -${step1.length - step2.length} chars`);
  current = step2;

  // Explicit inversion
  current = current.replace(/\bdo not\b/gi, "don't").replace(/\bin order to\b/gi, "to").replace(/\bit is (important|critical|necessary) that\b/gi, "must");
  const step3 = current.replace(/\s+/g, " ").trim();
  if (step3.length < step2.length) changes.push(`Optimized phrasing: -${step2.length - step3.length} chars`);
  current = step3;

  return { compressed: current, changes, originalLength, compressedLength: current.length, savingsPercent: ((originalLength - current.length) / originalLength) * 100 };
}

/* ─── Layout ─── */

function Layout({ children }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink className="brand" to="/">TokenOps Atlas</NavLink>
        <nav>
          {content.nav.map((item) => (
            <NavLink key={item} to={item === "Home" ? "/" : `/${item.toLowerCase()}`}>
              {item}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}

/* ─── Home ─── */

function Home() {
  return (
    <div className="stack">
      <section className="hero-band">
        <div>
          <p className="eyebrow">FinOps for tokens</p>
          <h1>Run LLM spend like a professional operating discipline.</h1>
          <p className="hero-copy">
            TokenOps applies visibility, allocation, optimization, and governance to LLM token consumption so AI products can scale without invoice surprises.
          </p>
          <div className="hero-actions">
            <NavLink className="primary-action" to="/calculator">Open calculator <ArrowRight size={17} /></NavLink>
            <NavLink className="secondary-action" to="/dashboard">View dashboard</NavLink>
          </div>
        </div>
        <div className="command-panel">
          <div className="panel-row"><span>Monthly AI spend</span><strong>$126,000</strong></div>
          <div className="panel-row"><span>Optimized run-rate</span><strong>$71,000</strong></div>
          <div className="panel-row"><span>Token yield target</span><strong>80%+</strong></div>
          <div className="progress-track"><span style={{ width: "84%" }} /></div>
        </div>
      </section>

      <section className="section-grid three">
        {operatingPillars.map(({ icon: Icon, title, body }) => (
          <article className="tile" key={title}>
            <Icon size={22} />
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <section className="split-section">
        <div>
          <p className="eyebrow">From the guide</p>
          <h2>Token spend becomes urgent when it scales invisibly.</h2>
          <p>
            The guide frames the core problem clearly: token volume can grow exponentially while per-token prices decline only incrementally. Without deliberate tagging, logging, and allocation, token economics becomes a black box.
          </p>
        </div>
        <div className="timeline">
          {playbook.map((item, index) => (
            <div className="timeline-item" key={item.title}>
              <span>{index + 1}</span>
              <div><h3>{item.title}</h3><p>{item.body}</p></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── Guide ─── */

function Guide() {
  return (
    <section className="article-shell">
      <aside>
        <h2>Guide</h2>
        <p>The complete TokenOps operating manual from the source markdown.</p>
      </aside>
      <article className="guide" dangerouslySetInnerHTML={{ __html: marked.parse(guideRaw) }} />
    </section>
  );
}

/* ─── Patterns ─── */

function Patterns() {
  return (
    <section className="stack">
      <div className="page-heading">
        <h1>Optimization Patterns</h1>
        <p>Reusable recipes for reducing waste without degrading outcomes.</p>
      </div>
      <div className="section-grid">
        {content.patterns.map((pattern) => (
          <article className="tile" key={pattern.title}>
            <Layers size={21} />
            <h3>{pattern.title}</h3>
            <p>{pattern.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ─── Calculator ─── */

function Calculator() {
  const [provider, setProvider] = useState("openai");
  const [requestsPerMonth, setRequestsPerMonth] = useState(3000000);
  const [inputTokens, setInputTokens] = useState(1800);
  const [outputTokens, setOutputTokens] = useState(450);
  const [cacheHitRate, setCacheHitRate] = useState(35);
  const [batchShare, setBatchShare] = useState(30);
  const [cheapModelShare, setCheapModelShare] = useState(60);
  const [implementationCost, setImplementationCost] = useState(25000);
  const pricing = providerPresets[provider];

  const summary = useMemo(() => {
    const basePerRequest = (inputTokens * pricing.premiumInput + outputTokens * pricing.premiumOutput) / 1000000;
    const baselineMonthly = basePerRequest * requestsPerMonth;
    const effectiveInput = inputTokens * (1 - cacheHitRate / 100);
    const cheapShare = cheapModelShare / 100;
    const premiumShare = 1 - cheapShare;
    const premiumCost = (effectiveInput * pricing.premiumInput + outputTokens * pricing.premiumOutput) / 1000000;
    const cheapCost = (effectiveInput * pricing.cheapInput + outputTokens * pricing.cheapOutput) / 1000000;
    const batchDiscount = 1 - (batchShare / 100) * 0.5;
    const optimizedMonthly = (premiumShare * premiumCost + cheapShare * cheapCost) * requestsPerMonth * batchDiscount;
    const savings = baselineMonthly - optimizedMonthly;
    return {
      baselineMonthly,
      optimizedMonthly,
      savings,
      savingsPct: baselineMonthly ? (savings / baselineMonthly) * 100 : 0,
      paybackMonths: savings > 0 ? implementationCost / savings : 0
    };
  }, [requestsPerMonth, inputTokens, outputTokens, cacheHitRate, batchShare, cheapModelShare, implementationCost, pricing]);

  const exportCSV = () => {
    const rows = [
      ["Provider", providerPresets[provider].label],
      ["Requests/Month", requestsPerMonth],
      ["Input Tokens", inputTokens],
      ["Output Tokens", outputTokens],
      ["Cache Hit Rate", `${cacheHitRate}%`],
      ["Batch Share", `${batchShare}%`],
      ["Lower-cost Model Share", `${cheapModelShare}%`],
      ["Baseline Monthly USD", summary.baselineMonthly.toFixed(2)],
      ["Optimized Monthly USD", summary.optimizedMonthly.toFixed(2)],
      ["Monthly Savings USD", summary.savings.toFixed(2)],
      ["Savings Percent", `${summary.savingsPct.toFixed(1)}%`],
      ["Payback Months", summary.paybackMonths.toFixed(1)]
    ];
    const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tokenops-scenario.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="stack">
      <div className="page-heading">
        <h1>TokenOps Savings Calculator</h1>
        <p>Estimate the impact of caching, model routing, batching, and implementation cost.</p>
      </div>
      <div className="calculator-layout">
        <form className="control-surface">
          <label>Pricing preset<select value={provider} onChange={(event) => setProvider(event.target.value)}>{Object.entries(providerPresets).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label>
          <label>Requests / month<input type="number" value={requestsPerMonth} onChange={(event) => setRequestsPerMonth(Number(event.target.value))} /></label>
          <label>Input tokens / request<input type="number" value={inputTokens} onChange={(event) => setInputTokens(Number(event.target.value))} /></label>
          <label>Output tokens / request<input type="number" value={outputTokens} onChange={(event) => setOutputTokens(Number(event.target.value))} /></label>
          <label>Cache hit rate (%)<input type="number" value={cacheHitRate} onChange={(event) => setCacheHitRate(Number(event.target.value))} /></label>
          <label>Batch share (%)<input type="number" value={batchShare} onChange={(event) => setBatchShare(Number(event.target.value))} /></label>
          <label>Lower-cost model share (%)<input type="number" value={cheapModelShare} onChange={(event) => setCheapModelShare(Number(event.target.value))} /></label>
          <label>Implementation cost ($)<input type="number" value={implementationCost} onChange={(event) => setImplementationCost(Number(event.target.value))} /></label>
        </form>
        <div className="result-surface">
          <div className="metric-row"><span>Baseline monthly</span><strong>${summary.baselineMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></div>
          <div className="metric-row"><span>Optimized monthly</span><strong>${summary.optimizedMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></div>
          <div className="metric-row accent"><span>Monthly savings</span><strong>${summary.savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></div>
          <div className="metric-row"><span>Savings rate</span><strong>{summary.savingsPct.toFixed(1)}%</strong></div>
          <div className="metric-row"><span>Payback</span><strong>{summary.paybackMonths.toFixed(1)} months</strong></div>
          <div className="executive-note">
            At {requestsPerMonth.toLocaleString()} monthly requests, this scenario lowers run-rate by {summary.savingsPct.toFixed(1)}% while preserving a clear optimization audit trail.
          </div>
          <button className="primary-action button-action" type="button" onClick={exportCSV}><Download size={17} /> Download CSV</button>
        </div>
      </div>
    </section>
  );
}

/* ─── Resources Page ─── */

function ResourceCard({ item, iconVariant }) {
  const FormatIcon = formatIcons[item.format] || FileText;
  const badgeClass = formatBadgeClass[item.format] || "badge-md";
  const iconClass = iconVariant || categoryIconClass[item.category] || "";
  const hasDownload = item.file && templateContents[item.file];

  return (
    <article className="resource-card">
      <div className="resource-card-header">
        <div className={`resource-card-icon ${iconClass}`}>
          <FormatIcon size={22} />
        </div>
        <div>
          <h3>{item.title}</h3>
          <p>{item.desc}</p>
        </div>
      </div>
      <div className="resource-card-footer">
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span className={`badge ${badgeClass}`}>{item.format}</span>
          <span className="category-tag">{item.category}</span>
        </div>
        {hasDownload && (
          <button
            className="download-btn"
            onClick={() => downloadFile(item.file, templateContents[item.file])}
          >
            <Download size={15} /> Download
          </button>
        )}
        {!hasDownload && item.format === "PDF" && item.file && (
          <a className="download-btn" href={`${import.meta.env.BASE_URL}templates/${item.file}`} download>
            <Download size={15} /> Download PDF
          </a>
        )}
        {!hasDownload && item.file === null && (
          <NavLink className="download-btn" to="/guide" style={{ textDecoration: "none" }}>
            <BookOpen size={15} /> Read in Guide
          </NavLink>
        )}
      </div>
    </article>
  );
}

function Resources() {
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Document", "Engineering", "Finance", "Governance"];

  const allItems = [...content.resources, ...content.templates];
  const filtered = filter === "All" ? allItems : allItems.filter((item) => item.category === filter);

  return (
    <section className="stack">
      <div className="page-heading">
        <h1>Resources</h1>
        <p>Documents, templates, and starter artifacts to implement TokenOps across your organization.</p>
      </div>

      {/* Starter Kit Banner */}
      <div className="starter-kit-banner">
        <div>
          <h3><Package size={20} style={{ verticalAlign: "middle", marginRight: 8 }} />Starter Kit — All Templates</h3>
          <p>Download every template and reference document in one batch. Get your team from zero to instrumented in weeks, not months.</p>
          <div className="starter-kit-items">
            <span><CheckSquare size={12} /> 7 Templates</span>
            <span><FileText size={12} /> 2 Documents</span>
            <span><FileCode2 size={12} /> YAML + Markdown</span>
          </div>
        </div>
        <button className="download-btn" onClick={downloadAllTemplates}>
          <FolderDown size={18} /> Download All
        </button>
      </div>

      {/* Filters */}
      <div className="filter-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-tab ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resource Cards */}
      <div className="section-grid two">
        {filtered.map((item) => (
          <ResourceCard key={item.title} item={item} />
        ))}
      </div>
    </section>
  );
}

/* ─── Enhanced Templates ─── */

function Templates() {
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Engineering", "Finance", "Governance"];
  const filtered = filter === "All" ? content.templates : content.templates.filter((t) => t.category === filter);

  return (
    <section className="stack">
      <div className="page-heading">
        <h1>Templates</h1>
        <p>Starter operating artifacts for making TokenOps repeatable. Each template is ready to download and customize.</p>
      </div>

      <div className="filter-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-tab ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="section-grid two">
        {filtered.map((template) => (
          <ResourceCard key={template.title} item={template} />
        ))}
      </div>
    </section>
  );
}

/* ─── Toolkit ─── */

function Toolkit() {
  const [promptInput, setPromptInput] = useState("Please kindly analyze the following data and could you provide a comprehensive summary. It is important that you include all relevant details. Thank you for your help, I would appreciate it if you could also just basically identify the key trends in order to support our decision making process.");
  const [compressionResult, setCompressionResult] = useState(null);
  const [compInputTokens, setCompInputTokens] = useState(2000);
  const [compOutputTokens, setCompOutputTokens] = useState(500);
  const [compDailyRequests, setCompDailyRequests] = useState(100000);

  const handleCompress = () => {
    setCompressionResult(compressPrompt(promptInput));
  };

  const comparisonData = useMemo(() => {
    return Object.entries(modelPricingData).map(([name, pricing]) => {
      const costPerRequest = (compInputTokens * pricing.input + compOutputTokens * pricing.output) / 1000000;
      const monthlyCost = costPerRequest * compDailyRequests * 30;
      return { name, costPerRequest, monthlyCost, inputRate: pricing.input, outputRate: pricing.output };
    }).sort((a, b) => a.monthlyCost - b.monthlyCost);
  }, [compInputTokens, compOutputTokens, compDailyRequests]);

  const cheapest = comparisonData[0];
  const mostExpensive = comparisonData[comparisonData.length - 1];

  return (
    <section className="stack">
      <div className="page-heading">
        <h1>Toolkit</h1>
        <p>Interactive tools to test TokenOps optimization strategies. Try prompt compression and model cost comparison live.</p>
      </div>

      {/* Prompt Compressor */}
      <div className="toolkit-panel">
        <div className="toolkit-panel-header">
          <Zap size={20} />
          <div>
            <h3>Prompt Compressor</h3>
            <p>Paste a system prompt or query to see how compression reduces token count without losing meaning.</p>
          </div>
        </div>
        <div className="toolkit-split">
          <div>
            <label>Input prompt
              <textarea className="toolkit-textarea" value={promptInput} onChange={(e) => setPromptInput(e.target.value)} rows={6} />
            </label>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>~{Math.ceil(promptInput.length / 4)} tokens ({promptInput.length} chars)</span>
              <button className="download-btn primary" onClick={handleCompress}><Zap size={14} /> Compress</button>
            </div>
          </div>
          <div>
            {compressionResult ? (
              <>
                <label>Compressed output
                  <textarea className="toolkit-textarea compressed" value={compressionResult.compressed} readOnly rows={6} />
                </label>
                <div className="compression-stats">
                  <div className="compression-stat">
                    <strong>{compressionResult.savingsPercent.toFixed(1)}%</strong>
                    <span>reduction</span>
                  </div>
                  <div className="compression-stat">
                    <strong>{compressionResult.originalLength - compressionResult.compressedLength}</strong>
                    <span>chars saved</span>
                  </div>
                  <div className="compression-stat">
                    <strong>~{Math.ceil(compressionResult.compressedLength / 4)}</strong>
                    <span>tokens after</span>
                  </div>
                </div>
                {compressionResult.changes.length > 0 && (
                  <div className="compression-changes">
                    {compressionResult.changes.map((change, i) => <div key={i}>✓ {change}</div>)}
                  </div>
                )}
              </>
            ) : (
              <div className="toolkit-placeholder">
                <Zap size={32} />
                <p>Click "Compress" to see the optimized version of your prompt.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Model Cost Comparator */}
      <div className="toolkit-panel">
        <div className="toolkit-panel-header">
          <LineChart size={20} />
          <div>
            <h3>Model Cost Comparator</h3>
            <p>Compare monthly costs across all major models for your workload parameters.</p>
          </div>
        </div>
        <div className="comparator-controls">
          <label>Input tokens / request
            <input type="number" value={compInputTokens} onChange={(e) => setCompInputTokens(Number(e.target.value))} />
          </label>
          <label>Output tokens / request
            <input type="number" value={compOutputTokens} onChange={(e) => setCompOutputTokens(Number(e.target.value))} />
          </label>
          <label>Daily requests
            <input type="number" value={compDailyRequests} onChange={(e) => setCompDailyRequests(Number(e.target.value))} />
          </label>
        </div>
        <div className="comparator-table">
          <div className="comparator-header">
            <span>Model</span><span>Input rate</span><span>Output rate</span><span>Cost/request</span><span>Monthly cost</span><span>vs. cheapest</span>
          </div>
          {comparisonData.map((model, i) => {
            const multiplier = cheapest.monthlyCost > 0 ? model.monthlyCost / cheapest.monthlyCost : 1;
            const barWidth = mostExpensive.monthlyCost > 0 ? (model.monthlyCost / mostExpensive.monthlyCost) * 100 : 0;
            return (
              <div className={`comparator-row ${i === 0 ? "cheapest" : ""}`} key={model.name}>
                <span className="comparator-model">{i === 0 && "🏆 "}{model.name}</span>
                <span>${model.inputRate}/1M</span>
                <span>${model.outputRate}/1M</span>
                <span>${model.costPerRequest.toFixed(6)}</span>
                <span className="comparator-cost">
                  ${model.monthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  <span className="comparator-bar" style={{ width: `${barWidth}%` }} />
                </span>
                <span className="comparator-mult">{multiplier.toFixed(1)}x</span>
              </div>
            );
          })}
        </div>
        {cheapest && mostExpensive && cheapest.name !== mostExpensive.name && (
          <div className="executive-note">
            Routing from {mostExpensive.name} to {cheapest.name} would save ${(mostExpensive.monthlyCost - cheapest.monthlyCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}/month ({((1 - cheapest.monthlyCost / mostExpensive.monthlyCost) * 100).toFixed(0)}% reduction) at {compDailyRequests.toLocaleString()} daily requests.
          </div>
        )}
      </div>

      {/* Code Reference Downloads */}
      <div className="toolkit-panel">
        <div className="toolkit-panel-header">
          <Code2 size={20} />
          <div>
            <h3>Reference Implementation</h3>
            <p>Download TypeScript source files for building your own TokenOps infrastructure.</p>
          </div>
        </div>
        <div className="section-grid three">
          {[
            { title: "Database Schema", desc: "PostgreSQL tables for usage logging, teams, and budgets.", file: "supabase-schema.sql", format: "SQL" },
            { title: "Budget Guardrails", desc: "YAML config for token budget enforcement with alerts.", file: "budget-guardrails.yaml", format: "YAML" },
            { title: "Tagging Schema", desc: "LLM gateway configuration with metadata tagging.", file: "request-tagging-schema.yaml", format: "YAML" }
          ].map((item) => (
            <article className="tile" key={item.title} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Database size={20} />
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <button className="download-btn" style={{ marginTop: "auto", alignSelf: "flex-start" }} onClick={() => templateContents[item.file] && downloadFile(item.file, templateContents[item.file])}>
                <Download size={14} /> {item.format}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Sources ─── */

function Sources() {
  return <section className="stack"><div className="page-heading"><h1>Sources</h1><p>Reference material used by the TokenOps guide and implementation spec.</p></div><div className="source-list">{content.sources.map((source) => <div key={source}>{source}</div>)}</div></section>;
}

/* ─── Enhanced About ─── */

function About() {
  const features = [
    { icon: BookOpen, title: "Comprehensive Guide", desc: "45,000-word operating manual covering foundations, framework, implementation, and governance.", to: "/guide" },
    { icon: LineChart, title: "Savings Calculator", desc: "Model the impact of caching, routing, batching, and implementation cost on your token spend.", to: "/calculator" },
    { icon: Gauge, title: "Operational Dashboard", desc: "Visibility into spend trends, team allocation, model costs, yield rates, and anomalies.", to: "/dashboard" },
    { icon: Zap, title: "Interactive Toolkit", desc: "Live prompt compressor, model cost comparator, and reference implementation downloads.", to: "/toolkit" },
    { icon: FolderDown, title: "Resources & Templates", desc: "Downloadable documents, checklists, schemas, and starter configs for your team.", to: "/resources" },
    { icon: Target, title: "Unit Economics", desc: "Metrics frameworks for engineering, finance, and product to connect cost to business impact.", to: "/guide" }
  ];

  return (
    <section className="stack">
      <div className="about-hero">
        <div>
          <p className="eyebrow">About TokenOps Atlas</p>
          <h1>Turn AI cost into an engineered system.</h1>
          <p className="about-hero-desc">
            TokenOps Atlas is the open reference for teams applying FinOps discipline to LLM token consumption. It combines a practical guide, interactive tools, and governance templates so engineering, finance, product, and leadership can work from the same operating picture.
          </p>
        </div>
        <div className="about-stats">
          <div className="about-stat"><strong>45K+</strong><span>Words of guidance</span></div>
          <div className="about-stat"><strong>12</strong><span>Downloadable resources</span></div>
          <div className="about-stat"><strong>7</strong><span>Optimization patterns</span></div>
          <div className="about-stat"><strong>5</strong><span>Interactive tools</span></div>
        </div>
      </div>

      <div className="about-features">
        {features.map(({ icon: Icon, title, desc, to }) => (
          <NavLink className="about-feature-card" to={to} key={title}>
            <Icon size={22} />
            <h3>{title}</h3>
            <p>{desc}</p>
            <ArrowRight size={16} className="card-arrow" />
          </NavLink>
        ))}
      </div>

      <div className="about-cta">
        <h2>Ready to get started?</h2>
        <p>Begin with a baseline audit, deploy instrumentation, and start optimizing in weeks.</p>
        <div className="about-cta-actions">
          <NavLink className="primary-action button-action" to="/resources"><FolderDown size={17} /> Download Starter Kit</NavLink>
          <NavLink className="primary-action" to="/guide" style={{ border: "1px solid var(--line)" }}><BookOpen size={17} /> Read the Guide</NavLink>
        </div>
      </div>
    </section>
  );
}

/* ─── App Shell ─── */

function App({ basePath = "/" }) {
  return (
    <BrowserRouter basename={basePath}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/patterns" element={<Patterns />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/dashboard" element={<Suspense fallback={<div className="loading-panel">Loading dashboard...</div>}><TokenOpsDashboard /></Suspense>} />
          <Route path="/toolkit" element={<Toolkit />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
