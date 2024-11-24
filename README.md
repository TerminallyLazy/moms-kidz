# Mom's Kidz v3

A sophisticated web application built with Next.js 13+, designed as both a supportive platform for mothers and a valuable pediatric data acquisition system.

## Features

- 🏆 Gamification System
- 📊 Data Acquisition System
- 👥 Community Features
- 📱 Social Integration
- 📈 Progress Tracking
- 🔒 HIPAA-Compliant Data Handling

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
- npm/yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/moms-kidz-v3.git
cd moms-kidz-v3
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Copy the example environment variables:
```bash
cp .env.example .env.local
```

4. Update the environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Initialize the database:
```bash
npm run setup-db
# or
yarn setup-db
```

6. Start the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                    # Next.js 13 App Router
├── components/            # React Components
│   ├── ui/               # UI Components
│   ├── features/         # Feature Components
│   └── providers/        # Context Providers
├── hooks/                # Custom React Hooks
├── lib/                  # Utility Functions
├── styles/              # Global Styles
└── types/               # TypeScript Types
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/yourusername/moms-kidz-v3](https://github.com/yourusername/moms-kidz-v3)