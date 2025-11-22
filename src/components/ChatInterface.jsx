'use client';

import { useEffect, useRef, useState } from "react";
import { C1Component, ThemeProvider } from "@thesysai/genui-sdk";

const PROMPT_PRESETS = [
  {
    title: "Investor Artifact",
    description: "Craft a venture-ready raise brief with KPIs and CTAs.",
    prompt:
      "Create an immersive investment memo for a healthcare automation startup. Include KPI cards, diligence checklist, highlights, and CTA buttons for investors.",
    intent: "Investor-ready narrative",
  },
  {
    title: "GTM Launchpad",
    description: "Launch plan with swim-lanes and enablement tasks.",
    prompt:
      "Design a GTM launch board for a new ClinixAI claims feature featuring timelines, channel plan, enablement checklist, and launch-readiness scorecards.",
    intent: "GTM plan",
  },
  {
    title: "Executive Snapshot",
    description: "C-level dashboard with KPIs, risks, and asks.",
    prompt:
      "Produce an executive dashboard for a digital health platform summarizing KPIs, risk callouts, hiring plan, and next-step CTAs.",
    intent: "Executive dashboard",
  },
  {
    title: "Workflow Copilot",
    description: "Decision tree with action buttons and alerts.",
    prompt:
      "Generate a workflow copilot that triages support tickets with decision pillars, priority chips, next-action buttons, and automation toggles.",
    intent: "Workflow automation",
  },
];

const HERO_STATS = [
  { label: "UI primitives", value: "140+" },
  { label: "Layout types", value: "20+" },
  { label: "Live data hooks", value: "Built-in" },
];

const HERO_PILLS = [
  "Generate structured UI from intent",
  "Inspect the raw C1 markup",
  "Swap prompts to change artifacts",
];

const QUICK_ACTIONS = [
  {
    label: "Strategy brief",
    subtitle: "Executive-ready plans with CTAs & KPIs",
    prompt:
      "Draft a GTM strategy artifact for a healthcare claims automation feature. Include KPI scorecards, launch timeline, risk register, and executive asks.",
    intent: "Strategy brief",
  },
  {
    label: "Ops cockpit",
    subtitle: "Dashboards with tags, filters, alerts",
    prompt:
      "Create an operations cockpit for a revenue org. Include KPI cards, backlog widgets, escalation alerts, and an action checklist with owners.",
    intent: "Operations dashboard",
  },
  {
    label: "Workflow copilot",
    subtitle: "Decision trees + action buttons",
    prompt:
      "Generate a ticket-triage copilot artifact that uses decision pillars, chips, CTA buttons, and per-step guidance for onboarding agents.",
    intent: "Workflow copilot",
  },
];

const createClientId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const formatTimestamp = (timestamp) =>
  new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "numeric",
  }).format(timestamp);

