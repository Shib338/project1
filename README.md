# QueryViz AI — Conversational Business Intelligence

> Turn plain English into interactive dashboards instantly, powered by Google Gemini AI.

## 🚀 Demo Queries for Presentation

1. **Simple:** "Show me monthly revenue trends for 2024"
2. **Medium:** "Compare sales by region and highlight the top product category"
3. **Complex:** "Show Q3 sales breakdown by region with profit margins and top performing products"
4. **Follow-up (Bonus):** "Now filter this to only show Electronics"
5. **CSV Upload (Bonus):** Upload any CSV and ask questions about it

---

## 🏗️ Architecture

```
User (Natural Language)
        ↓
  Next.js Frontend
        ↓
  FastAPI Backend
        ↓
  Google Gemini AI  ←→  CSV / SQLite Data
        ↓
  Chart Config JSON
        ↓
  Recharts Dashboard
```

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Charts | Recharts |
| Backend | Python FastAPI |
| AI/LLM | Google Gemini 1.5 Flash |
| Data | CSV (pandas) |

---

## ⚙️ Setup & Run

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Set your Gemini API key
set GEMINI_API_KEY=your_key_here   # Windows
# export GEMINI_API_KEY=your_key   # Mac/Linux

# Run the server
uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click **Get API Key**
3. Copy and set as `GEMINI_API_KEY` environment variable

---

## ✨ Features

- 💬 **Natural Language Queries** — Ask questions in plain English
- 📊 **Smart Chart Selection** — AI picks the right chart type automatically
- 🔄 **Follow-up Questions** — Chat with your dashboard to filter/refine
- 📁 **CSV Upload** — Upload any CSV and query it instantly
- ⚡ **Real-time Loading States** — Visual feedback while AI processes
- 🛡️ **Hallucination Handling** — AI reports when data isn't available
- 🌙 **Dark Mode UI** — Professional executive dashboard design

---

## 📊 Evaluation Criteria Coverage

| Criteria | Implementation |
|----------|---------------|
| Data Retrieval (Accuracy) | Gemini generates queries against real CSV data |
| Chart Selection | AI selects line/bar/pie/area based on data type |
| Error Handling | Graceful messages for vague/unanswerable queries |
| Design & UX | Dark theme, glass cards, animations |
| Interactivity | Hover tooltips, responsive charts |
| Loading States | Animated loading with step indicators |
| Follow-up Questions | Conversation history passed to Gemini (+10 bonus) |
| CSV Upload | Upload any CSV and query it (+20 bonus) |
