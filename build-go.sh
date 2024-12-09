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

# Command to run
echo "Will download modules"
go mod download
echo "Will build the project"
your_command="GOMAXPROCS=1 go build -x ./go/ccxt"

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
$your_command
command_exit_code=$?

# Kill the background message-printing process
kill $message_pid 2>/dev/null
wait $message_pid 2>/dev/null

# Exit with the same code as the main command
exit $command_exit_code