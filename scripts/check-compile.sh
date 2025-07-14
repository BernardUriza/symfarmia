#!/bin/bash

echo "Starting Next.js server and monitoring for errors..."

# Start dev server in background and capture output
npm run dev 2>&1 | tee /tmp/nextjs-output.log &
SERVER_PID=$!

echo "Server PID: $SERVER_PID"
echo "Waiting for server to compile..."

# Wait for compilation
sleep 20

# Check if server is still running
if ps -p $SERVER_PID > /dev/null; then
    echo -e "\n✅ Server is running"
    
    # Try to access the site
    echo -e "\nTesting server response..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Server is responding successfully (HTTP $HTTP_CODE)"
        echo -e "\n🎉 SUCCESS! No import errors detected!"
    else
        echo "❌ Server returned HTTP $HTTP_CODE"
        echo -e "\nChecking for errors in output..."
        grep -E "Module not found|Can't resolve|Error:" /tmp/nextjs-output.log | head -20
    fi
else
    echo -e "\n❌ Server crashed"
    echo -e "\nLast 50 lines of output:"
    tail -50 /tmp/nextjs-output.log
fi

# Keep server running for manual testing
echo -e "\nServer is still running. Press Ctrl+C to stop."
wait $SERVER_PID