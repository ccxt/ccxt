---
title: "Compétences IA"
description: "CCXT fournit des compétences spécifiques à chaque langage pour les assistants IA Claude Code et OpenCode. Ces compétences aident les développeurs à apprendre rapidement et à utiliser CCXT dans leurs projets…"
---

# Compétences IA pour Claude Code et OpenCode

CCXT fournit des compétences spécifiques à chaque langage pour les assistants IA Claude Code et OpenCode. Ces compétences aident les développeurs à apprendre rapidement et à utiliser CCXT dans leurs projets grâce à des guides complets, des exemples de code et une référence API complète.

## Que sont les compétences CCXT ?

Les compétences sont des modules de documentation interactifs que les assistants de codage IA (comme Claude Code et OpenCode) peuvent charger pour fournir une aide contextuelle lors du travail avec CCXT. Lorsque vous posez des questions sur CCXT, l'assistant IA utilise ces compétences pour donner des réponses précises et détaillées avec des exemples de code fonctionnels.

### Ce qui est inclus

Chaque compétence comprend :

- **Référence API complète** - Plus de 200 méthodes CCXT documentées avec des descriptions
- **Guides d'installation** - Commandes du gestionnaire de paquets pour chaque langage
- **Exemples de code** - Exemples de code fonctionnels intégrés dans la documentation pour tous les langages pris en charge
- **API REST et WebSocket** - Les API standard et en temps réel sont toutes deux couvertes
- **Bonnes pratiques** - Gestion des erreurs, limitation du débit, modèles d'authentification
- **Pièges courants** - Erreurs spécifiques à chaque langage à éviter
- **Guides de dépannage** - Solutions aux problèmes courants et messages d'erreur

## Compétences disponibles

Cinq compétences spécifiques à chaque langage sont disponibles :

| Compétence | Langage | Couverture |
|-------|----------|----------|
| **ccxt-typescript** | TypeScript/JavaScript | Node.js, navigateur, REST et WebSocket |
| **ccxt-python** | Python | Sync, async, asyncio, REST et WebSocket |
| **ccxt-php** | PHP | Sync, async (ReactPHP), REST et WebSocket |
| **ccxt-csharp** | C#/.NET | .NET Standard 2.0+, REST et WebSocket |
| **ccxt-go** | Go | REST et WebSocket |

Chaque compétence est adaptée au langage spécifique avec les idiomes, conventions de nommage et bonnes pratiques appropriés.

## Installation

### Prérequis

