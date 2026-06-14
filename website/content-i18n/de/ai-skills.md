---
title: "KI-Skills"
description: "CCXT stellt sprachspezifische Skills für die KI-Assistenten Claude Code und OpenCode bereit. Diese Skills helfen Entwicklern, CCXT schnell in ihren Projekten zu erlernen und einzusetzen…"
---

# KI-Skills für Claude Code und OpenCode

CCXT stellt sprachspezifische Skills für die KI-Assistenten Claude Code und OpenCode bereit. Diese Skills helfen Entwicklern, CCXT schnell in ihren Projekten zu erlernen und einzusetzen – mit umfassenden Anleitungen, Code-Beispielen und einer vollständigen API-Referenz.

## Was sind CCXT-Skills?

Skills sind interaktive Dokumentationsmodule, die KI-Coding-Assistenten (wie Claude Code und OpenCode) laden können, um kontextbezogene Hilfe bei der Arbeit mit CCXT zu leisten. Wenn Sie Fragen zu CCXT stellen, nutzt der KI-Assistent diese Skills, um genaue und ausführliche Antworten mit funktionsfähigen Code-Beispielen zu liefern.

### Was ist enthalten

Jeder Skill enthält:

- **Vollständige API-Referenz** – Alle 200+ CCXT-Methoden mit Beschreibungen dokumentiert
- **Installationsanleitungen** – Paketmanager-Befehle für jede Sprache
- **Code-Beispiele** – Funktionsfähige Code-Beispiele, die in die Dokumentation aller unterstützten Sprachen eingebettet sind
- **REST- und WebSocket-APIs** – Sowohl Standard- als auch Echtzeit-APIs abgedeckt
- **Best Practices** – Fehlerbehandlung, Rate-Limiting, Authentifizierungsmuster
- **Häufige Fallstricke** – Sprachspezifische Fehler, die vermieden werden sollten
- **Fehlerbehebungsanleitungen** – Lösungen für häufige Probleme und Fehlermeldungen

## Verfügbare Skills

Fünf sprachspezifische Skills sind verfügbar:

| Skill | Sprache | Abdeckung |
|-------|----------|----------|
| **ccxt-typescript** | TypeScript/JavaScript | Node.js, Browser, REST & WebSocket |
| **ccxt-python** | Python | Sync, async, asyncio, REST & WebSocket |
| **ccxt-php** | PHP | Sync, async (ReactPHP), REST & WebSocket |
| **ccxt-csharp** | C#/.NET | .NET Standard 2.0+, REST & WebSocket |
| **ccxt-go** | Go | REST & WebSocket |

Jeder Skill ist auf die jeweilige Sprache zugeschnitten – mit passenden Idiomen, Namenskonventionen und Best Practices.

## Installation

### Voraussetzungen

Sie benötigen entweder [Claude Code](https://claude.ai/download) oder [OpenCode](https://opencode.dev/) auf Ihrem System installiert.

### Schnellinstallation (empfohlen)

Installieren Sie alle Skills mit einem einzigen Befehl über die [skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add ccxt/ccxt
```

Dies funktioniert mit Claude Code, Cursor, Copilot, Windsurf, Codex und mehr als 30 weiteren KI-Coding-Assistenten.

### Alternative: Shell-Skript

```bash
curl -fsSL https://raw.githubusercontent.com/ccxt/ccxt/master/install-skills.sh | bash
```

Dadurch werden alle fünf CCXT-Skills automatisch heruntergeladen und auf Ihrem System installiert.

### Aus dem Repository

Wenn Sie das CCXT-Repository geklont haben, stehen Ihnen folgende Optionen zur Verfügung:

#### Option 1: Interaktive Installation (empfohlen)

```bash
./install-skills.sh
```

Dadurch wird ein interaktives Menü angezeigt, in dem Sie auswählen können, welche Skills installiert werden sollen:

```
Select which skills to install:

  1) ccxt-typescript - TypeScript/JavaScript (Node.js & browser, REST & WebSocket)
  2) ccxt-python     - Python (sync & async, REST & WebSocket)
  3) ccxt-php        - PHP (sync & async, REST & WebSocket)
  4) ccxt-csharp     - C#/.NET (REST & WebSocket)
  5) ccxt-go         - Go (REST & WebSocket)
  6) All skills      - Install all of the above
  7) Exit            - Cancel installation

