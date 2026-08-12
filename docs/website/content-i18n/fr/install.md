---
title: "Installation"
description: "La façon la plus simple d'installer la bibliothèque ccxt est d'utiliser les gestionnaires de packages intégrés :"
---

## Installation

La façon la plus simple d'installer la bibliothèque ccxt est d'utiliser les gestionnaires de packages intégrés :

- [ccxt dans **NPM**](http://npmjs.com/package/ccxt) (JavaScript / Node v15+)
- [ccxt dans **PyPI**](https://pypi.python.org/pypi/ccxt) (Python 3)

Cette bibliothèque est livrée comme une implémentation de module tout-en-un avec des dépendances et des exigences minimalistes :

- [ccxt.js](https://github.com/ccxt/ccxt/blob/master/js/ccxt.js) en JavaScript
- [./python/](https://github.com/ccxt/ccxt/blob/master/python/) en Python (généré à partir de JS)
- [ccxt.php](https://github.com/ccxt/ccxt/blob/master/ccxt.php) en PHP (généré à partir de JS)
- [./java/](https://github.com/ccxt/ccxt/blob/master/java/) en Java (généré à partir de TS)

Vous pouvez également le cloner dans votre répertoire de projet à partir du [dépôt GitHub ccxt](https://github.com/ccxt/ccxt) et copier manuellement les fichiers dans votre répertoire de travail avec l'extension de langue appropriée pour votre environnement.

```bash
git clone https://github.com/ccxt/ccxt.git
```

Une autre façon d'installer cette bibliothèque est de construire un bundle personnalisé à partir des sources. Choisissez les exchanges dont vous avez besoin dans `exchanges.cfg`.

### JavaScript (NPM)

La version JavaScript de ccxt fonctionne à la fois dans Node et les navigateurs web. Nécessite la prise en charge de ES6 et de la syntaxe `async/await` (Node 15+). Lors de la compilation avec Rspack (ou Webpack) et Babel, assurez-vous qu'elle n'est [pas exclue](https://github.com/ccxt-dev/ccxt/issues/225#issuecomment-331582275) dans votre configuration `babel-loader`.

[Bibliothèque de trading crypto ccxt dans npm](http://npmjs.com/package/ccxt)

```bash
npm install ccxt
```

```javascript
var ccxt = require ('ccxt')

console.log (ccxt.exchanges) // print all available exchanges
```

### JavaScript (pour utilisation avec la balise `<script>`) :

Bundle tout-en-un pour navigateur (dépendances incluses), servi depuis un CDN de votre choix :

* jsDelivr : https://cdn.jsdelivr.net/npm/ccxt@4.5.56/dist/ccxt.browser.min.js
* unpkg : https://unpkg.com/ccxt@4.5.56/dist/ccxt.browser.min.js
* ccxt : https://cdn.ccxt.com/latest/ccxt.min.js

Vous pouvez obtenir une version du bundle mise à jour en direct en supprimant le numéro de version de l'URL (la partie `@a.b.c`) ou le /latest/ sur notre cdn — cependant, nous ne recommandons pas de le faire, car cela pourrait éventuellement casser votre application. Gardez également à l'esprit que nous ne sommes pas responsables du bon fonctionnement de ces serveurs CDN.

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/ccxt@4.5.56/dist/ccxt.browser.min.js"></script>
```

Le point d'entrée par défaut pour le navigateur est `window.ccxt` et il crée un objet ccxt global :

```javascript
console.log (ccxt.exchanges) // print all available exchanges
```

### Builds JavaScript personnalisés

Il faut du temps pour charger tous les scripts et ressources. Le problème avec l'utilisation dans le navigateur est que la bibliothèque CCXT entière pèse plusieurs mégaoctets, ce qui est beaucoup pour une application web. Parfois, c'est aussi critique pour une application Node. Par conséquent, pour réduire le temps de chargement, vous voudrez peut-être créer votre propre build personnalisé de CCXT pour votre application avec uniquement les exchanges dont vous avez besoin. CCXT utilise rspack pour supprimer les chemins de code morts afin de réduire la taille du package.

Suivez ces étapes :

```bash
# 1. cloner le dépôt

git clone --depth 1 https://github.com/ccxt/ccxt.git

# 2. aller dans le dépôt cloné

cd ccxt

# 3. installer les dépendances

npm install

# 4. modifier exchanges.cfg pour les exchanges qui vous intéressent

echo -e "binance\nokx" > exchanges.cfg

# 5. construire la bibliothèque

npm run export-exchanges
npm run bundle-browser

# 6a. copier le fichier du navigateur dans votre dossier de projet si vous construisez une application web

cp dist/ccxt.browser.js path/to/your/html/project

# 6b. ou lier contre la bibliothèque si vous construisez une application Node.js
npm link
cd path/to/your/node/project
npm link ccxt

# 6c. importer directement ccxt depuis le point d'entrée
touch app.js

# à l'intérieur de app.js

import ccxt from './js/ccxt.js'
console.log (ccxt)

# maintenant vous pouvez exécuter votre application comme ceci

node app.js
```

### Python

[Bibliothèque de trading algorithmique ccxt dans PyPI](https://pypi.python.org/pypi/ccxt)

```bash
pip install ccxt
```

```python
import ccxt
print(ccxt.exchanges) # print a list of all available exchange classes
```

La bibliothèque prend en charge le mode asynchrone concurrent avec asyncio et async/await en Python 3.5.3+

```python
import ccxt.async_support as ccxt # link against the asynchronous version of ccxt
```

### PHP

La version autoloadable de ccxt peut être installée avec [**Packagist/Composer**](https://packagist.org/packages/ccxt/ccxt) (PHP 8.1+).

Elle peut également être installée à partir du code source : [**`ccxt.php`**](https://raw.githubusercontent.com/ccxt/ccxt/master/php)

Elle nécessite des modules PHP courants :

- cURL
- mbstring (l'utilisation de UTF-8 est fortement recommandée)
- PCRE
- iconv
- gmp

```php
include "ccxt.php";
var_dump (\ccxt\Exchange::$exchanges); // print a list of all available exchange classes
```

La bibliothèque prend en charge le mode asynchrone concurrent en utilisant des outils de [ReactPHP](https://reactphp.org/) en PHP 8.1+. Lisez le [Manuel](/docs) pour plus de détails.

### .net/C#

[ccxt en C# avec **Nugget**](https://www.nuget.org/packages/ccxt) (netstandard 2.0 et netstandard 2.1)
```c#
using ccxt;
Console.WriteLine(ccxt.Exchanges) // check this later
```

### Java

La version Java de CCXT nécessite Java 21+ et utilise Gradle comme système de build.

Cloner et construire à partir des sources :

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

Exécuter les exemples :

```bash
cd java
./gradlew :examples:run -PmainClass=examples.FetchTicker
./gradlew :examples:run -PmainClass=examples.WatchOrderBook
```

Voir [java/examples/](https://github.com/ccxt/ccxt/tree/master/java/examples) pour la liste complète des exemples.

### Docker

Vous pouvez obtenir CCXT installé dans un conteneur avec tous les langages et dépendances pris en charge. Cela peut être utile si vous voulez contribuer à CCXT (par exemple, exécuter les scripts de build et les tests — veuillez consulter le document [Contribution](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) pour plus de détails).

Vous n'avez pas besoin de l'image Docker si vous ne développez pas CCXT. Si vous voulez simplement utiliser CCXT – installez-le simplement comme un package régulier dans votre projet.

Utilisation de `docker-compose` (dans le dépôt CCXT cloné) :

```bash
docker-compose run --rm ccxt
```

Alternativement :

```bash
docker build . --tag ccxt
docker run -it ccxt
```

## Proxy
Si vous ne parvenez pas à obtenir des données des exchanges en raison de restrictions de localisation, lisez la section [proxy](/docs/manual#proxy).
