---
title: "Habilidades de IA"
description: "O CCXT fornece habilidades específicas por linguagem para os assistentes de IA Claude Code e OpenCode. Essas habilidades ajudam os desenvolvedores a aprender e usar o CCXT rapidamente em seus projetos…"
---

# Habilidades de IA para Claude Code e OpenCode

O CCXT fornece habilidades específicas por linguagem para os assistentes de IA Claude Code e OpenCode. Essas habilidades ajudam os desenvolvedores a aprender e usar o CCXT rapidamente em seus projetos, com guias abrangentes, exemplos de código e uma referência completa da API.

## O que são as Habilidades do CCXT?

Habilidades são módulos de documentação interativa que assistentes de codificação com IA (como Claude Code e OpenCode) podem carregar para fornecer ajuda contextual ao trabalhar com o CCXT. Quando você faz perguntas sobre o CCXT, o assistente de IA utiliza essas habilidades para fornecer respostas precisas e detalhadas com exemplos de código funcionais.

### O que está Incluído

Cada habilidade inclui:

- **Referência completa da API** - Todos os 200+ métodos do CCXT documentados com descrições
- **Guias de instalação** - Comandos do gerenciador de pacotes para cada linguagem
- **Exemplos de código** - Exemplos de código funcionais incorporados na documentação em todas as linguagens suportadas
- **APIs REST e WebSocket** - Ambas as APIs padrão e em tempo real cobertas
- **Boas práticas** - Padrões de tratamento de erros, limitação de taxa e autenticação
- **Armadilhas comuns** - Erros específicos de cada linguagem a evitar
- **Guias de solução de problemas** - Soluções para problemas comuns e mensagens de erro

## Habilidades Disponíveis

Cinco habilidades específicas por linguagem estão disponíveis:

| Habilidade | Linguagem | Cobertura |
|-------|----------|----------|
| **ccxt-typescript** | TypeScript/JavaScript | Node.js, navegador, REST e WebSocket |
| **ccxt-python** | Python | Síncrono, assíncrono, asyncio, REST e WebSocket |
| **ccxt-php** | PHP | Síncrono, assíncrono (ReactPHP), REST e WebSocket |
| **ccxt-csharp** | C#/.NET | .NET Standard 2.0+, REST e WebSocket |
| **ccxt-go** | Go | REST e WebSocket |

Cada habilidade é adaptada à linguagem específica com os idiomas, convenções de nomenclatura e boas práticas adequados.

## Instalação

### Pré-requisitos

