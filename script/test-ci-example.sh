#!/bin/bash

set -e

echo "🧪 Testando CI Localmente"
echo "========================="


act pull_request -j code-quality -W .github/workflows/pr-checks.yml -P ubuntu-latest=node:20-bookworm-slim --reuse