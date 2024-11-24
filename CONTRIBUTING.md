# Contributing to Mom's Kidz

First off, thank you for considering contributing to Mom's Kidz! It's people like you that make Mom's Kidz such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

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

Enhancement suggestions are tracked as GitHub issues. When you are creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Include screenshots and animated GIFs in your pull request whenever possible
* Follow the JavaScript/TypeScript styleguides
* Include thoughtfully-worded, well-structured tests
* Document new code
* End all files with a newline

## Development Process

1. Fork the repo
2. Create a new branch from `main`
3. Make your changes
4. Run the tests
5. Push to your fork and submit a pull request

### Setup Development Environment

```bash
# Clone your fork
git clone https://github.com/your-username/moms-kidz-v3.git

# Navigate to the project directory
cd moms-kidz-v3

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Style Guide

* Use TypeScript
* Follow the existing code style
* Use meaningful variable names
* Comment your code when necessary
* Keep functions small and focused
* Use async/await instead of promises
* Use ES6+ features when possible

### Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### Testing

* Write tests for new features
* Run existing tests before submitting a PR
* Ensure all tests pass
* Include both unit and integration tests when applicable

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

## Database Schema

Please refer to `src/lib/db/schema.sql` for the current database schema.

## Additional Notes

### Git Workflow

1. Create a new branch for each feature/fix
2. Use meaningful branch names (feature/add-login, fix/auth-redirect)
3. Keep commits atomic and focused
4. Rebase your branch on main before submitting a PR
5. Squash commits if necessary

### Code Review Process

1. All submissions require review
2. Changes must be approved by at least one maintainer
3. Reviews should be thorough and constructive
4. Address all review comments
5. Update documentation if necessary

### Documentation

* Keep README.md up to date
* Document all new features
* Update API documentation when necessary
* Include JSDoc comments for TypeScript interfaces and functions
* Update changelog for significant changes

## Questions?

Feel free to open an issue with your question or contact the maintainers directly.

Thank you for contributing to Mom's Kidz! 🎉