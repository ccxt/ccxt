# needed to completely fix `fatal error: bulkBarrierPreWrite: unaligned arguments`
# patched the Go tool-chain to stop cgo from producing structs that violate ARM64 alignment, rebuilt the tool, and regenerated your iOS framework.
sudo sed -i '' \\n  -e 's/__attribute__((packed))[[:space:]]*__attribute__((aligned(8)))/__attribute__((aligned(8)))/' \\n  /usr/local/go/src/cmd/cgo/out.go
grep -n '__attribute__((packed))' /usr/local/go/src/cmd/cgo/out.go || echo "patched"
cd /usr/local/go/src
sudo go install -a std cmd/cgo