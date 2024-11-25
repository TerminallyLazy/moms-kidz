# Colors for output
YELLOW := \033[1;33m
GREEN := \033[0;32m
RED := \033[0;31m
NC := \033[0m

# Variables
SHELL := /bin/bash
APP_NAME := moms-kidz
NODE_ENV ?= development

.PHONY: help install dev build start stop restart status logs backup restore update clean test lint format

help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	npm install
	@echo "$(GREEN)Dependencies installed successfully$(NC)"

dev: ## Start development server
	@echo "$(YELLOW)Starting development server...$(NC)"
	npm run dev

build: ## Build the application
	@echo "$(YELLOW)Building application...$(NC)"
	npm run build
	@echo "$(GREEN)Build completed$(NC)"

start: ## Start all services
	@echo "$(YELLOW)Starting all services...$(NC)"
	@chmod +x scripts/manage.sh
	./scripts/manage.sh start

stop: ## Stop all services
	@echo "$(YELLOW)Stopping all services...$(NC)"
	@chmod +x scripts/manage.sh
	./scripts/manage.sh stop

restart: ## Restart all services
	@echo "$(YELLOW)Restarting all services...$(NC)"
	@chmod +x scripts/manage.sh
	./scripts/manage.sh restart

status: ## Show service status
	@echo "$(YELLOW)Checking service status...$(NC)"
	@chmod +x scripts/manage.sh
	./scripts/manage.sh status

logs: ## View service logs (usage: make logs service=app|grafana|prometheus|loki)
	@if [ -z "$(service)" ]; then \
		echo "$(RED)Error: Please specify service (e.g., make logs service=app)$(NC)"; \
		exit 1; \
	fi
	@chmod +x scripts/manage.sh
	./scripts/manage.sh logs $(service)

backup: ## Create backup of all services
	@echo "$(YELLOW)Creating backup...$(NC)"
	@chmod +x scripts/manage.sh
	./scripts/manage.sh backup

restore: ## Restore from backup (usage: make restore dir=backup_directory)
	@if [ -z "$(dir)" ]; then \
		echo "$(RED)Error: Please specify backup directory (e.g., make restore dir=backups/20240315_120000)$(NC)"; \
		exit 1; \
	fi
	@chmod +x scripts/manage.sh
	./scripts/manage.sh restore $(dir)

update: ## Update all services
	@echo "$(YELLOW)Updating services...$(NC)"
	@chmod +x scripts/manage.sh
	./scripts/manage.sh update

clean: ## Clean up generated files and dependencies
	@echo "$(YELLOW)Cleaning up...$(NC)"
	rm -rf .next
	rm -rf node_modules
	rm -rf monitoring/grafana/data
	rm -rf monitoring/prometheus/data
	rm -rf monitoring/loki/data
	@echo "$(GREEN)Cleanup completed$(NC)"

test: ## Run tests
	@echo "$(YELLOW)Running tests...$(NC)"
	npm test

lint: ## Run linter
	@echo "$(YELLOW)Running linter...$(NC)"
	npm run lint

format: ## Format code
	@echo "$(YELLOW)Formatting code...$(NC)"
	npm run format

db-migrate: ## Run database migrations
	@echo "$(YELLOW)Running database migrations...$(NC)"
	npm run db:migrate

db-seed: ## Run database seeds
	@echo "$(YELLOW)Running database seeds...$(NC)"
	npm run db:seed

db-reset: ## Reset database
	@echo "$(YELLOW)Resetting database...$(NC)"
	npm run db:reset

monitoring-init: ## Initialize monitoring stack
	@echo "$(YELLOW)Initializing monitoring stack...$(NC)"
	mkdir -p monitoring/grafana/data
	mkdir -p monitoring/prometheus/data
	mkdir -p monitoring/loki/data
	chmod -R 777 monitoring/grafana/data
	chmod -R 777 monitoring/prometheus/data
	chmod -R 777 monitoring/loki/data
	@echo "$(GREEN)Monitoring stack initialized$(NC)"

monitoring-dashboard: ## Open Grafana dashboard
	@echo "$(YELLOW)Opening Grafana dashboard...$(NC)"
	xdg-open http://localhost:3001 || open http://localhost:3001 || echo "$(RED)Could not open browser automatically. Please visit http://localhost:3001$(NC)"

# Default target
.DEFAULT_GOAL := help
