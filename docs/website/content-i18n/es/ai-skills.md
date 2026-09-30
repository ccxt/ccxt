---
title: "Habilidades de IA"
description: "CCXT proporciona habilidades específicas por lenguaje para los asistentes de IA Claude Code y OpenCode. Estas habilidades ayudan a los desarrolladores a aprender y usar CCXT rápidamente en sus proyectos…"
---

# Habilidades de IA para Claude Code y OpenCode

CCXT proporciona habilidades específicas por lenguaje para los asistentes de IA Claude Code y OpenCode. Estas habilidades ayudan a los desarrolladores a aprender y usar CCXT rápidamente en sus proyectos con guías completas, ejemplos de código y una referencia de API completa.

## ¿Qué son las habilidades de CCXT?

Las habilidades son módulos de documentación interactivos que los asistentes de codificación con IA (como Claude Code y OpenCode) pueden cargar para proporcionar ayuda contextual al trabajar con CCXT. Cuando haces preguntas sobre CCXT, el asistente de IA usa estas habilidades para dar respuestas precisas y detalladas con ejemplos de código funcionales.

### Qué se incluye

Cada habilidad incluye:

- **Referencia completa de la API** - Más de 200 métodos de CCXT documentados con descripciones
- **Guías de instalación** - Comandos del gestor de paquetes para cada lenguaje
- **Ejemplos de código** - Ejemplos de código funcionales integrados en la documentación para todos los lenguajes admitidos
- **APIs REST y WebSocket** - Tanto las APIs estándar como las de tiempo real están cubiertas
- **Mejores prácticas** - Patrones de manejo de errores, limitación de velocidad y autenticación
- **Errores comunes** - Errores específicos de cada lenguaje que se deben evitar
- **Guías de resolución de problemas** - Soluciones a problemas comunes y mensajes de error

## Habilidades disponibles

Hay cinco habilidades específicas por lenguaje disponibles:

| Habilidad | Lenguaje | Cobertura |
|-------|----------|----------|
| **ccxt-typescript** | TypeScript/JavaScript | Node.js, navegador, REST y WebSocket |
| **ccxt-python** | Python | Síncrono, asíncrono, asyncio, REST y WebSocket |
| **ccxt-php** | PHP | Síncrono, asíncrono (ReactPHP), REST y WebSocket |
| **ccxt-csharp** | C#/.NET | .NET Standard 2.0+, REST y WebSocket |
| **ccxt-go** | Go | REST y WebSocket |

Cada habilidad está adaptada al lenguaje específico con los modismos, convenciones de nomenclatura y mejores prácticas apropiados.

## Instalación

### Requisitos previos

