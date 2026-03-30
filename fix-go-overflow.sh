#!/bin/bash
# Script to fix Go integer overflow errors by adding int64() cast

echo "Fixing Go integer overflow errors..."

# Fix large constants that overflow int type
# These are typically timestamps in milliseconds

# Common overflow values (sorted by size)
sed -i 's/\b1241440531000\b/int64(1241440531000)/g' go/v4/*.go
sed -i 's/\b1550448000000\b/int64(1550448000000)/g' go/v4/*.go
sed -i 's/\b2592000000\b/int64(2592000000)/g' go/v4/*.go
sed -i 's/\b3600000000\b/int64(3600000000)/g' go/v4/*.go
sed -i 's/\b4133404800000\b/int64(4133404800000)/g' go/v4/*.go
sed -i 's/\b5000000000\b/int64(5000000000)/g' go/v4/*.go
sed -i 's/\b7776000000\b/int64(7776000000)/g' go/v4/*.go
sed -i 's/\b9007199254740991\b/int64(9007199254740991)/g' go/v4/*.go
sed -i 's/\b21600000000\b/int64(21600000000)/g' go/v4/*.go
sed -i 's/\b86400000000\b/int64(86400000000)/g' go/v4/*.go

# Remove double casting (in case script runs multiple times)
sed -i 's/int64(int64(\([0-9]*\)))/int64(\1)/g' go/v4/*.go

echo "Done! Now run: go build -C go/v4"
