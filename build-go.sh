#!/bin/bash

# Function to print a message with elapsed time
print_message() {
  local start_time=$1
  while true; do
    elapsed=$((SECONDS - start_time))
    echo "GO Build is still running... Elapsed time: ${elapsed}s"
    sleep 30
  done
}


timeout_kill() {
  local pid=$1
  local timeout=$((60 * 15)) # 10 minutes in seconds
  local elapsed=0

  echo "Monitoring process $pid for timeout..."

  while kill -0 "$pid" 2>/dev/null; do
    if (( elapsed >= timeout )); then
      cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}')  # CPU usage as a percentage
      mem_usage=$(free -m | awk '/Mem:/ { printf "%.2f%%", $3/$2 * 100 }')  # Memory usage as a percentage
      echo "Stats before killing | CPU Usage: ${cpu_usage}% | RAM Usage: ${mem_usage}"
      echo "Timeout reached: Killing the go build process (PID: $pid)"
      kill -6 "$pid"
      return
    fi
    sleep 1
    ((elapsed++))
  done

  echo "Process $pid has completed within the timeout."
}


# Capture the start time
start_time=$SECONDS

# Start the message-printing function in the background, passing the start time
print_message $start_time &
message_pid=$!

# Trap SIGINT (Ctrl+C) and SIGTERM to clean up background processes
cleanup() {
  echo "Stopping background process..."
  kill $message_pid 2>/dev/null
  wait $message_pid 2>/dev/null
  exit 1
}
trap cleanup SIGINT SIGTERM

# Run the main command and capture its exit code
export GOMAXPROCS=1

# Command to run
echo "Will download modules"
# go mod download
echo "Will build the project"
go build -p=1 -x -trimpath -ldflags="-s -w" -o ccxt ./go/ccxt &
pid_go_build=$!

if [[ -z "$pid_go_build" ]]; then
  echo "Error: Failed to capture PID for go build."
  exit 1
fi

# Start the timeout monitoring in the background
timeout_kill "$pid_go_build" &
wait $pid_go_build
command_exit_code=$?

# Kill the background message-printing process
kill $message_pid 2>/dev/null
wait $message_pid 2>/dev/null

# Exit with the same code as the main command
exit $command_exit_code