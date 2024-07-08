#!/bin/sh

# Set local port from command line arg or default to 8080
LOCAL_PORT=${1-8080}

echo "Start ngrok in background on port [ $LOCAL_PORT ]"
nohup ngrok http ${LOCAL_PORT} &>/dev/null &

echo -n "Extracting ngrok public url ."
NGROK_PUBLIC_URL=""
while [ -z "$NGROK_PUBLIC_URL" ]; do
  # Run 'curl' against ngrok API and extract public (using 'sed' command)
  export NGROK_PUBLIC_URL=$(curl --silent --max-time 10 --connect-timeout 5 \
                            --show-error http://127.0.0.1:4040/api/tunnels | \
                            sed -nE 's/.*public_url":"(https:[^"]*).*/\1/p')
  sleep 1
  echo -n "."
done

echo
echo "NGROK_PUBLIC_URL => [ $NGROK_PUBLIC_URL ]"

# export NGROK_PUBLIC_URL=$(curl --silent --max-time 10 --connect-timeout 5 \
  #                            --show-error http://127.0.0.1:4040/api/tunnels | \
  #                            sed -nE 's/.*public_url":"https:..([^"]*).*/\1/p')



# nohup ngrok tunnel --label edge=edghts_2hgx1TzXxwRBfIn020w1NZzOUxV http://localhost:3000

#!/bin/sh

#LOCAL_PORT=${1-8080}
#echo "Start ngrok in background on port [ $LOCAL_PORT ]"
#nohup ngrok tunnel --label edge=edghts_2hgx1TzXxwRBfIn020w1NZzOUxV http://localhost:${LOCAL_PORT} &>/dev/null

