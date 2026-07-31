---
title: "CLI"
description: "CCXT inclut un exemple qui permet d'appeler toutes les méthodes et propriétés de l'échange depuis la ligne de commande. On n'a même pas besoin d'être programmeur ou d'écrire du code –…"
---

# Interface de Ligne de Commande (CLI) de CCXT

CCXT inclut un exemple qui permet d'appeler toutes les méthodes et propriétés de l'échange depuis la ligne de commande. On n'a même pas besoin d'être programmeur ou d'écrire du code – n'importe quel utilisateur peut l'utiliser !

L'interface CLI est un programme dans CCXT qui prend le nom de l'échange et quelques paramètres depuis la ligne de commande et exécute un appel correspondant de CCXT en imprimant le résultat de l'appel à l'utilisateur. Ainsi, avec CLI, vous pouvez utiliser CCXT sans écrire une seule ligne de code.

L'interface de ligne de commande de CCXT est très pratique et utile pour :

- le scripting bash api
- l'automatisation de trading avec cron/crontab
- résoudre des problèmes dans votre code
- déboguer les erreurs d'échange
- effectuer des transactions de cryptomonnaie rapides depuis la ligne de commande
- agréger des données pour le backtesting
- ajouter l'interopérabilité avec d'autres systèmes et frameworks
- apprendre les bases du trading sur les exchanges de cryptomonnaies
- apprendre CCXT et les aspects avancés des API
- écrire de nouvelles intégrations d'exchanges
- contribuer du code à CCXT

Pour les utilisateurs de la bibliothèque CCXT – nous recommandons fortement d'essayer CLI au moins quelques fois pour en avoir une idée.
Pour les développeurs de la bibliothèque CCXT – CLI n'est pas seulement une recommandation, c'est un must.

La meilleure façon d'apprendre et de comprendre CCXT CLI – c'est par l'expérimentation, essais et erreurs. **Avertissement : CLI exécute votre commande et ne demande pas de confirmation après le lancement, soyez donc prudent avec les nombres, confondre les montants avec les prix peut entraîner une perte de fonds.**

Le même design CLI est implémenté dans tous les langages supportés, TypeScript, JavaScript, Python et PHP – à des fins de code d'exemple pour les développeurs.
En d'autres termes, le CLI existant contient trois implémentations qui sont à bien des égards identiques. Le code dans ces trois exemples CLI est destiné à être "facilement compréhensible".

Le code source du CLI est disponible ici :

- https://github.com/ccxt/ccxt/blob/master/examples/ts/cli.ts
- https://github.com/ccxt/ccxt/blob/master/examples/js/cli.js
- https://github.com/ccxt/ccxt/blob/master/examples/py/cli.py
- https://github.com/ccxt/ccxt/blob/master/examples/php/cli.php

## Installer globalement
```bash
npm -g ccxt
```
- Mettre à jour en utilisant `npm update ccxt -g`

## Installation

1. Cloner le dépôt CCXT :
    ```bash
    git clone https://github.com/ccxt/ccxt
    ```
2. Changer de répertoire vers le dépôt cloné :
    ```bash
    cd ccxt
    ```
3. Installer les dépendances :
    - Node.js + npm : `npm install`
    - PHP + Composer : `composer install`

4. Exécuter le script :
    - Node.js : `node examples/js/cli okx fetchTicker ETH/USDT`
    - Python : `python3 examples/py/cli.py okx fetch_ticker ETH/USDT`
    - PHP : `php -f examples/php/cli.php okx fetch_ticker ETH/USDT`

## Utilisation

Le script CLI nécessite au moins un argument, à savoir l'identifiant de l'exchange ([la liste des exchanges supportés et leurs identifiants](https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets)). Si vous ne spécifiez pas l'identifiant de l'exchange, le script imprimera la liste de tous les identifiants d'exchanges pour référence.

