#!/bin/bash

# Load environment variables from .env.local
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo "Error: .env.local file not found"
    exit 1
fi

# Execute the passed command with the loaded environment variables
"$@"