Vous devez avoir [Claude Code](https://claude.ai/download) ou [OpenCode](https://opencode.dev/) installé sur votre système.

### Installation rapide (recommandée)

Installez toutes les compétences avec une seule commande en utilisant la [CLI des compétences](https://github.com/vercel-labs/skills) :

```bash
npx skills add ccxt/ccxt
```

Cela fonctionne avec Claude Code, Cursor, Copilot, Windsurf, Codex et plus de 30 autres assistants de codage IA.

### Alternative : Script Shell

```bash
curl -fsSL https://raw.githubusercontent.com/ccxt/ccxt/master/install-skills.sh | bash
```

Cela téléchargera et installera automatiquement les cinq compétences CCXT sur votre système.

### Depuis le dépôt

Si vous avez cloné le dépôt CCXT, vous pouvez utiliser ces options :

#### Option 1 : Installation interactive (recommandée)

```bash
./install-skills.sh
```

Un menu interactif vous permettra de choisir les compétences à installer :

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

#### Option 2 : Installer toutes les compétences

```bash
./install-skills.sh --all
```

#### Option 3 : Installer des langages spécifiques

```bash
# Install single skill
./install-skills.sh --typescript

# Install multiple skills
./install-skills.sh --python --go

# Install with flags
./install-skills.sh --typescript --php --csharp
```

### Emplacements d'installation

Les compétences sont installées dans :
- `~/.claude/skills/` (pour Claude Code)
- `~/.opencode/skills/` (pour OpenCode)

Le script d'installation détecte automatiquement les deux et installe aux emplacements appropriés.

## Utilisation avec les assistants IA

### Invoquer les compétences

Une fois installées, vous pouvez invoquer les compétences directement dans Claude Code ou OpenCode :

```
/ccxt-typescript
/ccxt-python
/ccxt-php
/ccxt-csharp
/ccxt-go
```

L'assistant IA chargera la compétence et sera prêt à répondre aux questions sur CCXT dans ce langage.

### Poser des questions

Il n'est pas nécessaire d'invoquer explicitement les compétences — posez simplement des questions naturelles :

**Utilisation de base :**
- "Comment installer CCXT en Python ?"
- "Montre-moi comment récupérer un ticker en TypeScript"
- "Comment me connecter à Binance avec des clés API en Go ?"

**Fonctionnalités spécifiques :**
- "Comment créer un ordre stop-loss en JavaScript ?"
- "Montre-moi comment observer les mises à jour en direct du carnet d'ordres en Python"
- "Quelle est la différence entre `fetchTicker` et `watchTicker` ?"
- "Comment gérer les erreurs `RateLimitExceeded` en PHP ?"

**Sujets avancés :**
- "Comment définir l'effet de levier pour le trading de contrats à terme en C# ?"
- "Montre-moi comment récupérer l'historique des taux de financement en TypeScript"
- "Comment créer un ordre stop suiveur en Python ?"
- "Quelle est la meilleure façon de gérer les reconnexions WebSocket en Go ?"

L'assistant IA référencera automatiquement la compétence appropriée pour fournir des réponses précises avec des exemples de code fonctionnels.

## Ce qui est couvert

### Méthodes de données de marché

**Tickers et prix :**
- `fetchTicker` - Obtenir le ticker pour un symbole
- `fetchTickers` - Obtenir plusieurs tickers à la fois
- `fetchBidsAsks` - Obtenir les meilleurs prix d'achat/vente
- `fetchMarkPrices` - Obtenir les prix mark pour les dérivés
- `fetchLastPrices` - Obtenir les derniers prix négociés

**Carnets d'ordres :**
- `fetchOrderBook` - Obtenir le carnet d'ordres complet
- `fetchL2OrderBook` - Carnet d'ordres niveau 2
- `fetchL3OrderBook` - Carnet d'ordres niveau 3 (profondeur complète)
- WebSocket : `watchOrderBook` - Mises à jour en direct du carnet d'ordres

**Transactions et historique :**
- `fetchTrades` - Obtenir l'historique des transactions publiques
- `fetchMyTrades` - Obtenir votre historique de transactions (authentifié)
- `fetchOHLCV` - Obtenir les données de chandeliers/OHLCV
- WebSocket : `watchTrades`, `watchOHLCV` - Mises à jour en direct

### Méthodes de trading

**Types d'ordres (plus de 20 pris en charge) :**
- Ordres au marché : `createMarketOrder`, `createMarketBuyOrder`, `createMarketSellOrder`
- Ordres à cours limité : `createLimitOrder`, `createLimitBuyOrder`, `createLimitSellOrder`
- Ordres stop : `createStopLossOrder`, `createStopMarketOrder`, `createStopLimitOrder`
- Prise de profit : `createTakeProfitOrder`
- Stops suiveurs : `createTrailingAmountOrder`, `createTrailingPercentOrder`
- Avancé : `createPostOnlyOrder`, `createReduceOnlyOrder`, `createTriggerOrder`
- Ordres OCO : `createOrderWithTakeProfitAndStopLoss`

**Gestion des ordres :**
- `fetchOrder` - Obtenir un ordre unique
- `fetchOrders` - Obtenir tous les ordres
- `fetchOpenOrders` - Obtenir les ordres ouverts
- `fetchClosedOrders` - Obtenir les ordres fermés
- `cancelOrder` - Annuler un ordre unique
- `cancelAllOrders` - Annuler tous les ordres
- `editOrder` - Modifier un ordre existant
- WebSocket : `watchOrders` - Mises à jour en direct des ordres

### Compte et solde

- `fetchBalance` - Obtenir le solde du compte
- `fetchAccounts` - Obtenir les sous-comptes
- `fetchLedger` - Obtenir l'historique du grand livre
- `fetchDeposits` - Obtenir l'historique des dépôts
- `fetchWithdrawals` - Obtenir l'historique des retraits
- `fetchTransactions` - Obtenir l'historique des transactions
- WebSocket : `watchBalance` - Mises à jour en direct du solde

### Dérivés et contrats à terme

**Positions :**
- `fetchPosition` - Obtenir une position unique
- `fetchPositions` - Obtenir toutes les positions
- `closePosition` - Fermer une position
- `setPositionMode` - Définir le mode couverture/sens unique
- WebSocket : `watchPositions` - Mises à jour en direct des positions

**Marge et effet de levier :**
- `fetchLeverage` - Obtenir l'effet de levier actuel
- `setLeverage` - Définir l'effet de levier
- `setMarginMode` - Définir la marge croisée/isolée
- `borrowMargin` - Emprunter de la marge
- `repayMargin` - Rembourser la marge empruntée

**Financement et règlement :**
- `fetchFundingRate` - Obtenir le taux de financement actuel
- `fetchFundingRateHistory` - Obtenir l'historique des taux de financement
- `fetchFundingHistory` - Obtenir vos paiements de financement
- `fetchSettlementHistory` - Obtenir l'historique des règlements

**Intérêt ouvert et liquidations :**
- `fetchOpenInterest` - Obtenir l'intérêt ouvert
- `fetchOpenInterestHistory` - Obtenir l'historique de l'OI
- `fetchLiquidations` - Obtenir les liquidations publiques
- `fetchMyLiquidations` - Obtenir vos liquidations

**Options :**
- `fetchOption` - Obtenir les informations sur une option
- `fetchOptionChain` - Obtenir la chaîne d'options
- `fetchGreeks` - Obtenir les grecques d'options
- `fetchVolatilityHistory` - Obtenir l'historique de volatilité

### Dépôts et retraits

- `fetchDepositAddress` - Obtenir l'adresse de dépôt
- `createDepositAddress` - Créer une nouvelle adresse de dépôt
- `withdraw` - Retirer des fonds
- `fetchDeposit` - Obtenir les informations sur un dépôt
- `fetchWithdrawal` - Obtenir les informations sur un retrait

### Frais et limites

- `fetchTradingFee` - Obtenir les frais de trading pour un symbole
- `fetchTradingFees` - Obtenir les frais de trading
- `fetchTradingLimits` - Obtenir les limites de trading
- `fetchDepositWithdrawFee` - Obtenir les frais de dépôt/retrait

### Diffusion en temps réel via WebSocket

Toutes les méthodes `fetch*` ont des équivalents WebSocket avec le préfixe `watch*` :

- `watchTicker` - Mises à jour en direct du ticker
- `watchTickers` - Mises à jour en direct de plusieurs tickers
- `watchOrderBook` - Mises à jour en direct du carnet d'ordres
- `watchTrades` - Flux de transactions en direct
- `watchOHLCV` - Mises à jour en direct des chandeliers
- `watchBalance` - Mises à jour en direct du solde (authentification requise)
- `watchOrders` - Mises à jour en direct des ordres (authentification requise)
- `watchMyTrades` - Mises à jour en direct des transactions (authentification requise)
- `watchPositions` - Mises à jour en direct des positions (authentification requise)

## Bonnes pratiques couvertes

### Gestion des erreurs

Chaque compétence enseigne la gestion correcte des exceptions :

- **NetworkError** - Erreurs récupérables (réessayer avec un délai exponentiel)
- **ExchangeError** - Erreurs non récupérables (ne pas réessayer)
- **RateLimitExceeded** - Limite de débit atteinte (attendre et réessayer)
- **AuthenticationError** - Identifiants API invalides
- **InsufficientFunds** - Solde insuffisant
- **InvalidOrder** - Paramètres d'ordre invalides

### Limitation du débit

Les compétences couvrent la limitation du débit intégrée et manuelle :

```
# Enable built-in rate limiter (recommended)
exchange.enableRateLimit = true
```

### Authentification

Gestion sécurisée des clés API :

```
# Use environment variables (recommended)
exchange.apiKey = process.env.EXCHANGE_API_KEY
exchange.secret = process.env.EXCHANGE_SECRET
```

### Disponibilité des méthodes

Vérifier si une bourse prend en charge une méthode :

```
if (exchange.has['fetchOHLCV']) {
    // Method is supported
}
```

## Dépannage

### Les compétences n'apparaissent pas

1. Vérifier l'emplacement d'installation :
```bash
ls ~/.claude/skills/ccxt-*
ls ~/.opencode/skills/ccxt-*
```

2. Redémarrer Claude Code / OpenCode

3. Relancer l'installation :
```bash
./install-skills.sh --all
```

### Erreur "Compétence introuvable"

Assurez-vous d'utiliser le nom de compétence correct :
- `/ccxt-typescript` (pas `/ccxt-ts` ou `/typescript`)
- `/ccxt-python` (pas `/ccxt-py` ou `/python`)
- etc.

### L'assistant IA n'utilise pas les compétences

L'assistant IA utilise automatiquement les compétences lorsque vous posez des questions relatives à CCXT. Il n'est pas nécessaire de les invoquer explicitement, sauf si vous le souhaitez.

## Installation manuelle

Si le script d'installation ne fonctionne pas, vous pouvez installer manuellement :

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

## En savoir plus

- **Documentation des compétences** : `.claude/skills/README.md` dans le dépôt CCXT
- **Stratégie de génération** : `.claude/skills/GENERATION_STRATEGY.md`
- **Manuel CCXT** : [Manual.md](/docs/manual)
- **CCXT Pro** : [ccxt.pro.manual.md](/docs/pro-manual)

## Retour d'information

Si vous avez des suggestions pour améliorer les compétences ou si vous trouvez des problèmes :

1. Ouvrez une issue sur [GitHub](https://github.com/ccxt/ccxt/issues)
2. Incluez "Skills:" dans le titre
3. Précisez quelle compétence de langage et ce qui pourrait être amélioré

Les compétences sont activement maintenues et mises à jour parallèlement aux versions de CCXT.