Enter your choice (1-7):
```

#### Option 2: Alle Skills installieren

```bash
./install-skills.sh --all
```

#### Option 3: Bestimmte Sprachen installieren

```bash
# Install single skill
./install-skills.sh --typescript

# Install multiple skills
./install-skills.sh --python --go

# Install with flags
./install-skills.sh --typescript --php --csharp
```

### Installationsorte

Skills werden installiert in:
- `~/.claude/skills/` (für Claude Code)
- `~/.opencode/skills/` (für OpenCode)

Das Installationsskript erkennt beide automatisch und installiert an den entsprechenden Orten.

## Verwendung mit KI-Assistenten

### Skills aufrufen

Nach der Installation können Sie Skills direkt in Claude Code oder OpenCode aufrufen:

```
/ccxt-typescript
/ccxt-python
/ccxt-php
/ccxt-csharp
/ccxt-go
```

Der KI-Assistent lädt den Skill und ist bereit, Fragen zu CCXT in der jeweiligen Sprache zu beantworten.

### Fragen stellen

Sie müssen Skills nicht explizit aufrufen – stellen Sie einfach natürliche Fragen:

**Grundlegende Nutzung:**
- „Wie installiere ich CCXT in Python?"
- „Zeig mir, wie ich einen Ticker in TypeScript abrufe"
- „Wie verbinde ich mich mit Binance über API-Schlüssel in Go?"

**Bestimmte Funktionen:**
- „Wie erstelle ich eine Stop-Loss-Order in JavaScript?"
- „Zeig mir, wie ich in Python Live-Orderbuch-Updates beobachte"
- „Was ist der Unterschied zwischen `fetchTicker` und `watchTicker`?"
- „Wie behandle ich RateLimitExceeded-Fehler in PHP?"

**Fortgeschrittene Themen:**
- „Wie setze ich den Hebel für Futures-Handel in C#?"
- „Zeig mir, wie ich den Finanzierungsraten-Verlauf in TypeScript abrufe"
- „Wie erstelle ich eine Trailing-Stop-Order in Python?"
- „Was ist der beste Weg, WebSocket-Wiederverbindungen in Go zu behandeln?"

Der KI-Assistent referenziert automatisch den passenden Skill, um genaue Antworten mit funktionsfähigen Code-Beispielen zu liefern.

## Was abgedeckt wird

### Marktdaten-Methoden

**Ticker & Preise:**
- `fetchTicker` – Ticker für ein Symbol abrufen
- `fetchTickers` – Mehrere Ticker auf einmal abrufen
- `fetchBidsAsks` – Beste Geld-/Briefkurse abrufen
- `fetchMarkPrices` – Mark-Preise für Derivate abrufen
- `fetchLastPrices` – Zuletzt gehandelte Preise abrufen

**Orderbücher:**
- `fetchOrderBook` – Vollständiges Orderbuch abrufen
- `fetchL2OrderBook` – Level-2-Orderbuch
- `fetchL3OrderBook` – Level-3-Orderbuch (volle Tiefe)
- WebSocket: `watchOrderBook` – Live-Orderbuch-Updates

**Trades & Verlauf:**
- `fetchTrades` – Öffentlichen Handelsverlauf abrufen
- `fetchMyTrades` – Eigenen Handelsverlauf abrufen (authentifiziert)
- `fetchOHLCV` – Kerzenchart-/OHLCV-Daten abrufen
- WebSocket: `watchTrades`, `watchOHLCV` – Live-Updates

### Handels-Methoden

**Ordertypen (20+ unterstützt):**
- Market-Orders: `createMarketOrder`, `createMarketBuyOrder`, `createMarketSellOrder`
- Limit-Orders: `createLimitOrder`, `createLimitBuyOrder`, `createLimitSellOrder`
- Stop-Orders: `createStopLossOrder`, `createStopMarketOrder`, `createStopLimitOrder`
- Take-Profit: `createTakeProfitOrder`
- Trailing Stops: `createTrailingAmountOrder`, `createTrailingPercentOrder`
- Erweitert: `createPostOnlyOrder`, `createReduceOnlyOrder`, `createTriggerOrder`
- OCO-Orders: `createOrderWithTakeProfitAndStopLoss`

**Orderverwaltung:**
- `fetchOrder` – Einzelne Order abrufen
- `fetchOrders` – Alle Orders abrufen
- `fetchOpenOrders` – Offene Orders abrufen
- `fetchClosedOrders` – Geschlossene Orders abrufen
- `cancelOrder` – Einzelne Order stornieren
- `cancelAllOrders` – Alle Orders stornieren
- `editOrder` – Bestehende Order ändern
- WebSocket: `watchOrders` – Live-Order-Updates

### Konto & Guthaben

- `fetchBalance` – Kontostand abrufen
- `fetchAccounts` – Unterkonten abrufen
- `fetchLedger` – Kontobuch-Verlauf abrufen
- `fetchDeposits` – Einzahlungsverlauf abrufen
- `fetchWithdrawals` – Auszahlungsverlauf abrufen
- `fetchTransactions` – Transaktionsverlauf abrufen
- WebSocket: `watchBalance` – Live-Guthabenaktualisierungen

### Derivate & Futures

**Positionen:**
- `fetchPosition` – Einzelne Position abrufen
- `fetchPositions` – Alle Positionen abrufen
- `closePosition` – Position schließen
- `setPositionMode` – Hedge-/One-Way-Modus festlegen
- WebSocket: `watchPositions` – Live-Positions-Updates

**Margin & Hebel:**
- `fetchLeverage` – Aktuellen Hebel abrufen
- `setLeverage` – Hebel festlegen
- `setMarginMode` – Cross-/Isolated-Margin festlegen
- `borrowMargin` – Margin leihen
- `repayMargin` – Geliehene Margin zurückzahlen

**Finanzierung & Abrechnung:**
- `fetchFundingRate` – Aktuelle Finanzierungsrate abrufen
- `fetchFundingRateHistory` – Finanzierungsraten-Verlauf abrufen
- `fetchFundingHistory` – Eigene Finanzierungszahlungen abrufen
- `fetchSettlementHistory` – Abrechnungsverlauf abrufen

**Open Interest & Liquidationen:**
- `fetchOpenInterest` – Open Interest abrufen
- `fetchOpenInterestHistory` – OI-Verlauf abrufen
- `fetchLiquidations` – Öffentliche Liquidationen abrufen
- `fetchMyLiquidations` – Eigene Liquidationen abrufen

**Optionen:**
- `fetchOption` – Optionsinformationen abrufen
- `fetchOptionChain` – Options-Chain abrufen
- `fetchGreeks` – Options-Griechen abrufen
- `fetchVolatilityHistory` – Volatilitätsverlauf abrufen

### Einzahlungen & Auszahlungen

- `fetchDepositAddress` – Einzahlungsadresse abrufen
- `createDepositAddress` – Neue Einzahlungsadresse erstellen
- `withdraw` – Guthaben auszahlen
- `fetchDeposit` – Einzahlungsinformation abrufen
- `fetchWithdrawal` – Auszahlungsinformation abrufen

### Gebühren & Limits

- `fetchTradingFee` – Handelsgebühr für Symbol abrufen
- `fetchTradingFees` – Handelsgebühren abrufen
- `fetchTradingLimits` – Handelslimits abrufen
- `fetchDepositWithdrawFee` – Ein-/Auszahlungsgebühren abrufen

### WebSocket-Echtzeit-Streaming

Alle `fetch*`-Methoden haben WebSocket-Entsprechungen mit dem Präfix `watch*`:

- `watchTicker` – Live-Ticker-Updates
- `watchTickers` – Live-Updates für mehrere Ticker
- `watchOrderBook` – Live-Orderbuch-Updates
- `watchTrades` – Live-Handelsstrom
- `watchOHLCV` – Live-Kerzenchart-Updates
- `watchBalance` – Live-Guthabenaktualisierungen (Authentifizierung erforderlich)
- `watchOrders` – Live-Order-Updates (Authentifizierung erforderlich)
- `watchMyTrades` – Live-Handelsaktualisierungen (Authentifizierung erforderlich)
- `watchPositions` – Live-Positions-Updates (Authentifizierung erforderlich)

## Abgedeckte Best Practices

### Fehlerbehandlung

Jeder Skill vermittelt die korrekte Ausnahmebehandlung:

- **NetworkError** – Behebbare Fehler (mit Backoff wiederholen)
- **ExchangeError** – Nicht behebbare Fehler (nicht wiederholen)
- **RateLimitExceeded** – Rate-Limit erreicht (warten und wiederholen)
- **AuthenticationError** – Ungültige API-Zugangsdaten
- **InsufficientFunds** – Nicht ausreichendes Guthaben
- **InvalidOrder** – Ungültige Order-Parameter

### Rate-Limiting

Skills behandeln sowohl integriertes als auch manuelles Rate-Limiting:

```
# Enable built-in rate limiter (recommended)
exchange.enableRateLimit = true
```

### Authentifizierung

Sichere Handhabung von API-Schlüsseln:

```
# Use environment variables (recommended)
exchange.apiKey = process.env.EXCHANGE_API_KEY
exchange.secret = process.env.EXCHANGE_SECRET
```

### Methoden-Verfügbarkeit

Prüfen, ob eine Börse eine Methode unterstützt:

```
if (exchange.has['fetchOHLCV']) {
    // Method is supported
}
```

## Fehlerbehebung

### Skills werden nicht angezeigt

1. Installationsort überprüfen:
```bash
ls ~/.claude/skills/ccxt-*
ls ~/.opencode/skills/ccxt-*
```

2. Claude Code / OpenCode neu starten

3. Installation erneut ausführen:
```bash
./install-skills.sh --all
```

### Fehler „Skill Not Found" erhalten

Stellen Sie sicher, dass Sie den korrekten Skill-Namen verwenden:
- `/ccxt-typescript` (nicht `/ccxt-ts` oder `/typescript`)
- `/ccxt-python` (nicht `/ccxt-py` oder `/python`)
- usw.

### KI-Assistent verwendet Skills nicht

Der KI-Assistent verwendet Skills automatisch, wenn Sie CCXT-bezogene Fragen stellen. Sie müssen sie nicht explizit aufrufen, es sei denn, Sie möchten dies tun.

## Manuelle Installation

Falls das Installationsskript nicht funktioniert, können Sie manuell installieren:

```bash
# Create directories
mkdir -p ~/.claude/skills/
mkdir -p ~/.opencode/skills/

