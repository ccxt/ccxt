---
title: "Beitragen"
description: "Lesen Sie die Hinweise beim Öffnen eines neuen Issues auf GitHub und geben Sie die angeforderten Details an, damit wir Ihnen besser helfen können. Sie können auch den Abschnitt zur Fehlerbehebung lesen."
---

# Beitrag zur CCXT-Bibliothek

- [Wie man eine Frage oder ein Problem einreicht](#how-to-submit-an-issue)
- [Wie man Code beiträgt](#how-to-contribute-code)
  - [Was Sie haben müssen](#what-you-need-to-have)
  - [Was Sie wissen müssen](#what-you-need-to-know)

## Wie man ein Issue einreicht

Lesen Sie die Hinweise beim Öffnen eines [neuen Issues auf GitHub](https://github.com/ccxt/ccxt/issues/new/choose) und geben Sie die angeforderten Details an, damit wir Ihnen besser helfen können. Sie können auch den Abschnitt [Fehlerbehebung](/docs/manual#troubleshooting) lesen.


### Sicherheitslücken und kritische Probleme melden

Wenn Sie ein Sicherheitsproblem oder eine kritische Schwachstelle gefunden haben und eine öffentliche Meldung ein Risiko darstellen würde – senden Sie uns bitte eine Nachricht an <a href="mailto:info@ccxt.trade">info@ccxt.trade</a>.

## Wie man Code beiträgt

- **[STELLEN SIE SICHER, DASS IHR CODE VEREINHEITLICHT IST](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes)!**

  **↑ Dies ist die wichtigste Regel von allen!!!**

- **VOR JEDEM PUSH STELLEN SIE SICHER, DASS SIE DIESEN BEFEHL LOKAL AUSFÜHREN: `git config core.hooksPath .git-templates/hooks`**

- **BITTE COMMITTEN SIE DIE FOLGENDEN DATEIEN NICHT IN PULL REQUESTS:**

  - `/build/*` (diese werden automatisch generiert)
  - `/js/*` (diese werden aus der TypeScript-Version kompiliert)
  - `/php/*` (außer Basisklassen)
  - `/python/*` (außer Basisklassen)
  - `/cs/*` (außer Basisklassen)
  - `/ccxt.js`
  - `/README.md` (Börsenübersichten werden automatisch generiert)
  - `/package.json`
  - `/package.lock`
  - `/wiki/*` (außer bei echten Änderungen, Börsenübersichten werden automatisch generiert)
  - `/dist/ccxt.browser.js` (dies wird ebenfalls automatisch im Browser-Bundle erstellt)


  Diese Dateien werden generiert ([unten erklärt](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support)) und werden beim Build überschrieben. Bitte committen Sie sie nicht, um das Repository nicht aufzublähen, das bereits recht groß ist. In den meisten Fällen müssen Sie nur eine einzige Quelldatei committen, um eine Änderung an der Implementierung einer Börse einzureichen.

- **BITTE REICHEN SIE ATOMARE ÄNDERUNGEN EIN, EINEN PULL REQUEST PRO BÖRSE, MISCHEN SIE DIESE NICHT**
- **STELLEN SIE SICHER, DASS IHR CODE ALLE SYNTAXPRÜFUNGEN BESTEHT, INDEM SIE `npm run build` AUSFÜHREN**

## Ausstehende Aufgaben

Nachfolgend finden Sie eine Liste von Funktionen, die wir derzeit in erster Linie in der Bibliothek implementiert und vollständig **vereinheitlicht** haben möchten. Die meisten dieser Aufgaben sind bereits in Arbeit, für einige Börsen implementiert, aber nicht für alle:

- Margin-Handel
- Leverage (Hebel)
- Derivate (Futures, Optionen)
- Hauptkonto / Unterkonten
- Bedingte Orders (Stop-Loss, Take-Profit)
- `transfer` zwischen Unterkonten und Hauptkonto
- `fetchTransfer`
- `fetchTransfers`
- `fetchLedger`
- `fetchPositions`
- `closePosition`
- `closePositions`

Wenn Sie durch das Einreichen von Teilimplementierungen beitragen möchten, schauen Sie sich unbedingt Beispiele an, wie es innerhalb der Bibliothek gemacht wird (wo bereits implementiert), und übernehmen Sie die etablierten Praktiken.

Wenn Ihr Vorschlag, Ihre Empfehlung oder Verbesserung sich nicht auf die obige Aufgabenliste bezieht, stellen Sie vor dem Einreichen sicher, dass sie:
1. wirklich von der Mehrheit der CCXT-Benutzer benötigt wird
2. als Allzwecklösung konzipiert ist und nicht fest für Ihre spezifischen Bedürfnisse codiert
3. auf verallgemeinerte Weise kompatibel mit allen Börsen umgesetzt ist (nicht börsenweit spezifisch)
4. portierbar ist (in allen unterstützten Sprachen verfügbar)
5. robust ist
6. explizit in dem ist, was es tut
7. nichts kaputt macht (wenn Sie eine Methode ändern, stellen Sie sicher, dass alle anderen Methoden, die die bearbeitete Methode aufrufen, nicht beeinträchtigt werden)

Im Folgenden finden Sie eine Reihe von Regeln für Beiträge zur CCXT-Bibliotheksbasis.

## Was Sie haben müssen

Wenn Sie CCXT nicht entwickeln und keinen Code zur CCXT-Bibliothek beitragen möchten, benötigen Sie weder das Docker-Image noch das CCXT-Repository. Wenn Sie CCXT einfach in Ihrem Projekt verwenden möchten, installieren Sie es als reguläres Paket im Projektordner, wie im Handbuch (/docs/install) dokumentiert:

- [JavaScript / Node.js / NPM](/docs/install#javascript-npm)

  ```bash
  # JavaScript / Node.js / NPM
  npm install ccxt
  ```

- [Python / PIP](/docs/install#python)

  ```bash
  # Python
  pip install ccxt  # or pip3 install ccxt
  ```

- [PHP / Composer](/docs/install#php)

  ```bash
  # PHP / Composer
  composer install ccxt
  ```

- [C# / Nugget](/docs/install#netc)

  ```bash
  # C# / Nugget
  dotnet add ccxt
  ```

- [Java / Gradle](/docs/install#java)

  ```bash
  # Java (clone and build from source)
  git clone https://github.com/ccxt/ccxt.git --depth 1
  cd ccxt/java && ./gradlew :lib:build
  ```

### Mit Docker

Am einfachsten ist es, Docker zu verwenden, um eine isolierte Build- und Testumgebung mit allen installierten Abhängigkeiten auszuführen:

```bash
docker-compose run --rm ccxt
```

Damit wird ein Container erstellt und eine Shell geöffnet, in der die Befehle `npm run build` und `node run-tests` einfach funktionieren sollten.

Der CCXT-Ordner ist innerhalb des Containers eingebunden, mit Ausnahme des Ordners `node_modules` — der Container hat seine eigene kurzlebige Kopie — sodass Ihre lokal installierten Module nicht beeinträchtigt werden. Das bedeutet, dass Sie Quellen auf Ihrem Host-Rechner mit Ihrem bevorzugten Editor bearbeiten und sie im laufenden Container erstellen/testen können.

Auf diese Weise können Sie die Build-Tools und -Prozesse isoliert halten, ohne den mühsamen Prozess der manuellen Installation all dieser Abhängigkeiten auf Ihrem Host-Rechner durchlaufen zu müssen.

### Ohne Docker

#### Abhängigkeiten

- Git
- [Node.js](https://nodejs.org/en/download/) 8+
- [Python](https://www.python.org/downloads/) 3.5.3+
  - requests (`pip install requests`)
  - [aiohttp](https://docs.aiohttp.org/) (`pip install aiohttp`)
  - [ruff](https://docs.astral.sh/ruff/) (`pip install ruff`)
  - [tox](https://tox.readthedocs.io)
    - via pip: `pip install tox`
    - MacOS mit [brew](https://brew.sh): `brew install tox`
    - Ubuntu Linux: `apt-get install tox`
- [PHP](https://secure.php.net/downloads.php) 8.1+ mit den folgenden installierten und aktivierten Erweiterungen:
  - cURL
  - iconv
  - mbstring
  - PCRE
  - gmp
- [C#](https://dotnet.microsoft.com/en-us/download) 7.0
- [Java](https://adoptium.net/) 21+ mit Gradle

#### Build-Schritte

```bash
git clone https://github.com/ccxt/ccxt.git
```

```bash
cd ccxt
```

```bash
npm install
```

```bash
npm run build
```

## Was Sie wissen müssen

### Repository-Struktur

Der Inhalt des Repositorys ist wie folgt strukturiert:

```bash
/                          # root directory aka npm module/package folder for Node.js
/.babelrc                  # babel config used for making the ES5 version of the library
/.eslintrc                 # linter
/.gitattributes            # contains linguist settings for language detection in repo
/.gitignore                # ignore it
/.npmignore                # files to exclude from the NPM package
/.travis.yml               # a YAML config for travis-ci (continuous integration)
/CONTRIBUTING.md           # this file
/LICENSE.txt               # MIT
/README.md                 # master markdown for GitHub, npmjs.com, npms.io, yarn and others
/build/                    # build scripts
/build/export-exchanges.js # used to create tables of exchanges in the docs during the build
/build/transpile.js        # the transpilation script
/build/update-badges.js    # a JS script to update badges in the README and in docs
/build/vss.js              # reads single-sourced version from package.json and writes it everywhere
/dist/                     # a folder for the generated browser bundle of CCXT
/ccxt.js                   # entry point for the master JS version of the ccxt library
/ccxt.php                  # entry point for the PHP version of the ccxt library
/js/                       # the JS version of the library
/ts/                       # the TypeScript version of the library
/php/                      # PHP ccxt module/package folder
/cs/                       # C#/dotnet package folder
/python/                   # Python ccxt module/package folder for PyPI
/python/__init__.py        # entry point for the Python version of the ccxt.library
/python/async_support/     # asynchronous version of the ccxt.library for Python 3.5.3+ asyncio
/python/base/              # base code for the Python version of the ccxt library
/python/MANIFEST.in        # a PyPI-package file listing extra package files (license, configs, etc...)
/python/README.md          # a copy of README.md for PyPI
/python/setup.cfg          # wheels config file for the Python package
/python/setup.py           # pip/setuptools script (build/install) for ccxt in Python
/python/tox.ini            # tox config for Python
/examples/                 # self-explanatory
/examples/js               # ...
/examples/php              # ...
/examples/py               # ...
/java/examples/            # Java examples (Gradle module)
/exchanges.cfg             # custom bundle config for including only the exchanges you need
/package.json              # npm package file, also used in setup.py for version single-sourcing
/run-tests.js              # a front-end to run individual tests of all exchanges in all languages (JS/PHP/Python)
/wiki/                     # the source of all docs (edits go here)
```

### Mehrsprachige Unterstützung

Die CCXT-Bibliothek ist in mehreren verschiedenen Sprachen verfügbar (TypeScript, JavaScript, Python, PHP, C#, Go und Java). Wir ermutigen Entwickler, *portablen* Code zu schreiben, damit ein einsprachiger Benutzer den Code in anderen Sprachen lesen und leicht verstehen kann. Dies fördert die Akzeptanz der Bibliothek. Das Hauptziel ist es, eine verallgemeinerte, vereinheitlichte, konsistente und robuste Schnittstelle zu so vielen bestehenden Kryptowährungsbörsen wie möglich bereitzustellen.

Zunächst wurden alle sprachspezifischen Versionen parallel, aber getrennt voneinander entwickelt. Als es jedoch zu schwierig wurde, den Code zwischen allen unterstützten Sprachen konsistent zu halten und zu pflegen, haben wir uns entschieden, zu einem Prozess zu wechseln, den wir *Quelle/Generiert* nennen. Es gibt nun eine einzige Quellversion in einer Sprache, nämlich TypeScript. Andere sprachspezifische Versionen werden syntaktisch automatisch aus der Quellversion abgeleitet (transpiliert, generiert). Das bedeutet jedoch nicht, dass Sie ein TS- oder JS-Programmierer sein müssen, um beizutragen. Das Portabilitätsprinzip ermöglicht es Python- und PHP-Entwicklern, sich ebenfalls effektiv an der Entwicklung der Quellversion zu beteiligen.

Die Moduleinstiegspunkte sind:
- `./python/__init__.py` für das Python-pip-Paket
- `./python/async/__init__.py` für das Python 3.7.0+ ccxt.async_support-Unterpaket
- `./js/ccxt.js` für das Node.js-npm-Paket
- `./ts/ccxt.ts` für TypeScript
- `./dist/ccxt.browser.js` für das Browser-Bundle
- `./ccxt.php` für PHP
- `./java/lib/src/main/java/io/github/ccxt/` für Java

Generierte Versionen und Dokumentationen werden aus dem Quellordner `ts/src` durch den Befehl `npm run build` transpiliert.

### Transpilierte (generierte) Dateien

- Alle abgeleiteten Börsenklassen werden durch `tsc` von TypeScript nach JavaScript und durch unseren benutzerdefinierten Transpiler von TypeScript nach PHP und Python transpiliert. Die Quelldateien sind sprachunabhängig, leicht zeilenweise auf jede andere Sprache abbildbar und in einer sprachübergreifend kompatiblen Weise geschrieben. Jeder Programmierer kann sie lesen (by Design).
- Basisklassen werden **nicht** vollständig transpiliert und werden nur teilweise transpiliert, da sie sprachspezifisch sind.

#### JavaScript

Das `ccxt.browser.js` wird mit Babel aus dem Quellcode generiert.

#### Python

Diese Dateien mit abgeleiteten Börsenklassen werden von TS nach Python transpiliert:

- `ts/[_a-z].ts` → `python/ccxt/async/[_a-z].py`
- `python/ccxt/async[_a-z].py` → `python/ccxt/[_a-z].py` (Python 3 asyncio → Python-Sync-Transpilierungsschritt)
- `python/ccxt/test/test_async.py` → `python/ccxt/test/test_sync.py` (der Sync-Test wird aus dem Async-Test generiert)

Diese Python-Basisklassen und -Dateien werden nicht transpiliert:

- `python/ccxt/base/*`
- `python/ccxt/async/base/*`

#### PHP

Diese Dateien mit abgeleiteten Börsenklassen werden von TS nach C# transpiliert:

- `ts/[_a-z].ts` → `php/[_a-z].php`

Diese PHP-Basisklassen und -Dateien werden nicht transpiliert:

- `php/Exchange.php php/ExchangeError.php php/Precise.php ...`

#### C#

Diese Dateien mit abgeleiteten Börsenklassen werden von TS nach C# transpiliert:

- `ts/src/[_a-z].ts` → `cs/src/exchanges/[_a-z].cs`

Diese C#-Basisklassen und -Dateien werden nicht transpiliert:

- `cs/base/*`

#### Java

Diese Dateien mit abgeleiteten Börsenklassen werden von TS nach Java transpiliert:

- `ts/src/[_a-z].ts` → `java/lib/src/main/java/io/github/ccxt/exchanges/[A-Z]*.java`

Diese Java-Basisklassen und -Dateien werden nicht transpiliert:

- `java/lib/src/main/java/io/github/ccxt/base/*`
- `java/lib/src/main/java/io/github/ccxt/ws/*`
- `java/lib/src/main/java/io/github/ccxt/Exchange.java`

#### Typescript

- Die Entwicklung erfolgt mit diesen Dateien

### Basisklasse

``` CONSTRUCTION```

### Abgeleitete Börsenklassen

Der Transpiler ist regex-basiert und verlässt sich stark auf spezifische Formatierungsregeln. Wenn Sie diese verletzen, wird der Transpiler entweder
keine Python/PHP-Klassen generieren können oder fehlerhaften Python/PHP-Syntax generieren.

Nachfolgend finden Sie wichtige Hinweise, wie Sie den JS-Code transpilierbar halten.

Verwenden Sie den Linter `npm run lint js/your-exchange-implementation.js` bevor Sie bauen. Er deckt viele (aber nicht alle) Probleme ab,
sodass eine manuelle Prüfung weiterhin erforderlich ist, wenn die Transpilierung fehlschlägt.

Wenn Sie eine `[TypeError] Cannot read property '1' of null`-Ausnahme oder einen anderen Transpilierungsfehler bei `npm run build` sehen, prüfen Sie, ob Ihr Code die folgenden Regeln erfüllt:

- keine leeren Zeilen innerhalb Ihrer Methoden
- immer Python-artigen Einzug verwenden, er wird für alle Sprachen unverändert beibehalten
- genau mit 4 Leerzeichen einrücken, Tabulatoren vermeiden
- eine leere Zeile zwischen jeder Ihrer Methoden lassen
- gemischte Kommentarstile vermeiden, doppelten Schrägstrich `//` in JS für Zeilenkommentare verwenden
- mehrzeilige Kommentare vermeiden

Wenn der Transpilierungsprozess erfolgreich abgeschlossen wird, aber fehlerhaften Python/PHP-Syntax generiert, prüfen Sie Folgendes:

- jede öffnende Klammer wie `(` oder `{` sollte ein Leerzeichen davor haben!
- keine sprachspezifischen Syntax-Vereinfachungen verwenden, auch wenn Sie es wirklich möchten
- alle Maps und Comprehensions in grundlegende for-Schleifen umwandeln
- die Argumente überschriebener geerbter Methoden nicht ändern, sie über alle Börsen hinweg einheitlich halten
- alles sollte ausschließlich mit Basisklassenmethoden durchgeführt werden (zum Beispiel `this.json ()` für die Konvertierung von Objekten in JSON verwenden)
- immer ein Semikolon `;` am Ende jeder Anweisung setzen, wie in PHP/C-Stil
- alle assoziativen Schlüssel müssen überall einfach angeführte Strings sein (`array['good']`), keine Punkt-Notation verwenden (`array.bad`)
- niemals das Schlüsselwort `var` verwenden, stattdessen `const` für Konstanten oder `let` für Variablen

Und strukturell:

- Wenn Sie eine weitere Basismethode benötigen, müssen Sie diese in allen drei Sprachen implementieren
- Versuchen Sie, nicht mehr als eine HTTP-Anfrage aus einer einheitlichen Methode heraus zu stellen
- Vermeiden Sie es, den Inhalt der Argumente und params zu verändern, die per Referenz in Funktionsaufrufe übergeben werden
- Halten Sie es einfach, führen Sie nicht mehr als eine Anweisung pro Zeile durch
- Versuchen Sie, Syntax und Logik (wenn möglich) auf einfache einzeilige Ausdrücke zu reduzieren
- Mehrere Zeilen sind in Ordnung, aber Sie sollten tiefe Verschachtelungen mit vielen Klammern vermeiden
- Verwenden Sie keine zu komplexen Bedingungsanweisungen (starke if-Verschachtelung)
- Verwenden Sie keine schweren ternären Bedingungen
- Vermeiden Sie Operatorenanhäufungen (**tun Sie das nicht**: `a && b || c ? d + 80 : e ** f`)
- Verwenden Sie nicht `.includes()`, sondern stattdessen `.indexOf()`!
- Verwenden Sie niemals `.toString()` auf Gleitkommazahlen: `Number (0.00000001).toString () === '1e-8'`
- Verwenden Sie keine Closures, `a.map` oder `a.filter (x => (x === 'foobar'))` ist in abgeleiteten Klassen nicht zulässig
- Verwenden Sie den `in`-Operator nicht, um zu prüfen, ob ein Wert in einem nicht-assoziativen Array (Liste) enthalten ist
- Fügen Sie keine eigenen Währungs- oder Symbol-/Paarkonvertierungen und -formatierungen hinzu, kopieren Sie stattdessen aus vorhandenem Code
- **Greifen Sie nicht auf nicht vorhandene Schlüssel zu, `array['key'] || {}` funktioniert in anderen Sprachen nicht!**

#### Markt-IDs senden

Die meisten API-Endpunkte von Börsen erfordern, dass in der Anfrage ein börsenspezifisches Marktsymbol, Handelspaar oder Instrument angegeben wird.

**Wir senden keine einheitlichen Symbole direkt an Börsen!** Sie sind nicht austauschbar! Es gibt einen wesentlichen Unterschied zwischen *börsenspezifischen Markt-IDs* und *einheitlichen Symbolen*! Dies wird im Handbuch erklärt, hier:

- /docs/manual#markets
- /docs/manual#symbols-and-market-ids

**TUN SIE DAS NIEMALS:**

```javascript
async fetchTicker (symbol, params = {}) {
   const request = {
      'pair': symbol, // very bad, sending unified symbols to the exchange directly
   };
   const response = await this.publicGetEndpoint (request);
   // parse in a unified way...
}
```

**TUN SIE AUCH DAS NICHT:**

```javascript
async fetchTicker (symbol, params = {}) {
   const request = {
      'symbol': symbol, // very bad, sending unified symbols to the exchange directly
   };
   const response = await this.publicGetEndpoint (request);
   // parse in a unified way...
}
```

Anstatt ein einheitliches CCXT-Symbol an die Börse zu senden, nehmen wir **immer** die börsenspezifische Markt-`id`, die diesem Symbol entspricht. Falls eine börsenspezifische Markt-ID zufällig identisch mit dem einheitlichen CCXT-Symbol ist – das ist ein glücklicher Zufall, aber wir verlassen uns in der einheitlichen CCXT-API niemals darauf.

Um die börsenspezifische Markt-ID anhand eines einheitlichen CCXT-Symbols zu erhalten, verwenden Sie die folgenden Methoden:

- `this.market (symbol)` – gibt die gesamte einheitliche Marktstruktur zurück, die die `id`, `baseId`, `quoteId` und viele andere interessante Dinge enthält
- `this.marketId (symbol)` – gibt nur die börsenspezifische `id` eines Marktes anhand eines einheitlichen Symbols zurück (wenn Sie nichts anderes benötigen)

**GUTE BEISPIELE:**

```javascript
async fetchTicker (symbol, params = {}) {
   const market = this.market (symbol); // the entire market structure
   const request = {
      'pair': market['id'], // good, they may be equal, but often differ, it's ok
   };
   const response = await this.publicGetEndpoint (this.extend (request, params));
   // parse in a unified way...
}
```

```javascript
async fetchTicker (symbol, params = {}) {
   const marketId = this.marketId (symbol); // just the id
   const request = {
      'symbol': marketId, // good, they may be equal, but often differ, it's ok
   };
   const response = await this.publicGetEndpoint (this.extend (request, params));
   // parse in a unified way...
}
```

#### Symbole parsen

Beim Senden von Anfragen an die Börse müssen einheitliche Symbole wie oben gezeigt in börsenspezifische Markt-`id`s _"umgewandelt"_ werden. Das Gleiche gilt auf der anderen Seite – wenn eine Börsenantwort empfangen wird, enthält sie eine börsenspezifische Markt-`id`, die zurück in ein einheitliches CCXT-Symbol _"umgewandelt"_ werden muss.

**Wir fügen börsenspezifische Markt-`id`s nicht direkt in einheitliche Strukturen ein!** Wir können Symbole und IDs nicht frei austauschen! Es gibt einen wesentlichen Unterschied zwischen einer *börsenspezifischen Markt-ID* und *einheitlichen Symbolen*! Dies wird im Handbuch erklärt, hier:

- /docs/manual#markets
- /docs/manual#symbols-and-market-ids

**TUN SIE DAS NIEMALS:**:

```javascript
parseTrade (trade, market = undefined) {
   // parsing code...
   return {
      'info': trade,
      'symbol': trade['pair'], // very bad, returning exchange-specific market-ids in a unified structure!
      // other fields...
   };
}
```

**TUN SIE AUCH DAS NICHT**

```javascript
parseTrade (trade, market = undefined) {
   // parsing code...
   return {
      'info': trade,
      'symbol': trade['symbol'], // very bad, returning exchange-specific market-ids in a unified structure!
      // other fields...
   };
}
```

Um die Markt-`id` korrekt zu verarbeiten, muss sie in den auf dieser Börse mit `loadMarkets()` zwischengespeicherten Informationen nachgeschlagen werden:

**GUTES BEISPIEL:**

```javascript
parseTrade (trade, market = undefined) {
    const marketId = this.safeString (trade, 'pair');
    // safeSymbol is used to parse the market id to a unified symbol
    const symbol = this.safeSymbol (marketId, market);
    return {
       'info': trade,
       'symbol': symbol, // very good, a unified symbol here now
       // other fields...
    };
}
```

#### Auf Wörterbuchschlüssel zugreifen

In JavaScript können Wörterbuchschlüssel in zwei Notationen aufgerufen werden:

- `object['key']` (Schlüsselnotation mit einfach angeführtem String)
- `object.key` (Eigenschaftsnotation)

Beide funktionieren fast identisch, und eine wird beim Ausführen des JavaScript-Codes implizit in die andere umgewandelt.

Während das oben Genannte in JavaScript funktioniert, **funktioniert es nicht in Python oder PHP**. In den meisten Sprachen werden assoziative Wörterbuchschlüssel nicht genauso behandelt wie Eigenschaften. Daher ist in Python `object.key` nicht dasselbe wie `object['key']`. In PHP ist `$object->key` ebenfalls nicht dasselbe wie `$object['key']`. Sprachen, die zwischen assoziativen Schlüsseln und Eigenschaften unterscheiden, verwenden unterschiedliche Notationen für beide.

Um den Code transpilierbar zu halten, beachten Sie bitte diese einfache Regel: *Verwenden Sie immer die Schlüsselnotation mit einfach angeführtem String `object['key']` für den Zugriff auf alle assoziativen Wörterbuchschlüssel in allen Sprachen überall in dieser Bibliothek!*

#### Eingaben mit `safe`-Methoden bereinigen

JavaScript ist weniger restriktiv als andere Sprachen. Es toleriert den Versuch, einen nicht vorhandenen Schlüssel zu dereferenzieren, wo andere Sprachen eine Ausnahme auslösen würden:

```javascript
// JavaScript

const someObject = {}

if (someObject['nonExistentKey']) {
    // the body of this conditional will not execute in JavaScript
    // because someObject['nonExistentKey'] === undefined === false
    // but JavaScript will not throw an exception on the if-clause
}
```

Die obige Logik mit *"einem standardmäßig undefinierten Wert"* funktioniert jedoch nicht in Python oder PHP.

```python
# Python
some_dictionary = {}

# breaks
if some_dictionary['nonExistentKey']:
    # in Python the attempt to dereference the nonExistentKey value
    # will throw a standard built-in KeyError exception

# works
if 'nonExistentKey' in some_dictionary and some_dictionary['nonExistentKey']:
    # this is a way to check if the key exists before accessing the value

# also works
if some_dictionary.get('nonExistentKey'):
    # another a way to check if the key exists before accessing the value...
```

Die meisten Sprachen tolerieren keinen Versuch, auf einen nicht vorhandenen Schlüssel in einem Objekt zuzugreifen.

Aus den oben genannten Gründen **tun Sie das bitte niemals** in den transpilierten JS-Dateien:

```javascript
// JavaScript
const value = object['key'] || other_value; // will not work in Python or PHP!
if (object['key'] || other_value) { /* will not work in Python or PHP! */ }
```

Daher haben wir eine Familie von `safe*`-Funktionen:

- `safeInteger (object, key, default)`, `safeInteger2 (object, key1, key2, default)` – zum Parsen von Zeitstempeln in Millisekunden
- `safeNumber (object, key, default)`, `safeNumber2 (object, key1, key2, default)` – zum Parsen von Mengen, Preisen, Kosten
- `safeString (object, key, default)`, `safeString2 (object, key1, key2, default)` – zum Parsen von IDs, Typen, Statuswerten
- `safeStringLower (object, key, default)`, `safeStringLower2 (object, key1, key2, default)` – zum Parsen und Umwandeln in Kleinbuchstaben
- `safeStringUpper (object, key, default)`, `safeStringUpper2 (object, key1, key2, default)` – zum Parsen und Umwandeln in Großbuchstaben
- `safeBool(object, key, default)` – zum Parsen von Booleschen Werten innerhalb von Wörterbüchern und Arrays/Listen
- `safeList(object, key, default)` – zum Parsen von Listen/Arrays innerhalb von Wörterbüchern und Arrays/Listen
- `safeDict(object, key, default)` – zum Parsen von Wörterbüchern innerhalb von Wörterbüchern und Arrays/Listen
- `safeValue (object, key, default)`, `safeValue2 (object, key1, key2, default)` – zum Parsen von Objekten (Wörterbüchern) und Arrays (Listen)
- `safeTimestamp (object, key, default)`, `safeTimestamp2 (object, key1, key2, default)` – zum Parsen von UNIX-Zeitstempeln in Sekunden

Die Funktion `safeValue` wird für Objekte innerhalb von Objekten, Arrays innerhalb von Objekten und boolesche `true/false`-Werte verwendet (**veraltet, verwenden Sie sie nur, wenn Sie nicht genau wissen, welcher Typ zurückgegeben wird, bevorzugen Sie andernfalls** `safeBool/safeDict/safeList`).

Wenn Sie nach mehreren verschiedenen Schlüsseln innerhalb eines Objekts suchen müssen, steht Ihnen die Funktionsfamilie `safeMethodN` zur Verfügung, die eine Suche mit einer beliebigen Anzahl von Schlüsseln ermöglicht, indem ein Array von Schlüsseln als Argument akzeptiert wird.

```javascript
const price = this.safeStringN (object, [ 'key1', 'key2', 'key3' ], defaultValue)
```
Für jede oben aufgeführte Safe-Methode gibt es auch das entsprechende `safeMethodN`.

Die oben genannten Safe-Funktionen prüfen auf das Vorhandensein des `key` (oder `key1`, `key2`) im Objekt und geben ordnungsgemäß `undefined/None/null`-Werte für JS/Python/PHP zurück. Jede Funktion akzeptiert auch den `default`-Wert, der im letzten Argument anstelle von `undefined/None/null` zurückgegeben werden soll.

Alternativ können Sie zuerst auf das Vorhandensein des Schlüssels prüfen...

Sie müssen also das hier ändern:

```javascript
if (params['foo'] !== undefined) {
}
```

↓

```javascript
const foo = this.safeValue (params, 'foo');
if (foo !== undefined) {
}
```

Oder:

```javascript
if ('foo' in params) {
}
```

#### Kryptographiemethoden der Basisklasse zur Authentifizierung verwenden

Erfinden Sie das Rad nicht neu. Verwenden Sie immer Basisklassenmethoden für Kryptographie.

Die CCXT-Bibliothek unterstützt die folgenden Authentifizierungs- und Kryptographiealgorithmen:

- HMAC
- JWT (JSON Web Token)
- RSA
- ECDSA Elliptische-Kurven-Kryptographie
  - NIST P256
  - secp256k1
- OTP 2FA (Einmalpasswort-Zwei-Faktor-Authentifizierung)

Die Basisklasse `Exchange` bietet mehrere Methoden, die für praktisch die gesamte Kryptographie in dieser Bibliothek grundlegend sind. Abgeleitete Börsenimplementierungen dürfen keine externen Abhängigkeiten für Kryptographie verwenden; alles sollte nur mit Basismethoden erledigt werden.

- `hash (message, hash = 'md5', digest = 'hex')`
- `hmac (message, secret, hash = 'sha256', digest = 'hex')`
- `jwt (message, secret, hash = 'HS256')`
- `rsa (message, secret, alg = 'RS256')`
- `ecdsa (request, secret, algorithm = 'p256', hash = undefined)`
- `totp (secret)`
- `stringToBase64()`, `base64ToBinary()`, `binaryToBase64()`...

Die Methode `hash()` unterstützt die folgenden `hash`-Algorithmen:

- `'md5'`
- `'sha1'`
- `'sha3'`
- `'sha256'`
- `'sha384'`
- `'sha512'`
- `'keccak'`

Das `digest`-Kodierungsargument akzeptiert die folgenden Werte:

- `'hex'`
- `'binary'`

Die Methode `hmac()` unterstützt auch `'base64'` für das `digest`-Argument. Dies gilt nur für `hmac()`, andere Implementierungen sollten `'binary'` mit `binaryToBase64()` verwenden.

#### Zeitstempel

**Alle Zeitstempel in allen einheitlichen Strukturen dieser Bibliothek sind ganzzahlige UTC-Zeitstempel _in Millisekunden_!**

Um Zeitstempel in Millisekunden umzuwandeln, implementiert CCXT die folgenden Methoden:

```javascript
const data = {
   'unixTimestampInSeconds': 1565242530,
   'unixTimestampInMilliseconds': 1565242530165,
   'unixTimestampAsDecimal': 1565242530.165,
   'stringInSeconds': '1565242530',
};

// convert to integer if the underlying value is already in milliseconds
const timestamp = this.safeInteger (data, 'unixTimestampInMilliseconds'); // === 1565242530165

// convert to integer and multiply by a thousand if the value has milliseconds after dot
const timestamp = this.safeTimestamp (data, 'unixTimestampAsDecimal'); // === 1565242530165

// convert to integer and multiply by a thousand if the value is a UNIX timestamp in seconds
const timestamp = this.safeTimestamp (data, 'unixTimestampInSeconds'); // === 1565242530000

// convert to integer and multiply by a thousand if the value is in seconds
const timestamp = this.safeTimestamp (data, 'stringInSeconds'); // === 1565242530000
```

#### Mit Array-Längen arbeiten

In JavaScript ist die übliche Syntax zum Ermitteln der Länge eines Strings oder eines Arrays die Referenzierung der `.length`-Eigenschaft, wie hier gezeigt:

```javascript
someArray.length

// or

someString.length
```

Das funktioniert sowohl für Strings als auch für Arrays. In Python wird dies auf ähnliche Weise gemacht:

```python
len(some_array)

# or

len(some_string)
```

Die Länge ist also auf die gleiche Weise für Strings und Arrays zugänglich, und beides funktioniert gut.

Bei PHP ist das jedoch anders, sodass die Syntax für String-Längen und Array-Längen unterschiedlich ist:

```php
count(some_array);

// or

strlen(some_string); // or mb_strlen
```

Da der Transpiler zeilenweise arbeitet und keine Code-Inspektion durchführt, kann er Arrays nicht von Strings unterscheiden und `.length` nicht korrekt zu PHP transpilieren ohne zusätzliche Hinweise. Er wird JS `.length` immer zu PHP `strlen` transpilieren und String-Längen gegenüber Array-Längen bevorzugen. Um eine Array-Länge korrekt anzugeben, müssen wir Folgendes tun:

```javascript
const arrayLength = someArray.length;
// the above line ends with .length;
// that ending is a hint for the transpiler that will recognize someArray
// as an array variable in this place, rather than a string type variable
// now we can use arrayLength for the arithmetic
```

Diese Zeilenendung `.length;` erledigt das. Der einzige Fall, in dem die Array-`.length` gegenüber der String-`.length` bevorzugt wird, ist die `for`-Schleife. Im Header der `for`-Schleife bezieht sich `.length` immer auf die Array-Länge (nicht die String-Länge).

#### Zahlen addieren und Strings verketten

In JS verarbeitet der arithmetische Additionsoperator `+` sowohl Strings als auch Zahlen. Er kann Strings mit `+` verketten und Zahlen mit `+` addieren. Dasselbe gilt für Python. Bei PHP ist das anders, dort gibt es unterschiedliche Operatoren für die String-Verkettung (den „Punkt"-Operator `.`) und für die arithmetische Addition (den „Plus"-Operator `+`). Da der Transpiler auch hier keine Code-Inspektion durchführt, kann er nicht erkennen, ob Sie in JS Zahlen addieren oder Strings verketten. Das funktioniert gut, bis Sie das in andere Sprachen transpilieren möchten, sei es PHP oder eine andere Sprache.

Es gibt diesen Aspekt der Zahlenrepräsentation in der Bibliothek.
Der im Handbuch dokumentierte bestehende Ansatz besagt, dass die Bibliothek „überall Gleitkommazahlen" für Mengen, Preise, Kosten usw. akzeptiert und zurückgibt.
Die Verwendung von Gleitkommazahlen ist die einfachste Möglichkeit, neue Benutzer einzubinden.
Dies hat bekannte Eigenheiten; es ist unmöglich, exakte Zahlen mit Gleitkommazahlen darzustellen (https://0.30000000000000004.com/)

Um das zu beheben, wechseln wir überall zu stringbasierten Darstellungen.
Wir befinden uns also derzeit im Prozess, auf nicht-brechende Weise zu Strings zu wechseln.

Der neue Ansatz lautet:

Wir fügen eine interne Schicht für stringbasierte Darstellungen und stringbasierte Mathematik in die Antwort-Parser ein.
Diese interne Schicht basiert auf der Basisklasse `Precise`, die für alle stringbasierten Berechnungen verwendet wird.
Diese Klasse erfordert Strings als Eingabe und gibt ebenfalls Strings zurück.
Alle vorhandenen alten Parser müssen beim ersten Auftreten auf `Precise`-stringbasierte Darstellungen umgeschrieben werden.
Aller neuer Code aller neuen Parser muss von Anfang an mit `Precise`-stringbasierten Darstellungen geschrieben werden.

Was das genau bedeutet:

Vergleichen Sie diesen Pseudocode, der zeigt, wie es **zuvor** gemacht wurde (ein Beispiel für beliebigen Parsing-Code zur Veranschaulichung):

```javascript
const amount = this.safeFloat (order, 'amount');
const remaining = this.safeFloat (order, 'remaining');
if (remaining > 0) {
    status = 'open';
} else {
    status = 'closed';
}
// ...
return {
    // ...
    'amount': amount,
    'remaining': remaining,
    'status': status,
    // ...
};
```

So sollten wir es **ab jetzt** machen:

```javascript
const amount = this.safeNumber (order, 'amount'); // internal string-layer
const remaining = this.safeString (order, 'remaining'); // internal string-layer
if (Precise.stringGt (remaining, '0')) { // internal string-layer
    status = 'open';
} else {
    status = 'closed';
}
// ...
return {
    // ...
    'amount': amount, // external layer, goes to the user
    'remaining': this.parseNumber (remaining), // external layer, goes to the user
    'status': status,
    // ...
};
```

In allem neuen Code aller Parser sollten wir durchgehend zeichenkettenbasierte Zahlen im Rumpf des Parsers verwenden. Außerdem sollten wir `parseNumber` als letzten Schritt zur Behandlung numerischer Werte hinzufügen, bevor das Ergebnis an den Aufrufer zurückgegeben wird. Die obigen zwei Codeausschnitte sind nur Beispiele, die die Verwendung von `Precise` mit `safeString` und `parseNumber` zeigen. Die eigentlichen Parser für Aufträge verwenden auch safeOrder-Methoden: https://github.com/ccxt/ccxt/pulls?q=safeOrder2.

Der Nutzer hat letztendlich die Möglichkeit zu wählen, welche Implementierung von parseNumber er verwenden möchte: diejenige, die Gleitkommazahlen zurückgibt, oder diejenige, die Zeichenketten zurückgibt. Auf diese Weise bleibt jeder zufrieden, und die Bibliothek funktioniert auf beide Arten ohne Breaking Changes.

Die Faustregel lautet: **`+` ist ausschließlich für die Zeichenkettenverkettung (!)** und **ALLE arithmetischen Operationen müssen `Precise` verwenden**.

#### Dezimalzahlen mit Präzision formatieren

Dieser Abschnitt behandelt den Teil der Anfragezusammenstellung. Die `.toFixed ()`-Methode hat [bekannte Rundungsfehler](https://www.google.com/search?q=toFixed+bug) in JavaScript, ebenso wie die anderen Rundungsmethoden in den anderen Sprachen. Um konsistent mit der Zahlenformatierung zu arbeiten, verwenden Sie die [`decimalToPrecision`-Methode, wie im Handbuch beschrieben](/docs/manual#methods-for-formatting-decimals).

#### Maskierte Steuerzeichen

Wenn Sie Zeichenketten mit Steuerzeichen wie `"\n"`, `"\t"` verwenden, schließen Sie diese immer in doppelte Anführungszeichen (`"`) ein, nicht in einfache (`'`)! Einfach angeführte Zeichenketten werden in vielen Sprachen außer TypeScript nicht auf Steuerzeichen geparst und als solche behandelt. Damit Tabulator- und Zeilenumbruchzeichen in PHP funktionieren, müssen wir sie daher mit doppelten Anführungszeichen umgeben (insbesondere in der `sign()`-Implementierung).

Schlecht:

```javascript
const a = 'GET' + method.toLowerCase () + '\n' + path;
const b = 'api\nfoobar.com\n';
```

Gut:

```javascript
const a = 'GET' + method.toLowerCase () + "\n" + path; // eslint-disable-line quotes
// eslint-disable-next-line quotes
const b = "api\nfoobar.com\n";
```

**↑ Die `eslint-*`-Kommentare sind obligatorisch!**

#### Verwendung ternärer Bedingungen

Verwenden Sie keine umfangreichen ternären (`?:`) Bedingungen, **verwenden Sie immer Klammern in ternären Operatoren!**

Obwohl die Programmiersprachen selbst eine Operatorrangfolge haben, ist der Transpiler auf regulären Ausdrücken basiert und führt keine Code-Introspektion durch, weshalb er alles als reinen Text behandelt.

Die Klammern sind erforderlich, um dem Transpiler anzuzeigen, welcher Teil der Bedingung welcher ist. Ohne Klammern ist es schwer, die Zeile und die Absicht des Entwicklers zu verstehen.

Hier sind einige Beispiele für schlecht gestalteten Code, der den Transpiler zum Scheitern bringt:

```javascript
// this is an example of bad code style that will likely break the transpiler
const foo = {
   'bar': 'a' + qux === 'baz' ? this.a () : this.b () + 'b',
};
```

```javascript
// this confuses the transpiler and a human developer as well
const foo = 'bar' + baz + qux ? 'a' : '' + this.c ();
```

Das Hinzufügen von umschließenden Klammern zu den entsprechenden Teilen wäre eine mehr oder weniger korrekte Lösung.

```javascript
const foo = {
   'bar': (qux === 'baz') ? this.a () : this.b (), // much better now
};
```

Die universell funktionierende Lösung besteht darin, die komplexe Zeile in einige einfachere Zeilen aufzuteilen, auch wenn dies zusätzliche Zeilen und Bedingungen erfordert:

```javascript
// before:
// const foo = {
//    'bar': 'a' + qux === 'baz' ? this.a () : this.b () + 'b',
// };
// ----------------------------------------------------------------------------
// after:
const bar = (qux === 'baz') ? this.a () : this.b ();
const foo = {
   'bar': 'a' + bar + 'b',
};
```

Oder sogar:

```javascript
// before:
// const foo = 'bar' + baz + qux ? 'a' : '' + this.c ();
// ----------------------------------------------------------------------------
// after:
let foo = 'bar' + baz;
if (qux) {
   foo += 'a';
};
foo += this.c ();
```

---

### Neue Exchange-Integrationen

**DENKEN SIE DARAN:** Der Hauptgrund, warum diese Bibliothek überhaupt verwendet wird, ist **Vereinheitlichung**. Beim Entwickeln einer neuen Exchange-Datei besteht das Ziel nicht darin, sie irgendwie zu implementieren, sondern sie auf eine sehr pedantische, präzise und exakte Weise zu implementieren, genau wie die anderen Exchanges implementiert sind. Dazu müssen wir Teile der Logik von anderen Exchanges kopieren und sicherstellen, dass die neue Exchange dem Handbuch in den folgenden Aspekten entspricht:

- Markt-IDs, Handelspaar-Symbole, Währungs-IDs, Token-Codes, symbolische Vereinheitlichung und `commonCurrencies` müssen in allen Parsing-Methoden standardisiert sein (`fetchMarkets`, `fetchCurrencies`, `parseTrade`, `parseOrder`, ...)
- alle vereinheitlichten API-Methodennamen und -argumente sind standardisiert – sie können nicht frei hinzugefügt oder geändert werden
- alle Parser-Eingaben müssen `safe`-bereinigt werden, wie [oben beschrieben](#sanitizing-input-with-safe-methods)
- für Massenoperationen sollten die Basismethoden verwendet werden (`parseTrades`, `parseOrders`, beachten Sie das Plural-`s`)
- nutzen Sie so viel Basisfunktionalität wie möglich, erfinden Sie weder das Rad noch das Fahrrad noch das Fahrradrad neu
- respektieren Sie Standard-Argumentwerte in `fetch`-Methoden, prüfen Sie, ob `since` und `limit` `undefined` sind, und senden Sie sie nicht an die Exchange – in solchen Fällen verwenden wir absichtlich die Standardwerte der Exchanges
- wenn Sie eine vereinheitlichte Methode implementieren, die einige Argumente hat – wir können keines dieser Argumente ignorieren oder auslassen
- alle von den vereinheitlichten Methoden zurückgegebenen Strukturen müssen ihren Spezifikationen aus dem Handbuch entsprechen
- alle API-Endpunkte müssen mit ordnungsgemäßer Unterstützung für in den URLs substituierte Parameter aufgelistet werden

Bitte lesen Sie das folgende Dokument für neue Integrationen: /docs/requirements

Ein schnelles Zusammenführen eines Pull Requests für eine neue Exchange-Integration hängt von der Konsistenz und Einhaltung der oben genannten vereinheitlichten Regeln und Standards ab. Das Verletzen einer dieser Regeln ist der Hauptgrund dafür, dass ein Pull Request nicht zusammengeführt wird.

**Wenn Sie eine weitere Exchange hinzufügen (unterstützen) oder eine neue Methode für eine bestimmte Exchange implementieren möchten, ist der beste Weg, es zu einer konsistenten Verbesserung zu machen, aus Beispielen zu lernen. Sehen Sie sich an, wie gleiche Dinge in anderen Exchanges implementiert sind (wir empfehlen zertifizierte Exchanges) und versuchen Sie, den Codefluss und -stil zu kopieren.**

Das grundlegende JSON-Skelett für eine neue Exchange-Integration sieht wie folgt aus:

```
{
   'id': 'example',
   'name': 'Example Exchange',
   'country': [ 'US', 'EU', 'CN', 'RU' ],
   'rateLimit': 1000,
   'version': '1',
   'comment': 'This comment is optional',
   'urls': {
      'logo': 'https://example.com/image.jpg',
      'api': 'https://api.example.com/api',
      'www': 'https://www.example.com',
      'doc': [
         'https://www.example.com/docs/api',
         'https://www.example.com/docs/howto',
         'https://github.com/example/docs',
      ],
   },
   'api': {
      'public': {
         'get': [
            'endpoint/example',
            'orderbook/{pair}/full',
            '{pair}/ticker',
         ],
      },
      'private': {
         'post': [
            'balance',
         ],
      },
   },
}
```

### Implizite API-Methoden

Im Code für jede Exchange werden Sie feststellen, dass die Funktionen, die API-Anfragen stellen, nicht explizit definiert sind. Das liegt daran, dass die `api`-Definition im Exchange-Beschreibungs-JSON verwendet wird, um *magische Funktionen* (auch bekannt als *partielle Funktionen* oder *Closures*) innerhalb der Exchange-Unterklasse zu erstellen. Diese implizite Einspeisung erfolgt durch die `defineRestApi/define_rest_api`-Basismethode der Exchange.

Jede partielle Funktion nimmt ein Wörterbuch von `params` entgegen und gibt die API-Antwort zurück. Im obigen JSON-Beispiel führt `'endpoint/example'` zur Einspeisung einer `this.publicGetEndpointExample`-Funktion. Ebenso führt `'orderbook/{pair}/full'` zu einer `this.publicGetOrderbookPairFull`-Funktion, die einen ``pair``-Parameter entgegennimmt (wiederum im `params`-Argument übergeben).

Bei der Instanziierung nimmt die Exchange-Basisklasse jede URL aus ihrer Liste von Endpunkten, teilt sie in Wörter auf und bildet dann aus diesen Wörtern mithilfe eines partiellen Konstrukts einen aufrufbaren Funktionsnamen. Dieser Vorgang ist in JS, Python und PHP gleich. Er wird auch hier beschrieben:

- /docs/manual#api-methods--endpoints
- /docs/manual#implicit-api-methods
- https://github.com/ccxt-dev/ccxt/wiki/Manual#api-method-naming-conventions

``` CONSTRUCTION```

### Docstrings

- wenn eine Methode einen weiteren Parameter als Eigenschaft von params entgegennimmt (z. B. `params['something']`), fügen Sie diesen Parameter dem Docstring hinzu, als params.something
   - wenn dieser Parameter erforderlich ist, ist der Typ `{str}`, `{int}`, `{etc}`, wenn er optional ist, ist der Typ `{str|undefined}`, `{int|undefined}`, `{etc|undefined}`
- wenn der Standardwert eines Parameters `undefined` ist, aber die Methode etwas wie `if (symbol === undefined) { throw new ArgumentsRequired('...')}` enthält, dann setzen Sie den Typ dieses Parameters auf `{str}`, `{int}`, `{etc}`. Wenn kein Fehler ausgelöst wird, ist der Typ `{str|undefined}`, `{int|undefined}`, `{etc|undefined}`
- wenn eine Methode einen der vereinheitlichten Parameter nicht verwendet, setzen Sie die Beschreibung dieses Parameters auf `not used by exchange_name.method_name ()` (ersetzen Sie `exchange_name` und `method_name` durch die echten Exchange- und Methodennamen)
- wenn die Methode andere spezielle Anwendungsfälle hat, fügen Sie diese in die Beschreibung des Docstrings ein; diese Fälle können auch im Klassen-Docstring enthalten sein

### Kontinuierliche Integration

Builds werden mit [Travis CI](https://app.travis-ci.com/github/ccxt/ccxt) automatisiert. Die Build-Schritte für Travis CI sind in der [`.travis.yml`](https://github.com/ccxt/ccxt/blob/master/.travis.yml)-Datei beschrieben.

Windows-Builds werden mit [Appveyor](https://ci.appveyor.com/project/ccxt/ccxt) automatisiert. Die Build-Schritte für Appveyor befinden sich in der [`appveyor.yml`](https://github.com/ccxt/ccxt/blob/master/appveyor.yml)-Datei.

Eingehende Pull Requests werden automatisch vom CI-Dienst validiert. Sie können den Build-Prozess hier online verfolgen: [app.travis-ci.com/github/ccxt/ccxt/builds](https://app.travis-ci.com/github/ccxt/ccxt/builds).

### Wie man auf dem lokalen Rechner baut und Tests ausführt

### Offline-Tests
CCXT verfügt über verschiedene Offline-Tests, die sicherstellen, dass wir beim Hinzufügen einer neuen Funktion oder beim Beheben eines Fehlers keine Regressionen einführen. Sie sind mühelos und schnell auszuführen (da sie keinen Zugriff auf die Exchanges erfordern) und sollten daher Teil unseres Entwicklungsablaufs bei CCXT sein.


Sie umfassen die Basistests (Präzision, Krypto, Orderbuch usw.) und statische Tests (Anfrage/Antwort).

Diese Tests befinden sich im Ordner `ts/src/test/base/functions/`; der größte Teil ihres Inhalts ist automatisch in jede Sprache transpilierbar; daher gelten dieselben Code-Konventionen.

Sie können sie ausführen mit: `npm run test-base` und `npm run-test-ws`

Statische Tests sind ebenfalls offline, funktionieren aber anders, da sie einen vereinheitlichten ccxt-Aufruf (createOrder/fetchTickers/usw.) emulieren und die Server-Antwort mocken und/oder die Gültigkeit der generierten HTTP-Anfrage überprüfen.

**Anfrage-statisch**:
- Sie emulieren die HTTP-Anfrage, stoppen sie, bevor sie versucht, eine Verbindung herzustellen, und überprüfen, dass URL/Body korrekt geformt sind.

Ordner: `ts/src/test/static/request/`

Sie können einen statischen Anfrage-Test erstellen, indem Sie diesen Befehl ausführen und das Ergebnis in die entsprechende Datei einfügen (z. B.: `static/request/binance.json`)

```bash
node cli.js binance fetchTrades "BTC/USDT:USDT" --report
````


**Antwort-statisch**
- Emuliert eine gemockte Antwort vom Server und überprüft, dass CCXT die rohe HTTP-Antwort korrekt parst.

Ordner: `ts/src/test/static/response/binance.json`

Sie können einen statischen Antwort-Test erstellen, indem Sie diesen Befehl ausführen und das Ergebnis in die entsprechende Datei einfügen (z. B.: `static/response/binance.json`)

```bash
node cli.js binance fetchTrades "BTC/USDT:USDT"  undefined 1 --response
````
#### Exchange-Anmeldeinformationen hinzufügen

CCXT verfügt über Tests sowohl für die öffentliche API als auch für die private authentifizierte API. Standardmäßig testet CCXTs integrierte Tests nur die öffentlichen APIs, da das Code-Repository nicht die [API-Schlüssel](/docs/manual#authentication) enthält, die für die privaten API-Tests erforderlich sind. Außerdem verändern die enthaltenen privaten Tests den Kontostand in keiner Weise – alle Tests sind nicht-invasiv. Um private API-Tests zu aktivieren, müssen die API-Schlüssel konfiguriert werden. Das kann entweder in `keys.local.json` oder mit den `env`-Variablen erfolgen.

##### API-Schlüssel und Optionen in `keys.local.json` konfigurieren

Exchange-API-Schlüssel können der `keys.local.json` im Stammordner des Repositorys hinzugefügt werden. Falls sie auf Ihrer Seite nicht existiert – erstellen Sie sie zuerst. Diese Datei ist in `.gitignore` und in `.npmignore` aufgeführt. Sie können Exchange-Anmeldeinformationen und verschiedene Optionen für verschiedene Exchanges zur `keys.local.json`-Datei hinzufügen.

Ein Beispiel für eine `keys.local.json`-Datei:

```json
{
    "okx": {
        "apiKey": "XXX",
        "secret": "YYY"
    },
    "binance": {
        "apiKey": "XXX",
        "secret": "YYY",
        "options": {
            "some-option": "some value"
        }
    },
    // ...
}
```

##### API-Schlüssel als Umgebungsvariablen konfigurieren

Sie können API-Schlüssel auch als `env`-Variablen definieren:

- https://www.google.com/search?q=set+env+variable+linux
- https://www.google.com/search?q=set+env+variable+mac
- https://www.google.com/search?q=set+env+variable+windows

Konsultieren Sie die Dokumentation Ihres Betriebssystems und Ihrer Shell, um zu erfahren, wie Sie eine Umgebungsvariable setzen. Meistens funktioniert ein `set`-Befehl oder ein `export`-Befehl. Der `env`-Befehl kann helfen, die bereits gesetzten Umgebungsvariablen zu überprüfen.

Beispiele für `env`-Variablen: `BINANCE_APIKEY`, `BINANCE_SECRET`, `KRAKEN_APIKEY`, `KRAKEN_SECRET`, usw.

#### Bauen

Installieren Sie vor dem ersten Build die Node-Abhängigkeiten (überspringen Sie diesen Schritt, wenn Sie unser Docker-Image verwenden):

```
npm install
```

Der folgende Befehl baut alles und generiert PHP/Python-Versionen aus den TS-Quelldateien:

```
npm run build
```

#### Tests

Der folgende Befehl testet die erstellten generierten Dateien (für alle Börsen, Symbole und Sprachen):

```
node run-tests
```

Sie können Tests auf eine bestimmte Sprache, eine bestimmte Börse oder ein bestimmtes Symbol einschränken:

```
node run-tests [--js] [--python] [--python-async] [--php] [--php-async] [exchange] [symbol]
```

Der Befehl `node run-tests exchangename` versucht 5 Tests: `js`, `python`, `python-async`, `php`, `php-async`. Dies können Sie wie folgt steuern:

```
node run-tests exchange --js
node run-tests exchange --js --python-async
node run-tests exchange --js --php
node run-tests exchange --python --python-async
...
```

Wenn das jedoch fehlschlägt, müssen Sie möglicherweise eine Ebene tiefer gehen und sprachspezifische Tests ausführen, um zu sehen, was genau falsch ist:

```
node js/test/test exchange --verbose
python3 python/ccxt/test/test_sync.py exchange --verbose
python3 python/ccxt/test/test_async.py exchange --verbose
php -f php/test/test_sync.php exchange --verbose
php -f php/test/test_async.php exchange --verbose
```

`test_sync` ist lediglich eine synchrone Version von `test_async`, daher reicht es in den meisten Fällen aus, einfach `test_async.py` und `test_async.php` auszuführen:

```
node js/test/test exchange --verbose
python3 python/ccxt/test/test_async.py exchange --verbose
php -f php/test/test_async.php exchange --verbose
```

Wenn alle sprachspezifischen Tests funktionieren, wird auch `node run-tests` erfolgreich sein. Um diese Tests auszuführen, sollten Sie sicherstellen, dass der Build erfolgreich abgeschlossen wurde.

Zum Beispiel testet die erste der folgenden Zeilen nur die JS-Quellversion der Bibliothek (`ccxt.js`). Sie erfordert kein `npm run build` vor dem Ausführen (kann nützlich sein, wenn Sie schnell überprüfen müssen, ob Ihre Änderungen den Code beschädigen oder nicht):

```bash

node run-tests --js                  # test master ccxt.js, all exchanges

# other examples require the 'npm run build' to run

node run-tests --python              # test Python sync version, all exchanges
node run-tests --php bitfinex        # test Bitfinex with PHP
node run-tests --python-async kraken # test Kraken with Python async test, requires 'npm run build'
```

#### Tests schreiben

Folgen Sie diesen Schritten, um einen Test hinzuzufügen:

- Erstellen Sie eine Datei in [ts/tests/Exchange](https://github.com/ccxt/ccxt/tree/master/ts/test/Exchange) mit einer Syntax, die transpiliert werden kann.
- Fügen Sie den Test zu `runPrivateTests` oder `runPublicTests` in [ts/src/test/tests.ts](https://github.com/ccxt/ccxt/blob/master/ts/src/test/tests.ts#L354) hinzu oder für CCXT Pro-Endpunkte in [ts/src/pro/test/tests.ts](https://github.com/ccxt/ccxt/blob/master/ts/src/pro/test/tests.ts#L121)
- Führen Sie `npm run transpile` aus, um die Testdatei in JavaScript, Python und PHP zu generieren.
- Rufen Sie Tests auf: `node run-tests`

## Änderungen in das Repository einpflegen

Der Build-Prozess erzeugt viele Änderungen in den transpilierten Börsen-Dateien, z. B. für Python und PHP. **Sie sollten diese NICHT auf GitHub einpflegen, bitte committen Sie nur die Änderungen an den Basis-Dateien (TS)**.

## Finanzielle Beiträge

Wir freuen uns auch über finanzielle Beiträge in voller Transparenz auf unserem [Open Collective](https://opencollective.com/ccxt).

## Danksagungen

### Mitwirkende

Vielen Dank an alle, die bereits zu CCXT beigetragen haben!

<a href="https://github.com/ccxt/ccxt/graphs/contributors"><img src="https://opencollective.com/ccxt/contributors.svg?width=890" /></a>

### Unterstützer

Vielen Dank an alle unsere Unterstützer! [[Unterstützer werden](https://opencollective.com/ccxt#backer)]

<a href="https://opencollective.com/ccxt#backers" target="_blank"><img src="https://opencollective.com/ccxt/backers.svg?width=890"></a>

### Förderer

Unterstützen Sie dieses Projekt, indem Sie Förderer werden. Ihr Avatar wird hier mit einem Link zu Ihrer Website angezeigt.

[[Förderer werden](https://opencollective.com/ccxt#supporter)]

<a href="https://opencollective.com/ccxt/tiers/supporter/0/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/0/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/1/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/1/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/2/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/2/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/3/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/3/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/4/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/4/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/5/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/5/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/6/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/6/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/7/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/7/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/8/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/8/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/9/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/9/avatar.svg"></a>

### Sponsoren

Vielen Dank an alle unsere Sponsoren! (Bitten Sie Ihr Unternehmen, dieses Open-Source-Projekt ebenfalls zu unterstützen, indem es [Sponsor wird](https://opencollective.com/ccxt#sponsor))

[[Sponsor werden](https://opencollective.com/ccxt#sponsor)]

<a href="https://opencollective.com/ccxt/tiers/sponsor/0/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/1/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/2/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/3/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/4/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/5/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/6/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/7/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/8/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/9/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/9/avatar.svg"></a>
