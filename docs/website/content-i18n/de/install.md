---
title: "Installation"
description: "Die einfachste Möglichkeit, die ccxt-Bibliothek zu installieren, ist die Verwendung integrierter Paketmanager:"
---

## Installation

Die einfachste Möglichkeit, die ccxt-Bibliothek zu installieren, ist die Verwendung integrierter Paketmanager:

- [ccxt in **NPM**](http://npmjs.com/package/ccxt) (JavaScript / Node v15+)
- [ccxt in **PyPI**](https://pypi.python.org/pypi/ccxt) (Python 3)

Diese Bibliothek wird als All-in-One-Modulimplementierung mit minimalistischen Abhängigkeiten und Anforderungen geliefert:

- [ccxt.js](https://github.com/ccxt/ccxt/blob/master/js/ccxt.js) in JavaScript
- [./python/](https://github.com/ccxt/ccxt/blob/master/python/) in Python (generiert aus JS)
- [ccxt.php](https://github.com/ccxt/ccxt/blob/master/ccxt.php) in PHP (generiert aus JS)
- [./java/](https://github.com/ccxt/ccxt/blob/master/java/) in Java (generiert aus TS)

Sie können es auch aus dem [ccxt GitHub-Repository](https://github.com/ccxt/ccxt) in Ihr Projektverzeichnis klonen und Dateien manuell in Ihr Arbeitsverzeichnis mit der für Ihre Umgebung passenden Spracherweiterung kopieren.

```bash
git clone https://github.com/ccxt/ccxt.git
```

Eine alternative Installationsmethode ist das Erstellen eines benutzerdefinierten Bundles aus der Quelle. Wählen Sie die benötigten Exchanges in `exchanges.cfg`.

### JavaScript (NPM)

Die JavaScript-Version von ccxt funktioniert sowohl in Node als auch in Webbrowsern. Erfordert ES6 und `async/await`-Syntaxunterstützung (Node 15+). Bei der Kompilierung mit Webpack und Babel stellen Sie sicher, dass es in Ihrer `babel-loader`-Konfiguration [nicht ausgeschlossen](https://github.com/ccxt-dev/ccxt/issues/225#issuecomment-331582275) ist.

[ccxt Krypto-Trading-Bibliothek in npm](http://npmjs.com/package/ccxt)

```bash
npm install ccxt
```

```javascript
var ccxt = require ('ccxt')

console.log (ccxt.exchanges) // print all available exchanges
```

### JavaScript (zur Verwendung mit dem `<script>`-Tag):

All-in-One-Browser-Bundle (Abhängigkeiten inklusive), bereitgestellt von einem CDN Ihrer Wahl:

* jsDelivr: https://cdn.jsdelivr.net/npm/ccxt@4.5.56/dist/ccxt.browser.min.js
* unpkg: https://unpkg.com/ccxt@4.5.56/dist/ccxt.browser.min.js
* ccxt: https://cdn.ccxt.com/latest/ccxt.min.js

Sie können eine live aktualisierte Version des Bundles erhalten, indem Sie die Versionsnummer aus der URL entfernen (das `@a.b.c`-Element) oder das /latest/ auf unserem CDN — wir empfehlen dies jedoch nicht, da es Ihre Anwendung möglicherweise irgendwann beschädigen kann. Beachten Sie außerdem, dass wir nicht für den korrekten Betrieb dieser CDN-Server verantwortlich sind.

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/ccxt@4.5.56/dist/ccxt.browser.min.js"></script>
```

Der Standardeinstiegspunkt für den Browser ist `window.ccxt` und er erstellt ein globales ccxt-Objekt:

```javascript
console.log (ccxt.exchanges) // print all available exchanges
```

### Benutzerdefinierte JavaScript-Builds

Es dauert Zeit, alle Skripte und Ressourcen zu laden. Das Problem bei der Verwendung im Browser ist, dass die gesamte CCXT-Bibliothek einige Megabyte wiegt, was für eine Webanwendung sehr viel ist. Manchmal ist dies auch für eine Node-App kritisch. Daher können Sie zum Senken der Ladezeit einen eigenen CCXT-Build für Ihre App mit nur den benötigten Exchanges erstellen. CCXT verwendet Webpack, um tote Codepfade zu entfernen und das Paket kleiner zu machen.

Folgen Sie diesen Schritten:

```bash
# 1. Repository klonen

git clone --depth 1 https://github.com/ccxt/ccxt.git

# 2. in das geklonte Repository wechseln

cd ccxt

# 3. Abhängigkeiten installieren

npm install

# 4. exchanges.cfg für die gewünschten Exchanges bearbeiten

echo -e "binance\nokx" > exchanges.cfg

# 5. Bibliothek bauen

npm run export-exchanges
npm run bundle-browser

# 6a. Browserdatei in Ihren Projektordner kopieren, wenn Sie eine Webanwendung erstellen

cp dist/ccxt.browser.js path/to/your/html/project

# 6b. oder gegen die Bibliothek verlinken, wenn Sie eine Node.js-Anwendung erstellen
npm link
cd path/to/your/node/project
npm link ccxt

# 6c. direkt ccxt vom Einstiegspunkt importieren
touch app.js

# in app.js

import ccxt from './js/ccxt.js'
console.log (ccxt)

# jetzt können Sie Ihre App so ausführen

node app.js
```

### Python

[ccxt Algotrading-Bibliothek in PyPI](https://pypi.python.org/pypi/ccxt)

```bash
pip install ccxt
```

```python
import ccxt
print(ccxt.exchanges) # print a list of all available exchange classes
```

Die Bibliothek unterstützt den nebenläufigen asynchronen Modus mit asyncio und async/await in Python 3.5.3+

```python
import ccxt.async_support as ccxt # link against the asynchronous version of ccxt
```

### PHP

Die autoloadbare Version von ccxt kann mit [**Packagist/Composer**](https://packagist.org/packages/ccxt/ccxt) (PHP 8.1+) installiert werden.

Sie kann auch aus dem Quellcode installiert werden: [**`ccxt.php`**](https://raw.githubusercontent.com/ccxt/ccxt/master/php)

Sie erfordert gängige PHP-Module:

- cURL
- mbstring (die Verwendung von UTF-8 wird dringend empfohlen)
- PCRE
- iconv
- gmp

```php
include "ccxt.php";
var_dump (\ccxt\Exchange::$exchanges); // print a list of all available exchange classes
```

Die Bibliothek unterstützt den nebenläufigen asynchronen Modus mit Tools von [ReactPHP](https://reactphp.org/) in PHP 8.1+. Lesen Sie das [Handbuch](/docs) für weitere Details.

### .net/C#

[ccxt in C# mit **Nugget**](https://www.nuget.org/packages/ccxt) (netstandard 2.0 und netstandard 2.1)
```c#
using ccxt;
Console.WriteLine(ccxt.Exchanges) // check this later
```

### Java

Die Java-Version von CCXT erfordert Java 21+ und verwendet Gradle als Build-System.

Klonen und aus der Quelle bauen:

```bash
git clone https://github.com/ccxt/ccxt.git --depth 1
cd ccxt/java
./gradlew :lib:build
```

```java
import io.github.ccxt.exchanges.Binance;
import io.github.ccxt.types.Ticker;

Binance exchange = new Binance();
exchange.loadMarkets(false);

Ticker ticker = exchange.fetchTicker("BTC/USDT");
System.out.println(ticker.symbol + " " + ticker.last);
```

Beispiele ausführen:

```bash
cd java
./gradlew :examples:run -PmainClass=examples.FetchTicker
./gradlew :examples:run -PmainClass=examples.WatchOrderBook
```

Weitere Beispiele finden Sie in [java/examples/](https://github.com/ccxt/ccxt/tree/master/java/examples).

### Docker

Sie können CCXT in einem Container zusammen mit allen unterstützten Sprachen und Abhängigkeiten installieren. Dies kann nützlich sein, wenn Sie zu CCXT beitragen möchten (z.B. Build-Skripte und Tests ausführen — bitte lesen Sie das Dokument [Contributing](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) für weitere Details).

Sie benötigen das Docker-Image nicht, wenn Sie CCXT nicht entwickeln möchten. Wenn Sie CCXT nur verwenden möchten — installieren Sie es einfach als reguläres Paket in Ihr Projekt.

Mit `docker-compose` (im geklonten CCXT-Repository):

```bash
docker-compose run --rm ccxt
```

Alternativ:

```bash
docker build . --tag ccxt
docker run -it ccxt
```

## Proxy
Wenn Sie aufgrund von Standortbeschränkungen keine Daten von Exchanges erhalten können, lesen Sie den [Proxy](/docs/manual#proxy)-Abschnitt.
