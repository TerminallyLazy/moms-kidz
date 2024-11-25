.PHONY: help install dev build start clean test lint format db-migrate db-seed db-reset docker-build docker-up docker-down

# Variables
DOCKER_COMPOSE = docker-compose
DOCKER_COMPOSE_FILE = docker-compose.yml
DOCKER_COMPOSE_OVERRIDE = docker-compose.override.yml

# Colors
CYAN = \033[0;36m
GREEN = \033[0;32m
YELLOW = \033[0;33m
NC = \033[0m # No Color

help: ## Display this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk -F ':|##' '/^[^\t].+?:.*?##/ { printf "  $(CYAN)%-20s$(NC) %s\n", $$1, $$NF }' $(MAKEFILE_LIST)

install: ## Install dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	npm install

dev: ## Start development server
	@echo "$(GREEN)Starting development server...$(NC)"
	npm run dev

build: ## Build for production
	@echo "$(GREEN)Building for production...$(NC)"
	npm run build

start: ## Start production server
	@echo "$(GREEN)Starting production server...$(NC)"
	npm start

clean: ## Clean build artifacts
	@echo "$(GREEN)Cleaning build artifacts...$(NC)"
	rm -rf .next
	rm -rf node_modules

test: ## Run tests
	@echo "$(GREEN)Running tests...$(NC)"
	npm test

lint: ## Run linter
	@echo "$(GREEN)Running linter...$(NC)"
	npm run lint

format: ## Format code
	@echo "$(GREEN)Formatting code...$(NC)"
	npm run format

# Database commands
db-migrate: ## Run database migrations
	@echo "$(GREEN)Running database migrations...$(NC)"
	npm run db:migrate

db-seed: ## Seed database
	@echo "$(GREEN)Seeding database...$(NC)"
	npm run db:seed

db-reset: ## Reset database
	@echo "$(YELLOW)Warning: This will reset the database$(NC)"
	@read -p "Are you sure? [y/N] " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		echo "$(GREEN)Resetting database...$(NC)"; \
		npm run db:reset; \
	fi

# Docker commands
docker-build: ## Build Docker images
	@echo "$(GREEN)Building Docker images...$(NC)"
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) -f $(DOCKER_COMPOSE_OVERRIDE) build

docker-up: ## Start Docker containers
	@echo "$(GREEN)Starting Docker containers...$(NC)"
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) -f $(DOCKER_COMPOSE_OVERRIDE) up -d

docker-down: ## Stop Docker containers
	@echo "$(GREEN)Stopping Docker containers...$(NC)"
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) -f $(DOCKER_COMPOSE_OVERRIDE) down

# Development environment
dev-setup: install db-migrate db-seed ## Set up development environment
	@echo "$(GREEN)Development environment setup complete$(NC)"

# Production deployment
deploy: build ## Deploy to production
	@echo "$(GREEN)Deploying to production...$(NC)"
	docker-build
	docker-up

# Monitoring
monitor: ## Open Grafana dashboard
	@echo "$(GREEN)Opening Grafana dashboard...$(NC)"
	open http://localhost:3001

logs: ## View application logs
	@echo "$(GREEN)Viewing logs...$(NC)"
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) -f $(DOCKER_COMPOSE_OVERRIDE) logs -f app

# Default target
.DEFAULT_GOAL := help
