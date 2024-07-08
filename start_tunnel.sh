#!/bin/sh

NGROK_EDGE="edghts_2hgx1TzXxwRBfIn020w1NZzOUxV"
LOCAL_PORT=${1-8080}
echo "Start ngrok in background on port [ $LOCAL_PORT ]"
nohup ngrok tunnel --label edge=$NGROK_EDGE http://localhost:${LOCAL_PORT} &>/dev/null