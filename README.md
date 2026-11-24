# HCM Lite — AI-Assisted Human Capital Management

A multi-company HR platform built for the Saylani Hackathon brief: company setup, employee lifecycle, attendance (web + camera/geofence check-in), leave management, payroll with payslip PDFs, role-scoped dashboards, and an AI assistant that answers from real data via tool calling.

## Tech stack

**Backend** — Node.js + Express 4 (ESM) · MongoDB + Mongoose · JWT auth (bcrypt) · PDFKit · express-validator · any OpenAI-compatible chat-completions endpoint (Groq `llama-3.3-70b-versatile` by default)

**Frontend** — React 19 + Vite · Tailwind CSS v4 + shadcn/radix-ui · React Router v7 · react-hot-toast · MediaPipe Tasks Vision (camera face check)

## Project structure

```
backend/   Express API — auth, org, employees, attendance, leave, payroll, dashboards, AI, comms
frontend/  React SPA — role-based portals for Admin, HR and Employee
```

## Getting started

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in real values
npm run dev             # http://localhost:5000
```

`.env.example`:
```dotenv
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
PORT=5000
JWT_SECRET=<a long random string>
JWT_EXPIRES_IN=7d

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
COMPANY_NAME=My Company

AI_API_URL=https://api.groq.com/openai/v1/chat/completions
AI_API_KEY=<your provider key>
AI_MODEL=llama-3.3-70b-versatile

FRONTEND_URL=http://localhost:5173
```

### Frontend
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev              # http://localhost:5173
```

> **Never commit a real `.env`.** Only `.env.example` with placeholder values belongs in git. Add `dist/` to `.gitignore` — a committed build can make Vercel serve a stale frontend even after you fix a bug in source.

### First run
The database starts empty. Use **Register Company** to create an organization + Admin account (or let the backend bootstrap one from `ADMIN_EMAIL`/`ADMIN_PASSWORD`/`COMPANY_NAME`). Then: Admin configures the company → creates HR logins → HR registers employees (creates their logins) → employees sign in, change their temp password, and use the app.

## Demo / judging accounts

The login page has a **Testing Accounts** box that one-click fills these (clearly marked as demo-only — replace before real production use):

| Role     | Email                    | Password   |
|----------|---------------------------|------------|
| Admin    | azeefashraf22@gmail.com  | Azeef@456  |
| HR       | azeef@gmail.com          | Azeef@456  |
| Employee | ali@gmail.com            | Ali@4567   |

## Feature checklist

- [x] M1 Auth & Access, M2 Organization Setup, M3 Employees (incl. CSV import/export)
- [x] M4 Attendance — web check-in/out + **camera & geolocation check-in (bonus)**, cross-browser face detection via MediaPipe Tasks Vision
- [x] M5 Leave — apply/cancel/balance + AI "smart leave"
- [x] M6 Payroll — tax slab, payslip PDF, **late-penalty rule (bonus: 3 lates = 0.5 day)**
- [x] M7 Dashboards, M8 AI Assistant (chat, summaries, policy Q&A, Roman Urdu), M9 Comms & Audit
- [x] Bonus — dark mode toggle, installable PWA shell
- [ ] Not yet implemented — attrition risk scoring, absence anomaly flags

## Security notes
- The AI key lives only in the backend `.env`; the browser never calls the AI provider.
- Payslip PDFs and the employee CSV export are fetched with an `Authorization` header via `fetch` + blob — never as a bare link with a token in the URL.
- Treat any credential ever pasted into a chat/ticket as compromised — rotate it.

## License
Built for the Saylani Hackathon. Free to adapt for educational use.