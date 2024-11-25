# Contributing to Mom's Kidz

First off, thank you for considering contributing to Mom's Kidz! It's people like you that make Mom's Kidz such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Process

1. Clone the repository:
```bash
git clone https://github.com/yourusername/moms-kidz-v3.git
cd moms-kidz-v3
```

2. Install dependencies:
```bash
npm install
```

3. Create a branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

4. Set up your environment:
```bash
cp .env.example .env.local
```
Then edit `.env.local` with your values.

5. Start the development server:
```bash
npm run dev
```

### Database Management

When making changes to the database schema:

1. Create a new migration file in `supabase/migrations`
2. Test your migration locally:
```bash
npm run db:migrate
```

3. Include the migration in your pull request

### Code Style

We use ESLint and Prettier to maintain code quality. Before submitting a PR:

```bash
npm run format
npm run lint
```

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

* `feat:` - A new feature
* `fix:` - A bug fix
* `docs:` - Documentation only changes
* `style:` - Changes that do not affect the meaning of the code
* `refactor:` - A code change that neither fixes a bug nor adds a feature
* `perf:` - A code change that improves performance
* `test:` - Adding missing tests or correcting existing tests
* `chore:` - Changes to the build process or auxiliary tools

Example:
```
feat: add user authentication system
```

### Testing

Please write tests for new code you create. To run tests:

```bash
npm test
```

## Project Structure

```
src/
├── app/                    # Next.js 13 App Router
├── components/            # React Components
├── contexts/             # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Core utilities
├── types/                # TypeScript definitions
└── utils/                # Utility functions
```

## Documentation

* Comment your code
* Update README.md if you change functionality
* Add JSDoc comments for functions and components
* Update type definitions when changing interfaces

## Questions?

Feel free to open an issue with the tag `question`.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
