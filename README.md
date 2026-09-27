# BrandMind

> Marketing AI that learns your brand.

BrandMind is an AI marketing teammate equipped with a persistent memory layer powered by [Hindsight](https://github.com/vectorize-io/hindsight). Instead of relying on generic, one-shot LLM recommendations, BrandMind tracks your brand's historical campaigns, audience reactions, successes, and failures to deliver increasingly specific, data-backed marketing strategies over time.

---

## The Problem
Marketing teams continuously create campaigns and content, but the institutional knowledge gained from past efforts is often scattered across spreadsheets, tools, and team members' heads. Teams repeat failed experiments and reinvent strategies because traditional AI agents suffer from amnesia—treating every new prompt as day zero.

## The Solution: Persistent Brand Memory
BrandMind connects your historical marketing data directly to a persistent memory engine. Every campaign execution, performance metric, and audience feedback loop updates the agent's long-term intelligence.

* **Content Memory:** Remembers topics, formats, themes, and objectives across past campaigns.
* **Performance Memory:** Associates reach, engagement, clicks, and conversions with specific content types.
* **Audience Memory:** Tracks recurring audience sentiment, positive/negative reactions, and content gaps[cite: 1].
* **Experiment Memory:** Remembers the core formula: *What we tried $\rightarrow$ What happened $\rightarrow$ What we learned*[cite: 1].

---

## Architecture & Tech Stack

BrandMind is built as a modern full-stack web application:
* **AI Engine:** Groq API (`openai/gpt-oss-120b` / `qwen/qwen3-32b`) for ultra-fast, low-latency reasoning.
* **Agent Memory Layer:** [Hindsight](https://github.com/vectorize-io/hindsight) by Vectorize for persistent retention, recall, and contextual learning[cite: 1].
* **Database:** Supabase (PostgreSQL) for storing campaign metadata and user interactions.
* **Frontend / Backend:** Next.js / React with Tailwind CSS, deployed via Vercel.

---

## Core Features

1. **Brand Memory Ingestion:** Ingest past campaign results and audience responses to bootstrap the agent's historical context[cite: 1].
2. **Memory-Aware Recommendations:** Ask strategic marketing questions and receive tailored advice grounded in your brand's actual past performance[cite: 1].
3. **Explainable Recommendations ("Why?"):** Every major recommendation comes with an explicit breakdown showing the exact past campaigns and audience patterns that drove the decision[cite: 1].

---

## Getting Started

### Prerequisites
* Node.js 18+ installed locally
* A [Groq API Key](https://groq.com/)[cite: 1]
* A [Hindsight Cloud](https://ui.hindsight.vectorize.io) instance (or local Hindsight setup)[cite: 1]
* A [Supabase](https://supabase.com) project

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/brandmind.git](https://github.com/your-username/brandmind.git)
   cd brandmind
