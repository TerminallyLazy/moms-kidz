# Mom's Kidz v3

A sophisticated web application built with Next.js 13+, designed as both a supportive platform for mothers and a valuable pediatric data acquisition system.

## Tech Stack

- **Framework:** Next.js 13+ (App Router)
- **Language:** TypeScript
- **Auth:** Supabase Auth
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS + shadcn/ui
- **Animation:** Framer Motion
- **State Management:** Zustand
- **Form Handling:** React Hook Form + Zod
- **Data Visualization:** Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account and project

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Update the environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Initialize the database:
```bash
npm run db:migrate
npm run db:seed
```

3. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Management

The project includes several scripts for managing the Supabase database:

- `npm run db:migrate` - Run all migrations
- `npm run db:seed` - Run database seeds
- `npm run db:reset` - Reset database and run migrations and seeds

## Project Structure

```
src/
├── app/                    # Next.js 13 App Router
│   ├── api/               # API routes
│   ├── (auth)/           # Authentication pages
│   └── (dashboard)/      # Protected dashboard routes
├── components/            # React Components
│   ├── ui/               # UI Components
│   ├── layout/           # Layout Components
│   └── providers/        # Context Providers
├── contexts/             # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Core utilities
├── types/                # TypeScript definitions
└── utils/                # Utility functions
```

## Features

- 🔐 Authentication with Supabase Auth
- 🎨 Theming with next-themes
- 📱 Responsive design
- 🎭 Animations with Framer Motion
- 📊 Data visualization with Recharts
- 🔄 Real-time updates
- 🎯 Form validation with Zod
- 📝 Rich text editing
- 🌙 Dark mode support
- ⌨️ Keyboard shortcuts
- 🎮 Gamification system
- 📈 Progress tracking
- 🤝 Social features

## Development

### Code Style

The project uses ESLint and Prettier for code formatting. Format your code using:

```bash
npm run format
```

Check formatting without making changes:

```bash
npm run format:check
```

### Adding New Features

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit them:
```bash
git commit -m "feat: add your feature"
```

3. Push to your branch:
```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request

## Deployment

The application can be deployed to any platform that supports Next.js applications. For production builds:

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
