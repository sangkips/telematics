#!/bin/sh
set -e

# Set default if not provided
VITE_API_URL=${VITE_API_URL:-"https://api.autoscaleops.com/api/v1"}

# Replace placeholder in JavaScript files
echo "Replacing __VITE_API_URL__ with ${VITE_API_URL} in JS files..."
find /usr/share/nginx/html -name "*.js" -exec sed -i "s|__VITE_API_URL__|${VITE_API_URL}|g" {} \;
find /usr/share/nginx/html -name "*.html" -exec sed -i "s|__VITE_API_URL__|${VITE_API_URL}|g" {} \;
echo "Replacement complete."

# Start nginx
exec nginx -g 'daemon off;'