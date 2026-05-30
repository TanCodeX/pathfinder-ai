<div align="center">

### 🧠 Your AI-Powered Career Coach & Resume Builder

*Build professional resumes · Generate cover letters · Ace interviews · Accelerate your career*

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-pathfinder--ai.vercel.app-000000?style=for-the-badge)](https://pathfinder-ai.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![GSSoC](https://img.shields.io/badge/Open_Source-GSSoC'26-8b5cf6?style=for-the-badge)](https://gssoc.girlscript.tech)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-f97316?style=for-the-badge)](CONTRIBUTING.md)
[![Maintained](https://img.shields.io/badge/Maintained-Yes-10b981?style=for-the-badge)](https://github.com/harshdwivediiiii/pathfinder-ai)

</div>

---

## 📸 Preview

<div align="center">
  <img src="https://raw.githubusercontent.com/harshdwivediiiii/pathfinder-ai/main/public/pathfinder-ai.gif" alt="PathFinder AI Preview" width="100%" />
</div>

---

## 🌟 What is PathFinder AI?

**PathFinder AI** is an intelligent, AI-powered career platform built for students, developers, and professionals. It helps you:

- ✅ Create **ATS-friendly resumes** in minutes
- ✅ Generate **personalized cover letters** tailored to each role
- ✅ **Prepare for interviews** with adaptive AI-driven questions
- ✅ Get **real-time industry insights**, salary data, and skill trends

Whether you're chasing your first internship, switching industries, or leveling up — PathFinder AI is your personalized career companion.

🔗 **[Try it live → pathfinder-ai.vercel.app](https://pathfinder-ai.vercel.app)**

---

## ✨ Core Features

| Feature | Description |
|---|---|
| 📄 **AI Resume Builder** | Personalized, ATS-optimized resumes powered by Gemini AI |
| ✉️ **Cover Letter Generator** | Tone-matched, role-specific letters generated instantly |
| 🎯 **Interview Prep** | Adaptive, role-based practice questions with AI feedback |
| 📊 **Industry Insights** | Real-time trends, in-demand skills, and salary benchmarks |
| 🔐 **Secure Auth** | Full session management via Clerk.dev |
| ⚡ **Modern UI/UX** | Responsive, accessible, production-ready interface |
| ☁️ **Cloud Native** | Deployed and optimized on Vercel |

---

## 🧩 Application Workflow

```
User Input
    │
    ▼
AI Processing (Gemini API)
    │
    ▼
Resume / Cover Letter / Interview Generation
    │
    ▼
Database Storage (PostgreSQL + Prisma)
    │
    ▼
Dashboard Rendering
    │
    ▼
Personalized Career Experience ✨
```

---

## 🛠️ Tech Stack

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![Gemini API](https://img.shields.io/badge/Gemini_API-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS_3-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-3982CE?style=for-the-badge&logo=prisma)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.dev)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)

</div>

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Authentication** | Clerk.dev |
| **AI Engine** | Gemini API (Google AI) |
| **Database** | PostgreSQL + Prisma ORM |
| **Styling** | TailwindCSS + ShadCN UI |
| **Deployment** | Vercel |

---

## 📂 Project Structure

```
pathfinder-ai/
├── app/              # Next.js App Router pages & layouts
├── components/       # Reusable UI components
├── lib/              # Utility libraries & helpers
├── prisma/           # Database schema & migrations
├── public/           # Static assets
├── styles/           # Global styles
├── utils/            # Helper functions
├── hooks/            # Custom React hooks
├── constants/        # App-wide constants
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/harshdwivediiiii/pathfinder-ai.git
cd pathfinder-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL=your_postgresql_connection_string

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

GEMINI_API_KEY=your_gemini_api_key

REDIS_URL=your_redis_connection_string
RATE_LIMIT_STORE=auto
```

> **Rate limiting in production:** Redis is required for consistent multi-instance throttling. In production, set `REDIS_URL` and keep `RATE_LIMIT_STORE=auto` (or set `RATE_LIMIT_STORE=redis`).

### 4. Set Up Prisma

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Start the Dev Server

```bash
npm run dev
```

> **💡 Clerk Keyless Mode:** When developing locally without Clerk API keys, the app runs in keyless mode — auth routes redirect safely and protected dashboards won't crash. Perfect for rapid frontend development.

---

## 🤖 AI Capabilities

PathFinder AI uses **Gemini API** to power:

- 🧾 Resume bullet point generation
- ✍️ AI cover letter writing
- 🎤 Interview preparation questions
- 🗺️ Career guidance workflows
- 💬 Personalized AI responses

---

## 📱 Responsive Design

Fully optimized for **Desktop**, **Mobile**, and **Tablet** — built with TailwindCSS and a mobile-first approach.

---

## 🌟 Open Source & GSSoC 2026

PathFinder AI is actively participating in **GirlScript Summer of Code 2026 (GSSoC'26)** ❤️

We welcome contributions in:

- 🤖 AI integrations & prompt engineering
- 📄 Resume intelligence systems
- ⚡ Performance optimization
- 🎨 UI/UX enhancements
- ♿ Accessibility improvements
- 📖 Open-source documentation

---

## 🤝 How to Contribute

### Step-by-Step

```bash
# 1. Fork the repo, then clone it
git clone https://github.com/YOUR_USERNAME/pathfinder-ai.git

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes, then commit
git commit -m "feat: add amazing feature"

# 4. Push and open a PR
git push origin feature/your-feature-name
```

### PR Naming Conventions

```
feat: add resume analytics dashboard
fix: resolve onboarding redirect bug
docs: improve environment setup guide
chore: update dependencies
```

### Before Submitting a PR

- [ ] Code is production-ready and tested locally
- [ ] UI changes are responsive across screen sizes
- [ ] Existing code conventions are followed
- [ ] Documentation is updated if needed
- [ ] Screenshots attached for any UI changes
- [ ] Synced with latest `main` and conflicts resolved

---

## ✅ Getting Assigned an Issue

1. Comment on the issue you want to work on
2. Briefly explain your planned approach
3. Wait for maintainer approval before starting
4. Begin work only after official assignment

**Example comment:**

```
Hi maintainers 👋

I'd like to work on this issue under GSSoC'26.

Planned approach:
- Improve validation flow
- Optimize API handling
- Update related documentation

Could you please assign it to me?
```

---

## 🏷️ Label System

Labels are managed via GitHub Actions automation.

| Category | Labels |
|---|---|
| **Difficulty** | `level:beginner` · `level:intermediate` · `level:advanced` · `level:critical` |
| **Type** | `type:bug` · `type:feature` · `type:docs` · `type:design` · `type:security` |
| **Domain** | `frontend` · `backend` · `database` · `ai` · `ui/ux` |
| **Programs** | `Gssoc` · `good first issue` |

---

## 🧪 Development Standards

- **Frontend:** Reusable components, Tailwind conventions, accessibility-first
- **Backend:** Input validation, RESTful principles, edge case handling
- **AI Features:** Prompt engineering optimization, fallback handling

### Beginner-Friendly Ideas

- 📖 Documentation improvements
- 💅 UI polishing & loading skeletons
- 📱 Mobile responsiveness fixes
- ♿ Accessibility enhancements
- 🧪 Unit test coverage

---

## 🏆 Contributors

All contributors are recognized publicly in this README. Major contributors may receive special mentions, and long-term contributors can become collaborators.

<div align="center">

### Everyone who has contributed to PathFinder AI ❤️

<a href="https://github.com/harshdwivediiiii/pathfinder-ai/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=harshdwivediiiii/pathfinder-ai" alt="PathFinder AI Contributors" width="100%" />
</a>

<br/><br/>

*Want to see your avatar here? [Make a contribution!](CONTRIBUTING.md)*

</div>

---

## 📄 License

This project is licensed under the **[MIT License](LICENSE)** — free to use, modify, and distribute.

---

## 📬 Contact

Have questions or ideas? Reach out:

📧 **[harshvardhandwivedi18@gmail.com](mailto:harshvardhandwivedi18@gmail.com)**

---

## 🌍 Support the Project

If PathFinder AI helped you or you believe in the mission:

⭐ **Star the repository** — helps others discover it  
🍴 **Fork the project** — build something on top of it  
🚀 **Contribute during GSSoC'26** — make it better  
📢 **Share with developers** — spread the word  

---

<div align="center">

**PathFinder AI** — *Smart Careers Start Here.*

[![Star on GitHub](https://img.shields.io/github/stars/harshdwivediiiii/pathfinder-ai?style=social)](https://github.com/harshdwivediiiii/pathfinder-ai)
[![Fork on GitHub](https://img.shields.io/github/forks/harshdwivediiiii/pathfinder-ai?style=social)](https://github.com/harshdwivediiiii/pathfinder-ai/fork)

</div>
