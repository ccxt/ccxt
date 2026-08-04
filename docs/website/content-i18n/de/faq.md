---
title: "FAQ"
description: "Wenn Ihre Frage so kurz formuliert ist wie die obige, werden wir nicht helfen. Wir unterrichten kein Programmieren. Wenn Sie das…"
---

# Häufig gestellte Fragen


  ## Ich versuche, den Code auszuführen, aber er funktioniert nicht – wie behebe ich das?

  Wenn Ihre Frage so kurz formuliert ist wie die obige, werden wir nicht helfen. Wir unterrichten kein Programmieren. Wenn Sie das [Handbuch](/docs) nicht lesen und verstehen können oder den Anleitungen aus der [CONTRIBUTING](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md)-Dokumentation zum Melden eines Problems nicht präzise folgen können, werden wir ebenfalls nicht helfen. Lesen Sie die CONTRIBUTING-Anleitungen zum Melden von Problemen und lesen Sie das Handbuch. Sie sollten das Geld und die Zeit anderer nicht riskieren, ohne das gesamte Handbuch sehr sorgfältig gelesen zu haben. Sie sollten nichts riskieren, wenn Sie nicht gewohnt sind, viel mit vielen Details zu lesen. Wenn Sie außerdem kein Vertrauen in die Programmiersprache haben, die Sie verwenden, gibt es viel bessere Orte für grundlegende Programmierkenntnisse und -übungen. Suchen Sie nach `python tutorials`, `js videos`, spielen Sie mit Beispielen – so arbeiten sich andere Menschen die Lernkurve hinauf. Keine Abkürzungen, wenn Sie etwas lernen wollen.

  ## Was ist erforderlich, um Hilfe zu erhalten?

  Wenn Sie eine Frage stellen:

  - Nutzen Sie zuerst die Suchfunktion nach Duplikaten!
  - **Posten Sie Ihre Anfrage und Antwort im `verbose`-Modus!** Fügen Sie `exchange.verbose = true` direkt vor der Zeile ein, mit der Sie Probleme haben, und kopieren Sie, was Sie auf Ihrem Bildschirm sehen. Das steht überall geschrieben und erwähnt, im [Troubleshooting](/docs/manual#troubleshooting)-Abschnitt, in der [README](https://github.com/ccxt/ccxt/blob/master/README.md) und in vielen Antworten auf ähnliche Fragen unter [früheren Issues](https://github.com/ccxt/ccxt/issues) und [Pull Requests](https://github.com/ccxt/ccxt/pulls). Keine Ausreden. Die ausführliche Ausgabe sollte sowohl die Anfrage als auch die Antwort der Börse enthalten.
  - Fügen Sie den vollständigen Fehler-Callstack bei!
  - Schreiben Sie Ihre Programmiersprache **und die Versionsnummer der Sprache**
  - Schreiben Sie die CCXT / CCXT Pro-Bibliotheksversionsnummer
  - Welche Börse es ist
  - Welche Methode Sie aufzurufen versuchen

  - **Posten Sie Ihren Code**, um das Problem zu reproduzieren. Machen Sie daraus ein vollständiges, kurzes, ausführbares Programm, lassen Sie keine Zeilen weg und machen Sie es so kompakt wie möglich (5–10 Codezeilen), einschließlich des Codes zur Instanziierung der Börse. Entfernen Sie alle irrelevanten Teile und lassen Sie nur das Wesentliche des Codes zur Reproduktion des Problems übrig.
    - **POSTEN SIE KEINE SCREENSHOTS VON CODE ODER FEHLERN, POSTEN SIE DIE AUSGABE UND DEN CODE ALS KLARTEXT!**
    - **Umschließen Sie Code und Ausgabe mit dreifachen Backticks: &#096;&#096;&#096;GUT&#096;&#096;&#096;**.
    - Verwechseln Sie das Backtick-Symbol (&#096;) nicht mit dem Anführungszeichen (\'): '''SCHLECHT'''
    - Verwechseln Sie keinen einzelnen Backtick mit dreifachen Backticks: &#096;SCHLECHT&#096;

  - **POSTEN SIE NICHT IHREN `apiKey` UND IHR `secret`!** Halten Sie diese sicher (entfernen Sie sie vor dem Posten)!

  ## Ich rufe eine Methode auf und erhalte einen Fehler – was mache ich falsch?

  Sie melden das Problem nicht ordnungsgemäß ) Bitte helfen Sie der Community, Ihnen zu helfen ) Lesen Sie dies und befolgen Sie die Schritte: https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue. Noch einmal: Ihr Code zur Reproduktion des Problems und Ihre ausführliche Anfrage und Antwort **SIND ERFORDERLICH**. *Nur der Fehler-Traceback, oder nur die Antwort, oder nur die Anfrage, oder nur der Code – reicht nicht aus!*

  ## Ich habe ein falsches Ergebnis von einem Methodenaufruf erhalten – können Sie helfen?

  Im Grunde dieselbe Antwort wie bei der vorherigen Frage. Lesen Sie und befolgen Sie **genau**: https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue. Noch einmal: Ihr Code zur Reproduktion des Problems und Ihre ausführliche Anfrage und Antwort **SIND ERFORDERLICH**. *Nur der Fehler-Traceback, oder nur die Antwort, oder nur die Anfrage, oder nur der Code – reicht nicht aus!*

  ## Können Sie Funktion `foo` für Börse `bar` implementieren?

  Ja, das können wir. Und wir werden es tun, wenn niemand anderes es vor uns tut. Es hat wenig Sinn, diese Art von Fragen zu stellen, da die Antwort immer positiv ist. Wenn jemand fragt, ob wir dies oder das tun können, geht es nicht um unsere Fähigkeiten – es läuft alles auf die Zeit und das Management hinaus, die für die Implementierung aller angesammelten Funktionsanfragen benötigt werden.

  Außerdem ist dies eine Open-Source-Bibliothek, die sich in Entwicklung befindet. Das bedeutet, dass dieses Projekt von der Gemeinschaft der Nutzer, die es verwenden, entwickelt werden soll. Was Sie fragen, ist nicht, ob wir es implementieren können oder nicht – tatsächlich sagen Sie uns, dass wir diese bestimmte Aufgabe erledigen sollen, und das ist nicht das, wie wir eine freiwillige Zusammenarbeit sehen. Ihre Beiträge, PRs und Commits sind willkommen: https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code.

  Wir geben keine Versprechen oder Schätzungen für kostenlose Open-Source-Arbeit. Wenn Sie die Umsetzung beschleunigen möchten, wenden Sie sich gerne an uns unter info@ccxt.trade.

  ## Wann werden Sie Funktion `foo` für Börse `bar` hinzufügen? Wie lautet die geschätzte Zeit? Wann können wir damit rechnen?

  Wir geben keine Versprechen oder Schätzungen für Open-Source-Arbeit. Die Begründung dafür ist im vorherigen Absatz erklärt.

  ## Wann werden Sie die Unterstützung für eine in den Issues angeforderte Börse hinzufügen?

  Auch hier können wir keine Termine für das Hinzufügen dieser oder jener Börse versprechen, aus den oben genannten Gründen. Die Antwort wird immer dieselbe bleiben: _so bald wie möglich_.

  ## Wie lange soll ich warten, bis eine Funktion hinzugefügt wird? Ich muss entscheiden, ob ich sie selbst implementieren oder auf das CCXT-Entwicklungsteam warten soll.

  Bitte implementieren Sie es selbst, warten Sie nicht auf uns. Wir werden es so bald wie möglich hinzufügen. Außerdem sind Ihre Beiträge sehr willkommen:

  - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

  ## Wie ist Ihr Fortschritt beim Hinzufügen der Funktion `foo`, die früher angefragt wurde? Wie läuft die Implementierung der Börse `bar`?

  Diese Art von Fragen ist in der Regel Zeitverschwendung, da die Beantwortung meist zu viel Zeit für den Kontextwechsel erfordert – und es oft mehr Zeit kostet, diese Frage zu beantworten, als tatsächlich die Anfrage mit Code für eine neue Funktion oder eine neue Börse zu erfüllen. Der Fortschritt dieses Open-Source-Projekts ist ebenfalls offen, sodass Sie jederzeit in der Commit-Historie nachschauen können, wie es läuft.

  ## Was ist der Status dieses PR? Gibt es Neuigkeiten?

  Wenn er nicht gemergt ist, bedeutet das, dass der PR Fehler enthält, die zuerst behoben werden müssen. Wenn er so gemergt werden könnte – würden wir ihn mergen, und Sie hätten diese Frage gar nicht erst gestellt. Der häufigste Grund für das Nicht-Mergen eines PR ist ein Verstoß gegen eine der [CONTRIBUTING-Richtlinien](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes). Diese Richtlinien sollten wörtlich genommen werden – wenn Sie möchten, dass Ihr PR schnell gemergt wird, darf keine einzige Zeile oder kein einziges Wort übersprungen werden. Code-Beiträge, die gegen keine Richtlinien verstoßen, werden fast sofort gemergt (in der Regel innerhalb von Stunden).

  ## Können Sie die Fehler oder das, was ich in meinem PR bearbeiten soll, aufzeigen, damit er in den Master-Branch gemergt wird?

  Leider haben wir nicht immer die Zeit, jeden einzelnen Fehler im Code, der das Mergen verhindert, schnell aufzulisten. Es ist oft einfacher und schneller, den Fehler direkt zu beheben, als zu erklären, was jemand tun sollte, um ihn zu beheben. Die meisten davon sind bereits in den [CONTRIBUTING-Richtlinien](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes) skizziert. Die wichtigste Grundregel ist, **alle Richtlinien wörtlich** zu befolgen.

  ## Hey! Der Fix, den Sie hochgeladen haben, ist in TypeScript – würden Sie bitte auch JavaScript / Python / PHP beheben?

  Unser Build-System generiert automatisch börsenspezifischen JavaScript-, Python-, PHP-, C#-, Go- und Java-Code für uns, der also aus TypeScript transpiliert wird, sodass es nicht notwendig ist, alle Sprachen einzeln nacheinander zu beheben.

  Wenn es also in TypeScript behoben ist, ist es auch in JavaScript NPM, Python pip, PHP Composer, C# NuGet, Go und Java behoben. Der automatische Build dauert in der Regel 15–20 Minuten. Aktualisieren Sie einfach Ihre Version mit `npm`, `pip` oder `composer` **nachdem die neue Version erschienen ist**, und alles ist in Ordnung.

  Mehr dazu hier:

  - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support
  - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#transpiled-generated-files


  ## Wie erstelle ich eine Order mit takeProfit+stopLoss?
  Einige Börsen unterstützen `createOrder` mit den zusätzlichen „angehängten" `stopLoss`- und `takeProfit`-Unterorders – siehe [StopLoss- und TakeProfit-Orders, die einer Position angehängt sind](/docs/manual#stoploss-and-takeprofit-orders-attached-to-a-position). 
  Jedoch unterstützen manche Börsen diese Funktion möglicherweise nicht, und Sie müssen separate `createOrder`-Methoden ausführen, um eine bedingte Order (z. B. ***Trigger-Order | StopLoss-Order | TakeProfit-Order**) zu der bereits offenen Position hinzuzufügen – siehe [Bedingte Orders](/docs/manual#conditional-orders).
  Sie können dies auch prüfen, indem Sie `exchange.has['createOrderWithTakeProfitAndStopLoss']`, `exchange.has['createStopLossOrder']` und `exchange.has['createTakeProfitOrder']` betrachten, jedoch sind diese nicht so präzise wie die `.features`-Eigenschaft.

  ## Was ist der Unterschied zwischen `takeProfit/stopLoss`- und `takeProfitPrice/stopLossPrice`-Orders

  Bei CCXT unterscheiden wir zwischen mehreren Arten von takeProfit/stopLoss-Orders. Wenn Sie eine Order aufgeben möchten, die eine Position eröffnet und gleichzeitig eine Take-Profit- oder Stop-Loss-Order innerhalb derselben Anfrage anhängt (sofern die Börse diese Funktion unterstützt), sollten Sie die `takeProfit/stopLoss`-Syntax verwenden.
  Wir bezeichnen diese angehängten TP/SL-Orders als **Typ 3**.

  Beispiel:
  ```python
    params = {
      'stopLoss': {
          'triggerPrice': 12.34,  # at what price it will trigger
          'price': 12.00,  # if exchange supports, 'price' param would be limit price (for market orders, don't include this param)
        },
        'takeProfit': {
            # similar params here
        }
    }
    order = exchange.create_order ('SOL/USDT', 'limit', 'buy', 0.5, 13, params)
  ```

  Wenn die Börse diese angehängten Orders nicht unterstützt oder Sie eine unabhängige Order aufgeben möchten, die als Stop-Loss/Take-Profit-Order fungiert, können Sie eine `stopLossPrice`- **oder** `takeProfitPrice`-Order aufgeben; wir nennen diese unabhängigen SL/TP-Orders **Typ 2**.

  Beispiel
  ```python
      symbol = 'ADA/USDT:USDT'
      main_order = await binance.create_order(symbol, 'market', 'buy', 50) # open position
      tp_order = await binance.create_order(symbol, 'limit', 'sell', 50, 1.5, {"takeProfitPrice": 1.6}) # take profit order
      sl_order = await binance.create_order(symbol, 'limit', 'sell', 50, 0.24, {"stopLossPrice": 0.25}) # stop loss order
  ```

 ## Wie funktionieren Trailing-Orders?
  Einige Börsen unterstützen die Verwendung von `createOrder` zur Erstellung einer `trailingPercent`- oder `trailingAmount`-Order – siehe: [Trailing-Orders](/docs/manual#trailing-orders)
  
  Trailing-Orders folgen dem aktuellen Marktpreis entweder um einen Prozentsatz oder einen Quotenbetrag. Die Order verfolgt in eine Richtung, aber nicht die andere, sodass sie schließlich ausgeführt werden kann. Die ausgeführte Order kann eine Market-Order oder eine Limit-Order sein. Eine Trailing-Order kann in der Regel zum Öffnen einer Position platziert werden oder in Kombination mit dem auf `true` gesetzten Parameter `reduceOnly`, um eine Position zu schließen. Diese Details darüber, welche Orders erlaubt sind, hängen von der Börse ab. Trailing-Orders unterstützen häufig einen `trailingTriggerPrice`-Parameter, und wenn der aktuelle Marktpreis diesen Wert überschreitet, wird die durch `trailingPercent` oder `trailingAmount` festgelegte Trailing-Funktion gestartet.
  
  Einige Börsen unterstützen diese Trailing-Funktion möglicherweise nicht. Sie können die `.features`-Eigenschaft überprüfen. Sie können auch prüfen, ob `createOrder` bei der von Ihnen verwendeten Börse `trailingPercent` oder `trailingAmount` als verfügbaren Parameter im Docstring hat. Einige Börsen haben möglicherweise `exchange.has['createTrailingPercentOrder']` oder `exchange.has['createTrailingAmountOrder']` auf `true` gesetzt, was signalisiert, dass die Parameter `trailingPercent` oder `trailingAmount` in `createOrder` verfügbar sind.

Beispiele für das Erstellen von `trailingPercent`- und `trailingAmount`-Orders:
  ```python
    params = {
      'trailingPercent': 1.0, # percentage away from the current market price, 1.0 means 1%
      # 'trailingAmount': 100.0, # quote amount away from the current market price, for a SOL/USDT pair this is 100 USDT away from the current market price.
      # 'trailingTriggerPrice': 44500.0, # the price to trigger activating a trailing stop order
      'reduceOnly': True, # set to true if you want to close a position, set to false if you want to open a new position
    }
    order = exchange.create_order ('SOL/USDT:USDT', 'market', 'sell', 0.5, None, params)
  ```
  ```python
    trailingAmount = 100.0
    trailingTriggerPrice = 115.0
    params = {
        'reduceOnly': True,
    }
    order = exchange.create_trailing_amount_order ('SOL/USDT:USDT', 'market', 'sell', 0.5, None, trailingAmount, trailingTriggerPrice, params)
  ```
  ```python
    trailingPercent = 1.0
    trailingTriggerPrice = 115.0
    params = {
        'reduceOnly': False,
    }
    order = exchange.create_trailing_percent_order ('SOL/USDT:USDT', 'limit', 'buy', 0.5, 13, trailingPercent, trailingTriggerPrice, params)
  ```

  ## Wie erstelle ich einen Spot-Market-Buy mit Kosten?
  Um eine Market-Buy-Order mit Kosten zu erstellen, müssen Sie zunächst prüfen, ob die Börse diese Funktion unterstützt (`exchange.has['createMarketBuyOrderWithCost']).
  Falls ja, können Sie die Methode `createMarketBuyOrderWithCost` verwenden.
  Beispiel:
  ```python
  order = await exchange.createMarketBuyOrderWithCost(symbol, cost)
  ```

## Was bedeutet die Option `createMarketBuyRequiresPrice`?

Viele Börsen verlangen, dass der Betrag bei Spot-Market-Buy-Orders in der Quotierungswährung angegeben wird (sie akzeptieren keinen Basisbetrag). In diesen Fällen hat die Börse die Option `createMarketBuyRequiresPrice` auf `true` gesetzt.

Beispiel: Wenn Sie BTC/USDT mit einer Market-Buy-Order kaufen möchten, müssen Sie einen Betrag = 5 USDT statt 0,000X angeben. Es gibt eine Prüfung, um Fehler zu vermeiden, die explizit den Preis erfordern, da Benutzer den Betrag normalerweise in der Basiswährung angeben.

Standardmäßig wird daher `create_order(symbol, 'market,' 'buy,' 10)` einen Fehler auslösen, wenn die Börse diese Option hat (`createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false...`).

Wenn die Börse die Kosten verlangt und der Benutzer den Basisbetrag angegeben hat, müssen wir einen zusätzlichen Parameter **price** anfordern und diesen multiplizieren, um die Kosten zu erhalten. Wenn Sie sich dieses Verhaltens bewusst sind, können Sie `createMarketBuyRequiresPrice` einfach deaktivieren und die Kosten im Betrag-Parameter übergeben. Das Deaktivieren bedeutet jedoch nicht, dass Sie die Order mit dem Basisbetrag statt dem Quotierungsbetrag aufgeben können.

Wenn Sie `create_order(symbol, 'market', 'buy', 0.001, 20000)` ausführen, verwendet ccxt den angeforderten Preis zur Berechnung der Kosten durch `0.01*20000` und sendet diesen Wert an die Börse.

Wenn Sie die Kosten direkt im Betrag-Argument angeben möchten, können Sie `exchange.options['createMarketBuyOrderRequiresPrice'] = False` setzen (Sie bestätigen damit, dass der Betrag die Kosten für den Market-Buy sind) und dann `create_order(symbol, 'market', 'buy', 10)` ausführen.

Dies dient im Wesentlichen dazu, zu verhindern, dass ein Benutzer folgendes tut: `create_order('SHIB/USDT', market, buy, 1000000)` und denkt, er versucht 1 Million SHIB zu kaufen, während er in Wirklichkeit SHIB im Wert von 1 Million USDT kauft. Aus diesem Grund akzeptiert ccxt standardmäßig immer die Basiswährung im Betrag-Parameter.

Alternativ können Sie die Funktionen `createMarketBuyOrderWithCost`/ `createMarketSellOrderWithCost` verwenden, sofern sie verfügbar sind.

  Mehr dazu: [Market Buys](/docs/manual#market-buys)

  ## Was ist der Unterschied zwischen Spot- und Swap-/Perpetual-Futures-Handel?
  Beim Spot-Handel werden Finanzinstrumente (wie Kryptowährungen) zur sofortigen Lieferung gekauft oder verkauft. Es ist unkompliziert und beinhaltet den direkten Austausch von Vermögenswerten.

  Swap-Handel hingegen umfasst Derivatkontrakte, bei denen zwei Parteien Finanzinstrumente oder Zahlungsströme zu einem festgelegten zukünftigen Datum auf Basis des zugrunde liegenden Vermögenswerts tauschen. Swaps werden häufig für Hebelwirkung, Spekulation oder Absicherung verwendet und beinhalten nicht notwendigerweise den Austausch des zugrunde liegenden Vermögenswerts bis zum Ablauf des Kontrakts.


  Außerdem handeln Sie bei Swaps mit Kontrakten und nicht direkt mit der Basiswährung (z. B. BTC). Wenn Sie also eine Order mit `amount = 1` erstellen, variiert der BTC-Betrag je nach `contractSize`. Sie können die Kontraktgröße wie folgt überprüfen:

  ```python
  await exchange.loadMarkets()
  symbol = 'XRP/USDT:USDT'
  market = exchange.market(symbol)
  print(market['contractSize'])
  ```

  ## Warum erhalte ich einen Fehler, der besagt „muss größer als die minimale Betragspräzision von 1 sein"?
  Dies ist ein häufiger Fehler, der beim Erstellen von Orders für Kontraktmärkte auftritt. Dieser Fehler tritt auf, wenn die Börse eine natürliche Anzahl von Kontrakten (1, 2, 3 usw.) im Betrag-Argument von createOrder erwartet.
  
  Jeder Kontrakt entspricht einem bestimmten Betrag des Basiswerts, der durch die contractSize bestimmt wird. Sie können die contractSize aus der Marktstruktur eines Symbols wie folgt abrufen:
  ```python
  await exchange.loadMarkets()
  symbol = 'SOL/USDT:USDT'
  market = exchange.market(symbol)
  print(market['contractSize'])
  ```

  Wenn Sie eine Order mit `amount = 1` erstellen, variiert der Betrag des Basiswerts, der für die Order verwendet wird, je nach `contractSize` des Symbols.

  Nachfolgend finden Sie eine Formel und ein Beispiel, um die Anzahl der `contracts` zu ermitteln, die Sie für das Betrag-Argument verwenden sollten, wenn Sie 0,5 des Basiswerts verwenden möchten:
  ```python
  await exchange.loadMarkets()
  symbol = 'SOL/USDT:USDT'
  market = exchange.market(symbol)
  # Converting a 0.5 base amount to the number of contracts:
  # Formula: contracts = (base amount / contract size)
  contracts = round(0.5 / market['contractSize'])
  ```

  Hier ist ein Beispiel zur Ermittlung des Basisbetrags, der mit einem Betrag-Argument von 1 Kontrakt verwendet wird:
  ```python
  await exchange.loadMarkets()
  symbol = 'SOL/USDT:USDT'
  market = exchange.market(symbol)
  # Finding the base amount that will be used with 1 contract:
  # Formula: base amount = (contracts * contract size)
  contracts = 1
  base_amount = (contracts * market['contractSize'])
  ```

  ## Wie platziere ich eine reduceOnly-Order?
  Eine reduceOnly-Order ist ein Ordertyp, der nur eine Position verringern, nicht erhöhen kann. Um eine reduceOnly-Order zu platzieren, verwenden Sie in der Regel die createOrder-Methode mit einem auf true gesetzten reduceOnly-Parameter. Dies stellt sicher, dass die Order nur ausgeführt wird, wenn sie die Größe einer offenen Position verringert, und wird entweder teilweise ausgeführt oder gar nicht, wenn ihre Ausführung die Positionsgröße erhöhen würde.


```javascript tab="JavaScript"
const params = {
    'reduceOnly': true, // set to true if you want to close a position, set to false if you want to open a new position
}
const order = await exchange.createOrder (symbol, type, side, amount, price, params)
```
```python tab="Python"
params = {
    'reduceOnly': True, # set to True if you want to close a position, set to False if you want to open a new position
}
order = exchange.create_order (symbol, type, side, amount, price, params)
```
```php tab="PHP"
$params = {
    'reduceOnly': true, // set to true if you want to close a position, set to false if you want to open a new position
}
$order = $exchange->create_order ($symbol, $type, $side, $amount, $price, $params);
```


  ## Wie überprüft man den Endpunkt einer einheitlichen Methode?
  Um den Endpunkt einer einheitlichen Methode in der CCXT-Bibliothek zu überprüfen, müssen Sie in der Regel den Quellcode der Bibliothek für die jeweilige Börsenimplementierung einsehen. Die einheitlichen Methoden in CCXT abstrahieren die Details der spezifischen Endpunkte, mit denen sie interagieren, sodass diese Informationen nicht direkt über die API der Bibliothek zugänglich sind. Für eine detaillierte Prüfung können Sie die Implementierung der Methode für die jeweilige Börse im Quellcode der CCXT-Bibliothek auf GitHub einsehen.

  Mehr dazu: [Unified API](/docs/manual#unified-api)

  ## Wie unterscheidet man zwischen previousFundingRate, fundingRate und nextFundingRate in der Funding-Rate-Struktur?
  Die Funding-Rate-Struktur enthält drei verschiedene Funding-Rate-Werte, die zurückgegeben werden können:
  1. `previousFundingRate` bezieht sich auf die zuletzt abgeschlossene Rate.
  2. `fundingRate` ist die bevorstehende Rate. Dieser Wert ändert sich ständig, bis die Funding-Zeit verstrichen ist, und wird dann zur previousFundingRate.
  3. `nextFundingRate` wird nur von wenigen Börsen unterstützt und ist die vorhergesagte Funding-Rate nach der bevorstehenden Rate. Dieser Wert liegt zwei Funding-Raten in der Zukunft.

  Als Beispiel: Es ist 12:30 Uhr. Die `previousFundingRate` fand um 12:00 Uhr statt, und wir prüfen den `fundingRate`-Wert, um zu sehen, wie die bevorstehende Funding-Rate sein wird. In diesem Beispiel mit 4-Stunden-Intervallen wird die `fundingRate` in der Zukunft um 4:00 Uhr stattfinden, und die `nextFundingRate` ist die vorhergesagte Rate, die um 8:00 Uhr stattfinden wird.

## Wie verwendet man die Lighter-Börse in CCXT?

Lighter ist als Teil von CCXT verfügbar und funktioniert ähnlich wie jede andere CCXT-Börse, weist jedoch einige Besonderheiten auf, die für manche Benutzer verwirrend sein könnten. Wir werden dies im Folgenden ausführlich erläutern. Wir müssen lediglich einige grundlegende Anmeldedaten und Abhängigkeiten einrichten.


Nach dem letzten Upgrade hat CCXT den Authentifizierungsprozess vereinfacht, und nun reicht der L1-Private-Key aus.

## Anforderungen an Anmeldedaten

Lighter erfordert Folgendes:
- `privateKey`: der L1-Private-Key **obligatorisch**
- `accountIndex` (eine Ganzzahl) in `exchange.options`: — **optional** CCXT ruft ihn ab, falls nicht verfügbar; setzen Sie ihn, wenn Sie ein Unterkonto verwenden
- `apiKeyIndex` (eine Ganzzahl) in `exchange.options`: **optional** CCXT verwendet einen Standardwert (254)

Beispiel

```python
lighter = ccxt.lighter({
	'privateKey': 'XXXXXXX', # l1 private key
})
```

### Anforderungen an Abhängigkeiten

Da die Signierungsalgorithmen und Strukturen nicht nativ in allen Sprachen unterstützt werden, verwendet CCXT die offiziell verteilten Binärdateien und interagiert mit ihnen für den Signierungsprozess (über FFI/WASM). Je nach Sprache müssen Sie daher einen Pfad für diese Binärdatei angeben.

### Python/C#/PHP-Benutzer:

- Die Binärdateien können hier heruntergeladen werden: https://github.com/elliottech/lighter-python/tree/main/lighter/signers
- Der Pfad zur Binärdatei muss als `libraryPath` angegeben werden
- Sie müssen die Binärdatei entsprechend Ihrem Betriebssystem/Ihrer Architektur auswählen

```python
lighter = ccxt.lighter({
	'options': {
		'libraryPath': 'path/to/lighter-signer-linux-arm64.so',
	}
})
```

### Javascript/Typescript-Benutzer

- CCXT verwendet die aus dem offiziellen Paket erstellte WASM-Binärdatei, die hier heruntergeladen werden kann: https://github.com/ccxt/lighter-wasm oder aus dem Quellcode erstellt werden kann
- Sie müssen auch den Pfad zu `exec_wasm.js` angeben; Sie können ihn entweder aus demselben Repository herunterladen oder den Pfad zu Ihrer lokalen Datei prüfen (vorausgesetzt, Go ist installiert)

```javascript
lighter = ccxt.lighter({
	'options': {
		'libraryPath': '/user/cjg/Git/lighter-wasm/lighter.wasm',
		'wasmExecPath': '/opt/homebrew/opt/go/libexec/lib/wasm/wasm_exec.js'
	}
})
```

### GO-Benutzer

- Es ist nichts erforderlich. CCXT verwendet das offizielle GO-Paket; Sie müssen lediglich die Anmeldedaten angeben.


## Wie verwendet man die DyDx-Börse in CCXT?

DyDx ist als Teil von CCXT verfügbar und funktioniert ähnlich wie jede andere CCXT-Börse, weist jedoch einige Besonderheiten auf, die für manche Benutzer verwirrend sein könnten. Wir werden dies im Folgenden ausführlich erläutern. Wir müssen lediglich einige grundlegende Anmeldedaten und Abhängigkeiten einrichten.

Aufgrund aktueller signierbezogener Abhängigkeitsanforderungen ist die Börse nur in Python und JavaScript verfügbar. Die Unterstützung für weitere Sprachen wird eingeführt, sobald die erforderlichen Abhängigkeiten portiert wurden.


## Anforderungen an Anmeldedaten

DyDx erfordert eines der folgenden:
- `privateKey`: der l1-Private-Key (hex), der bei dydx verwendet wird, oder Sie können l2-Mnemonic in den Optionen setzen
- `mnemonic` in `exchange.options`: die 24 Wörter zum Abrufen Ihres l2-Private-Keys, den Sie in der Web-Oberfläche finden können

Beispiel

```python
dydx = ccxt.dydx({
	'privateKey': 'XXXXXXX',
})

# or
dydx = ccxt.dydx({
	'options': {
		'mnemonic': 'test test ...',
	}
})
```

### Anforderungen an Abhängigkeiten

DyDx erfordert eine weitere Abhängigkeit für Python-Benutzer. Vor der Verwendung müssen Sie pycryptodom lokal installieren.

```bash
$ pip3 install pycryptodom
```


Zusätzlich ist auch protobuf erforderlich, ist jedoch keine direkte Abhängigkeit von CCXT. Sie müssen es manuell installieren:

```
npm install protobufjs // javascript/typescript
pip install "protobuf==5.29.5" // python
```

### Verwendung

Die Verwendung ist weitgehend konsistent mit anderen Börsen, obwohl sich bestimmte Verhaltensweisen unterscheiden.

Während Orders beispielsweise normal aufgegeben werden können, verwendet das Stornieren einer Order auf dYdX nicht die herkömmliche orderId. Stattdessen erfordert dYdX zusätzliche Felder wie:

- clientOrderId, nicht die orderId
- orderFlags (0 für Market- und Nicht-Limit-GTT-Orders, 64 für Limit-GTT-Orders und 32 für bedingte Orders); ccxt nimmt standardmäßig 64 an
- goodTillBlockTimeInSeconds (erforderlich für langfristige und bedingte Orders; CCXT nimmt standardmäßig 30 Tage an)
- subAccountId; ccxt nimmt standardmäßig 0 an

CCXT bietet sinnvolle Standardwerte für die häufigsten Anwendungsfälle; je nach Ihren spezifischen Anforderungen müssen Sie diese Werte jedoch möglicherweise überschreiben (über Parameter oder Optionen).

### Wie verwendet man die GRVT-Börse in CCXT?

GRVT funktioniert ähnlich wie jede andere CCXT-DEX und erfordert nur den l1-Private-Key der Wallet.

Ein Beispiel zur Instanziierung der GRVT-Börse:

```
exchange = ccxt.grvt({
	'privateKey': 'XXXXXXX', // the l1 private key (hex)
})
```
Hinweis: Benutzer, die sich per E-Mail registriert haben, deren Wallet wird von Privy betrieben (GRVTs eingebettete Wallet-Lösung). So exportieren Sie den Private-Key:

1. Gehen Sie zu https://home.privy.io
2. Melden Sie sich mit derselben E-Mail-/Google-Adresse an, die zur Registrierung bei GRVT verwendet wurde
3. Von dort aus können Sie den Private-Key exportieren

*(Bei Bedarf können Sie https://support.privy.io besuchen)*

CCXT ist auch ein Builder bei GRVT, was bedeutet, dass Benutzer standardmäßig 1 Basispunkt (0,01 %) extra zahlen, wenn sie es über CCXT nutzen. Diese Gebühr ist jedoch völlig optional und kann durch Angabe der Option `builderFee: False` in den Optionen deaktiviert werden. Ihr Beitrag wird jedoch sehr geschätzt.

```
exchange.options['builderFee'] = False
```
