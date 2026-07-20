---
title: "Contribuer"
description: "Lisez les notes lors de l'ouverture d'un nouvel ticket sur github et fournissez les détails demandés, afin que nous puissions mieux vous aider. Vous pouvez également lire la section Dépannage."
---

# Contribuer à la bibliothèque CCXT

- [Comment soumettre une question ou un problème](#how-to-submit-an-issue)
- [Comment contribuer du code](#how-to-contribute-code)
  - [Ce dont vous avez besoin](#what-you-need-to-have)
  - [Ce que vous devez savoir](#what-you-need-to-know)

## Comment soumettre un problème

Lisez les notes lors de l'ouverture d'un [nouveau ticket sur github](https://github.com/ccxt/ccxt/issues/new/choose) et fournissez les détails demandés, afin que nous puissions mieux vous aider. Vous pouvez également lire la section [Dépannage](/docs/manual#troubleshooting).


### Signalement de vulnérabilités et de problèmes critiques

Si vous avez trouvé un problème de sécurité ou une vulnérabilité critique et que le signaler publiquement représente un risque – n'hésitez pas à nous envoyer un message à <a href="mailto:info@ccxt.trade">info@ccxt.trade</a>.

## Comment contribuer du code

- **[ASSUREZ-VOUS QUE VOTRE CODE EST UNIFIÉ](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes)!**

  **↑ Il s'agit de la règle la plus importante de toutes!!!**

- **AVANT TOUT PUSH, ASSUREZ-VOUS D'EXÉCUTER CETTE COMMANDE EN LOCAL : `git config core.hooksPath .git-templates/hooks`**

- **S'IL VOUS PLAÎT, NE COMMITTEZ PAS LES FICHIERS SUIVANTS DANS LES PULL REQUESTS :**

  - `/build/*` (ils sont générés automatiquement)
  - `/js/*` (ils sont compilés depuis la version TypeScript)
  - `/php/*` (sauf pour les classes de base)
  - `/python/*` (sauf pour les classes de base)
  - `/cs/*` (sauf pour les classes de base)
  - `/ccxt.js`
  - `/README.md` (les listes d'exchanges sont générées automatiquement)
  - `/package.json`
  - `/package.lock`
  - `/wiki/*` (sauf pour les vraies modifications, les listes d'exchanges sont générées automatiquement)
  - `/dist/ccxt.browser.js` (celui-ci est aussi browserifié automatiquement)


  Ces fichiers sont générés ([expliqué ci-dessous](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support)) et seront écrasés lors de la compilation. Veuillez ne pas les committer afin d'éviter de gonfler le dépôt qui est déjà assez volumineux. La plupart du temps, vous devez committer un seul fichier source pour soumettre une modification à l'implémentation d'un exchange.

- **S'IL VOUS PLAÎT, SOUMETTEZ DES MODIFICATIONS ATOMIQUES, UNE PULL REQUEST PAR EXCHANGE, NE LES MÉLANGEZ PAS**
- **ASSUREZ-VOUS QUE VOTRE CODE PASSE TOUTES LES VÉRIFICATIONS DE SYNTAXE EN EXÉCUTANT `npm run build`**

## Tâches en attente

Voici une liste de fonctionnalités que nous souhaitons voir implémentées et pleinement **unifiées** dans la bibliothèque en priorité à ce stade. La plupart de ces tâches sont déjà en cours, implémentées pour certains exchanges, mais pas pour tous :

- Trading sur marge
- Levier
- Dérivés (futures, options)
- Compte principal / sous-comptes
- Ordres conditionnels (stop loss, take profit)
- `transfer` entre sous-comptes et compte principal
- `fetchTransfer`
- `fetchTransfers`
- `fetchLedger`
- `fetchPositions`
- `closePosition`
- `closePositions`

Si vous souhaitez contribuer en soumettant des implémentations partielles, consultez les exemples de la façon dont cela est fait dans la bibliothèque (là où c'est déjà implémenté) et copiez les pratiques adoptées.

Si votre proposition, suggestion ou amélioration ne concerne pas la liste de tâches ci-dessus, avant de la soumettre, assurez-vous qu'elle est :
1. vraiment nécessaire pour la majorité des utilisateurs de ccxt
2. conçue comme une solution à usage général, non codée en dur pour vos besoins spécifiques
3. réalisée de manière généralisée compatible avec tous les exchanges (non spécifique à un exchange)
4. portable (disponible dans tous les langages supportés)
5. robuste
6. explicite dans ce qu'elle fait
7. ne casse rien (si vous modifiez une méthode, assurez-vous que toutes les autres méthodes appelant la méthode modifiée ne sont pas cassées)

Ce qui suit est un ensemble de règles pour contribuer à la base de code de la bibliothèque ccxt.

## Ce dont vous avez besoin

Si vous n'allez pas développer CCXT et contribuer du code à la bibliothèque CCXT, vous n'avez pas besoin de l'image Docker ni du dépôt CCXT. Si vous souhaitez simplement utiliser CCXT dans votre projet, installez-le simplement comme un paquet ordinaire dans le dossier du projet, comme documenté dans le Manuel (/docs/install) :

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

### Avec Docker

La manière la plus simple est d'utiliser Docker pour exécuter un environnement de compilation et de test isolé avec toutes les dépendances installées :

```bash
docker-compose run --rm ccxt
```

Cela construit un conteneur et ouvre un shell, où les commandes `npm run build` et `node run-tests` devraient simplement fonctionner immédiatement.

Le dossier CCXT est mappé à l'intérieur du conteneur, à l'exception du dossier `node_modules` — le conteneur aura sa propre copie éphémère — afin de ne pas perturber vos modules installés localement. Cela signifie que vous pouvez modifier les sources sur votre machine hôte avec votre éditeur favori et les compiler/tester dans le conteneur en cours d'exécution.

De cette façon, vous pouvez garder les outils de compilation et les processus isolés, sans avoir à traverser le processus douloureux d'installation manuelle de toutes ces dépendances sur votre machine hôte.

### Sans Docker

#### Dépendances

- Git
- [Node.js](https://nodejs.org/en/download/) 8+
- [Python](https://www.python.org/downloads/) 3.5.3+
  - requests (`pip install requests`)
  - [aiohttp](https://docs.aiohttp.org/) (`pip install aiohttp`)
  - [ruff](https://docs.astral.sh/ruff/) (`pip install ruff`)
  - [tox](https://tox.readthedocs.io)
    - via pip : `pip install tox`
    - MacOS avec [brew](https://brew.sh) : `brew install tox`
    - Ubuntu Linux : `apt-get install tox`
- [PHP](https://secure.php.net/downloads.php) 8.1+ avec les extensions suivantes installées et activées :
  - cURL
  - iconv
  - mbstring
  - PCRE
  - gmp
- [C#](https://dotnet.microsoft.com/en-us/download) 7.0
- [Java](https://adoptium.net/) 21+ avec Gradle

#### Étapes de compilation

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

## Ce que vous devez savoir

### Structure du dépôt

Le contenu du dépôt est structuré comme suit :

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
/python/README.md          # a copy of README.md for PyPI
/python/tox.ini            # tox config for Python
/examples/                 # self-explanatory
/examples/js               # ...
/examples/php              # ...
/examples/py               # ...
/java/examples/            # Java examples (Gradle module)
/exchanges.cfg             # custom bundle config for including only the exchanges you need
/package.json              # npm package file, version single-sourced into pyproject.toml and other files via `npm run vss`
/pyproject.toml            # metadata and build config (pip/setuptools) for the ccxt package in Python
/run-tests.js              # a front-end to run individual tests of all exchanges in all languages (JS/PHP/Python)
/wiki/                     # the source of all docs (edits go here)
```

### Support multi-langages

La bibliothèque ccxt est disponible en plusieurs langages différents (TypeScript, JavaScript, Python, PHP, C#, Go et Java). Nous encourageons les développeurs à concevoir du code *portable*, afin qu'un utilisateur d'un seul langage puisse lire le code dans d'autres langages et le comprendre facilement. Cela favorise l'adoption de la bibliothèque. L'objectif principal est de fournir une interface généralisée, unifiée, cohérente et robuste vers autant d'exchanges de cryptomonnaies existants que possible.

Au début, toutes les versions spécifiques aux langages étaient développées en parallèle, mais séparément les unes des autres. Mais lorsqu'il est devenu trop difficile de maintenir et de garder le code cohérent entre tous les langages supportés, nous avons décidé de passer à ce que nous appelons un processus *source/généré*. Il existe maintenant une seule version source dans un langage, qui est TypeScript. Les autres versions spécifiques aux langages sont dérivées syntaxiquement (transpilées, générées) automatiquement depuis la version source. Mais cela ne signifie pas que vous devez être développeur TS ou JS pour contribuer. Le principe de portabilité permet aux développeurs Python et PHP de participer efficacement au développement de la version source également.

Les points d'entrée du module sont :
- `./python/__init__.py` pour le paquet pip Python
- `./python/async/__init__.py` pour le sous-paquet Python 3.7.0+ ccxt.async_support
- `./js/ccxt.js` pour le paquet npm Node.js
- `./ts/ccxt.ts` pour TypeScript
- `./dist/ccxt.browser.js` pour le bundle navigateur
- `./ccxt.php` pour PHP
- `./java/lib/src/main/java/io/github/ccxt/` pour Java

Les versions générées et la documentation sont transpilées depuis le dossier source `ts/src` par la commande `npm run build`.

### Fichiers transpilés (générés)

- Toutes les classes d'exchange dérivées sont transpilées par `tsc` de TypeScript vers JavaScript et par notre transpileur personnalisé de TypeScript vers PHP et Python. Les fichiers source sont indépendants du langage, facilement mappables ligne par ligne vers tout autre langage et écrits de manière compatible avec tous les langages. N'importe quel développeur peut le lire (par conception).
- Les classes de base ne sont **pas** entièrement transpilées et ne le sont que partiellement, car elles sont spécifiques au langage.

#### JavaScript

Le `ccxt.browser.js` est généré avec Babel depuis la source.

#### Python

Ces fichiers contenant des classes d'exchange dérivées sont transpilés de TS vers Python :

- `ts/[_a-z].ts` → `python/ccxt/async/[_a-z].py`
- `python/ccxt/async[_a-z].py` → `python/ccxt/[_a-z].py` (étape de transpilation Python 3 asyncio → Python synchrone)
- `python/ccxt/test/test_async.py` → `python/ccxt/test/test_sync.py` (le test synchrone est généré depuis le test asynchrone)

Ces classes de base et fichiers Python ne sont pas transpilés :

- `python/ccxt/base/*`
- `python/ccxt/async/base/*`

#### PHP

Ces fichiers contenant des classes d'exchange dérivées sont transpilés de TS vers C# :

- `ts/[_a-z].ts` → `php/[_a-z].php`

Ces classes de base et fichiers PHP ne sont pas transpilés :

- `php/Exchange.php php/ExchangeError.php php/Precise.php ...`

#### C#

Ces fichiers contenant des classes d'exchange dérivées sont transpilés de TS vers C# :

- `ts/src/[_a-z].ts` → `cs/src/exchanges/[_a-z].cs`

Ces classes de base et fichiers C# ne sont pas transpilés :

- `cs/base/*`

#### Java

Ces fichiers contenant des classes d'exchange dérivées sont transpilés de TS vers Java :

- `ts/src/[_a-z].ts` → `java/lib/src/main/java/io/github/ccxt/exchanges/[A-Z]*.java`

Ces classes de base et fichiers Java ne sont pas transpilés :

- `java/lib/src/main/java/io/github/ccxt/base/*`
- `java/lib/src/main/java/io/github/ccxt/ws/*`
- `java/lib/src/main/java/io/github/ccxt/Exchange.java`

#### Typescript

- Le développement est effectué en utilisant ces fichiers

### Classe de base

``` CONSTRUCTION```

### Classes d'exchange dérivées

Le transpileur est basé sur des expressions régulières et repose fortement sur des règles de formatage spécifiques. Si vous les enfreignez, le transpileur échouera soit à générer les classes Python/PHP du tout, soit générera une syntaxe Python/PHP malformée.

Voici les points clés pour garder le code JS transpilable.

Utilisez le linter `npm run lint js/your-exchange-implementation.js` avant de compiler. Il couvrira beaucoup (mais pas tous) les problèmes, donc une vérification manuelle sera toujours nécessaire si la transpilation échoue.

Si vous voyez une exception `[TypeError] Cannot read property '1' of null` ou toute autre erreur de transpilation lors de l'exécution de `npm run build`, vérifiez que votre code respecte les règles suivantes :

- ne mettez pas de lignes vides à l'intérieur de vos méthodes
- utilisez toujours l'indentation de style Python, elle est conservée telle quelle pour tous les langages
- indentez avec exactement 4 espaces, évitez les tabulations
- mettez une ligne vide entre chacune de vos méthodes
- évitez les styles de commentaires mixtes, utilisez le double slash `//` en JS pour les commentaires de ligne
- évitez les commentaires multi-lignes

Si le processus de transpilation se termine avec succès mais génère une syntaxe Python/PHP incorrecte, vérifiez les points suivants :

- chaque crochet ouvrant comme `(` ou `{` doit avoir un espace avant lui !
- n'utilisez pas de sucre syntaxique spécifique à un langage, même si vous en avez vraiment envie
- dépliez toutes les maps et compréhensions en boucles for basiques
- ne changez pas les arguments des méthodes héritées surchargées, gardez-les uniformes pour tous les exchanges
- tout doit être fait en utilisant uniquement les méthodes de la classe de base (par exemple, utilisez `this.json ()` pour convertir des objets en json)
- mettez toujours un point-virgule `;` à la fin de chaque instruction, comme en PHP/style C
- toutes les clés associatives doivent être des chaînes entre guillemets simples partout (`array['good']`), n'utilisez pas la notation pointée (`array.bad`)
- n'utilisez jamais le mot-clé `var`, utilisez plutôt `const` pour les constantes ou `let` pour les variables

Et structurellement :

- si vous avez besoin d'une autre méthode de base, vous devrez l'implémenter dans les trois langages
- essayez de ne pas émettre plus d'une requête HTTP depuis une méthode unifiée
- évitez de modifier le contenu des arguments et des params passés par référence dans les appels de fonction
- restez simple, n'effectuez pas plus d'une instruction par ligne
- essayez de réduire la syntaxe et la logique (si possible) à des expressions simples tenant sur une ligne
- plusieurs lignes sont acceptables, mais vous devriez éviter l'imbrication profonde avec beaucoup de parenthèses
- n'utilisez pas d'instructions conditionnelles trop complexes (lourde imbrication de if)
- n'utilisez pas de conditionnelles ternaires lourdes
- évitez l'accumulation d'opérateurs (**ne faites pas ceci** : `a && b || c ? d + 80 : e ** f`)
- n'utilisez pas `.includes()`, utilisez `.indexOf()` à la place !
- n'utilisez jamais `.toString()` sur des flottants : `Number (0.00000001).toString () === '1e-8'`
- n'utilisez pas de closures, `a.map` ou `a.filter (x => (x === 'foobar'))` n'est pas acceptable dans les classes dérivées
- n'utilisez pas l'opérateur `in` pour vérifier si une valeur se trouve dans un tableau non associatif (liste)
- n'ajoutez pas de conversions ou formatages personnalisés de devises ou de symboles/paires, copiez plutôt depuis le code existant
- **n'accédez pas à des clés inexistantes, `array['key'] || {}` ne fonctionnera pas dans d'autres langages !**

#### Envoi des identifiants de marché

La plupart des endpoints d'API des exchanges nécessitent qu'un symbole de marché, une paire de trading ou un instrument spécifique à l'exchange soit précisé dans la requête.

**Nous n'envoyons pas directement des symboles unifiés aux exchanges !** Ils ne sont pas interchangeables ! Il existe une différence significative entre les *identifiants de marché spécifiques à l'exchange* et les *symboles unifiés* ! Ceci est expliqué dans le Manuel, ici :

- /docs/manual#markets
- /docs/manual#symbols-and-market-ids

**NE FAITES JAMAIS CECI :**

```javascript
async fetchTicker (symbol, params = {}) {
   const request = {
      'pair': symbol, // very bad, sending unified symbols to the exchange directly
   };
   const response = await this.publicGetEndpoint (request);
   // parse in a unified way...
}
```

**NE FAITES PAS CECI NON PLUS :**

```javascript
async fetchTicker (symbol, params = {}) {
   const request = {
      'symbol': symbol, // very bad, sending unified symbols to the exchange directly
   };
   const response = await this.publicGetEndpoint (request);
   // parse in a unified way...
}
```

Au lieu d'envoyer un symbole CCXT unifié à l'exchange, nous prenons **toujours** l'`id` de marché spécifique à l'exchange qui correspond à ce symbole. S'il arrive qu'un identifiant de marché spécifique à l'exchange soit exactement le même que le symbole unifié CCXT — c'est une heureuse coïncidence, mais nous ne nous appuyons jamais là-dessus dans l'API CCXT unifiée.

Pour obtenir l'identifiant de marché spécifique à l'exchange à partir d'un symbole CCXT unifié, utilisez les méthodes suivantes :

- `this.market (symbol)` – retourne toute la structure de marché unifiée, contenant l'`id`, le `baseId`, le `quoteId`, et bien d'autres informations utiles
- `this.marketId (symbol)` – retourne uniquement l'`id` spécifique à l'exchange d'un marché à partir d'un symbole unifié (si vous n'avez besoin de rien d'autre)

**BONS EXEMPLES :**

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

#### Analyse syntaxique des symboles

Lors de l'envoi de requêtes à l'exchange, les symboles unifiés doivent être _« convertis »_ en `id`s de marché spécifiques à l'exchange comme montré ci-dessus. Il en va de même dans l'autre sens — lors de la réception d'une réponse de l'exchange, celle-ci contient un `id` de marché spécifique à l'exchange qui doit être _« reconverti »_ en symbole CCXT unifié.

**Nous ne plaçons pas directement des `id`s de marché spécifiques à l'exchange dans les structures unifiées !** Nous ne pouvons pas échanger librement symboles et identifiants ! Il existe une différence significative entre un *identifiant de marché spécifique à l'exchange* et les *symboles unifiés* ! Ceci est expliqué dans le Manuel, ici :

- /docs/manual#markets
- /docs/manual#symbols-and-market-ids

**NE FAITES JAMAIS CECI :** :

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

**NE FAITES PAS CECI NON PLUS**

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

Afin de gérer correctement l'`id` de marché, il doit être recherché dans les informations mises en cache sur cet exchange avec `loadMarkets()` :

**BON EXEMPLE :**

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

#### Accès aux clés de dictionnaire

En JavaScript, les clés de dictionnaire peuvent être accédées selon deux notations :

- `object['key']` (notation par clé de chaîne entre guillemets simples)
- `object.key` (notation par propriété)

Les deux fonctionnent de manière presque identique, et l'une est implicitement convertie en l'autre lors de l'exécution du code JavaScript.

Bien que ce qui précède fonctionne en JavaScript, **cela ne fonctionnera pas en Python ou PHP**. Dans la plupart des langages, les clés de dictionnaire associatif ne sont pas traitées de la même façon que les propriétés. Ainsi, en Python `object.key` n'est pas la même chose que `object['key']`. En PHP, `$object->key` n'est pas non plus la même chose que `$object['key']`. Les langages qui distinguent les clés associatives des propriétés utilisent des notations différentes pour les deux.

Pour que le code reste transpilable, veuillez vous souvenir de cette règle simple : *utilisez toujours la notation par clé de chaîne entre guillemets simples `object['key']` pour accéder à toutes les clés de dictionnaire associatif dans tous les langages, partout dans cette bibliothèque !*

#### Assainissement des entrées avec les méthodes `safe`

JavaScript est moins restrictif que d'autres langages. Il tolère une tentative de déréférencement d'une clé inexistante là où d'autres langages lèveraient une exception :

```javascript
// JavaScript

const someObject = {}

if (someObject['nonExistentKey']) {
    // the body of this conditional will not execute in JavaScript
    // because someObject['nonExistentKey'] === undefined === false
    // but JavaScript will not throw an exception on the if-clause
}
```

Cependant, la logique ci-dessus avec *« une valeur indéfinie par défaut »* ne fonctionnera pas en Python ou PHP.

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

La plupart des langages ne tolèrent pas une tentative d'accès à une clé inexistante dans un objet.

Pour ces raisons, veuillez **ne jamais faire ceci** dans les fichiers JS transpilés :

```javascript
// JavaScript
const value = object['key'] || other_value; // will not work in Python or PHP!
if (object['key'] || other_value) { /* will not work in Python or PHP! */ }
```

C'est pourquoi nous disposons d'une famille de fonctions `safe*` :

- `safeInteger (object, key, default)`, `safeInteger2 (object, key1, key2, default)` – pour l'analyse des horodatages en millisecondes
- `safeNumber (object, key, default)`, `safeNumber2 (object, key1, key2, default)` – pour l'analyse des montants, prix, coûts
- `safeString (object, key, default)`, `safeString2 (object, key1, key2, default)` – pour l'analyse des identifiants, types, statuts
- `safeStringLower (object, key, default)`, `safeStringLower2 (object, key1, key2, default)` – pour l'analyse et la conversion en minuscules
- `safeStringUpper (object, key, default)`, `safeStringUpper2 (object, key1, key2, default)` – pour l'analyse et la conversion en majuscules
- `safeBool(object, key, default)` - pour l'analyse des booléens dans les dictionnaires et tableaux/listes
- `safeList(object, key, default)` - pour l'analyse des listes/tableaux dans les dictionnaires et tableaux/listes
- `safeDict(object, key, default)` - pour l'analyse des dictionnaires dans les dictionnaires et tableaux/listes
- `safeValue (object, key, default)`, `safeValue2 (object, key1, key2, default)` – pour l'analyse des objets (dictionnaires) et tableaux (listes)
- `safeTimestamp (object, key, default)`, `safeTimestamp2 (object, key1, key2, default)` – pour l'analyse des horodatages UNIX en secondes

La fonction `safeValue` est utilisée pour les objets dans les objets, les tableaux dans les objets et les valeurs booléennes `true/false` (**dépréciée, utilisez-la uniquement lorsque vous ne savez pas exactement quel type sera retourné, sinon préférez** `safeBool/safeDict/safeList`).

Si vous avez besoin de rechercher plusieurs clés différentes dans un objet, vous disposez de la famille de fonctions `safeMethodN` qui permet une recherche avec un nombre arbitraire de clés en acceptant un tableau de clés comme argument.

```javascript
const price = this.safeStringN (object, [ 'key1', 'key2', 'key3' ], defaultValue)
```
Pour chaque méthode safe listée ci-dessus, il existe également le `safeMethodN` correspondant.

Les fonctions safe ci-dessus vérifieront l'existence de la `key` (ou `key1`, `key2`) dans l'objet et retourneront correctement les valeurs `undefined/None/null` pour JS/Python/PHP. Chaque fonction accepte également la valeur `default` à retourner à la place de `undefined/None/null` dans le dernier argument.

Vous pourriez aussi vérifier d'abord l'existence de la clé...

Donc, vous devez changer ceci :

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

Ou :

```javascript
if ('foo' in params) {
}
```

#### Utilisation des méthodes cryptographiques de la classe de base pour l'authentification

Ne réinventez pas la roue. Utilisez toujours les méthodes de la classe de base pour la cryptographie.

La bibliothèque CCXT prend en charge les algorithmes d'authentification et de cryptographie suivants :

- HMAC
- JWT (JSON Web Token)
- RSA
- ECDSA Cryptographie à courbe elliptique
  - NIST P256
  - secp256k1
- OTP 2FA (mot de passe à usage unique, authentification à deux facteurs)

La classe de base `Exchange` offre plusieurs méthodes essentielles à pratiquement toute la cryptographie dans cette bibliothèque. Les implémentations d'exchange dérivées ne doivent pas utiliser de dépendances externes pour la cryptographie — tout doit être réalisé avec les seules méthodes de base.

- `hash (message, hash = 'md5', digest = 'hex')`
- `hmac (message, secret, hash = 'sha256', digest = 'hex')`
- `jwt (message, secret, hash = 'HS256')`
- `rsa (message, secret, alg = 'RS256')`
- `ecdsa (request, secret, algorithm = 'p256', hash = undefined)`
- `totp (secret)`
- `stringToBase64()`, `base64ToBinary()`, `binaryToBase64()`...

La méthode `hash()` prend en charge les algorithmes `hash` suivants :

- `'md5'`
- `'sha1'`
- `'sha3'`
- `'sha256'`
- `'sha384'`
- `'sha512'`
- `'keccak'`

L'argument d'encodage `digest` accepte les valeurs suivantes :

- `'hex'`
- `'binary'`

La méthode `hmac()` prend également en charge `'base64'` pour l'argument `digest`. Ceci est uniquement pour `hmac()` — les autres implémentations doivent utiliser `'binary'` avec `binaryToBase64()`.

#### Horodatages

**Tous les horodatages dans toutes les structures unifiées de cette bibliothèque sont des horodatages UTC entiers _en millisecondes_ !**

Afin de convertir vers des horodatages en millisecondes, CCXT implémente les méthodes suivantes :

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

#### Travail avec les longueurs de tableaux

En JavaScript, la syntaxe courante pour obtenir la longueur d'une chaîne ou d'un tableau consiste à référencer la propriété `.length` comme indiqué ici :

```javascript
someArray.length

// or

someString.length
```

Et cela fonctionne aussi bien pour les chaînes que pour les tableaux. En Python, c'est fait de manière similaire :

```python
len(some_array)

# or

len(some_string)
```

Ainsi la longueur est accessible de la même façon pour les chaînes et les tableaux, et les deux fonctionnent correctement.

Cependant, avec PHP c'est différent — la syntaxe pour les longueurs de chaînes et les longueurs de tableaux est distincte :

```php
count(some_array);

// or

strlen(some_string); // or mb_strlen
```

Étant donné que le transpileur fonctionne ligne par ligne et ne fait pas d'introspection de code, il ne peut pas distinguer les tableaux des chaînes et ne peut pas transpiler correctement `.length` vers PHP sans indication supplémentaire. Il transpilera toujours le `.length` JS vers PHP `strlen` et privilégiera les longueurs de chaînes par rapport aux longueurs de tableaux. Afin d'indiquer correctement une longueur de tableau, nous devons procéder comme suit :

```javascript
const arrayLength = someArray.length;
// the above line ends with .length;
// that ending is a hint for the transpiler that will recognize someArray
// as an array variable in this place, rather than a string type variable
// now we can use arrayLength for the arithmetic
```

Cette terminaison de ligne `.length;` fait l'affaire. Le seul cas où la `.length` de tableau est préférée à la `.length` de chaîne est la boucle `for`. Dans l'en-tête de la boucle `for`, `.length` fait toujours référence à la longueur du tableau (pas à la longueur de la chaîne).

#### Addition de nombres et concaténation de chaînes

En JS, l'opérateur d'addition arithmétique `+` gère à la fois les chaînes et les nombres. Il peut donc concaténer des chaînes avec `+` et additionner des nombres avec `+` également. Il en va de même avec Python. Avec PHP, c'est différent — il possède des opérateurs distincts pour la concaténation de chaînes (l'opérateur « point » `.`) et pour l'addition arithmétique (l'opérateur « plus » `+`). Une fois encore, comme le transpileur ne fait pas d'introspection de code, il ne peut pas savoir si vous additionnez des nombres ou des chaînes en JS. Cela fonctionne bien jusqu'au moment où vous souhaitez transpiler vers d'autres langages, que ce soit PHP ou tout autre langage.

Il y a cet aspect de la représentation des nombres dans toute la bibliothèque.
L'approche existante documentée dans le Manuel indique que la bibliothèque acceptera et retournera des « flottants partout » pour les montants, les prix, les coûts, etc.
L'utilisation des flottants est le moyen le plus simple d'intégrer de nouveaux utilisateurs.
Cela présente des inconvénients connus : il est impossible de représenter des nombres exacts avec des flottants (https://0.30000000000000004.com/)

Pour y remédier, nous passons à des représentations sous forme de chaînes partout.
Ainsi, nous sommes actuellement en train de migrer vers les chaînes de manière non destructrice.

La nouvelle approche est la suivante :

Nous ajoutons une couche interne pour les représentations basées sur les chaînes et les calculs basés sur les chaînes dans les analyseurs de réponses.
Cette couche interne est construite sur la classe de base `Precise`, qui est utilisée pour effectuer tous les calculs basés sur les chaînes.
Cette classe nécessite des chaînes pour opérer dessus et retournera également des chaînes.
Tous les anciens analyseurs existants doivent être réécrits pour utiliser les représentations basées sur les chaînes de `Precise`, lors de la première rencontre.
Tout le nouveau code de tous les nouveaux analyseurs doit être initialement écrit avec les représentations basées sur les chaînes de `Precise`.

Ce que cela signifie exactement :

Comparez ce pseudocode montrant comment cela était fait **avant** (un exemple de code d'analyse arbitraire dans le but de l'expliquer) :

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

Voici comment nous devrions le faire **désormais** :

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

Dans tout le nouveau code de tous les parseurs, nous devons utiliser des nombres sous forme de chaînes tout au long du corps du parseur. Nous devons également ajouter `parseNumber` comme dernière étape du traitement des valeurs numériques lors du retour du résultat à l'appelant. Les deux extraits ci-dessus ne sont que des exemples, montrant l'utilisation de `Precise` avec `safeString` et `parseNumber`. Les parseurs réels des ordres impliquent également les méthodes safeOrder : https://github.com/ccxt/ccxt/pulls?q=safeOrder2.

L'utilisateur aura finalement la possibilité de choisir quelle implémentation de parseNumber il souhaite : celle qui retourne des flottants ou celle qui retourne des chaînes. Ainsi, tout le monde sera satisfait et la bibliothèque fonctionnera dans les deux sens de manière non-destructive.

La règle d'or est : **`+` est uniquement pour la concaténation de chaînes (!)** et **TOUTES les opérations arithmétiques doivent utiliser `Precise`**.

#### Formatage des nombres décimaux avec précision

Cette section couvre la partie assemblage des requêtes. La méthode `.toFixed ()` présente des [bugs de précision connus](https://www.google.com/search?q=toFixed+bug) en JavaScript, tout comme les autres méthodes d'arrondi dans les autres langages. Afin de travailler de manière cohérente avec le formatage des nombres, utilisez la [méthode `decimalToPrecision` décrite dans le Manuel](/docs/manual#methods-for-formatting-decimals).

#### Caractères de contrôle échappés

Lorsque vous utilisez des chaînes contenant des caractères de contrôle comme `"\n"`, `"\t"`, entourez-les toujours de guillemets doubles (`"`), pas de guillemets simples (`'`) ! Les chaînes entre guillemets simples ne sont pas analysées pour les caractères de contrôle et sont traitées telles quelles dans de nombreux langages autres que TypeScript. Par conséquent, pour que les tabulations et les sauts de ligne fonctionnent en PHP, nous devons les entourer de guillemets doubles (notamment dans l'implémentation de `sign()`).

Incorrect :

```javascript
const a = 'GET' + method.toLowerCase () + '\n' + path;
const b = 'api\nfoobar.com\n';
```

Correct :

```javascript
const a = 'GET' + method.toLowerCase () + "\n" + path; // eslint-disable-line quotes
// eslint-disable-next-line quotes
const b = "api\nfoobar.com\n";
```

**↑ Les commentaires `eslint-*` sont obligatoires !**

#### Utilisation des conditionnelles ternaires

N'utilisez pas de conditionnelles ternaires (`?:`) complexes, **utilisez toujours des parenthèses dans les opérateurs ternaires !**

Bien qu'il existe une priorité des opérateurs dans les langages de programmation eux-mêmes, le transpileur est basé sur des expressions régulières et n'effectue pas d'introspection du code, il traite donc tout comme du texte brut.

Les parenthèses sont nécessaires pour indiquer au transpileur quelle partie du conditionnel est laquelle. En l'absence de parenthèses, il est difficile de comprendre la ligne et l'intention du développeur.

Voici quelques exemples de code mal conçu qui cassera le transpileur :

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

Ajouter des parenthèses autour des parties correspondantes serait une façon plus ou moins correcte de résoudre le problème.

```javascript
const foo = {
   'bar': (qux === 'baz') ? this.a () : this.b (), // much better now
};
```

La façon universellement applicable de le résoudre est de simplement décomposer la ligne complexe en quelques lignes plus simples, même au prix de lignes et de conditionnelles supplémentaires :

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

Ou même :

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

### Nouvelles intégrations d'échanges

**RAPPEL :** La principale raison pour laquelle cette bibliothèque est utilisée est **l'Unification**. Lors du développement d'un nouveau fichier d'échange, l'objectif n'est pas de l'implémenter d'une manière ou d'une autre, mais de l'implémenter de manière très méticuleuse, précise et exacte, tout comme les autres échanges sont implémentés. Pour cela, nous devons copier des morceaux de logique d'autres échanges et nous assurer que le nouvel échange est conforme au Manuel dans les aspects suivants :

- les identifiants de marché, les symboles de paires de trading, les identifiants de devises, les codes de tokens, l'unification symbolique et les `commonCurrencies` doivent être standardisés dans toutes les méthodes d'analyse (`fetchMarkets`, `fetchCurrencies`, `parseTrade`, `parseOrder`, ...)
- tous les noms et arguments de méthodes de l'API unifiée sont standards – on ne peut pas les ajouter ou les modifier librement
- toutes les entrées du parseur doivent être assainies avec `safe` comme [décrit ci-dessus](#sanitizing-input-with-safe-methods)
- pour les opérations en masse, les méthodes de base doivent être utilisées (`parseTrades`, `parseOrders`, remarquez le pluriel avec `s`)
- utilisez autant de fonctionnalités de base que possible, ne réinventez pas la roue, ni le vélo, ni la roue du vélo
- respectez les valeurs d'arguments par défaut dans les méthodes `fetch`, vérifiez si `since` et `limit` sont `undefined` et ne les envoyez pas à l'échange, nous utilisons intentionnellement les valeurs par défaut des échanges dans ces cas
- lors de l'implémentation d'une méthode unifiée qui a certains arguments – nous ne pouvons ignorer ou omettre aucun de ces arguments
- toutes les structures retournées par les méthodes unifiées doivent être conformes à leurs spécifications du Manuel
- tous les points de terminaison de l'API doivent être listés avec un support approprié pour les paramètres substitués dans les URLs

Veuillez consulter le document suivant pour les nouvelles intégrations : /docs/requirements

Une fusion rapide d'une Pull Request pour une nouvelle intégration d'échange dépend de la cohérence et de la conformité avec les règles et standards unifiés ci-dessus. Ne pas respecter l'un d'eux est la principale raison du refus de fusion d'une Pull Request.

**Si vous souhaitez ajouter (la prise en charge d')un autre échange, ou implémenter une nouvelle méthode pour un échange particulier, la meilleure façon d'en faire une amélioration cohérente est d'apprendre par l'exemple. Regardez comment les mêmes choses sont implémentées dans d'autres échanges (nous recommandons les échanges certifiés) et essayez de copier le flux de code et le style.**

Le squelette JSON de base pour une nouvelle intégration d'échange est le suivant :

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

### Méthodes API implicites

Dans le code de chaque échange, vous remarquerez que les fonctions qui effectuent des requêtes API ne sont pas explicitement définies. C'est parce que la définition `api` dans le JSON de description de l'échange est utilisée pour créer des *fonctions magiques* (aussi appelées *fonctions partielles* ou *fermetures*) à l'intérieur de la sous-classe de l'échange. Cette injection implicite est effectuée par la méthode de base `defineRestApi/define_rest_api`.

Chaque fonction partielle prend un dictionnaire de `params` et retourne la réponse de l'API. Dans l'exemple JSON ci-dessus, `'endpoint/example'` entraîne l'injection d'une fonction `this.publicGetEndpointExample`. De même, `'orderbook/{pair}/full'` entraîne une fonction `this.publicGetOrderbookPairFull`, qui prend un paramètre ``pair`` (à nouveau, passé dans l'argument `params`).

Lors de l'instanciation, la classe de base de l'échange prend chaque URL de sa liste de points de terminaison, la divise en mots, puis compose un nom de fonction appelable à partir de ces mots en utilisant une construction partielle. Ce processus est le même en JS, Python et PHP. Il est également décrit ici :

- /docs/manual#api-methods--endpoints
- /docs/manual#implicit-api-methods
- https://github.com/ccxt-dev/ccxt/wiki/Manual#api-method-naming-conventions

``` CONSTRUCTION```

### Docstrings

- lorsqu'une méthode prend un autre paramètre comme propriété sur params (ex. `params['something']`), ajoutez ce paramètre à la docstring, sous la forme params.something
   - si ce paramètre est requis, le type est `{str}`, `{int}`, `{etc}`, s'il est optionnel le type est `{str|undefined}`, `{int|undefined}`, `{etc|undefined}`
- lorsque la valeur par défaut d'un paramètre est `undefined`, mais que la méthode contient quelque chose comme `if (symbol === undefined) { throw new ArgumentsRequired('...')}`, alors définissez le type de ce paramètre comme `{str}`, `{int}`, `{etc}`. Si aucune erreur n'est levée, le type est `{str|undefined}`, `{int|undefined}`, `{etc|undefined}`
- si une méthode n'utilise pas l'un des paramètres unifiés, définissez la description de ce paramètre comme `not used by exchange_name.method_name ()` (remplacez `exchange_name` et `method_name` par les vrais noms d'échange et de méthode)
- si la méthode a d'autres cas d'utilisation spéciaux, incluez-les dans la description de la docstring, ces cas peuvent également être inclus dans la docstring de la classe

### Intégration continue

Les builds sont automatisés avec [Travis CI](https://app.travis-ci.com/github/ccxt/ccxt). Les étapes de build pour Travis CI sont décrites dans le fichier [`.travis.yml`](https://github.com/ccxt/ccxt/blob/master/.travis.yml).

Les builds Windows sont automatisés avec [Appveyor](https://ci.appveyor.com/project/ccxt/ccxt). Les étapes de build pour Appveyor se trouvent dans le fichier [`appveyor.yml`](https://github.com/ccxt/ccxt/blob/master/appveyor.yml).

Les pull requests entrantes sont automatiquement validées par le service CI. Vous pouvez suivre le processus de build en ligne ici : [app.travis-ci.com/github/ccxt/ccxt/builds](https://app.travis-ci.com/github/ccxt/ccxt/builds).

### Comment construire et exécuter les tests sur votre machine locale

### Tests hors ligne
CCXT dispose de divers tests hors ligne qui permettent de s'assurer que nous n'introduisons pas de régressions lors de l'ajout d'une nouvelle fonctionnalité ou de la correction d'un bug. Ils sont faciles et rapides à exécuter (car ils ne nécessitent pas d'accès aux échanges), ils devraient donc faire partie de notre flux de développement chez CCXT.


Ils comprennent les tests de base (précision, crypto, carnet d'ordres, etc.) et les tests statiques (requête/réponse).

Ces tests se trouvent dans le dossier `ts/src/test/base/functions/` ; la plupart de leur contenu est automatiquement transpilable dans tous les langages ; par conséquent, les mêmes conventions de code s'appliquent.

Vous pouvez les exécuter en faisant : `npm run test-base` et `npm run-test-ws`

Les tests statiques sont également hors ligne mais ils fonctionnent différemment car ils émulent un appel ccxt unifié (createOrder/fetchTickers/etc) et ils simulent la réponse du serveur et/ou vérifient la validité de la requête HTTP générée.

**Requête-statique** :
- Ils émulent la requête HTTP, l'arrêtent avant qu'elle tente de se connecter et vérifient que l'url/le corps sont correctement formés.

Dossier : `ts/src/test/static/request/`

Vous pouvez créer un test de requête statique en exécutant cette commande et en collant le résultat dans le fichier correct (ex. : `static/request/binance.json`)

```bash
node cli.js binance fetchTrades "BTC/USDT:USDT" --report
````


**Réponse-statique**
- Émule une réponse simulée du serveur et vérifie que CCXT analyse correctement la réponse HTTP brute.

Dossier : `ts/src/test/static/response/binance.json`

Vous pouvez créer un test de réponse statique en exécutant cette commande et en collant le résultat dans le fichier correct (ex. : `static/response/binance.json`)

```bash
node cli.js binance fetchTrades "BTC/USDT:USDT"  undefined 1 --response
````
#### Ajout des identifiants d'échange

CCXT dispose de tests pour l'API publique et l'API privée authentifiée. Par défaut, les tests intégrés de CCXT ne testeront que les API publiques, car le dépôt de code n'inclut pas les [clés API](/docs/manual#authentication) requises pour les tests d'API privée. De plus, les tests privés inclus ne modifieront en aucun cas le solde du compte, tous les tests sont non-intrusifs. Pour activer les tests d'API privée, il faut configurer les clés API. Cela peut être fait soit dans `keys.local.json`, soit avec les variables `env`.

##### Configuration des clés API et des options dans `keys.local.json`

Les clés API des échanges peuvent être ajoutées au fichier `keys.local.json` dans le dossier racine du dépôt. S'il n'existe pas de votre côté – créez-le d'abord. Ce fichier est dans `.gitignore` et dans `.npmignore`. Vous pouvez ajouter des identifiants d'échange et diverses options pour différents échanges dans le fichier `keys.local.json`.

Un exemple de fichier `keys.local.json` :

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

##### Configuration des clés API comme variables d'environnement

Vous pouvez également définir les clés API comme variables `env` :

- https://www.google.com/search?q=set+env+variable+linux
- https://www.google.com/search?q=set+env+variable+mac
- https://www.google.com/search?q=set+env+variable+windows

Consultez la documentation de votre système d'exploitation et de votre shell pour savoir comment définir une variable d'environnement. La plupart du temps, une commande `set` ou une commande `export` fonctionnera. La commande `env` peut aider à vérifier les variables d'environnement déjà définies.

Exemples de variables `env` : `BINANCE_APIKEY`, `BINANCE_SECRET`, `KRAKEN_APIKEY`, `KRAKEN_SECRET`, etc.

#### Compilation

Avant de compiler pour la première fois, installez les dépendances Node (ignorez cette étape si vous utilisez notre image Docker) :

```
npm install
```

La commande ci-dessous compilera tout et générera les versions PHP/Python à partir des fichiers sources TS :

```
npm run build
```

#### Tests

La commande suivante testera les fichiers générés compilés (pour tous les exchanges, symboles et langages) :

```
node run-tests
```

Vous pouvez restreindre les tests à un langage spécifique, à un exchange particulier ou à un symbole :

```
node run-tests [--js] [--python] [--python-async] [--php] [--php-async] [exchange] [symbol]
```

La commande `node run-tests exchangename` tentera 5 tests : `js`, `python`, `python-async`, `php`, `php-async`. Vous pouvez contrôler cela de la manière suivante :

```
node run-tests exchange --js
node run-tests exchange --js --python-async
node run-tests exchange --js --php
node run-tests exchange --python --python-async
...
```

Cependant, si cela échoue, vous devrez peut-être descendre d'un niveau et exécuter des tests spécifiques à chaque langage pour voir ce qui ne va pas exactement :

```
node js/test/test exchange --verbose
python3 python/ccxt/test/test_sync.py exchange --verbose
python3 python/ccxt/test/test_async.py exchange --verbose
php -f php/test/test_sync.php exchange --verbose
php -f php/test/test_async.php exchange --verbose
```

`test_sync` est simplement une version synchrone de `test_async`, donc dans la plupart des cas, exécuter uniquement `test_async.py` et `test_async.php` suffit :

```
node js/test/test exchange --verbose
python3 python/ccxt/test/test_async.py exchange --verbose
php -f php/test/test_async.php exchange --verbose
```

Lorsque tous les tests spécifiques à chaque langage fonctionnent, `node run-tests` réussira également. Pour exécuter ces tests, assurez-vous que la compilation s'est terminée avec succès.

Par exemple, la première des lignes suivantes ne testera que la version JS source de la bibliothèque (`ccxt.js`). Elle ne nécessite pas d'exécuter `npm run build` avant de la lancer (peut être utile si vous avez besoin de vérifier rapidement si vos modifications cassent le code ou non) :

```bash

node run-tests --js                  # test master ccxt.js, all exchanges

# other examples require the 'npm run build' to run

node run-tests --python              # test Python sync version, all exchanges
node run-tests --php bitfinex        # test Bitfinex with PHP
node run-tests --python-async kraken # test Kraken with Python async test, requires 'npm run build'
```

#### Écriture de tests

Suivez ces étapes pour ajouter un test :

- Créez un fichier dans [ts/tests/Exchange](https://github.com/ccxt/ccxt/tree/master/ts/test/Exchange) en suivant la syntaxe pouvant être transpilée.
- Ajoutez le test à `runPrivateTests` ou `runPublicTests` dans [ts/src/test/tests.ts](https://github.com/ccxt/ccxt/blob/master/ts/src/test/tests.ts#L354) ou pour les endpoints CCXT Pro dans [ts/src/pro/test/tests.ts](https://github.com/ccxt/ccxt/blob/master/ts/src/pro/test/tests.ts#L121)
- Exécutez `npm run transpile` pour générer le fichier de test en JavaScript, Python et PHP.
- Lancez les tests avec `node run-tests`

## Soumettre des modifications au dépôt

Le processus de compilation génère de nombreuses modifications dans les fichiers d'exchange transpilés, par exemple pour Python et PHP. **Vous ne devez PAS les envoyer sur GitHub, veuillez ne soumettre que les modifications du fichier de base (TS)**.

## Contributions financières

Nous accueillons également les contributions financières en toute transparence sur notre [open collective](https://opencollective.com/ccxt).

## Remerciements

### Contributeurs

Merci à toutes les personnes qui ont déjà contribué à ccxt !

<a href="https://github.com/ccxt/ccxt/graphs/contributors"><img src="https://opencollective.com/ccxt/contributors.svg?width=890" /></a>

### Soutiens financiers

Merci à tous nos soutiens financiers ! [[Devenir un soutien financier](https://opencollective.com/ccxt#backer)]

<a href="https://opencollective.com/ccxt#backers" target="_blank"><img src="https://opencollective.com/ccxt/backers.svg?width=890"></a>

### Supporters

Soutenez ce projet en devenant supporter. Votre avatar apparaîtra ici avec un lien vers votre site web.

[[Devenir un supporter](https://opencollective.com/ccxt#supporter)]

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

### Sponsors

Merci à tous nos sponsors ! (veuillez demander à votre entreprise de soutenir également ce projet open source en [devenant sponsor](https://opencollective.com/ccxt#sponsor))

[[Devenir sponsor](https://opencollective.com/ccxt#sponsor)]

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
