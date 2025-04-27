#!/bin/sh

# Ensure we're in the root project directory
cd "$(dirname "$0")"

# Copy hooks into the .git/hooks directory
cp -r git-hooks/* .git/hooks/
echo "✅ Git hooks setup complete!"