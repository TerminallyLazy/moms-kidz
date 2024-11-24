.PHONY: help setup dev build test lint format clean docker-up docker-down db-setup db-migrate

# Include environment variables from .env
-include .env
export

help: ## Display this help screen
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

setup: ## Setup the project
	@echo "Setting up the project..."
	cp .env.example .env
	npm install
	npm run setup-db

dev: ## Start development server
	npm run dev

build: ## Build the project
	npm run build

test: ## Run tests
	npm run test

lint: ## Run linter
	npm run lint

format: ## Format code
	npm run format

clean: ## Clean build artifacts
	rm -rf .next
	rm -rf node_modules
	rm -rf coverage

# Docker commands
docker-up: ## Start Docker containers
	docker-compose up -d

docker-down: ## Stop Docker containers
	docker-compose down

docker-logs: ## View Docker logs
	docker-compose logs -f

docker-build: ## Build Docker images
	docker-compose build

docker-rebuild: ## Rebuild Docker images
	docker-compose build --no-cache

# Database commands
db-setup: ## Setup database
	npm run setup-db

db-migrate: ## Run database migrations
	npm run migrate

db-reset: ## Reset database
	npm run db:reset

# Development shortcuts
dev-docker: docker-up ## Start development environment with Docker
	@echo "Development environment is ready"
	@echo "App: http://localhost:3000"
	@echo "Adminer: http://localhost:8080"
	@echo "MailHog: http://localhost:8025"
	@echo "Supabase Studio: http://localhost:3010"

install-deps: ## Install dependencies
	npm install

update-deps: ## Update dependencies
	npm update

# Deployment commands
deploy-prod: ## Deploy to production
	@echo "Deploying to production..."
	npm run build
	# Add your deployment commands here

deploy-staging: ## Deploy to staging
	@echo "Deploying to staging..."
	npm run build
	# Add your staging deployment commands here

# Security commands
security-check: ## Run security checks
	npm audit
	npm run lint

# Documentation commands
docs: ## Generate documentation
	@echo "Generating documentation..."
	# Add your documentation generation commands here

# Cache commands
clear-cache: ## Clear all caches
	rm -rf .next
	npm cache clean --force
	docker-compose exec redis redis-cli FLUSHALL

# Utility commands
check-env: ## Check environment variables
	@echo "Checking environment variables..."
	@test -f .env || (echo ".env file not found!" && exit 1)
	@echo "Environment variables are set"

check-health: ## Check application health
	curl -f http://localhost:3000/api/health || exit 1

# Default target
.DEFAULT_GOAL := help