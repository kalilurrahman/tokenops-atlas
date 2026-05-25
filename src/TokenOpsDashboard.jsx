import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const teamData = [
  { team: "Product", spend: 42000, yield: 86 },
  { team: "Marketing", spend: 35000, yield: 78 },
  { team: "Data", spend: 23000, yield: 91 },
  { team: "Support", spend: 18000, yield: 82 }
];

const modelData = [
  { model: "GPT-4o", spend: 28000 },
  { model: "GPT-4o Mini", spend: 37000 },
  { model: "Claude Sonnet", spend: 33000 },
  { model: "Gemini Flash", spend: 20000 }
];

const monthlyTrend = [
  { month: "Jan", baseline: 82000, optimized: 82000, yieldRate: 68 },
  { month: "Feb", baseline: 92000, optimized: 78000, yieldRate: 72 },
  { month: "Mar", baseline: 98000, optimized: 76000, yieldRate: 77 },
  { month: "Apr", baseline: 106000, optimized: 74000, yieldRate: 81 },
  { month: "May", baseline: 118000, optimized: 73000, yieldRate: 83 },
  { month: "Jun", baseline: 126000, optimized: 71000, yieldRate: 84 }
];

const anomalies = [
  ["Support chatbot", "+22% input tokens", "Conversation history exceeded sliding-window policy."],
  ["Content pipeline", "9.4k retries", "Schema validation failed after provider model change."],
  ["Research agent", "$8.6k context waste", "Top-10 retrieval included low-similarity chunks."]
];

const colors = ["#195f8f", "#4f7d39", "#b06b1f", "#a13b32"];

export default function TokenOpsDashboard() {
  const kpis = useMemo(() => {
    const latest = monthlyTrend[monthlyTrend.length - 1];
    return [
      { label: "Current monthly spend", value: `$${latest.baseline.toLocaleString()}` },
      { label: "Optimized run-rate", value: `$${latest.optimized.toLocaleString()}` },
      { label: "Monthly savings", value: `$${(latest.baseline - latest.optimized).toLocaleString()}` },
      { label: "Token yield rate", value: `${latest.yieldRate}%` }
    ];
  }, []);

  return (
    <section className="dashboard stack">
      <div className="page-heading">
        <h1>Operational Dashboard</h1>
        <p>Visibility, allocation, optimization progress, and anomalies in one operating view.</p>
      </div>

      <div className="dashboard-kpis">
        {kpis.map((kpi) => (
          <article className="dash-card" key={kpi.label}>
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
          </article>
        ))}
      </div>

      <div className="dashboard-grid">
        <article className="dash-panel wide">
          <h3>Spend trend and token yield</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={monthlyTrend}>
                <CartesianGrid stroke="#ddd6c9" strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="cost" />
                <YAxis yAxisId="yield" orientation="right" domain={[50, 100]} />
                <Tooltip />
                <Legend />
                <Area yAxisId="cost" type="monotone" dataKey="baseline" name="Baseline spend" stroke="#b06b1f" fill="#f0dcc0" />
                <Area yAxisId="cost" type="monotone" dataKey="optimized" name="Optimized spend" stroke="#195f8f" fill="#d8e8f1" />
                <Line yAxisId="yield" type="monotone" dataKey="yieldRate" name="Yield rate" stroke="#4f7d39" strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dash-panel">
          <h3>Spend by team</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={teamData}>
                <CartesianGrid stroke="#ddd6c9" strokeDasharray="3 3" />
                <XAxis dataKey="team" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="spend" name="Spend">
                  {teamData.map((entry, index) => <Cell key={entry.team} fill={colors[index % colors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dash-panel">
          <h3>Spend by model</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={modelData}>
                <CartesianGrid stroke="#ddd6c9" strokeDasharray="3 3" />
                <XAxis dataKey="model" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="spend" name="Spend" fill="#4f7d39" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <section className="anomaly-board">
        <h3>Top anomalies</h3>
        {anomalies.map(([feature, signal, cause]) => (
          <div className="anomaly-row" key={feature}>
            <strong>{feature}</strong>
            <span>{signal}</span>
            <p>{cause}</p>
          </div>
        ))}
      </section>
    </section>
  );
}
