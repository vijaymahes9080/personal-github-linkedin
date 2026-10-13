# Production Deployment & Hosting Guide

This guide explains how to deploy the **Personal GitHub Intelligence & AI Career Assistant** to a stable, publicly accessible HTTPS URL with persistent database storage, zero-cost operation, and robust authentication.

---

## 1. Architecture & Hosting Strategy

The application is built on **Next.js 15 App Router** with TypeScript, Tailwind CSS, and **Prisma ORM with SQLite**.

- **Frontend & API**: Unified in a single Next.js deployment.
- **Database**: Relational SQLite stored at `prisma/dev.db`.
- **AI Intelligence**: Multi-tiered (100% free built-in local heuristic analyzer + optional free-tier Google Gemini Flash key).
- **Security**: Server-side secrets protection. Master Security PIN protects private repositories and career notes.

---

## 2. Free & Low-Cost Hosting Options

| Platform | Free Tier Inclusions | Database Storage | Deployment Complexity | Recommended For |
| :--- | :--- | :--- | :--- | :--- |
| **Render** | 750 free instance hrs/month | Persistent Disk or SQLite | Low (via Docker or Node) | ⭐ Recommended All-in-One |
| **Railway** | $5 free trial credit | Persistent volume | Minimal (1-click Docker) | Fast testing |
| **Fly.io** | Up to 3 shared-cpu VMs free | Persistent volume | Low (Fly CLI) | High global performance |
| **Vercel** | Unlimited personal hobby tier | Turso (libSQL) / Supabase free | Minimal (Git push) | Serverless |
| **VPS (Hetzner / Oracle Free)** | 2 free ARM VMs (Always Free) | Docker container | Medium | Full permanent control |

---

## 3. Option A: Deploy on Render (Recommended Free Setup)

Render provides free web service hosting with automatic HTTPS and custom domains.

### Step 1: Push Repository to GitHub
```bash
git init
git add .
git commit -m "feat: complete personal career intelligence app"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### Step 2: Create Web Service on Render
1. Go to [render.com](https://render.com) and sign in.
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Configure service settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free
5. (Optional) In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: *(Optional free key from aistudio.google.com)*
6. Click **Deploy Web Service**.

Your app will be live at `https://<your-app-name>.onrender.com`.

---

## 4. Option B: One-Command Docker Deployment

You can run the production application on any server, VPS, or local machine using Docker:

```bash
docker compose up -d --build
```

Access the app immediately at `http://localhost:3000` or attach a reverse proxy (e.g., Caddy or Nginx) with Let's Encrypt for automatic HTTPS.

---

## 5. Option C: Vercel + Turso / Neon Database

For a 100% serverless deployment on Vercel:

1. Create a free database on [Turso](https://turso.tech) (libSQL) or [Neon](https://neon.tech) (PostgreSQL).
2. Update `prisma/schema.prisma` datasource provider (`sqlite` for Turso or `postgresql` for Neon).
3. In Vercel Project Settings, add `DATABASE_URL`.
4. Deploy with `vercel --prod`.

---

## 6. Production Health Check

Verify your deployment anytime via the public health endpoint:

```
GET https://<your-domain>/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-10-13T08:50:00.000Z",
  "uptime": 1240.5,
  "database": {
    "connected": true,
    "userCount": 1,
    "repoCount": 4,
    "factCount": 5
  },
  "environment": {
    "nodeEnv": "production",
    "hasGeminiKey": false
  }
}
```

---

## 7. Security Best Practices Checklist

- [x] **No Secrets in Frontend**: Tokens and API keys are only processed server-side in API routes.
- [x] **Rate Limit Safety**: Public GitHub scans run without tokens; optional user PATs are stored in the server database.
- [x] **Zero Hallucination Policy**: Resume bullets and LinkedIn posts are strictly derived from verified facts and inspected codebases.
- [x] **Master PIN Protection**: Enable in Settings to protect your private data when viewing on shared devices.
