# CCXT Go Mobile Wrapper

This repo contains a **Go → C → Swift wrapper** around the [CCXT Go library](https://github.com/ccxt/ccxt/tree/master/go/v4), 
designed for use in **iOS** and **macOS** apps via a native static library and a clean Swift API.

The wrapper is packaged as two Cocoapods:

- `CCXTPodCore` → C wrapper pod (libccxt.a, libccxt.h)
- `CCXTPod` → Swift wrapper pod (CCXTExchange.swift) → depends on `CCXTPodCore`

---

## Features

✅ Native static lib (`libccxt.a`)  
✅ C header (`libccxt.h`)  
✅ Swift wrapper class (`CCXTExchange`)  
✅ Works on iOS and macOS  
✅ Clean object-oriented API in Swift  
✅ Supports multiple exchange instances via `InitExchange`

---

## Usage

### 1️⃣ Build the static library

```bash
cd ccxt/go/mobile_wrapper
./build_mobile.sh
```