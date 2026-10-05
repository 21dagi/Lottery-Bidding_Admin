#!/bin/sh
set -eu

cat > /usr/share/nginx/html/env.js <<EOF
window.__ENV__ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL:-/api}",
  VITE_WS_URL: "${VITE_WS_URL:-}",
  VITE_ENV: "${VITE_ENV:-production}",
  VITE_USE_MOCKS: "${VITE_USE_MOCKS:-false}",
};
EOF

exec "$@"
