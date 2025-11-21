# Aether 🌌

**Aether** is a modern, high-performance Multi-Tenant SaaS platform for Real Estate Agencies, built to scale. It provides a unified workspace for agencies to manage listings, transactions, and client relationships with a sharp, professional "Digital Architect" design system.

![Aether Banner](https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop)

## 🚀 Tech Stack

Built with the bleeding edge of the React ecosystem:

-   **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
-   **Runtime:** [Bun](https://bun.sh/) (Fast JavaScript runtime & package manager)
-   **Database:** [Neon](https://neon.tech/) (Serverless Postgres)
-   **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
-   **Authentication:** [Better Auth](https://better-auth.com/)
-   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
-   **UI Components:** [Radix UI](https://www.radix-ui.com/) & [Lucide React](https://lucide.dev/)
-   **Internationalization:** [next-intl](https://next-intl-docs.vercel.app/)
-   **Design System:** Custom "Digital Architect" Theme (Sharp, Airy, Geometric)

## ✨ Features

-   **Multi-Tenancy:** Subdomain-based tenant isolation (e.g., `agency.aether.com`).
-   **Dashboard:** Real-time analytics, activity streams, and quick stats.
-   **Listings Management:** Create, edit, and track property listings.
-   **CRM:** Manage contacts, leads, and client interactions.
-   **Transactions:** Visual pipeline for deal tracking.
-   **Authentication:** Secure email/password and social login flows.
-   **Internationalization:** Built-in support for multiple languages (EN, EL).
-   **Dark/Light Mode:** Fully responsive theme switching.

## 🛠️ Getting Started

### Prerequisites

-   [Bun](https://bun.sh/) installed
-   [Neon](https://neon.tech/) account and database
-   Node.js 18+ (if not using Bun exclusively for scripts)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/dacrab/aether.git
    cd aether
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    ```

3.  **Environment Setup:**

    Create a `.env` file in the root directory:

    ```env
    # Database
    DATABASE_URL="postgresql://..."

    # Auth
    BETTER_AUTH_SECRET="your-secret"
    BETTER_AUTH_URL="http://localhost:3000"

    # App
    NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"
    NEXT_PUBLIC_APP_URL="http://localhost:3000"
    ```

4.  **Database Migration:**

    Push the schema to your Neon database:

    ```bash
    bun run db:push
    ```

5.  **Run Development Server:**

    ```bash
    bun dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
src/
├── app/                # Next.js App Router pages
│   ├── (auth)/         # Authentication routes
│   ├── (dashboard)/    # Main dashboard routes
│   ├── [subdomain]/    # Tenant-specific public pages
│   └── api/            # API Routes
├── components/         # Reusable UI components
├── db/                 # Drizzle schema and config
├── i18n/               # Internationalization config
├── lib/                # Utilities and shared logic
└── proxy.ts            # Middleware / Edge Proxy logic
```

## 🚢 Deployment

Deploy easily on [Vercel](https://vercel.com):

1.  Push your code to GitHub.
2.  Import the project into Vercel.
3.  Add your Environment Variables.
4.  Deploy!

---

**License:** Private / Proprietary
