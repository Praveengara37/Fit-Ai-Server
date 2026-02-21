#!/bin/bash
set -e

echo "Starting Database for testing (if any is required)..."
# We assume the user runs the dev server. I will start it in the background to test.
npm run dev > server.log 2>&1 &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID. Waiting for server to be ready..."
sleep 5

API_URL="http://localhost:3000/api"

echo "\n--- 1. Registering Test User ---"
REGISTER_RESP=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test_steps_'$(date +%s)'@example.com", "password":"Password123!", "fullName":"Test User Steps"}')

# We'll use a hardcoded user if we don't have cookies easily extracted from bash.
# For simplicity with JWT tokens, we'll extract the token directly if it's in the response,
# but it's likely set as a cookie. Let's send a valid raw request and capture headers.
echo "$REGISTER_RESP"

echo "\n--- Cleaning up ---"
kill $SERVER_PID
echo "Done testing."

