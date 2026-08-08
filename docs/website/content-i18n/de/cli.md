---
title: "CLI"
description: "CCXT enthält ein Beispiel, das es ermöglicht, alle Exchange-Methoden und -Eigenschaften über die Befehlszeile aufzurufen. Man muss nicht einmal ein Programmierer sein oder Code schreiben –…"
---

# CCXT CLI (Befehlszeilenschnittstelle)

CCXT enthält ein Beispiel, das es ermöglicht, alle Exchange-Methoden und -Eigenschaften über die Befehlszeile aufzurufen. Man muss nicht einmal ein Programmierer sein oder Code schreiben – jeder Benutzer kann es verwenden!

Die CLI-Schnittstelle ist ein Programm in CCXT, das den Exchange-Namen und einige Parameter von der Befehlszeile entgegennimmt und einen entsprechenden CCXT-Aufruf ausführt, der die Ausgabe des Aufrufs an den Benutzer zurückgibt. Somit können Sie CCXT direkt verwenden, ohne eine einzige Codezeile zu schreiben.

Die CCXT-Befehlszeilenschnittstelle ist sehr praktisch und nützlich für:

- Bash-API-Skripterstellung
- Cron/Crontab-Trading-Automatisierung
- Fehlerbehebung in Ihrem Code
- Debuggen von Exchange-Fehlern
- Schnelles Kryptowährungshandeln über die Befehlszeile
- Datensammlung für Backtesting
- Interoperabilität mit anderen Systemen und Frameworks
- Erlernen der Grundlagen des Kryptowährungshandels
- Erlernen von CCXT und fortgeschrittenen API-Aspekten
- Entwicklung neuer Exchange-Integrationen
- Beitrag zum CCXT-Code

Für CCXT-Bibliotheksbenutzer empfehlen wir dringend, die CLI mindestens ein paarmal auszuprobieren, um ein Gefühl dafür zu bekommen.
Für CCXT-Bibliotheksentwickler ist die CLI mehr als nur eine Empfehlung – sie ist ein Muss.

Der beste Weg, CCXT CLI zu lernen und zu verstehen, ist Experimentieren, Versuch und Irrtum. **Warnung: Die CLI führt Ihren Befehl aus und fragt nicht um Bestätigung, nachdem Sie ihn gestartet haben. Seien Sie daher vorsichtig mit Zahlen, da Verwechslungen von Beträgen mit Preisen zu Geldverlusten führen können.**

Das gleiche CLI-Design ist in allen unterstützten Sprachen – TypeScript, JavaScript, Python und PHP – für Beispielcode für Entwickler implementiert.
Mit anderen Worten, die vorhandene CLI enthält drei Implementierungen, die in vielerlei Hinsicht identisch sind. Der Code in diesen drei CLI-Beispielen soll "leicht verständlich" sein.

Der Quellcode der CLI ist hier verfügbar:

- https://github.com/ccxt/ccxt/blob/master/examples/ts/cli.ts
- https://github.com/ccxt/ccxt/blob/master/examples/js/cli.js
- https://github.com/ccxt/ccxt/blob/master/examples/py/cli.py
- https://github.com/ccxt/ccxt/blob/master/examples/php/cli.php

## Global installieren
```bash
npm -g ccxt
```
- Aktualisieren mit `npm update ccxt -g`

## Installation

1. CCXT-Repository klonen:
    ```bash
    git clone https://github.com/ccxt/ccxt
    ```
2. In das geklonte Repository wechseln:
    ```bash
    cd ccxt
    ```
3. Abhängigkeiten installieren:
    - Node.js + npm: `npm install`
    - PHP + Composer: `composer install`

4. Skript ausführen:
    - Node.js: `node examples/js/cli okx fetchTicker ETH/USDT`
    - Python: `python3 examples/py/cli.py okx fetch_ticker ETH/USDT`
    - PHP: `php -f examples/php/cli.php okx fetch_ticker ETH/USDT`

## Verwendung

Das CLI-Skript benötigt mindestens ein Argument, nämlich die Exchange-ID ([Liste der unterstützten Exchanges und ihrer IDs](https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets)). Wenn Sie keine Exchange-ID angeben, wird das Skript die Liste aller Exchange-IDs zur Referenz ausgeben.

