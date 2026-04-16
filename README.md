# 🔖 Awesome Bookmarks

A high-performance, modern bookmark management application built with Next.js 15, React 19, and Prisma.

## ✨ Features

- **Smart Bookmarking**: Save URLs with automated metadata extraction (titles, descriptions, and favicons).
- **Organization**: Categorize bookmarks with custom colors and icons.
- **Advanced Search**: Instant full-text search with filtering by categories, tags, and multiple sorting options.
- **Performance Optimized**: Virtualized grid for smooth scrolling even with thousands of bookmarks.
- **Modern UI/UX**: Responsive design using Tailwind CSS 4 and Shadcn UI components.
- **State Management**: Robust state handling with Zustand and optimistic updates.
- **Developer Friendly**: Fully type-safe with TypeScript and comprehensive testing suite with Vitest.

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Runtime**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [SQLite](https://sqlite.org/) with [Prisma ORM](https://www.prisma.io/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Package Manager**: [Bun](https://bun.sh/)

## 🛠️ Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine.
- Node.js 18+ (if not using Bun directly).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/awesome-bookmarks.git
   cd awesome-bookmarks
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Environment Setup:
   Create a `.env` file in the root directory (or copy from `.env.example`):
   ```bash
   DATABASE_URL="file:./dev.db"
   ```

4. Database Setup:
   Initialize the SQLite database and run migrations:
   ```bash
   bunx prisma migrate dev --name init
   ```

5. Run the development server:
   ```bash
   bun dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/            # Next.js App Router (pages & API routes)
├── components/     # UI components (Dashboard, Forms, Layout, UI)
├── hooks/          # Custom React hooks
├── lib/            
│   ├── db/         # Prisma client and database operations
│   ├── stores/     # Zustand state stores
│   ├── types/      # TypeScript interfaces/types
│   └── utils/      # Helper functions and validation logic
└── public/         # Static assets
```

## 🧪 Testing

The project uses Vitest for unit and integration testing.

```bash
# Run all tests
bun test

# Run tests in watch mode
bun run test:watch

# Run tests with UI reporter
bun run test:ui