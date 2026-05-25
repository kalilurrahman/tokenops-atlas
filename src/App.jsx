import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { lazy, Suspense, useMemo, useState } from "react";
import { ArrowRight, Download, Gauge, Layers, LineChart, ShieldCheck, Target, WalletCards } from "lucide-react";
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

function Templates() {
  const templates = [
    ["Request tagging schema", "team, service, feature, environment, model, tokens, latency, status, business outcome"],
    ["Monthly cost review", "spend trend, anomalies, yield rate, quality tradeoffs, optimization backlog"],
    ["Model review checklist", "task complexity, latency SLO, fallback model, expected savings, acceptance tests"],
    ["Budget guardrails", "soft alerts, hard limits, exception process, executive owner"]
  ];
  return (
    <section className="stack">
      <div className="page-heading"><h1>Templates</h1><p>Starter operating artifacts for making TokenOps repeatable.</p></div>
      <div className="section-grid two">{templates.map(([title, body]) => <article className="tile" key={title}><WalletCards size={21} /><h3>{title}</h3><p>{body}</p></article>)}</div>
    </section>
  );
}

function Sources() {
  return <section className="stack"><div className="page-heading"><h1>Sources</h1><p>Reference material used by the TokenOps guide and implementation spec.</p></div><div className="source-list">{content.sources.map((source) => <div key={source}>{source}</div>)}</div></section>;
}

function About() {
  return <section className="split-section"><div><p className="eyebrow">About</p><h1>TokenOps Atlas helps teams turn AI cost into an engineered system.</h1></div><p>The site combines a practical guide, savings calculator, dashboard, patterns, and governance templates so engineering, finance, product, and leadership can work from the same operating picture.</p></section>;
}

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
          <Route path="/templates" element={<Templates />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
