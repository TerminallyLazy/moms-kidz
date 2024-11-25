# Mom's Kidz Monitoring Stack

This directory contains the monitoring setup for Mom's Kidz application, including Grafana dashboards, Prometheus metrics collection, and Loki log aggregation.

## Components

- **Grafana**: Visualization and dashboarding (port 3001)
- **Prometheus**: Metrics collection and alerting (port 9090)
- **Loki**: Log aggregation and querying (port 3100)
- **Promtail**: Log shipping agent
- **Node Exporter**: System metrics collection
- **Postgres Exporter**: Database metrics collection

## Quick Start

1. Make the monitoring script executable:
```bash
chmod +x scripts/monitor.sh
```

2. Start the monitoring stack:
```bash
./scripts/monitor.sh start
```

3. Access the dashboards:
- Grafana: http://localhost:3001 (default credentials: admin/admin)
- Prometheus: http://localhost:9090
- Loki: http://localhost:3100

## Available Commands

- `./scripts/monitor.sh start`: Start the monitoring stack
- `./scripts/monitor.sh stop`: Stop the monitoring stack
- `./scripts/monitor.sh restart`: Restart the monitoring stack
- `./scripts/monitor.sh status`: Check services health
- `./scripts/monitor.sh logs <service>`: View logs for a specific service
- `./scripts/monitor.sh cleanup`: Clean up monitoring data
- `./scripts/monitor.sh backup`: Create a backup of monitoring data
- `./scripts/monitor.sh restore <backup-dir>`: Restore from a backup

## Dashboards

### Main Dashboard
- Care Log activity metrics
- User engagement statistics
- System health metrics
- Error rates and latency

### Care Log Analytics
- Entry types distribution
- Activity patterns
- User participation
- Streak tracking

### Community Metrics
- Content creation rates
- User interactions
- Popular content
- Engagement trends

### System Performance
- API response times
- Database performance
- Resource utilization
- Error rates

## Alerts

Configured alerts include:
- High user inactivity
- Unusual login patterns
- Missing daily care logs
- High API latency
- Database connection issues
- Low community engagement

## Log Categories

- Application logs (`/var/log/mom-kidz/*.log`)
- Care Log specific logs (`/var/log/mom-kidz/care-log/*.log`)
- Community activity logs (`/var/log/mom-kidz/community/*.log`)
- API logs (`/var/log/mom-kidz/api/*.log`)
- Error logs (`/var/log/mom-kidz/error/*.log`)
- System logs (`/var/log/mom-kidz/system/*.log`)
- Database logs (`/var/log/mom-kidz/db/*.log`)
- AI Chat logs (`/var/log/mom-kidz/ai-chat/*.log`)

## Maintenance

### Backup
Regular backups are recommended. Use:
```bash
./scripts/monitor.sh backup
```

### Data Cleanup
To clean up old monitoring data:
```bash
./scripts/monitor.sh cleanup
```

### Updating
1. Stop the stack:
```bash
./scripts/monitor.sh stop
```

2. Pull new images:
```bash
docker-compose pull
```

3. Start the stack:
```bash
./scripts/monitor.sh start
```

## Troubleshooting

1. Check service health:
```bash
./scripts/monitor.sh status
```

2. View service logs:
```bash
./scripts/monitor.sh logs <service-name>
```

3. Common issues:
- If Grafana fails to start, check permissions on `grafana/data`
- If Prometheus shows no data, verify target configurations
- If Loki shows no logs, check Promtail configuration

## Contributing

When adding new metrics or dashboards:
1. Export the dashboard JSON from Grafana
2. Add it to the `grafana/dashboards` directory
3. Update the provisioning configuration if needed

## Security Notes

- Default credentials should be changed in production
- Access to monitoring endpoints should be restricted
- Sensitive data should be scrubbed from logs
- Regular security audits recommended

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review service logs
3. Contact the development team