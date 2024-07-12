#!/bin/sh

LOCAL_PORT=${1-3000}
PID_FILE="tmp/serveo_ssh_tunnel.pid"
LOG_FILE="tmp/serveo_ssh_tunnel.log"

echo "Start Serveo tunnel in background on port [ $LOCAL_PORT ]"

# Start the SSH tunnel with nohup and redirect output to a log file
nohup ssh -nNT -R dg1-api.serveo.net:80:localhost:${LOCAL_PORT} serveo.net >> $LOG_FILE 2>&1 &

# Capture the PID of the background SSH process
SSH_PID=$!
echo $SSH_PID > $PID_FILE

echo "Serveo tunnel started with PID [ $SSH_PID ]"

# ssh -R dg1-api.serveo.net:80:localhost:${LOCAL_PORT} serveo.net

# ssh -R dg1-proxy-api.serveo.net:80:localhost:3000 serveo.net