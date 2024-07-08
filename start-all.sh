#!/bin/sh

NGROK_EDGE="edghts_2hgx1TzXxwRBfIn020w1NZzOUxV"
LOCAL_PORT=${1-3000}

# Function to clean up background processes
cleanup() {
    echo "Stopping background ngrok process"
    kill -9 $NGROK_PID
    echo "ngrok stopped"
    exit 0
}

# Set trap to call cleanup on SIGINT (Ctrl+C)
trap cleanup SIGINT

echo "Start ngrok in background on port [ $LOCAL_PORT ]"
nohup ngrok tunnel --label edge=$NGROK_EDGE http://localhost:${LOCAL_PORT} &>/dev/null &
NGROK_PID=$!

# Give ngrok some time to start
sleep 5

# Start the Node.js application
echo "Starting Node.js application"
npm start &

# Wait for background processes to finish
wait
