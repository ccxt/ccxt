# CCXT Go Mobile Wrapper

This repo contains a **Go → C → Swift wrapper** around the [CCXT Go library](https://github.com/ccxt/ccxt/tree/master/go/v4), 
designed for use in **iOS** and **macOS** apps via a native static library and a clean Swift API.

The wrapper is packaged as a **Swift Package**:

- `CCXTSwiftCore` → XCFramework (CCXT.xcframework) generated from Go via gomobile bind
- `CCXTSwift` → Swift wrapper (CCXTExchange.swift) → depends on `CCXTSwiftCore`

---

## Features

✅ Swift wrapper class (`CCXTExchange`)  
✅ Works on iOS and macOS  
✅ Clean object-oriented API in Swift  
✅ Supports multiple exchange instances via `InitExchange`

---

## Usage

### 1️⃣ Build the static library

```bash
cd ccxt/swift-wrapper
./build/build_xcframework.sh
```