Necesitas tener instalado [Claude Code](https://claude.ai/download) o [OpenCode](https://opencode.dev/) en tu sistema.

### Instalación rápida (recomendada)

Instala todas las habilidades con un solo comando usando la [CLI de habilidades](https://github.com/vercel-labs/skills):

```bash
npx skills add ccxt/ccxt
```

Esto funciona con Claude Code, Cursor, Copilot, Windsurf, Codex y más de 30 otros asistentes de codificación con IA.

### Alternativa: Script de shell

```bash
curl -fsSL https://raw.githubusercontent.com/ccxt/ccxt/master/install-skills.sh | bash
```

Esto descargará e instalará automáticamente las cinco habilidades de CCXT en tu sistema.

### Desde el repositorio

Si tienes el repositorio de CCXT clonado, puedes usar estas opciones:

#### Opción 1: Instalación interactiva (recomendada)

```bash
./install-skills.sh
```

Esto presentará un menú interactivo donde puedes elegir qué habilidades instalar:

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

#### Opción 2: Instalar todas las habilidades

```bash
./install-skills.sh --all
```

#### Opción 3: Instalar lenguajes específicos

```bash
# Install single skill
./install-skills.sh --typescript

# Install multiple skills
./install-skills.sh --python --go

# Install with flags
./install-skills.sh --typescript --php --csharp
```

### Ubicaciones de instalación

Las habilidades se instalan en:
- `~/.claude/skills/` (para Claude Code)
- `~/.opencode/skills/` (para OpenCode)

El script de instalación detecta ambas automáticamente e instala en las ubicaciones apropiadas.

## Uso con asistentes de IA

### Invocar habilidades

Una vez instaladas, puedes invocar las habilidades directamente en Claude Code o OpenCode:

```
/ccxt-typescript
/ccxt-python
/ccxt-php
/ccxt-csharp
/ccxt-go
```

El asistente de IA cargará la habilidad y estará listo para responder preguntas sobre CCXT en ese lenguaje.

### Hacer preguntas

No necesitas invocar las habilidades explícitamente; simplemente haz preguntas en lenguaje natural:

**Uso básico:**
- "¿Cómo instalo CCXT en Python?"
- "Muéstrame cómo obtener un ticker en TypeScript"
- "¿Cómo me conecto a Binance usando claves de API en Go?"

**Funcionalidades específicas:**
- "¿Cómo creo una orden stop-loss en JavaScript?"
- "Muéstrame cómo observar actualizaciones en vivo del libro de órdenes en Python"
- "¿Cuál es la diferencia entre `fetchTicker` y `watchTicker`?"
- "¿Cómo manejo errores `RateLimitExceeded` en PHP?"

**Temas avanzados:**
- "¿Cómo configuro el apalancamiento para trading de futuros en C#?"
- "Muéstrame cómo obtener el historial de tasas de financiamiento en TypeScript"
- "¿Cómo creo una orden trailing stop en Python?"
- "¿Cuál es la mejor manera de manejar reconexiones WebSocket en Go?"

El asistente de IA referenciará automáticamente la habilidad apropiada para proporcionar respuestas precisas con ejemplos de código funcionales.

## Qué está cubierto

### Métodos de datos de mercado

**Tickers y precios:**
- `fetchTicker` - Obtener ticker para un símbolo
- `fetchTickers` - Obtener múltiples tickers a la vez
- `fetchBidsAsks` - Obtener los mejores precios de compra/venta
- `fetchMarkPrices` - Obtener precios de marca para derivados
- `fetchLastPrices` - Obtener los últimos precios negociados

**Libros de órdenes:**
- `fetchOrderBook` - Obtener el libro de órdenes completo
- `fetchL2OrderBook` - Libro de órdenes de nivel 2
- `fetchL3OrderBook` - Libro de órdenes de nivel 3 (profundidad completa)
- WebSocket: `watchOrderBook` - Actualizaciones en vivo del libro de órdenes

**Operaciones e historial:**
- `fetchTrades` - Obtener historial de operaciones públicas
- `fetchMyTrades` - Obtener tu historial de operaciones (autenticado)
- `fetchOHLCV` - Obtener datos de velas/OHLCV
- WebSocket: `watchTrades`, `watchOHLCV` - Actualizaciones en vivo

### Métodos de trading

**Tipos de órdenes (más de 20 admitidos):**
- Órdenes de mercado: `createMarketOrder`, `createMarketBuyOrder`, `createMarketSellOrder`
- Órdenes limitadas: `createLimitOrder`, `createLimitBuyOrder`, `createLimitSellOrder`
- Órdenes stop: `createStopLossOrder`, `createStopMarketOrder`, `createStopLimitOrder`
- Take profit: `createTakeProfitOrder`
- Trailing stops: `createTrailingAmountOrder`, `createTrailingPercentOrder`
- Avanzadas: `createPostOnlyOrder`, `createReduceOnlyOrder`, `createTriggerOrder`
- Órdenes OCO: `createOrderWithTakeProfitAndStopLoss`

**Gestión de órdenes:**
- `fetchOrder` - Obtener una sola orden
- `fetchOrders` - Obtener todas las órdenes
- `fetchOpenOrders` - Obtener órdenes abiertas
- `fetchClosedOrders` - Obtener órdenes cerradas
- `cancelOrder` - Cancelar una sola orden
- `cancelAllOrders` - Cancelar todas las órdenes
- `editOrder` - Modificar una orden existente
- WebSocket: `watchOrders` - Actualizaciones de órdenes en vivo

### Cuenta y saldo

- `fetchBalance` - Obtener el saldo de la cuenta
- `fetchAccounts` - Obtener subcuentas
- `fetchLedger` - Obtener historial del libro mayor
- `fetchDeposits` - Obtener historial de depósitos
- `fetchWithdrawals` - Obtener historial de retiros
- `fetchTransactions` - Obtener historial de transacciones
- WebSocket: `watchBalance` - Actualizaciones de saldo en vivo

### Derivados y futuros

**Posiciones:**
- `fetchPosition` - Obtener una sola posición
- `fetchPositions` - Obtener todas las posiciones
- `closePosition` - Cerrar una posición
- `setPositionMode` - Establecer modo cobertura/unidireccional
- WebSocket: `watchPositions` - Actualizaciones de posiciones en vivo

**Margen y apalancamiento:**
- `fetchLeverage` - Obtener el apalancamiento actual
- `setLeverage` - Establecer el apalancamiento
- `setMarginMode` - Establecer margen cruzado/aislado
- `borrowMargin` - Pedir margen prestado
- `repayMargin` - Devolver el margen prestado

**Financiamiento y liquidación:**
- `fetchFundingRate` - Obtener la tasa de financiamiento actual
- `fetchFundingRateHistory` - Obtener el historial de tasas de financiamiento
- `fetchFundingHistory` - Obtener tus pagos de financiamiento
- `fetchSettlementHistory` - Obtener el historial de liquidaciones

**Interés abierto y liquidaciones:**
- `fetchOpenInterest` - Obtener el interés abierto
- `fetchOpenInterestHistory` - Obtener el historial de interés abierto
- `fetchLiquidations` - Obtener liquidaciones públicas
- `fetchMyLiquidations` - Obtener tus liquidaciones

**Opciones:**
- `fetchOption` - Obtener información de una opción
- `fetchOptionChain` - Obtener la cadena de opciones
- `fetchGreeks` - Obtener las griegas de opciones
- `fetchVolatilityHistory` - Obtener el historial de volatilidad

### Depósitos y retiros

- `fetchDepositAddress` - Obtener la dirección de depósito
- `createDepositAddress` - Crear nueva dirección de depósito
- `withdraw` - Retirar fondos
- `fetchDeposit` - Obtener información de un depósito
- `fetchWithdrawal` - Obtener información de un retiro

### Comisiones y límites

- `fetchTradingFee` - Obtener la comisión de trading para un símbolo
- `fetchTradingFees` - Obtener las comisiones de trading
- `fetchTradingLimits` - Obtener los límites de trading
- `fetchDepositWithdrawFee` - Obtener las comisiones de depósito/retiro

### Transmisión en tiempo real por WebSocket

Todos los métodos `fetch*` tienen equivalentes en WebSocket con el prefijo `watch*`:

- `watchTicker` - Actualizaciones de ticker en vivo
- `watchTickers` - Actualizaciones de múltiples tickers en vivo
- `watchOrderBook` - Actualizaciones del libro de órdenes en vivo
- `watchTrades` - Flujo de operaciones en vivo
- `watchOHLCV` - Actualizaciones de velas en vivo
- `watchBalance` - Actualizaciones de saldo en vivo (requiere autenticación)
- `watchOrders` - Actualizaciones de órdenes en vivo (requiere autenticación)
- `watchMyTrades` - Actualizaciones de operaciones en vivo (requiere autenticación)
- `watchPositions` - Actualizaciones de posiciones en vivo (requiere autenticación)

## Mejores prácticas cubiertas

### Manejo de errores

Cada habilidad enseña el manejo adecuado de excepciones:

- **NetworkError** - Errores recuperables (reintentar con retroceso exponencial)
- **ExchangeError** - Errores no recuperables (no reintentar)
- **RateLimitExceeded** - Límite de velocidad alcanzado (esperar y reintentar)
- **AuthenticationError** - Credenciales de API inválidas
- **InsufficientFunds** - Saldo insuficiente
- **InvalidOrder** - Parámetros de orden inválidos

### Limitación de velocidad

Las habilidades cubren tanto la limitación de velocidad integrada como la manual:

```
# Enable built-in rate limiter (recommended)
exchange.enableRateLimit = true
```

### Autenticación

Manejo seguro de claves de API:

```
# Use environment variables (recommended)
exchange.apiKey = process.env.EXCHANGE_API_KEY
exchange.secret = process.env.EXCHANGE_SECRET
```

### Disponibilidad de métodos

Comprobación de si un exchange admite un método:

```
if (exchange.has['fetchOHLCV']) {
    // Method is supported
}
```

## Resolución de problemas

### Las habilidades no aparecen

1. Verificar la ubicación de instalación:
```bash
ls ~/.claude/skills/ccxt-*
ls ~/.opencode/skills/ccxt-*
```

2. Reiniciar Claude Code / OpenCode

3. Volver a ejecutar la instalación:
```bash
./install-skills.sh --all
```

### Error "Habilidad no encontrada"

Asegúrate de usar el nombre correcto de la habilidad:
- `/ccxt-typescript` (no `/ccxt-ts` ni `/typescript`)
- `/ccxt-python` (no `/ccxt-py` ni `/python`)
- etc.

### El asistente de IA no usa las habilidades

El asistente de IA usa las habilidades automáticamente cuando haces preguntas relacionadas con CCXT. No necesitas invocarlas explícitamente a menos que quieras hacerlo.

## Instalación manual

Si el script de instalación no funciona, puedes instalar manualmente:

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

## Más información

- **Documentación de habilidades**: `.claude/skills/README.md` en el repositorio de CCXT
- **Estrategia de generación**: `.claude/skills/GENERATION_STRATEGY.md`
- **Manual de CCXT**: [Manual.md](/docs/manual)
- **CCXT Pro**: [ccxt.pro.manual.md](/docs/pro-manual)

## Comentarios

Si tienes sugerencias para mejorar las habilidades o encuentras problemas:

1. Abre un issue en [GitHub](https://github.com/ccxt/ccxt/issues)
2. Incluye "Skills:" en el título
3. Especifica qué habilidad de lenguaje y qué se podría mejorar

Las habilidades se mantienen activamente y se actualizan junto con las versiones de CCXT.