Beim Start wird die CLI eine Exchange-Instanz erstellen und initialisieren und [exchange.loadMarkets()](/docs/manual#loading-markets) für diesen Exchange aufrufen.
Wenn Sie keine weiteren Befehlszeilenargumente außer dem Exchange-ID-Argument angeben, wird das CLI-Skript den gesamten Inhalt des Exchange-Objekts ausgeben, einschließlich der Liste aller Methoden und Eigenschaften sowie aller geladenen Märkte (die Ausgabe kann in diesem Fall extrem lang sein).

Normalerweise würde man nach dem Exchange-ID-Argument einen Methodennamen mit seinen Argumenten oder eine Exchange-Eigenschaft zur Überprüfung der Exchange-Instanz angeben.

### Überprüfen von Exchange-Eigenschaften

Wenn der einzige Parameter, den Sie der CLI übergeben, die Exchange-ID ist, wird sie den Inhalt der Exchange-Instanz einschließlich aller Eigenschaften, Methoden, Märkte, Währungen usw. ausgeben. **Warnung: Der Inhalt des Exchanges ist RIESIG und dies wird SEHR VIEL Ausgabe auf Ihren Bildschirm werfen!**

```bash
node examples/js/cli bybit
```

Sie können den Namen der Eigenschaft des Exchanges angeben, um die Ausgabe auf eine vernünftige Größe zu reduzieren.

```bash
node examples/js/cli okx markets  # gibt die Liste aller geladenen Märkte aus
node examples/js/cli binance currencies  # gibt eine Tabelle aller geladenen Währungen aus
node examples/js/cli gate options  # gibt den Inhalt der Exchange-spezifischen Optionen aus
```

Sie können leicht sehen, welche Methoden auf den verschiedenen Exchanges unterstützt werden:

```bash
node examples/js/exchange-capabilities | less -S -R
```

### Aufrufen einer Unified-Methode nach Namen

Aufrufen von Unified-Methoden ist einfach:

```bash
node examples/js/cli okx fetchOrderBook BTC/USDT  # holt das Orderbuch von der Exchange-Instanz und gibt es als Tabelle aus
node examples/js/cli binance fetchTrades ETH/USDT  # holt eine Liste der aktuellsten öffentlichen Trades und gibt eine Tabelle aus
node examples/js/cli bitget fetchTickers  # holt alle Tickers nacheinander
node examples/js/cli bitget fetchTickers --table  # holt alle Tickers und gibt sie als Tabelle aus
node examples/js/cli bitget fetchTickers '["BTC/USDT","ETH/USDT"]' # holt die in der Array-Argument angegebenen Tickers
```

Exchange-spezifische Parameter können im letzten Argument jeder Unified-Methode gesetzt werden:

```bash
node examples/js/cli bybit setMarginMode isolated BTC/USDT '{"leverage":"8"}' # Margin-Modus setzen und dabei den Exchange-spezifischen Leverage-Parameter angeben
```

### Aufrufen einer Exchange-spezifischen Methode nach Namen

Hier ein Beispiel für das Abrufen des Orderbuchs auf okx im Sandbox-Modus mit der impliziten API und den Exchange-spezifischen Parametern instId und sz:

```bash
node examples/js/cli okx publicGetMarketBooks '{"instId":"BTC-USDT","sz":"3"}' --sandbox
```

## Authentifizierung und Überschreibungen

Öffentliche Exchange-APIs erfordern keine Authentifizierung. Sie können die CLI verwenden, um eine Methode einer öffentlichen API aufzurufen. Der Unterschied zwischen öffentlichen und privaten APIs wird im Handbuch hier beschrieben: [Öffentliche/Private API](/docs/manual#publicprivate-api).

Für private API-Aufrufe sucht das CLI-Skript standardmäßig nach API-Schlüsseln in der Datei `keys.local.json` im Stammverzeichnis des geklonten Repositorys und nach Exchange-Anmeldeinformationen in den Umgebungsvariablen. Weitere Details finden Sie hier: [Exchange-Anmeldeinformationen hinzufügen](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#adding-exchange-credentials).

## Unified API vs Exchange-spezifische API

Die CLI unterstützt alle möglichen Methoden und Eigenschaften, die auf der Exchange-Instanz existieren.

### Mit jq ausführen
jq installieren 

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

#### Beispiele
- Tickerpreis von BTC/USDT abrufen: `ccxt binance fetchTicker BTC/USDT | jq '.price'
- Preis und Menge der Trades beobachten:
```bash
`ccxt binance watchTrades BTC/USDT --raw | jq -c '[.[] | {price: .price, amount: .amount}]'`
```

- Fuzzy-Suche zwischen Trades (erfordert fzf):
```bash
`ccxt binance fetchTrades --raw | jq -c '.[]' | fzf`
```

![render1710459605924](https://github.com/ccxt/ccxt/assets/12142844/39b22383-42d5-4ebd-8b09-617008b7e4f0)
