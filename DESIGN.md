# Mom's Kidz Project Design Document

## Project Overview
Mom's Kidz is a modern web application built with Next.js, focusing on providing a comprehensive platform for new moms and their journey through motherhood and beyond. The moms are the first line of support for their children, and this platform is designed to support them. The application features both public-facing content and member-specific features.

## Technology Stack
- **Frontend Framework**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Hooks
- **UI Components**: Custom components built on shadcn/ui

## Project Structure

```
mk-v2/
├── src/
│   ├── app/                    # Next.js 13+ App Router
│   │   ├── _components/        # Page-specific components
│   │   │   ├── home-features.tsx
│   │   │   ├── home-data.tsx
│   │   │   ├── testimonials.tsx
│   │   │   └── tapestry-*.tsx
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   ├── user/
│   │   │   └── news/
│   │   ├── auth/              # Auth-related pages
│   │   ├── member/            # Member dashboard
│   │   └── layout.tsx         # Root layout
│   │
│   ├── components/            # Shared components
│   │   ├── ui/               # UI components (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── providers/        # Context providers
│   │   │   ├── auth-provider.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   └── client-providers.tsx
│   │   └── [feature]/        # Feature-specific components
│   │
│   └── lib/                  # Shared utilities
│
├── public/                   # Static assets
├── styles/                   # Global styles
└── config files             # Configuration files

```

## Core Features

### 1. Authentication System
- Supabase-based authentication
- Social login integration
- Protected routes
- User profile management

### 2. Member Dashboard
- Personalized welcome section
- News grid with articles and videos
- Social media integration
  - Facebook feed
  - Instagram feed
  - Pinterest feed
  - TikTok feed

### 3. Content Management
- Dynamic news articles
- Video content integration
- Social media feed aggregation
- Search functionality

### 4. UI/UX Design
- Responsive design
- Dark/Light mode support
- Consistent color scheme
  - Light mode:
    - White backgrounds
    - Purple to pink gradients
    - Gray text for secondary content
  - Dark mode:
    - Dark backgrounds (gray-950)
    - Lighter purple to pink gradients
    - Light gray text

## Component Architecture

### Key Components

1. **Layout Components**
   - Root Layout (`layout.tsx`)
   - Navigation Menu
   - Theme Provider

2. **Authentication Components**
   - Login Page
   - Signup Page
   - Protected Route Wrapper
   - Auth Provider

3. **Member Dashboard Components**
   - NewsGrid
     - Article Cards
     - Video Cards
     - Search Integration
   - SocialFeed
     - Social Media Tabs
     - Platform-specific Embeds

4. **UI Components**
   - Animated Card
   - Button
   - Input
   - Tabs
   - Dialog
   - Form Elements

## Data Flow

1. **Authentication Flow**
   ```
   User -> Login/Signup -> Supabase Auth -> JWT -> Protected Routes
   ```

2. **Content Flow**
   ```
   API -> NewsGrid -> Article/Video Cards -> User Interaction
   ```

3. **Social Media Integration**
   ```
   Platform SDKs -> SocialFeed Component -> Platform-specific Embeds
   ```

## Styling Strategy

1. **Base Styles**
   - Tailwind CSS for utility classes
   - CSS variables for theme colors
   - Responsive breakpoints

2. **Component Styles**
   - Shadcn/ui as base components
   - Custom variants for brand consistency
   - Dark mode variants

3. **Animation**
   - CSS transitions for hover states
   - Framer Motion for complex animations
   - Loading states and skeletons

## Security Considerations

1. **Authentication**
   - JWT-based auth with Supabase
   - Protected API routes
   - Secure session management

2. **API Security**
   - Rate limiting
   - CORS configuration
   - Input validation

3. **Content Security**
   - CSP headers for social media embeds
   - Sanitized user inputs
   - Secure external content loading

## Performance Optimization

1. **Loading Strategies**
   - Dynamic imports
   - Lazy loading for images
   - Code splitting

2. **Caching**
   - Static page caching
   - API response caching
   - Asset caching

3. **Optimization Techniques**
   - Image optimization
   - Bundle size optimization
   - Tree shaking

## Future Enhancements

1. **Feature Additions**
   - Enhanced search capabilities
   - User interaction features
   - Community features

2. **Technical Improvements**
   - PWA support
   - Offline capabilities
   - Analytics integration

3. **Content Expansion**
   - More content types
   - Interactive tutorials
   - User-generated content

## Development Guidelines

1. **Code Style**
   - TypeScript for type safety
   - ESLint configuration
   - Prettier for formatting

2. **Testing Strategy**
   - Unit tests for components
   - Integration tests
   - E2E testing with Cypress

3. **Version Control**
   - Feature branch workflow
   - Semantic versioning
   - Conventional commits

## Deployment

1. **Environment Setup**
   - Development
   - Staging
   - Production

2. **CI/CD Pipeline**
   - Automated testing
   - Build optimization
   - Deployment automation

3. **Monitoring**
   - Error tracking
   - Performance monitoring
   - User analytics
