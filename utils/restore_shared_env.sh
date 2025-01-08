#!/bin/bash

# Ensure shared_env.txt exists
FILE_NAME="./shared_env.txt"
if [ ! -f "$FILE_NAME" ]; then
  echo "$FILE_NAME does not exist"
  exit 1
fi

# Read the file line-by-line and assign to indexed variables
values=()
while IFS= read -r line || [ -n "$line" ]; do
  values+=("$line")
done < "$FILE_NAME"

# Assign variables
VAR1=${values[0]}
VAR2=${values[1]}
VAR3=${values[2]}

# # Print variables
# echo "VAR1=$VAR1"
# echo "VAR2=$VAR2"
# echo "VAR3=$VAR3"

echo "important_modified=$VAR1" >> $GITHUB_ENV
echo "rest_files=$VAR2" >> $GITHUB_ENV
echo "ws_files=$VAR3" >> $GITHUB_ENV