const PlaceholderArtifact = () => (
  <div className="c1-placeholder-shell">
    <div className="c1-placeholder-header">
      <div>
        <p>ClinixAI Launch HQ</p>
        <h3>Live launch control surface</h3>
      </div>
      <div className="c1-placeholder-badges">
        <span>Launch readiness · 92%</span>
        <span>ARR impact · $2.8M</span>
      </div>
    </div>
    <div className="c1-placeholder-grid">
      <div className="c1-placeholder-card">
        <p>North Star KPI</p>
        <strong>4.2M processed claims</strong>
        <span className="up">+18% vs last sprint</span>
      </div>
      <div className="c1-placeholder-card">
        <p>Pilot Cohorts</p>
        <strong>12 active</strong>
        <span className="neutral">4 onboarding</span>
      </div>
      <div className="c1-placeholder-card">
        <p>Automation coverage</p>
        <strong>78%</strong>
        <span className="down">Target 84%</span>
      </div>
    </div>
    <div className="c1-placeholder-table">
      <div className="c1-placeholder-table-head">
        <span>Workstream</span>
        <span>Status</span>
        <span>Owner</span>
        <span>Priority</span>
      </div>
      {[
        ["API integration", "QA in progress", "Platform", "High"],
        ["Rev enablement", "Playbooks approved", "Revenue", "Medium"],
        ["Compliance", "Awaiting SOC3 letter", "Risk", "Medium"],
      ].map((row) => (
        <div className="c1-placeholder-table-row" key={row[0]}>
          {row.map((cell) => (
            <span key={cell}>{cell}</span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default function ChatInterface() {
  const inputRef = useRef(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [c1Response, setC1Response] = useState("");
  const [history, setHistory] = useState([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [activePreset, setActivePreset] = useState(null);
  const [copied, setCopied] = useState(false);
  const [rawMarkup, setRawMarkup] = useState("");
  const [activeView, setActiveView] = useState("rendered");

  useEffect(() => {
    if (!copied) {
      return undefined;
    }
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const handlePresetSelect = (preset) => {
    setActivePreset(preset);
    setInput(preset.prompt);
    inputRef.current?.focus();
  };

  const sendPrompt = async ({ prompt, intent, label }) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setError("Please add a prompt before generating.");
      return;
    }

    const userMessage = { role: "user", content: trimmedPrompt };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsGenerating(true);
    setC1Response("");
    setRawMarkup("");
    setSelectedHistoryId(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          intent,
        }),
        cache: "no-store",
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to reach the Thesys API.");
      }

      if (!payload.artifact) {
        throw new Error("Thesys returned an empty artifact.");
      }

      const entry = {
        id: createClientId(),
        prompt: trimmedPrompt,
        response: payload.artifact,
        preset: label ?? activePreset?.title ?? "Custom brief",
        createdAt: Date.now(),
      };

      setHistory((previous) => [entry, ...previous].slice(0, 6));
      setSelectedHistoryId(entry.id);
      setMessages([
        ...nextMessages,
        { role: "assistant", content: payload.artifact },
      ]);
      setC1Response(payload.artifact);
      setRawMarkup(payload.artifact);
      setActiveView("rendered");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reach the Thesys API. Please try again.",
      );
    } finally {
      setIsGenerating(false);
      setActivePreset(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await sendPrompt({
      prompt: input,
      intent: activePreset?.intent,
      label: activePreset?.title,
    });
  };

  const handleQuickAction = async (action) => {
    await sendPrompt({
      prompt: action.prompt,
      intent: action.intent,
      label: action.label,
    });
  };

  const handleHistorySelect = (entry) => {
    setSelectedHistoryId(entry.id);
    setC1Response(entry.response);
    setRawMarkup(entry.response);
    setIsGenerating(false);
    setActiveView("rendered");
  };

  const handleCopy = async () => {
    if (!rawMarkup) {
      return;
    }
    try {
      await navigator.clipboard?.writeText(rawMarkup);
      setCopied(true);
    } catch (err) {
      console.error(err);
      setCopied(false);
    }
  };

  const handleDownload = () => {
    if (!rawMarkup) {
      return;
    }

    const blob = new Blob([rawMarkup], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "thesys-artifact.c1.xml";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <ThemeProvider>
      <div className="c1-shell">
        <header className="c1-hero">
          <div>
            <div className="c1-hero-heading">
              <img
                src="/thesys-mark.svg"
                alt="Thesys demo mark"
                className="c1-logo"
                width={48}
                height={48}
              />
              <div>
                <p className="c1-overline">C1 Generative UI</p>
                <h1>See what the Thesys API actually returns.</h1>
              </div>
            </div>
            <p className="c1-subtitle">
              Type a brief → receive structured C1 markup → render it instantly.
              This demo focuses on the response contract—how Thesys translates
              intent into UI artifacts.
            </p>
            <div className="c1-hero-pills">
              {HERO_PILLS.map((pill) => (
                <span key={pill}>{pill}</span>
              ))}
            </div>
          </div>
          <div className="c1-stats">
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <span>{stat.value}</span>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </header>

        <div className="c1-grid">
          <aside className="c1-sidebar">
            <div>
              <p className="c1-section-title">Preset briefs</p>
              <div className="c1-chip-grid">
                {PROMPT_PRESETS.map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    className={`c1-chip${
                      activePreset?.title === preset.title ? " active" : ""
                    }`}
                    onClick={() => handlePresetSelect(preset)}
                  >
                    <div>
                      <strong>{preset.title}</strong>
                      <p>{preset.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="c1-section-title">Recent artifacts</p>
              {history.length === 0 && (
                <p className="c1-placeholder">Nothing yet—run your first brief.</p>
              )}
              <div className="c1-history-scroll">
                <ul className="c1-history">
                  {history.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        className={`c1-history-button${
                          selectedHistoryId === entry.id ? " active" : ""
                        }`}
                        onClick={() => handleHistorySelect(entry)}
                      >
                        <div>
                          <strong>{entry.preset}</strong>
                          <p>{entry.prompt}</p>
                        </div>
                        <span>{formatTimestamp(entry.createdAt)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          <section className="c1-main">
            <div
              className={`c1-status-banner${isGenerating ? " streaming" : ""}`}
              role="status"
              aria-live="polite"
            >
              <span className={`c1-status-dot${isGenerating ? " pulse" : ""}`} />
              {isGenerating
                ? "Generating C1 artifact..."
                : "Ready to translate prompts into UI."}
            </div>

            <form className="c1-form" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                placeholder="Ask Thesys to build an artifact..."
                onChange={(event) => setInput(event.target.value)}
                disabled={isGenerating}
                aria-label="Chat prompt"
                className="c1-input"
              />
              <button
                type="submit"
                className="c1-button"
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate artifact"}
              </button>
            </form>

            {error && (
              <p className="c1-error" role="status" aria-live="polite">
                {error}
              </p>
            )}

            <div className="c1-action-row">
              <button
                type="button"
                className="c1-secondary-button"
                onClick={handleCopy}
                disabled={!rawMarkup}
              >
                {copied ? "Copied ✓" : "Copy artifact markup"}
              </button>
              <button
                type="button"
                className="c1-secondary-button"
                onClick={handleDownload}
                disabled={!rawMarkup}
              >
                Save artifact
              </button>
            </div>

            {isGenerating && (
              <div className="c1-loading-bar" aria-hidden="true">
                <span />
              </div>
            )}

            <div className="c1-view-toggle" role="tablist">
              <button
                type="button"
                className={activeView === "rendered" ? "active" : ""}
                onClick={() => setActiveView("rendered")}
                role="tab"
              >
                Rendered artifact
              </button>
              <button
                type="button"
                className={activeView === "markup" ? " active" : ""}
                onClick={() => setActiveView("markup")}
                role="tab"
              >
                Raw C1 markup
              </button>
            </div>

            <div className="c1-artifact-shell">
              {activeView === "markup" ? (
                rawMarkup ? (
                  <pre className="c1-raw-view">{rawMarkup}</pre>
                ) : (
                  <div className="c1-placeholder-shell">
                    <p>Generate an artifact to inspect the schema.</p>
                  </div>
                )
              ) : c1Response ? (
                <C1Component c1Response={c1Response} isStreaming={false} />
              ) : (
                <PlaceholderArtifact />
              )}
            </div>

            {!c1Response && !isGenerating && (
              <div className="c1-quick-panel">
                <p>Jumpstart with a curated artifact template.</p>
                <div className="c1-quick-actions">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      type="button"
                      key={action.label}
                      className="c1-quick-action"
                      onClick={() => handleQuickAction(action)}
                    >
                      <strong>{action.label}</strong>
                      <span>{action.subtitle}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="c1-info-panel">
              <p>What this demo highlights</p>
              <div className="c1-info-items">
                <div>
                  <strong>Structured UI</strong>
                  <span>Prompts turn into C1 markup that’s ready to render.</span>
                </div>
                <div>
                  <strong>Composable blocks</strong>
                  <span>Artifacts combine KPI cards, workflows, CTAs, timelines, and grids.</span>
                </div>
                <div>
                  <strong>Inspectable schema</strong>
                  <span>Toggle between the rendered UI and the raw C1 response.</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ThemeProvider>
  );
}

