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
  { label: "Artifacts rendered", value: "3.2k+" },
  { label: "Avg. assembly time", value: "4.6s" },
  { label: "Interactive primitives", value: "140+" },
];

const HERO_PILLS = [
  "Live UI streaming",
  "Share-ready artifacts",
  "Enterprise guardrails",
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

const StreamingSkeleton = () => (
  <div className="c1-skeleton">
    <div className="c1-skeleton-title" />
    <div className="c1-skeleton-row">
      <div className="c1-skeleton-card" />
      <div className="c1-skeleton-card" />
      <div className="c1-skeleton-card" />
    </div>
    <div className="c1-skeleton-block" />
    <div className="c1-skeleton-block short" />
  </div>
);

const EmptyState = () => (
  <div className="c1-empty-state">
    <p>Choose a preset brief to see a live C1 artifact stream together.</p>
    <div className="c1-empty-pills">
      <span>Slides & decks</span>
      <span>Dashboards</span>
      <span>Workflow copilots</span>
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
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");
  const [activePreset, setActivePreset] = useState(null);
  const [copied, setCopied] = useState(false);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt) {
      return;
    }

    const userMessage = { role: "user", content: prompt };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsStreaming(true);
    setC1Response("");
    setSelectedHistoryId(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          intent: activePreset?.intent,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Streaming response unavailable.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        streamedText += decoder.decode(value, { stream: true });
        setC1Response(streamedText);
      }

      const entry = {
        id: createClientId(),
        prompt,
        response: streamedText,
        preset: activePreset?.title ?? "Custom brief",
        createdAt: Date.now(),
      };

      setHistory((previous) => [entry, ...previous].slice(0, 6));
      setSelectedHistoryId(entry.id);
      setMessages([...nextMessages, { role: "assistant", content: streamedText }]);
      setActivePreset(null);
    } catch (err) {
      console.error(err);
      setError("Unable to reach the Thesys API. Please try again.");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleHistorySelect = (entry) => {
    setSelectedHistoryId(entry.id);
    setC1Response(entry.response);
    setIsStreaming(false);
  };

  const handleCopy = async () => {
    if (!c1Response) {
      return;
    }
    try {
      await navigator.clipboard?.writeText(c1Response);
      setCopied(true);
    } catch (err) {
      console.error(err);
      setCopied(false);
    }
  };

  const handleDownload = () => {
    if (!c1Response) {
      return;
    }

    const blob = new Blob([c1Response], { type: "text/xml" });
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
                <p className="c1-overline">Generative UI Studio</p>
                <h1>Stream artifacts that feel like the Thesys gallery.</h1>
              </div>
            </div>
            <p className="c1-subtitle">
              Launch decks, KPI boards, and copilots with a single brief. Each
              response is rendered live via C1.
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
              className={`c1-status-banner${isStreaming ? " streaming" : ""}`}
              role="status"
              aria-live="polite"
            >
              <span className={`c1-status-dot${isStreaming ? " pulse" : ""}`} />
              {isStreaming ? "Streaming artifact..." : "Ready for your next brief"}
            </div>

            <form className="c1-form" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                placeholder="Ask Thesys to build an artifact..."
                onChange={(event) => setInput(event.target.value)}
                disabled={isStreaming}
                aria-label="Chat prompt"
                className="c1-input"
              />
              <button type="submit" className="c1-button" disabled={isStreaming}>
                {isStreaming ? "Streaming..." : "Generate"}
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
                disabled={!c1Response}
              >
                {copied ? "Copied ✓" : "Copy artifact markup"}
              </button>
              <button
                type="button"
                className="c1-secondary-button"
                onClick={handleDownload}
                disabled={!c1Response}
              >
                Save artifact
              </button>
              <a
                className="c1-link"
                href="https://www.thesys.dev/artifacts"
                target="_blank"
                rel="noreferrer"
              >
                Explore gallery ↗
              </a>
            </div>

            {isStreaming && (
              <div className="c1-loading-bar" aria-hidden="true">
                <span />
              </div>
            )}

            <div className="c1-artifact-shell">
              {isStreaming && !c1Response && <StreamingSkeleton />}
              {!isStreaming && !c1Response && <EmptyState />}
              {c1Response && (
                <C1Component c1Response={c1Response} isStreaming={isStreaming} />
              )}
            </div>
          </section>
        </div>
      </div>
    </ThemeProvider>
  );
}

