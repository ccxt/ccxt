# CCXT Usage Skills

This directory contains **five language-specific skills** to help developers **use CCXT** in their own projects. These skills provide comprehensive guides for installing CCXT, connecting to exchanges, fetching market data, placing orders, handling authentication, managing errors, and using both REST and WebSocket APIs.

## Available Skills

### 1. ccxt-typescript
TypeScript and JavaScript skill covering:
- Installation via npm
- REST API usage (Node.js and browser)
- WebSocket API (real-time data streaming)
- Both TypeScript and JavaScript examples
- Async/await patterns
- Error handling and rate limiting

**Invoke with:** `/ccxt-typescript`

### 2. ccxt-python
Python skill covering:
- Installation via pip
- Synchronous and asynchronous REST API
- WebSocket API (asyncio-based)
- Performance enhancements (orjson, coincurve)
- Error handling and rate limiting

**Invoke with:** `/ccxt-python`

### 3. ccxt-php
PHP skill covering:
- Installation via Composer
- Synchronous and asynchronous (ReactPHP) REST API
- WebSocket API
- Required PHP extensions
- Timezone configuration
- Error handling and rate limiting

**Invoke with:** `/ccxt-php`

### 4. ccxt-csharp
C# and .NET skill covering:
- Installation via NuGet
- REST API usage (.NET Standard 2.0+)
- WebSocket API
- PascalCase method naming conventions
- Error handling and rate limiting

**Invoke with:** `/ccxt-csharp`

### 5. ccxt-go
Go skill covering:
- Installation via go get
- REST API usage
- WebSocket API
- Error handling patterns
- Goroutines for concurrent operations
- Rate limiting

**Invoke with:** `/ccxt-go`

## Common Features Across All Skills

Each skill includes:

✅ **Installation instructions** - Package manager commands
✅ **Quick start examples** - Minimal working code
✅ **REST API guide** - Standard HTTP operations (fetch_ticker, create_order, etc.)
✅ **WebSocket API guide** - Real-time data streaming (watch_ticker, watch_order_book, etc.)
✅ **Authentication** - Setting API keys securely
✅ **Error handling** - Exception hierarchy and retry patterns
✅ **Rate limiting** - Built-in and manual rate limiting
✅ **Common pitfalls** - Language-specific mistakes to avoid
✅ **Troubleshooting** - Solutions to common issues
✅ **Working examples** - Complete, runnable code samples

## REST vs WebSocket

| Feature | REST API | WebSocket API |
|---------|----------|---------------|
| **Use for** | One-time queries, placing orders | Real-time monitoring, live feeds |
| **Method prefix** | `fetch_*` / `Fetch*` | `watch_*` / `Watch*` |
| **Speed** | Slower (HTTP) | Faster (persistent connection) |
| **Rate limits** | Strict (1-2 req/sec) | More lenient |

## Installation

### Option 1: Using the Installation Script (Recommended)

```bash
# Interactive mode (choose which skills to install)
bash install-skills.sh

# Install all skills
bash install-skills.sh --all

# Install specific skills
bash install-skills.sh --typescript
bash install-skills.sh --python --go
```

### Option 2: Manual Installation

Copy individual skill directories to `~/.claude/skills/` or `~/.opencode/skills/`:

```bash
cp -r .claude/skills/ccxt-typescript ~/.claude/skills/
cp -r .claude/skills/ccxt-python ~/.claude/skills/
# ... etc
```

## Usage

Once installed, you can invoke skills in Claude Code or OpenCode:

```
/ccxt-python
/ccxt-typescript
/ccxt-php
/ccxt-csharp
/ccxt-go
```

Or simply ask questions:
- "How do I connect to Binance using CCXT in Python?"
- "Show me how to fetch a ticker in TypeScript"
- "How do I create a limit order in PHP?"
- "How do I watch live orderbook updates in Go?"

## Example Code Structure

Each skill includes working examples:

```
.claude/skills/ccxt-{language}/
├── SKILL.md                    # Main skill documentation
└── examples/
    ├── rest-basic.*           # Simple REST API example
    ├── websocket-ticker.*     # Live WebSocket ticker
    ├── authentication.*       # Using API keys
    ├── error-handling.*       # Exception handling
    └── advanced.*             # Advanced patterns
```

## Key Content Areas

### 1. Installation
- Package manager commands
- Dependencies and requirements
- Optional performance enhancements

### 2. Quick Start
- Minimal working examples
- Both REST and WebSocket

### 3. Exchange Instance Creation
- Public API (no authentication)
- Private API (with API keys)
- Rate limiting configuration

### 4. Common REST Operations
- Loading markets
- Fetching tickers, orderbooks, trades
- Creating orders (limit, market)
- Fetching balance, orders, trades
- Canceling orders

### 5. WebSocket Operations (Real-time)
- Watching tickers (live prices)
- Watching orderbooks (live depth)
- Watching trades (live trade stream)
- Watching orders (your orders, live)
- Watching balance (live updates)
- Managing connections

### 6. Authentication
- Setting API keys securely
- Using environment variables
- Testing authentication

### 7. Error Handling
- Exception hierarchy
- Specific error types
- Retry logic for network errors
- Order validation

### 8. Rate Limiting
- Built-in rate limiter
- Manual delays
- Best practices

### 9. Common Pitfalls
- Language-specific mistakes
- Wrong method usage
- Resource leaks
- Format errors

### 10. Troubleshooting
- Common error messages
- Solutions and fixes
- Debugging techniques

## Design Decisions

### Why Separate Skills Per Language?
1. **Focused content** - Developers typically work in one primary language
2. **Language-specific idioms** - Each language has unique patterns
3. **Easier maintenance** - Update one language without affecting others
4. **Better discoverability** - Clear skill names (`/ccxt-python` vs `/ccxt`)
5. **Cleaner invocation** - `/ccxt-typescript` is more specific than `/ccxt --language=typescript`

### Why TypeScript Instead of JavaScript?
- TypeScript is more modern and increasingly popular
- Covers both TypeScript and JavaScript (nearly identical syntax)
- Type safety helps prevent errors
- Examples shown in both TS and JS where helpful

### Content Sources
- **Manual.md** - REST API documentation
- **ccxt.pro.manual.md** - WebSocket API documentation
- **Generated abstract files** - Method signatures (binance.ts, binance.py, etc.)
- **Base exchange classes** - Common patterns across all exchanges
- **Examples directories** - Real-world usage patterns

## Contributing

To add or update skills:

1. Edit skill files in `.claude/skills/ccxt-{language}/`
2. Update examples in `examples/` subdirectories
3. Test the skill in Claude Code/OpenCode
4. Update this README if needed

## Learn More

- [CCXT Documentation](https://docs.ccxt.com/)
- [CCXT Pro Documentation](https://docs.ccxt.com/en/latest/ccxt.pro.html)
- [CCXT GitHub Repository](https://github.com/ccxt/ccxt)
- [Supported Exchanges](https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets)

## License

These skills are part of the CCXT project and follow the same license as CCXT.
