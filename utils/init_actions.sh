#!/bin/bash
OUTPUT=$(./utils/check_modified_files.sh | tr -d '\n')
# echo "1"
IMPORTANT_MODIFIED=$(echo "$OUTPUT" | jq -r '.important_modified')
# echo "2"
REST_FILES=$(echo "$OUTPUT" | jq -r '.rest_exchanges | join(" ")')
WS_FILES=$(echo "$OUTPUT" | jq -r '.ws_exchanges | join(" ")')
# echo "4"
echo "important_modified=$IMPORTANT_MODIFIED" >> $GITHUB_ENV
# echo "5"
echo "rest_files=$REST_FILES" >> $GITHUB_ENV
# echo "6"
echo "ws_files=$WS_FILES" >> $GITHUB_ENV
# echo "7"

FILE_NAME="shared_env.txt"

{
  echo "$IMPORTANT_MODIFIED"
  echo "$REST_FILES"
  echo "$WS_FILES"
} > "$FILE_NAME"