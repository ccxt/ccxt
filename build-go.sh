#!/bin/bash

# this is needed otheriwse travis will timeout
# Function to print a message every 30 seconds
print_message() {
  while true; do
    echo "GO Build is still running..."
    sleep 30
  done
}

# Command to run
your_command="npm run buildGO"

# Start the message-printing function in the background
print_message &

# Capture the PID of the background process
message_pid=$!

# Run the main command
$your_command

# Kill the background message-printing process once the command completes
kill $message_pid 2>/dev/null