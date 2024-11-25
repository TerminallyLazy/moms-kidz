# Mom's Kidz v3

A sophisticated Next.js 13+ web application designed as both a parenting support platform and pediatric data acquisition system.

## Quick Start

1. Install dependencies:
```bash
make install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Required environment variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Google AI Configuration
GOOGLE_AI_API_KEY=your_gemini_api_key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Optional Social Media Integration
NEXT_PUBLIC_TIKTOK_API_KEY=optional
NEXT_PUBLIC_FACEBOOK_APP_ID=optional
NEXT_PUBLIC_INSTAGRAM_API_KEY=optional
```

3. Initialize monitoring stack:
```bash
make monitoring-init
```

4. Start all services:
```bash
make start
```

5. Open Grafana dashboard:
```bash
make monitoring-dashboard
```

## Development

Start the development server:
```bash
make dev
```

Format and lint code:
```bash
make format
make lint
```

## Features

### AI Assistant
- 🤖 Gemini-powered AI chat
- ⌨️ Keyboard shortcuts support
- 💡 Suggested prompts
- 🎨 Dark mode optimized UI
- ⚡ Real-time streaming responses

### Core Features
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
- 📊 Real-time analytics
- 🔔 Push notifications
- 📱 PWA support

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
- **AI Integration:** Google Generative AI
- **Monitoring:** Grafana + Prometheus + Loki

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Send Message | ⌘/Ctrl + Enter |
| Clear Chat | ⌘/Ctrl + L |
| Focus Chat Input | ⌘/Ctrl + K |
| Clear Input | Esc |

## Database Management

Run migrations:
```bash
make db-migrate
```

Seed database:
```bash
make db-seed
```

Reset database:
```bash
make db-reset
```

## Monitoring & Analytics

The application includes a comprehensive monitoring stack with:

- **Grafana** (http://localhost:3001): Visualization and dashboards
- **Prometheus** (http://localhost:9090): Metrics collection
- **Loki** (http://localhost:3100): Log aggregation

### Dashboards

1. **Main Dashboard**
   - System health metrics
   - User engagement statistics
   - API performance metrics
   - Error rates

2. **Care Log Analytics**
   - Entry patterns
   - User participation
   - Activity trends
   - Streak tracking

3. **Community Metrics**
   - Content creation rates
   - User interactions
   - Engagement trends
   - Popular content

### Monitoring Commands

View service status:
```bash
make status
```

View service logs:
```bash
make logs service=app      # Main application logs
make logs service=grafana  # Grafana logs
make logs service=loki    # Loki logs
```

Create backup:
```bash
make backup
```

Restore from backup:
```bash
make restore dir=backups/20240315_120000
```

Update services:
```bash
make update
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
