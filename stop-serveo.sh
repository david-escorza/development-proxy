#!/bin/sh

PID_FILE="/tmp/serveo_ssh_tunnel.pid"

if [ -f $PID_FILE ]; then
    SSH_PID=$(cat $PID_FILE)
    echo "Terminating Serveo tunnel with PID [ $SSH_PID ]"
    kill $SSH_PID
    rm $PID_FILE
else
    echo "No Serveo tunnel PID file found."
fi