# Copy skills
cp -r .claude/skills/ccxt-typescript ~/.claude/skills/
cp -r .claude/skills/ccxt-python ~/.claude/skills/
cp -r .claude/skills/ccxt-php ~/.claude/skills/
cp -r .claude/skills/ccxt-csharp ~/.claude/skills/
cp -r .claude/skills/ccxt-go ~/.claude/skills/

# For OpenCode
cp -r .claude/skills/ccxt-* ~/.opencode/skills/
```

## Mehr erfahren

- **Skills-Dokumentation**: `.claude/skills/README.md` im CCXT-Repository
- **Generierungsstrategie**: `.claude/skills/GENERATION_STRATEGY.md`
- **CCXT-Handbuch**: [Manual.md](/docs/manual)
- **CCXT Pro**: [ccxt.pro.manual.md](/docs/pro-manual)

## Feedback

Wenn Sie Verbesserungsvorschläge für die Skills haben oder Probleme feststellen:

1. Eröffnen Sie ein Issue auf [GitHub](https://github.com/ccxt/ccxt/issues)
2. Fügen Sie „Skills:" in den Titel ein
3. Geben Sie an, welcher Sprach-Skill verbessert werden könnte

Die Skills werden aktiv gepflegt und zusammen mit CCXT-Releases aktualisiert.