Você precisa ter o [Claude Code](https://claude.ai/download) ou o [OpenCode](https://opencode.dev/) instalado em seu sistema.

### Instalação Rápida (Recomendada)

Instale todas as habilidades com um único comando usando o [skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add ccxt/ccxt
```

Funciona com Claude Code, Cursor, Copilot, Windsurf, Codex e mais de 30 outros assistentes de codificação com IA.

### Alternativa: Script Shell

```bash
curl -fsSL https://raw.githubusercontent.com/ccxt/ccxt/master/install-skills.sh | bash
```

Isso irá baixar e instalar automaticamente todas as cinco habilidades do CCXT em seu sistema.

### Do Repositório

Se você tiver o repositório do CCXT clonado, pode usar estas opções:

#### Opção 1: Instalação Interativa (Recomendada)

```bash
./install-skills.sh
```

Isso apresentará um menu interativo onde você pode escolher quais habilidades instalar:

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

#### Opção 2: Instalar Todas as Habilidades

```bash
./install-skills.sh --all
```

#### Opção 3: Instalar Linguagens Específicas

```bash
# Install single skill
./install-skills.sh --typescript

# Install multiple skills
./install-skills.sh --python --go

# Install with flags
./install-skills.sh --typescript --php --csharp
```

### Locais de Instalação

As habilidades são instaladas em:
- `~/.claude/skills/` (para Claude Code)
- `~/.opencode/skills/` (para OpenCode)

O script de instalação detecta ambos automaticamente e instala nos locais apropriados.

## Uso com Assistentes de IA

### Invocando Habilidades

Uma vez instaladas, você pode invocar as habilidades diretamente no Claude Code ou OpenCode:

```
/ccxt-typescript
/ccxt-python
/ccxt-php
/ccxt-csharp
/ccxt-go
```

O assistente de IA carregará a habilidade e estará pronto para responder perguntas sobre o CCXT nessa linguagem.

### Fazendo Perguntas

Você não precisa invocar as habilidades explicitamente — basta fazer perguntas naturais:

**Uso básico:**
- "Como instalo o CCXT em Python?"
- "Mostre-me como buscar um ticker em TypeScript"
- "Como me conecto à Binance usando chaves de API em Go?"

**Funcionalidades específicas:**
- "Como crio uma ordem de stop-loss em JavaScript?"
- "Mostre-me como observar atualizações ao vivo do livro de ordens em Python"
- "Qual é a diferença entre `fetchTicker` e `watchTicker`?"
- "Como trato erros `RateLimitExceeded` em PHP?"

**Tópicos avançados:**
- "Como defino alavancagem para negociação de futuros em C#?"
- "Mostre-me como buscar o histórico de taxas de financiamento em TypeScript"
- "Como crio uma ordem de trailing stop em Python?"
- "Qual é a melhor maneira de lidar com reconexões WebSocket em Go?"

O assistente de IA referenciará automaticamente a habilidade apropriada para fornecer respostas precisas com exemplos de código funcionais.

## O que está Coberto

### Métodos de Dados de Mercado

**Tickers e Preços:**
- `fetchTicker` - Obter ticker de um símbolo
- `fetchTickers` - Obter múltiplos tickers de uma vez
- `fetchBidsAsks` - Obter os melhores preços de compra/venda
- `fetchMarkPrices` - Obter preços mark para derivativos
- `fetchLastPrices` - Obter últimos preços negociados

**Livros de Ordens:**
- `fetchOrderBook` - Obter livro de ordens completo
- `fetchL2OrderBook` - Livro de ordens nível 2
- `fetchL3OrderBook` - Livro de ordens nível 3 (profundidade total)
- WebSocket: `watchOrderBook` - Atualizações ao vivo do livro de ordens

**Negociações e Histórico:**
- `fetchTrades` - Obter histórico público de negociações
- `fetchMyTrades` - Obter seu histórico de negociações (autenticado)
- `fetchOHLCV` - Obter dados de candles/OHLCV
- WebSocket: `watchTrades`, `watchOHLCV` - Atualizações ao vivo

### Métodos de Negociação

**Tipos de Ordem (mais de 20 suportados):**
- Ordens a mercado: `createMarketOrder`, `createMarketBuyOrder`, `createMarketSellOrder`
- Ordens limitadas: `createLimitOrder`, `createLimitBuyOrder`, `createLimitSellOrder`
- Ordens stop: `createStopLossOrder`, `createStopMarketOrder`, `createStopLimitOrder`
- Take profit: `createTakeProfitOrder`
- Trailing stops: `createTrailingAmountOrder`, `createTrailingPercentOrder`
- Avançadas: `createPostOnlyOrder`, `createReduceOnlyOrder`, `createTriggerOrder`
- Ordens OCO: `createOrderWithTakeProfitAndStopLoss`

**Gerenciamento de Ordens:**
- `fetchOrder` - Obter uma única ordem
- `fetchOrders` - Obter todas as ordens
- `fetchOpenOrders` - Obter ordens abertas
- `fetchClosedOrders` - Obter ordens fechadas
- `cancelOrder` - Cancelar uma única ordem
- `cancelAllOrders` - Cancelar todas as ordens
- `editOrder` - Modificar ordem existente
- WebSocket: `watchOrders` - Atualizações ao vivo de ordens

### Conta e Saldo

- `fetchBalance` - Obter saldo da conta
- `fetchAccounts` - Obter sub-contas
- `fetchLedger` - Obter histórico do razão
- `fetchDeposits` - Obter histórico de depósitos
- `fetchWithdrawals` - Obter histórico de saques
- `fetchTransactions` - Obter histórico de transações
- WebSocket: `watchBalance` - Atualizações ao vivo de saldo

### Derivativos e Futuros

**Posições:**
- `fetchPosition` - Obter uma única posição
- `fetchPositions` - Obter todas as posições
- `closePosition` - Fechar uma posição
- `setPositionMode` - Definir modo hedge/unidirecional
- WebSocket: `watchPositions` - Atualizações ao vivo de posições

**Margem e Alavancagem:**
- `fetchLeverage` - Obter alavancagem atual
- `setLeverage` - Definir alavancagem
- `setMarginMode` - Definir margem cruzada/isolada
- `borrowMargin` - Tomar margem emprestada
- `repayMargin` - Reembolsar margem tomada

**Financiamento e Liquidação:**
- `fetchFundingRate` - Obter taxa de financiamento atual
- `fetchFundingRateHistory` - Obter histórico de taxa de financiamento
- `fetchFundingHistory` - Obter seus pagamentos de financiamento
- `fetchSettlementHistory` - Obter histórico de liquidações

**Interesse em Aberto e Liquidações:**
- `fetchOpenInterest` - Obter interesse em aberto
- `fetchOpenInterestHistory` - Obter histórico de OI
- `fetchLiquidations` - Obter liquidações públicas
- `fetchMyLiquidations` - Obter suas liquidações

**Opções:**
- `fetchOption` - Obter informações de opção
- `fetchOptionChain` - Obter cadeia de opções
- `fetchGreeks` - Obter gregos de opções
- `fetchVolatilityHistory` - Obter histórico de volatilidade

### Depósitos e Saques

- `fetchDepositAddress` - Obter endereço de depósito
- `createDepositAddress` - Criar novo endereço de depósito
- `withdraw` - Sacar fundos
- `fetchDeposit` - Obter informações de depósito
- `fetchWithdrawal` - Obter informações de saque

### Taxas e Limites

- `fetchTradingFee` - Obter taxa de negociação para símbolo
- `fetchTradingFees` - Obter taxas de negociação
- `fetchTradingLimits` - Obter limites de negociação
- `fetchDepositWithdrawFee` - Obter taxas de depósito/saque

### Streaming em Tempo Real via WebSocket

Todos os métodos `fetch*` têm equivalentes WebSocket com o prefixo `watch*`:

- `watchTicker` - Atualizações ao vivo de ticker
- `watchTickers` - Atualizações ao vivo de múltiplos tickers
- `watchOrderBook` - Atualizações ao vivo do livro de ordens
- `watchTrades` - Stream ao vivo de negociações
- `watchOHLCV` - Atualizações ao vivo de candles
- `watchBalance` - Atualizações ao vivo de saldo (autenticação necessária)
- `watchOrders` - Atualizações ao vivo de ordens (autenticação necessária)
- `watchMyTrades` - Atualizações ao vivo de negociações (autenticação necessária)
- `watchPositions` - Atualizações ao vivo de posições (autenticação necessária)

## Boas Práticas Cobertas

### Tratamento de Erros

Cada habilidade ensina o tratamento adequado de exceções:

- **NetworkError** - Erros recuperáveis (tentar novamente com backoff)
- **ExchangeError** - Erros não recuperáveis (não tentar novamente)
- **RateLimitExceeded** - Limite de taxa atingido (aguardar e tentar novamente)
- **AuthenticationError** - Credenciais de API inválidas
- **InsufficientFunds** - Saldo insuficiente
- **InvalidOrder** - Parâmetros de ordem inválidos

### Limitação de Taxa

As habilidades cobrem tanto a limitação de taxa integrada quanto a manual:

```
# Enable built-in rate limiter (recommended)
exchange.enableRateLimit = true
```

### Autenticação

Tratamento seguro de chaves de API:

```
# Use environment variables (recommended)
exchange.apiKey = process.env.EXCHANGE_API_KEY
exchange.secret = process.env.EXCHANGE_SECRET
```

### Disponibilidade de Métodos

Verificando se uma exchange suporta um método:

```
if (exchange.has['fetchOHLCV']) {
    // Method is supported
}
```

## Solução de Problemas

### Habilidades Não Aparecendo

1. Verifique o local de instalação:
```bash
ls ~/.claude/skills/ccxt-*
ls ~/.opencode/skills/ccxt-*
```

2. Reinicie o Claude Code / OpenCode

3. Execute novamente a instalação:
```bash
./install-skills.sh --all
```

### Recebendo Erro "Habilidade Não Encontrada"

Certifique-se de usar o nome correto da habilidade:
- `/ccxt-typescript` (não `/ccxt-ts` ou `/typescript`)
- `/ccxt-python` (não `/ccxt-py` ou `/python`)
- etc.

### Assistente de IA Não Usando as Habilidades

O assistente de IA usa as habilidades automaticamente quando você faz perguntas relacionadas ao CCXT. Você não precisa invocá-las explicitamente, a menos que queira.

## Instalação Manual

Se o script de instalação não funcionar, você pode instalar manualmente:

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

## Saiba Mais

- **Documentação das habilidades**: `.claude/skills/README.md` no repositório do CCXT
- **Estratégia de geração**: `.claude/skills/GENERATION_STRATEGY.md`
- **Manual do CCXT**: [Manual.md](/docs/manual)
- **CCXT Pro**: [ccxt.pro.manual.md](/docs/pro-manual)

## Feedback

Se você tiver sugestões para melhorar as habilidades ou encontrar problemas:

1. Abra uma issue no [GitHub](https://github.com/ccxt/ccxt/issues)
2. Inclua "Skills:" no título
3. Especifique qual habilidade de linguagem e o que poderia ser melhorado

As habilidades são ativamente mantidas e atualizadas junto com as versões do CCXT.
