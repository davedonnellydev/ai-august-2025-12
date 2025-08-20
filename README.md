# Project 12 #AIAugustAppADay: AI Code Explainer

![Last Commit](https://img.shields.io/github/last-commit/davedonnellydev/ai-august-2025-12)  

**📆 Date**: 20/Aug/2025  
**🎯 Project Objective**: Paste code, get an AI explanation in plain English.  
**🚀 Features**: User can paste or upload code; App detects language; gives a line by line breakdown as well as a summary of what the code is doing.  
**🛠️ Tech used**: Next.js, TypeScript, Mantine UI, OpenAI APIs  
**▶️ Live Demo**: [https://ai-august-2025-12.netlify.app/](https://ai-august-2025-12.netlify.app/)  

## 🗒️ Summary

The goal of this project was to make code easier to understand. Users could either paste or upload a piece of code, and AI would then analyse it and explain what it does, why it’s used, and in what context.  

As sometimes happens, I got caught in the weeds. Instead of focusing on the AI integration, I found myself stuck designing the input screen on the fly. Specifically, I spent far too long hunting for libraries that could auto-detect the programming language as the user typed or uploaded their code. While I eventually got that piece working, it ate up so much time that I couldn’t refine the AI’s explanations to be as user-friendly and clear as I’d hoped.  

So, while the AI analysis *does* work, it’s fairly barebones in this version. This project ended up being less about building features and more about learning a hard lesson in time management.  

**Lessons learned**  
- Plan before you build — designing while coding often leads to getting stuck in the details.  
- Focus on the core value (in this case, the AI explanation) before polishing supporting features.  
- Timeboxing experiments (like searching for libraries) helps keep the project moving.  

**Final thoughts**  
Not every project hits the level you want it to, and that’s okay. This one reminded me that prioritisation and time discipline are just as important as technical skills when building quickly.  


This project has been built as part of my AI August App-A-Day Challenge. You can read more information on the full project here: [https://github.com/davedonnellydev/ai-august-2025-challenge](https://github.com/davedonnellydev/ai-august-2025-challenge).  

## 🧪 Testing

![CI](https://github.com/davedonnellydev/ai-august-2025-12/actions/workflows/npm_test.yml/badge.svg)  
_Note: Test suite runs automatically with each push/merge._

## Quick Start

1. **Clone and install:**

   ```bash
   git clone https://github.com/davedonnellydev/ai-august-2025-12.git
   cd ai-august-2025-12
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Start development:**

   ```bash
   npm run dev
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# OpenAI API (for AI features)
OPENAI_API_KEY=your_openai_api_key_here

```

### Key Configuration Files

- `next.config.mjs` – Next.js config with bundle analyzer
- `tsconfig.json` – TypeScript config with path aliases (`@/*`)
- `theme.ts` – Mantine theme customization
- `eslint.config.mjs` – ESLint rules (Mantine + TS)
- `jest.config.cjs` – Jest testing config
- `.nvmrc` – Node.js version

### Path Aliases

```ts
import { Component } from '@/components/Component'; // instead of '../../../components/Component'
```

## 📦 Available Scripts

### Build and dev scripts

- `npm run dev` – start dev server
- `npm run build` – bundle application for production
- `npm run analyze` – analyze production bundle

### Testing scripts

- `npm run typecheck` – checks TypeScript types
- `npm run lint` – runs ESLint
- `npm run jest` – runs jest tests
- `npm run jest:watch` – starts jest watch
- `npm test` – runs `prettier:check`, `lint`, `typecheck` and `jest`

### Other scripts

- `npm run prettier:check` – checks files with Prettier
- `npm run prettier:write` – formats files with Prettier

## 📜 License

![GitHub License](https://img.shields.io/github/license/davedonnellydev/ai-august-2025-12)  
This project is licensed under the MIT License.
