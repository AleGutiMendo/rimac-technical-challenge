#!/bin/bash

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded from .env file"
else
    echo "⚠️  No .env file found. Using system environment variables or defaults."
fi

# Execute the deployment script
exec ./scripts/deploy.sh