Au lancement, CLI créera et initialisera l'instance d'exchange et appellera également [exchange.loadMarkets()](/docs/manual#loading-markets) sur cet exchange.
Si vous ne spécifiez aucun autre argument de ligne de commande à CLI hormis l'argument de l'identifiant de l'exchange, alors le script CLI imprimera le contenu de l'objet exchange, y compris la liste de toutes les méthodes et propriétés et tous les marchés chargés (la sortie peut être extrêmement longue dans ce cas).

Normalement, après l'argument de l'identifiant de l'exchange, on spécifierait un nom de méthode à appeler avec ses arguments ou une propriété de l'exchange à inspecter sur l'instance de l'exchange.

### Inspecter les Propriétés de l'Exchange

Si le seul paramètre que vous spécifiez à CLI est l'identifiant de l'exchange, alors il imprimera le contenu de l'instance de l'exchange, y compris toutes les propriétés, méthodes, marchés, devises, etc. **Avertissement : le contenu de l'exchange est ÉNORME et cela va déverser BEAUCOUP de sortie sur votre écran !**

```bash
node examples/js/cli bybit
```

Vous pouvez spécifier le nom de la propriété de l'exchange pour réduire la sortie à une taille raisonnable.

```bash
node examples/js/cli okx markets  # imprimera la liste de tous les marchés chargés
node examples/js/cli binance currencies  # imprimera un tableau de toutes les devises chargées
node examples/js/cli gate options  # imprimera le contenu des options spécifiques à l'exchange
```

Vous pouvez facilement voir quelles méthodes sont supportées sur les différents exchanges :

```bash
node examples/js/exchange-capabilities | less -S -R
```

### Appeler une Méthode Unifiée par Nom

Appeler des méthodes unifiées est facile :

```bash
node examples/js/cli okx fetchOrderBook BTC/USDT  # récupérera le carnet d'ordres de l'instance de l'exchange et l'imprimera sous forme de tableau
node examples/js/cli binance fetchTrades ETH/USDT  # récupérera une liste des transactions publiques les plus récentes et imprimera un tableau
node examples/js/cli bitget fetchTickers  # récupérera tous les tickers un par un
node examples/js/cli bitget fetchTickers --table  # récupérera tous les tickers et les imprimera sous forme de tableau
node examples/js/cli bitget fetchTickers '["BTC/USDT","ETH/USDT"]' # récupérera les tickers spécifiés dans le tableau d'arguments
```

Les paramètres spécifiques à l'exchange peuvent être définis dans le dernier argument de chaque méthode unifiée :

```bash
node examples/js/cli bybit setMarginMode isolated BTC/USDT '{"leverage":"8"}' # définir le mode de marge tout en spécifiant le paramètre de levier spécifique à l'exchange
```

### Appeler une Méthode Spécifique à l'Exchange par Nom

Voici un exemple de récupération du carnet d'ordres sur okx en mode sandbox en utilisant l'API implicite et les paramètres spécifiques instId et sz :

```bash
node examples/js/cli okx publicGetMarketBooks '{"instId":"BTC-USDT","sz":"3"}' --sandbox
```

## Authentification et Remplacements

Les API publiques d'exchange ne nécessitent pas d'authentification. Vous pouvez utiliser CLI pour appeler n'importe quelle méthode d'une API publique. La différence entre les API publiques et privées est décrite dans le Manuel, ici : [API Publique/Privée](/docs/manual#publicprivate-api).

Pour les appels d'API privés, par défaut le script CLI recherchera les clés API dans le fichier `keys.local.json` dans la racine du dépôt cloné dans votre répertoire de travail et recherchera également les identifiants de l'exchange dans les variables d'environnement. Plus de détails ici : [Ajouter des Identifiants d'Exchange](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#adding-exchange-credentials).

## API Unifiée vs API Spécifique à l'Exchange

CLI supporte toutes les méthodes et propriétés possibles qui existent sur l'instance de l'exchange.

### Exécuter avec jq
Installer jq 

#### **Ubuntu**
```bash
sudo apt-get install jq
```
#### **Brew (Mac)**
```bash
brew install jq
```
#### **Choco (Windows)**
```bash
choco install jq -y
```

#### Exemples
- Obtenir le prix du ticker BTC/USDT : `ccxt binance fetchTicker BTC/USDT | jq '.price'
- surveiller le prix et le montant des transactions :
```bash
`ccxt binance watchTrades BTC/USDT --raw | jq -c '[.[] | {price: .price, amount: .amount}]'`
```

- recherche approximative entre les transactions (nécessite fzf) :
```bash
`ccxt binance fetchTrades --raw | jq -c '.[]' | fzf`
```

![render1710459605924](https://github.com/ccxt/ccxt/assets/12142844/39b22383-42d5-4ebd-8b09-617008b7e4f0)
