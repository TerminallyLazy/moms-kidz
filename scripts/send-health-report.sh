#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the absolute path of the project directory
PROJECT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

# Email configuration
EMAIL_TO=${EMAIL_TO:-"admin@example.com"}
EMAIL_FROM=${EMAIL_FROM:-"monitoring@momskidz.com"}
EMAIL_SUBJECT="Mom's Kidz Health Report - $(date +%Y-%m-%d)"

# SMTP configuration (from environment variables)
SMTP_HOST=${SMTP_HOST:-"smtp.gmail.com"}
SMTP_PORT=${SMTP_PORT:-"587"}
SMTP_USER=${SMTP_USER:-""}
SMTP_PASSWORD=${SMTP_PASSWORD:-""}

# Function to check if required commands exist
check_requirements() {
    local missing_commands=()
    
    for cmd in mailx curl jq; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            missing_commands+=("$cmd")
        fi
    done
    
    if [ ${#missing_commands[@]} -ne 0 ]; then
        echo -e "${RED}Error: Missing required commands: ${missing_commands[*]}${NC}"
        echo "Please install the missing packages:"
        echo "sudo apt-get install mailutils curl jq  # For Debian/Ubuntu"
        echo "sudo yum install mailx curl jq         # For CentOS/RHEL"
        exit 1
    fi
}

# Function to run health check
run_health_check() {
    echo -e "${YELLOW}Running health check...${NC}"
    
    # Make health check script executable
    chmod +x "$PROJECT_DIR/scripts/health-check.sh"
    
    # Run health check
    "$PROJECT_DIR/scripts/health-check.sh"
    
    # Get path to latest report
    REPORT_FILE="$PROJECT_DIR/logs/system/health-reports/latest.txt"
    
    if [ ! -f "$REPORT_FILE" ]; then
        echo -e "${RED}Error: Health check report not found${NC}"
        exit 1
    fi
}

# Function to format report for email
format_report() {
    local report_content=$(cat "$REPORT_FILE")
    local formatted_report
    
    # Convert ANSI color codes to HTML
    formatted_report=$(echo "$report_content" | sed \
        -e 's/\x1b\[0;31m/<span style="color: red;">/g' \
        -e 's/\x1b\[0;32m/<span style="color: green;">/g' \
        -e 's/\x1b\[1;33m/<span style="color: orange;">/g' \
        -e 's/\x1b\[0m/<\/span>/g')
    
    # Create HTML email
    cat > "$REPORT_FILE.html" << EOF
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        pre {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .header {
            background: #9333ea;
            color: white;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 0.9em;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Mom's Kidz Health Report</h1>
        <p>Generated on: $(date)</p>
    </div>
    
    <pre>
$formatted_report
    </pre>
    
    <div class="footer">
        <p>This is an automated health report from Mom's Kidz monitoring system.</p>
        <p>For more details, please check the monitoring dashboard at: http://localhost:3001</p>
    </div>
</body>
</html>
EOF
}

# Function to send email
send_email() {
    echo -e "${YELLOW}Sending email report...${NC}"
    
    # Configure mailx
    if [ -n "$SMTP_USER" ] && [ -n "$SMTP_PASSWORD" ]; then
        echo "set smtp-use-starttls" > ~/.mailrc
        echo "set ssl-verify=ignore" >> ~/.mailrc
        echo "set smtp=smtp://${SMTP_HOST}:${SMTP_PORT}" >> ~/.mailrc
        echo "set smtp-auth=login" >> ~/.mailrc
        echo "set smtp-auth-user=${SMTP_USER}" >> ~/.mailrc
        echo "set smtp-auth-password=${SMTP_PASSWORD}" >> ~/.mailrc
        echo "set from=${EMAIL_FROM}" >> ~/.mailrc
    fi
    
    # Send HTML email
    if mailx -a "Content-Type: text/html" \
            -s "$EMAIL_SUBJECT" \
            "$EMAIL_TO" < "$REPORT_FILE.html"; then
        echo -e "${GREEN}Email sent successfully${NC}"
        rm "$REPORT_FILE.html"
    else
        echo -e "${RED}Failed to send email${NC}"
        rm "$REPORT_FILE.html"
        exit 1
    fi
}

# Main function
main() {
    echo -e "${YELLOW}Starting health report process...${NC}"
    
    # Check requirements
    check_requirements
    
    # Run health check
    run_health_check
    
    # Format report
    format_report
    
    # Send email
    send_email
    
    echo -e "${GREEN}Health report process completed successfully${NC}"
}

# Run main function
main

exit 0