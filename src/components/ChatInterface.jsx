'use client';

import { useState } from "react";
import { C1Component, ThemeProvider } from "@thesysai/genui-sdk";

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [c1Response, setC1Response] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt) {
      return;
    }

    const nextMessages = [...messages, { role: "user", content: prompt }];
    setMessages(nextMessages);
    setInput("");
    setC1Response("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
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
    } catch (err) {
      console.error(err);
      setError("Unable to reach the Thesys API. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: "1.5rem",
          padding: "2rem",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: "640px",
            display: "flex",
            gap: "0.75rem",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask Thesys anything..."
            aria-label="Chat prompt"
            style={{
              flex: 1,
              padding: "0.85rem 1rem",
              borderRadius: "0.75rem",
              border: "1px solid #d0d5dd",
              fontSize: "1rem",
            }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "0.85rem 1.5rem",
              borderRadius: "0.75rem",
              border: "none",
              backgroundColor: "#111827",
              color: "#ffffff",
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </form>

        {error && (
          <p style={{ color: "#dc2626", fontSize: "0.95rem" }}>{error}</p>
        )}

        <div style={{ width: "100%", maxWidth: "768px" }}>
          <C1Component c1Response={c1Response} />
        </div>
      </div>
    </ThemeProvider>
  );
}

