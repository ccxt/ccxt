# CCXT Go Build Guide

## Complete Build Process

### 1. Export exchanges (creates exchanges.json)
```bash
npm run export-exchanges
```

### 2. Generate API methods for Go
```bash
npm run emitAPIGo
```

### 3. Transpile TypeScript → Go
```bash
# Transpile REST API
npm run transpileGORest

# Transpile WebSocket (if needed)
npm run transpileGOWs

# Or transpile both
npm run transpileGO
```

### 4. Fix integer overflow errors
```bash
bash fix-go-overflow.sh
```

### 5. Build Go code
```bash
# Build REST API
go build -C go/v4

# Build WebSocket
go build -C go/v4/pro

# Or use npm script
npm run buildGO
```

## Transpile a Specific Exchange

If you only want to transpile one exchange (e.g., matrixport):

```bash
# 1. Generate API methods
npm run emitAPIGo

# 2. Transpile specific exchange
npx tsx build/goTranspiler.ts -- matrixport

# 3. Fix overflow errors
bash fix-go-overflow.sh

# 4. Build
go build -C go/v4
```

## Common Errors

### Error: "no such file or directory, open 'exchanges.json'"
**Cause:** Haven't run export-exchanges

**Solution:**
```bash
npm run export-exchanges
```

### Error: "cannot use X (untyped int constant) as int value (overflows)"
**Cause:** Large numbers (timestamps) need to be cast to int64

**Solution:**
```bash
bash fix-go-overflow.sh
```

### Error: "undefined (type *ExchangeCore has no field or method XXX)"
**Cause:** Missing implicit API methods

**Solution:**
```bash
npm run emitAPIGo
npx tsx build/goTranspiler.ts -- <exchange_name>
```

### Error: "runtime: out of memory: cannot allocate X-byte block"
**Cause:** Go compiler runs out of memory compiling large generated files

**IMPORTANT:** If you see `windows/386` or `linux/386` in `go version`, you're using 32-bit Go which has a 2GB memory limit. **Install 64-bit Go** to fix this permanently.

**Solutions:**

#### Option 1: Install 64-bit Go (RECOMMENDED)
1. Download from: https://go.dev/dl/
   - Windows: `windows-amd64.msi` (NOT `windows-386.msi`)
   - Linux: `linux-amd64.tar.gz`
   - Mac: `darwin-amd64.pkg` or `darwin-arm64.pkg`

2. Verify installation:
```bash
go version
# Should show: amd64 or arm64 (NOT 386)
```

3. Then build normally:
```bash
go build -C go/v4
```

#### Option 2: Use build script with memory management
```bash
bash build-go.sh
```

#### Option 3: Build with reduced parallelism
```bash
# Limit parallel compilation to 1 process
go build -p=1 -C go/v4

# Or use the npm script
npm run buildGO
```

#### Option 4: Build without optimization (faster, uses less memory)
```bash
go build -gcflags="-N -l" -C go/v4
```

## Testing

### Run base tests
```bash
npm run test-base-rest-go
npm run test-base-ws-go
```

### Run response tests
```bash
npm run response-go
```

### Run request tests
```bash
npm run request-go
```

### Run all Go tests
```bash
npm run test-go
```

## Format code
```bash
npm run formatGO
```

## Static analysis
```bash
go vet -C go/v4
```

## Compile check (without creating binary)
```bash
go build -C go/v4 -o /dev/null
```

## fix-go-overflow.sh Script

This script automatically fixes integer overflow errors by adding `int64()` casts for large numbers:

- 1241440531000
- 1550448000000
- 2592000000
- 3600000000
- 4133404800000
- 5000000000
- 7776000000
- 9007199254740991
- 21600000000
- 86400000000

Run this script after each transpilation to ensure the code builds successfully.

## Quick Build Process (all-in-one)

```bash
npm run export-exchanges && \
npm run emitAPIGo && \
npm run transpileGO && \
bash fix-go-overflow.sh && \
go build -C go/v4
```

## Notes

- Always run `export-exchanges` before transpiling
- Always run `emitAPIGo` when adding a new exchange or changing APIs
- Always run `fix-go-overflow.sh` after transpiling
- Go files are auto-generated, do not edit manually
- Only edit TypeScript files in `ts/src/`
