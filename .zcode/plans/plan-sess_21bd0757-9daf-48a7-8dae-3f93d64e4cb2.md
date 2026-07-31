# Plan: Agentic AI Portfolio (3 projects) + tailored resume

## Goal
Build 3 deployable agentic-AI projects that map 1:1 to the FOXO "Agentic AI Engineering Intern" JD requirements, then rewrite your resume to lead with them. You chose: **Ollama (local) + Groq (free deploy) hybrid**, **new portfolio repo**, **all 3 projects**.

## Decisions locked
- **LLM layer (shared across all projects)**: Provider-agnostic — same code runs on Ollama locally (private) and Groq free tier when deployed. Toggled by `LLM_PROVIDER` + `OPENAI_API_KEY`/`OPENAI_BASE_URL` env vars (both providers are OpenAI-API-compatible, so one `openai` SDK works).
- **Embeddings**: `sentence-transformers` (`all-MiniLM-L6-v2`) — free, portable, works everywhere (Groq has no embeddings endpoint).
- **Vector DB**: ChromaDB (in-process/file-based) — "vector databases" is literally in the JD.
- **UI**: Streamlit (fast, free to deploy on HuggingFace Spaces — purpose-built for AI demos).
- **Location**: New repo `agentic-ai-portfolio` (sibling to `no-limits-notes`).
- **Deploy target**: HuggingFace Spaces (free) for all 3 — gives you live links the JD asks for.

## Repo structure
```
agentic-ai-portfolio/
├── README.md                      # Portfolio overview + 3 live demo links
├── .gitignore                     # .env, __pycache__, venv, chroma_db/
├── llm_config.py                  # SHARED provider-agnostic LLM factory (Ollama↔Groq)
├── 01-rag-knowledge-assistant/    # RAG + vector DB + citations
├── 02-multi-tool-agent/           # LangGraph ReAct agent + tool calling
└── 03-ai-copilot/                 # ReviewGuard v2: LLM copilot (evolution of your shipped project)
```

## Project 1 — RAG Knowledge Assistant *(transparent build)*
**JD coverage**: "RAG pipelines using vector databases," "retrieval systems," "LLM-powered applications," "structured outputs"
**Stack**: `chromadb` + `sentence-transformers` + `openai` SDK + Streamlit (no heavy framework — fully explainable in interviews).
**Flow**: Upload PDF/doc → chunk → embed → store in ChromaDB → ask question → retrieve top-k → answer **with source citations** (structured output).
**Why transparent (not LangChain)**: RAG is simple enough that building it directly shows the JD's "understanding of prompt engineering & retrieval" better than hiding it in a framework. ~200 lines, every step explainable.

## Project 2 — Multi-Tool ReAct Agent *(framework build)*
**JD coverage**: "AI agents," "agent workflows," "tool calling," "structured outputs," "copilots"
**Stack**: `langchain` + `langgraph` + Streamlit.
**Tools** (all free, no API keys): DuckDuckGo web search, calculator, Wikipedia lookup, + a custom knowledge-base tool that reuses Project 1's RAG.
**Flow**: User asks a multi-step question → agent decides which tools to call and in what order (ReAct loop) → returns structured answer. Shows agentic reasoning + tool-calling protocol.

## Project 3 — AI Copilot: ReviewGuard v2 *(evolution of YOUR shipped product)*
**JD coverage**: "copilots," "automation tools," "shipped AI products end-to-end," "build APIs & backend services"
**Stack**: FastAPI (REST backend — matches your Flask skills) + `openai` SDK + Streamlit/HTML front-end.
**Story**: Honest evolution of your existing ReviewGuardAI (traditional NLP, LinearSVC) → v2 uses an LLM that classifies + **explains its reasoning** per review. Demonstrates v1→v2 growth (traditional ML → LLM), reuses your REST + extension skills. Reuses a shared LLM layer.

## Build order (one project per phase, ~2-4 days each)
1. **Setup**: Create repo, shared `llm_config.py`, `.gitignore`, verify Ollama + Groq both work from one code path. Pull `ollama pull llama3.1`. Get free Groq key.
2. **Project 1** (RAG) — build, test locally, write README with architecture diagram + your-exact-contribution write-up (JD asks for this).
3. **Project 2** (Agent) — build, test, README.
4. **Project 3** (Copilot) — build, test, README.
5. **Deploy**: All 3 to HuggingFace Spaces (Groq key as Space secret). Capture live URLs.
6. **Resume rewrite**: New portfolio-first resume (PDF) leading with these 3 projects + live links + tech-stack line + most-impactful-project write-up.

## Per-project deliverables (each)
- Working app (Python, runs locally on Ollama, deploys to Groq free)
- `README.md` with: what it does, architecture, tech stack, how to run, live demo link, **"my exact contribution"** write-up (JD mandatory item)
- A demo GIF/screenshot for the portfolio README

## What you'll have at the end
- A GitHub portfolio repo with 3 deployed agentic-AI projects + live links
- Every JD mandatory requirement met: GitHub ✅, AI portfolio ✅, deployed demos ✅, agent/workflow details ✅, impactful-project write-up ✅
- A tailored resume PDF positioned for this role (built after projects ship, so it's honest)

## Note on honesty
No fabricated experience — every line on the resume will trace to a real project you built. The "v1→v2" ReviewGuard story is real because you genuinely built v1.

I'll implement phase by phase, pausing for you to test each project locally before moving on. Shall I begin with setup + Project 1?