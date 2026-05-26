# DSA Visualizer

DSA Visualizer is an interactive learning platform for mastering data structures and algorithms with guided explanations, animated visualizers, multi-language code samples, and practice problems.

## Features

- Interactive visualizers for arrays, strings, linked lists, stacks, queues, trees, graphs, sorting, dynamic programming, and more
- Structured topic progression across beginner, intermediate, advanced, and pro difficulty levels
- Algorithm walkthroughs with pseudocode, complexity analysis, and real-world analogies
- Practice problem sets mapped to each topic with difficulty, hints, and expected complexity
- Profile progress tracking with Google authentication, Firebase, and local persistence
- Production-ready SEO metadata, sitemap, robots rules, and Vercel deployment configuration

## Tech Stack

- Next.js 16 App Router
- React 19 + TypeScript
- Tailwind CSS 4
- Framer Motion
- NextAuth.js
- Firebase
- Zustand

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd dsa-visualizer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env.local
```

Required values are documented in `.env.example`.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm run dev` - start the local development server
- `npm run build` - create a production build
- `npm run start` - run the production server
- `npm run lint` - run ESLint

## Deployment on Vercel

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Add every variable from `.env.example` in the Vercel project settings.
4. Set `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` to your production domain.
5. Deploy using the included `vercel.json` configuration.

### Production Notes

- The Vercel build uses `next build`.
- `NODE_TLS_REJECT_UNAUTHORIZED` is only relaxed for local development; production uses secure TLS defaults.
- `next.config.ts` includes security headers, cache hints, and package import optimizations for deployment.

## Screenshots

### Homepage

_Placeholder: add a screenshot of the landing page hero and topic overview._

### Topic Detail Page

_Placeholder: add a screenshot of a topic page with visualization and algorithm tabs._

### Practice Problems

_Placeholder: add a screenshot of the problems listing and difficulty filters._

### Profile Dashboard

_Placeholder: add a screenshot of user progress, stats, and problem history._
