.PHONY: install start dev build lint format clean monitoring-init monitoring-dashboard db-migrate db-seed db-reset backup restore update status logs

# Application
install:
	npm install

start:
	npm run start

dev:
	npm run dev

build:
	npm run build

lint:
	npm run lint

format:
	npm run format

clean:
	rm -rf .next
	rm -rf node_modules

# Monitoring
monitoring-init:
	docker-compose -f monitoring/docker-compose.yml up -d

monitoring-dashboard:
	open http://localhost:3001

# Database
db-migrate:
	npm run db:migrate

db-seed:
	npm run db:seed

db-reset:
	npm run db:reset

# Backup & Restore
backup:
	@echo "Creating backup..."
	@mkdir -p backups
	@timestamp=$$(date +%Y%m%d_%H%M%S); \
	docker-compose -f docker-compose.yml exec db pg_dump -U postgres -d momskidz > backups/backup_$$timestamp.sql
	@echo "Backup created in backups/backup_$$timestamp.sql"

restore:
	@if [ -z "$(dir)" ]; then \
		echo "Please specify backup directory: make restore dir=backups/20240315_120000"; \
		exit 1; \
	fi
	@echo "Restoring from $(dir)..."
	@docker-compose -f docker-compose.yml exec -T db psql -U postgres -d momskidz < $(dir)/backup.sql

# Service Management
update:
	git pull
	npm install
	npm run build
	docker-compose -f docker-compose.yml pull
	docker-compose -f docker-compose.yml up -d

status:
	docker-compose -f docker-compose.yml ps

logs:
	@if [ -z "$(service)" ]; then \
		docker-compose -f docker-compose.yml logs -f; \
	else \
		docker-compose -f docker-compose.yml logs -f $(service); \
	fi

# Help
help:
	@echo "Available commands:"
	@echo "  install              - Install dependencies"
	@echo "  start               - Start production server"
	@echo "  dev                 - Start development server"
	@echo "  build               - Build production bundle"
	@echo "  lint                - Run linter"
	@echo "  format              - Format code"
	@echo "  clean               - Clean build files"
	@echo "  monitoring-init     - Initialize monitoring stack"
	@echo "  monitoring-dashboard- Open Grafana dashboard"
	@echo "  db-migrate          - Run database migrations"
	@echo "  db-seed             - Seed database"
	@echo "  db-reset            - Reset database"
	@echo "  backup              - Create database backup"
	@echo "  restore dir=<path>  - Restore database from backup"
	@echo "  update              - Update application and services"
	@echo "  status              - Show service status"
	@echo "  logs [service=name] - Show service logs"

# Default
.DEFAULT_GOAL := help
