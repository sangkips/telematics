#!/bin/sh
set -e

# Set default if not provided
VITE_API_URL=${VITE_API_URL:-"https://api.autoscaleops.com/api/v1"}

# Generate config.js with environment variables
echo "Generating config.js with VITE_API_URL=${VITE_API_URL}"
cat <<EOF > /usr/share/nginx/html/config.js
window.ENV = {
  VITE_API_URL: "${VITE_API_URL}",
};
EOF

# Start nginx
exec nginx -g 'daemon off;'