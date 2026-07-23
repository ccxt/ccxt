---
title: "FAQ"
description: "Si votre question est formulée de manière aussi brève que ci-dessus, nous ne vous aiderons pas. Nous n'enseignons pas la programmation. Si vous n'êtes pas en mesure de lire et de comprendre le…"
---

# Questions Fréquemment Posées


  ## J'essaie d'exécuter le code, mais ça ne fonctionne pas, comment puis-je résoudre le problème ?

  Si votre question est formulée de manière aussi brève que ci-dessus, nous ne vous aiderons pas. Nous n'enseignons pas la programmation. Si vous n'êtes pas en mesure de lire et de comprendre le [Manuel](/docs) ou si vous ne pouvez pas suivre précisément les guides du document [CONTRIBUTING](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) sur la façon de signaler un problème, nous ne vous aiderons pas non plus. Lisez les guides CONTRIBUTING sur la façon de signaler un problème et lisez le Manuel. Vous ne devriez pas risquer l'argent et le temps de quelqu'un sans avoir lu l'intégralité du Manuel très attentivement. Vous ne devriez rien risquer si vous n'avez pas l'habitude de lire beaucoup avec une multitude de détails. De plus, si vous n'avez pas confiance en votre maîtrise du langage de programmation que vous utilisez, il existe de bien meilleurs endroits pour les bases et la pratique de la programmation. Recherchez `python tutorials`, `js videos`, jouez avec des exemples, c'est ainsi que les autres personnes gravissent la courbe d'apprentissage. Pas de raccourcis, si vous voulez apprendre quelque chose.

  ## Qu'est-ce qui est requis pour obtenir de l'aide ?

  Lorsque vous posez une question :

  - Utilisez d'abord le bouton de recherche pour les doublons !
  - **Publiez votre requête et votre réponse en mode `verbose` !** Ajoutez `exchange.verbose = true` juste avant la ligne qui vous pose problème, et copiez-collez ce que vous voyez à l'écran. C'est écrit et mentionné partout, dans la section [Dépannage](/docs/manual#troubleshooting), dans le [README](https://github.com/ccxt/ccxt/blob/master/README.md) et dans de nombreuses réponses à des questions similaires parmi les [problèmes précédents](https://github.com/ccxt/ccxt/issues) et les [pull requests](https://github.com/ccxt/ccxt/pulls). Pas d'excuses. La sortie verbose doit inclure à la fois la requête et la réponse de l'exchange.
  - Incluez la pile d'appels complète de l'erreur !
  - Indiquez votre langage de programmation **et le numéro de version du langage**
  - Indiquez le numéro de version de la bibliothèque CCXT / CCXT Pro
  - Quel exchange il s'agit
  - Quelle méthode vous essayez d'appeler

  - **Publiez votre code** pour reproduire le problème. Faites-en un programme court et exécutable complet, ne supprimez pas les lignes et rendez-le aussi compact que possible (5 à 10 lignes de code), y compris le code d'instanciation de l'exchange. Supprimez toutes les parties non pertinentes, en laissant juste l'essence du code pour reproduire le problème.
    - **NE PUBLIEZ PAS DE CAPTURES D'ÉCRAN DU CODE OU DES ERREURS, PUBLIEZ LA SORTIE ET LE CODE EN TEXTE BRUT !**
    - **Entourez le code et la sortie de triple backticks : &#096;&#096;&#096;BIEN&#096;&#096;&#096;**.
    - Ne confondez pas le symbole backtick (&#096;) avec le symbole guillemet (\'): '''MAL'''
    - Ne confondez pas un seul backtick avec des triple backticks : &#096;MAL&#096;

  - **NE PUBLIEZ PAS VOTRE `apiKey` ET VOTRE `secret` !** Gardez-les en sécurité (supprimez-les avant de publier) !

  ## J'appelle une méthode et j'obtiens une erreur, qu'est-ce que je fais de travers ?

  Vous ne signalez pas correctement le problème ) S'il vous plaît, aidez la communauté à vous aider ) Lisez ceci et suivez les étapes : https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue. Encore une fois, votre code pour reproduire le problème et votre requête et réponse verbose **SONT REQUIS**. *Juste la trace d'erreur, ou juste la réponse, ou juste la requête, ou juste le code – ce n'est pas suffisant !*

  ## J'ai obtenu un résultat incorrect d'un appel de méthode, pouvez-vous m'aider ?

  Fondamentalement la même réponse que la question précédente. Lisez et suivez **précisément** : https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue. Encore une fois, votre code pour reproduire le problème et votre requête et réponse verbose **SONT REQUIS**. *Juste la trace d'erreur, ou juste la réponse, ou juste la requête, ou juste le code – ce n'est pas suffisant !*

  ## Pouvez-vous implémenter la fonctionnalité `foo` dans l'exchange `bar` ?

  Oui, nous le pouvons. Et nous le ferons, si personne d'autre ne le fait avant nous. Il y a très peu d'intérêt à poser ce type de questions, car la réponse est toujours positive. Quand quelqu'un demande si nous pouvons faire ceci ou cela, la question ne porte pas sur nos capacités, tout se résume au temps et à la gestion nécessaires pour mettre en œuvre toutes les demandes de fonctionnalités accumulées.

  De plus, il s'agit d'une bibliothèque open-source qui est un travail en cours. Cela signifie que ce projet est destiné à être développé par la communauté des utilisateurs qui l'utilisent. Ce que vous demandez n'est pas de savoir si nous pouvons ou ne pouvons pas l'implémenter, en fait vous nous dites d'aller accomplir cette tâche particulière et ce n'est pas ainsi que nous envisageons une collaboration volontaire. Vos contributions, PRs et commits sont les bienvenus : https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code.

  Nous ne faisons pas de promesses ni d'estimations sur le travail open-source gratuit. Si vous souhaitez accélérer les choses, n'hésitez pas à nous contacter via info@ccxt.trade.

  ## Quand allez-vous ajouter la fonctionnalité `foo` pour l'exchange `bar` ? Quel est le délai estimé ? Quand pouvons-nous l'attendre ?

  Nous ne faisons pas de promesses ni d'estimations sur le travail open-source. Le raisonnement derrière cela est expliqué dans le paragraphe précédent.

  ## Quand ajouterez-vous le support d'un exchange demandé dans les Issues ?

  Encore une fois, nous ne pouvons pas promettre de dates pour l'ajout de tel ou tel exchange, pour les raisons décrites ci-dessus. La réponse restera toujours la même : _dès que nous le pourrons_.

  ## Combien de temps dois-je attendre qu'une fonctionnalité soit ajoutée ? Je dois décider si je l'implémente moi-même ou si j'attends que l'équipe de développement CCXT le fasse pour moi.

  S'il vous plaît, allez l'implémenter vous-même, n'attendez pas après nous. Nous l'ajouterons dès que nous le pourrons. De plus, vos contributions sont très bienvenues :

  - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

  ## Où en êtes-vous dans l'ajout de la fonctionnalité `foo` qui a été demandée précédemment ? Comment avancez-vous dans l'implémentation de l'exchange `bar` ?

  Ce type de questions est généralement une perte de temps, car y répondre nécessite généralement trop de temps pour le changement de contexte, et il faut souvent plus de temps pour répondre à cette question que pour satisfaire réellement la demande avec du code pour une nouvelle fonctionnalité ou un nouvel exchange. L'avancement de ce projet open-source est également ouvert, donc, chaque fois que vous vous demandez comment il se porte, consultez l'historique des commits.

  ## Quel est l'état de cette PR ? Des nouvelles ?

  Si elle n'est pas fusionnée, cela signifie que la PR contient des erreurs qui doivent d'abord être corrigées. Si elle pouvait être fusionnée telle quelle – nous l'aurions fusionnée, et vous n'auriez pas posé cette question en premier lieu. La raison la plus fréquente pour ne pas fusionner une PR est une violation de l'une des [directives CONTRIBUTING](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes). Ces directives doivent être prises au pied de la lettre, vous ne pouvez pas sauter une seule ligne ou un seul mot si vous voulez que votre PR soit fusionnée rapidement. Les contributions de code qui ne violent pas les directives sont fusionnées presque immédiatement (généralement, en quelques heures).

  ## Pouvez-vous signaler les erreurs ou ce que je devrais modifier dans ma PR pour qu'elle soit fusionnée dans la branche master ?

  Malheureusement, nous n'avons pas toujours le temps de lister rapidement chaque erreur dans le code qui empêche la fusion. Il est souvent plus facile et plus rapide d'aller simplement corriger l'erreur plutôt que d'expliquer ce qu'il faut faire pour la corriger. La plupart d'entre elles sont déjà décrites dans les [directives CONTRIBUTING](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes). La règle principale est de suivre **toutes les directives à la lettre**.

  ## Hé ! Le correctif que vous avez téléchargé est en TypeScript, pourriez-vous corriger JavaScript / Python / PHP également, s'il vous plaît ?

  Notre système de build génère automatiquement pour nous du code JavaScript, Python, PHP, C#, Go et Java spécifique à chaque exchange, il est donc transpilé depuis TypeScript, et il n'est pas nécessaire de corriger tous les langages séparément un par un.

  Ainsi, si c'est corrigé en TypeScript, c'est corrigé dans JavaScript NPM, Python pip, PHP Composer, C# NuGet, Go et Java également. Le build automatique prend généralement 15 à 20 minutes. Mettez simplement à jour votre version avec `npm`, `pip` ou `composer` **après l'arrivée de la nouvelle version** et tout ira bien.

  Plus d'informations ici :

  - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support
  - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#transpiled-generated-files


  ## Comment créer un ordre avec takeProfit+stopLoss ?
  Certains exchanges supportent `createOrder` avec des sous-ordres `stopLoss` et `takeProfit` « attachés » supplémentaires - voir [Ordres StopLoss et TakeProfit Attachés à une Position](/docs/manual#stoploss-and-takeprofit-orders-attached-to-a-position). 
  Cependant, certains exchanges pourraient ne pas supporter cette fonctionnalité et vous devrez exécuter des méthodes `createOrder` séparées pour ajouter un ordre conditionnel (par ex. ***ordre déclencheur | ordre stoploss | ordre takeprofit**) à la position déjà ouverte - voir [Ordres conditionnels](/docs/manual#conditional-orders).
  Vous pouvez également les vérifier en consultant `exchange.has['createOrderWithTakeProfitAndStopLoss']`, `exchange.has['createStopLossOrder']` et `exchange.has['createTakeProfitOrder']`, cependant ils ne sont pas aussi précis que la propriété `.features`.

  ## Quelle est la différence entre les ordres `takeProfit/stopLoss` et `takeProfitPrice/stopLossPrice`

  Chez CCXT, nous distinguons plusieurs types d'ordres takeProfit/stopLoss. Si vous souhaitez placer un ordre qui ouvre une position et attache simultanément un ordre take-profit ou stop-loss au sein de la même requête (à condition que l'exchange supporte cette fonctionnalité), vous devez utiliser la syntaxe `takeProfit/stopLoss`.
  Nous désignons ces ordres TP/SL attachés comme **type 3**.

  Exemple :
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

  Si l'exchange ne supporte pas ces ordres attachés, ou si vous souhaitez placer un ordre indépendant qui agira comme un ordre stop Loss/take profit, vous pouvez alors placer un ordre `stopLossPrice` **ou** `takeProfitPrice`, nous appelons ces ordres sl/tp indépendants **type 2**.

  Exemple
  ```python
      symbol = 'ADA/USDT:USDT'
      main_order = await binance.create_order(symbol, 'market', 'buy', 50) # open position
      tp_order = await binance.create_order(symbol, 'limit', 'sell', 50, 1.5, {"takeProfitPrice": 1.6}) # take profit order
      sl_order = await binance.create_order(symbol, 'limit', 'sell', 50, 0.24, {"stopLossPrice": 0.25}) # stop loss order
  ```

 ## Comment fonctionnent les ordres trailing ?
  Certains exchanges supportent l'utilisation de `createOrder` pour créer un ordre `trailingPercent` ou `trailingAmount` - voir : [Ordres Trailing](/docs/manual#trailing-orders)
  
  Les ordres trailing suivent le prix actuel du marché à la hausse ou à la baisse d'un certain pourcentage ou d'un certain montant en devise de cotation. L'ordre suit dans une direction mais pas dans l'autre afin de pouvoir éventuellement être exécuté. L'ordre exécuté peut être un ordre au marché ou un ordre à cours limité. Un ordre trailing peut généralement être placé pour ouvrir une position, ou combiné avec le paramètre `reduceOnly` défini à true afin de clôturer une position. Ces détails sur les ordres autorisés dépendent de l'exchange. Les ordres trailing supportent souvent un paramètre `trailingTriggerPrice` et si le prix actuel du marché franchit cette valeur, la fonction de trailing définie par `trailingPercent` ou `trailingAmount` se déclenchera.
  
  Certains exchanges pourraient ne pas supporter cette fonctionnalité de trailing. Vous pouvez vérifier la propriété `.features`. Vous pouvez également vérifier si `createOrder` sur l'exchange que vous utilisez a `trailingPercent` ou `trailingAmount` comme paramètre disponible dans la docstring. Certains exchanges peuvent avoir `exchange.has['createTrailingPercentOrder']` ou `exchange.has['createTrailingAmountOrder']` défini à true, ce qui signale que les paramètres `trailingPercent` ou `trailingAmount` sont disponibles dans `createOrder`.

Exemples de création d'ordres `trailingPercent` et `trailingAmount` :
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

  ## Comment créer un achat au marché au comptant avec un coût ?
  Pour créer un ordre d'achat au marché avec un coût, vous devez d'abord vérifier si l'exchange prend en charge cette fonctionnalité (`exchange.has['createMarketBuyOrderWithCost']).
  Si c'est le cas, vous pouvez utiliser la méthode `createMarketBuyOrderWithCost`.
  Exemple :
  ```python
  order = await exchange.createMarketBuyOrderWithCost(symbol, cost)
  ```

## Que signifie l'option `createMarketBuyRequiresPrice` ?

De nombreux exchanges exigent que le montant soit exprimé dans la devise de cotation (ils n'acceptent pas le montant de base) lors du passage d'ordres d'achat au marché au comptant. Dans ces cas, l'exchange aura l'option `createMarketBuyRequiresPrice` définie à `true`.

Exemple : Si vous souhaitez acheter BTC/USDT avec un ordre d'achat au marché, vous devez fournir un montant = 5 USDT au lieu de 0.000X. Nous disposons d'une vérification pour éviter les erreurs qui exigent explicitement le prix, car les utilisateurs fournissent généralement le montant dans la devise de base.

Ainsi, par défaut, si vous faites `create_order(symbol, 'market,' 'buy,' 10)`, une erreur sera levée si l'exchange possède cette option (`createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false...`).

Si l'exchange exige le coût et que l'utilisateur a fourni le montant de base, nous devons demander un paramètre supplémentaire **price** et les multiplier pour obtenir le coût. Si vous êtes conscient de ce comportement, vous pouvez simplement désactiver `createMarketBuyOrderRequiresPrice` et passer le coût dans le paramètre amount, mais le désactiver ne signifie pas que vous pouvez passer l'ordre en utilisant le montant de base au lieu de la devise de cotation.

Si vous faites `create_order(symbol, 'market', 'buy', 0.001, 20000)`, ccxt utilisera le prix requis pour calculer le coût en effectuant `0.01*20000` et enverra cette valeur à l'exchange.

Si vous souhaitez fournir le coût directement dans l'argument amount, vous pouvez faire `exchange.options['createMarketBuyOrderRequiresPrice'] = False` (vous reconnaissez que le montant sera le coût pour un achat au marché), puis vous pouvez faire `create_order(symbol, 'market', 'buy', 10)`

Ceci permet essentiellement d'éviter qu'un utilisateur fasse : `create_order('SHIB/USDT', market, buy, 1000000)` en pensant acheter 1 million de SHIB alors qu'en réalité il achète pour 1 million de USDT de SHIB. Pour cette raison, par défaut ccxt accepte toujours la devise de base dans le paramètre amount.

Alternativement, vous pouvez utiliser les fonctions `createMarketBuyOrderWithCost`/ `createMarketSellOrderWithCost` si elles sont disponibles.

  Voir aussi : [Achats au marché](/docs/manual#market-buys)

  ## Quelle est la différence entre le trading au comptant et les swaps/futures perpétuels ?
  Le trading au comptant consiste à acheter ou vendre un instrument financier (comme une cryptomonnaie) pour livraison immédiate. C'est simple et implique l'échange direct d'actifs.

  Le trading de swaps, en revanche, implique des contrats dérivés où deux parties échangent des instruments financiers ou des flux de trésorerie à une date future fixée, en fonction de l'actif sous-jacent. Les swaps sont souvent utilisés pour le levier, la spéculation ou la couverture, et n'impliquent pas nécessairement l'échange de l'actif sous-jacent avant l'expiration du contrat.


  De plus, vous manipulerez des contrats si vous tradez des swaps et non la devise de base (par exemple, BTC) directement ; ainsi, si vous créez un ordre avec `amount = 1`, le montant en BTC variera en fonction du `contractSize`. Vous pouvez vérifier la taille du contrat en faisant :

  ```python
  await exchange.loadMarkets()
  symbol = 'XRP/USDT:USDT'
  market = exchange.market(symbol)
  print(market['contractSize'])
  ```

  ## Pourquoi est-ce que je reçois une erreur indiquant « must be greater than minimum amount precision of 1 » ?
  Il s'agit d'une erreur courante qui survient lors de la création d'ordres sur des marchés de contrats. Cette erreur se produit lorsque l'exchange attend un nombre entier de contrats (1, 2, 3, etc.) dans l'argument amount de createOrder.
  
  Chaque contrat vaut un certain montant de l'actif de base, déterminé par le contractSize. Vous pouvez récupérer le contractSize depuis la structure de marché d'un symbole comme ceci :
  ```python
  await exchange.loadMarkets()
  symbol = 'SOL/USDT:USDT'
  market = exchange.market(symbol)
  print(market['contractSize'])
  ```

  Si vous créez un ordre avec `amount = 1`, le montant de l'actif de base utilisé pour l'ordre variera en fonction du `contractSize` du symbole.

  Voici une formule et un exemple pour trouver le nombre de `contracts` à utiliser pour l'argument amount si vous souhaitez utiliser 0,5 de l'actif de base :
  ```python
  await exchange.loadMarkets()
  symbol = 'SOL/USDT:USDT'
  market = exchange.market(symbol)
  # Converting a 0.5 base amount to the number of contracts:
  # Formula: contracts = (base amount / contract size)
  contracts = round(0.5 / market['contractSize'])
  ```

  Voici un exemple permettant de trouver le montant de base qui sera utilisé avec un argument amount de 1 contrat :
  ```python
  await exchange.loadMarkets()
  symbol = 'SOL/USDT:USDT'
  market = exchange.market(symbol)
  # Finding the base amount that will be used with 1 contract:
  # Formula: base amount = (contracts * contract size)
  contracts = 1
  base_amount = (contracts * market['contractSize'])
  ```

  ## Comment passer un ordre reduceOnly ?
  Un ordre reduceOnly est un type d'ordre qui ne peut que réduire une position, sans l'augmenter. Pour passer un ordre reduceOnly, vous utilisez généralement la méthode createOrder avec un paramètre reduceOnly défini à true. Cela garantit que l'ordre ne s'exécutera que s'il diminue la taille d'une position ouverte, et il sera partiellement exécuté ou pas du tout si son exécution augmentait la taille de la position.


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


  ## Comment vérifier l'endpoint utilisé par la méthode unifiée ?
  Pour vérifier l'endpoint utilisé par une méthode unifiée dans la bibliothèque CCXT, vous devez généralement consulter le code source de la bibliothèque pour l'implémentation spécifique de l'exchange qui vous intéresse. Les méthodes unifiées dans CCXT abstraient les détails des endpoints spécifiques avec lesquels elles interagissent, de sorte que ces informations ne sont pas directement exposées via l'API de la bibliothèque. Pour une inspection détaillée, vous pouvez consulter l'implémentation de la méthode pour l'exchange particulier dans le code source de la bibliothèque CCXT sur GitHub.

  Voir aussi : [API unifiée](/docs/manual#unified-api)

  ## Comment différencier previousFundingRate, fundingRate et nextFundingRate dans la structure du taux de financement ?
  La structure du taux de financement contient trois valeurs différentes qui peuvent être retournées :
  1. `previousFundingRate` désigne le taux le plus récemment complété.
  2. `fundingRate` est le taux à venir. Cette valeur change en permanence jusqu'à ce que l'heure de financement soit passée, après quoi elle devient le previousFundingRate.
  3. `nextFundingRate` n'est pris en charge que par quelques exchanges et représente le taux de financement prévu après le taux à venir. Cette valeur correspond au taux de financement dans deux périodes.

  Par exemple, supposons qu'il soit 12h30. Le `previousFundingRate` s'est produit à 12h00 et nous cherchons à connaître le prochain taux de financement en vérifiant la valeur `fundingRate`. Dans cet exemple, avec des intervalles de 4 heures, le `fundingRate` se produira à l'avenir à 4h00 et le `nextFundingRate` est le taux prévu qui se produira à 8h00.

## Comment utiliser l'exchange Lighter dans CCXT ?

Lighter est disponible dans CCXT et fonctionne de manière similaire à tout autre exchange CCXT, mais il présente certaines particularités qui peuvent prêter à confusion pour certains utilisateurs ; nous les expliquerons en détail ci-dessous. Nous devons simplement définir quelques identifiants de base et dépendances.


Depuis la dernière mise à jour, CCXT a simplifié le processus d'authentification et l'utilisation de la clé privée L1 est désormais suffisante.

## Exigences en matière d'identifiants

Lighter nécessite les éléments suivants :
- `privateKey` : la clé privée L1 **obligatoire**
- `accountIndex` (un entier) dans `exchange.options` : — **optionnel** CCXT le récupérera s'il n'est pas disponible ; à définir si vous utilisez un sous-compte
- `apiKeyIndex` (un entier) dans `exchange.options` : **optionnel** CCXT utilisera une valeur par défaut (254)

Exemple

```python
lighter = ccxt.lighter({
	'privateKey': 'XXXXXXX', # l1 private key
})
```

### Exigences en matière de dépendances

Étant donné que les algorithmes de signature et les structures ne sont pas pris en charge nativement dans tous les langages, CCXT utilise les binaires officiellement distribués et interagit avec eux pour effectuer le processus de signature (via FFI/WASM) ; selon le langage, vous devez donc fournir un chemin vers ce binaire.

### Utilisateurs Python/C#/PHP :

- Les binaires peuvent être téléchargés ici : https://github.com/elliottech/lighter-python/tree/main/lighter/signers
- Le chemin vers le binaire doit être fourni en tant que `libraryPath`
- Vous devez choisir le binaire selon votre système d'exploitation/architecture

```python
lighter = ccxt.lighter({
	'options': {
		'libraryPath': 'path/to/lighter-signer-linux-arm64.so',
	}
})
```

### Utilisateurs JavaScript/Typescript

- CCXT utilise le binaire WASM compilé à partir du package officiel, téléchargeable ici https://github.com/ccxt/lighter-wasm ou à construire à partir des sources
- Vous devez également fournir le chemin vers `exec_wasm.js` ; vous pouvez soit le télécharger depuis le même dépôt, soit vérifier le chemin vers votre fichier local (en supposant que Go est installé)

```javascript
lighter = ccxt.lighter({
	'options': {
		'libraryPath': '/user/cjg/Git/lighter-wasm/lighter.wasm',
		'wasmExecPath': '/opt/homebrew/opt/go/libexec/lib/wasm/wasm_exec.js'
	}
})
```

### Utilisateurs GO

- Aucune dépendance supplémentaire n'est requise ; CCXT utilise le package GO officiel et vous n'avez qu'à fournir les identifiants


## Comment utiliser l'exchange DyDx dans CCXT ?

DyDx est disponible dans CCXT et fonctionne de manière similaire à tout autre exchange CCXT, mais il présente certaines particularités qui peuvent prêter à confusion pour certains utilisateurs ; nous les expliquerons en détail ci-dessous. Nous devons simplement définir quelques identifiants de base et dépendances.

En raison des exigences actuelles en matière de dépendances liées à la signature, l'exchange n'est disponible qu'en Python et JavaScript. La prise en charge de langages supplémentaires sera introduite une fois que les dépendances nécessaires auront été portées.


## Exigences en matière d'identifiants

DyDx nécessite l'un des éléments suivants :
- `privateKey` : la clé privée l1 (hex) utilisée sur dydx, ou vous pouvez définir le mnémonique l2 dans les options
- `mnemonic` dans `exchange.options` : les 24 mots pour récupérer votre clé privée l2, que vous pouvez trouver dans l'interface web

Exemple

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

### Exigences en matière de dépendances

DyDx nécessite une dépendance supplémentaire pour les utilisateurs Python. Avant de l'utiliser, vous devez installer pycryptodom localement.

```bash
$ pip3 install pycryptodom
```


De plus, protobuf est également requis, mais ce n'est pas une dépendance directe de CCXT. Vous devrez l'installer manuellement :

```
npm install protobufjs // javascript/typescript
pip install "protobuf==5.29.5" // python
```

### Utilisation

L'utilisation est globalement cohérente avec les autres exchanges, bien que certains comportements diffèrent.

Par exemple, bien que les ordres puissent être passés normalement, l'annulation d'un ordre sur dYdX n'utilise pas le orderId traditionnel. À la place, dYdX exige des champs supplémentaires tels que :

- clientOrderId, et non le orderId
- orderFlags (0 pour les ordres au marché et les ordres non-limit GTT, 64 pour les ordres limit GTT, et 32 pour les ordres conditionnels) ; ccxt suppose 64 par défaut
- goodTillBlockTimeInSeconds (requis pour les ordres à long terme et les ordres conditionnels ; CCXT suppose par défaut 30 jours)
- subAccountId, ccxt suppose 0 par défaut

CCXT fournit des valeurs par défaut raisonnables pour les cas d'utilisation les plus courants ; cependant, vous pourrez avoir besoin de les remplacer (en utilisant params ou options) selon vos besoins spécifiques.

### Comment utiliser l'exchange GRVT dans CCXT ?

GRVT fonctionne de manière similaire à tout autre DEX CCXT et ne nécessite que la clé privée l1 du portefeuille.

Voici un exemple d'instanciation de l'exchange GRVT :

```
exchange = ccxt.grvt({
	'privateKey': 'XXXXXXX', // the l1 private key (hex)
})
```
Remarque : Pour les utilisateurs qui se sont inscrits par e-mail, leur portefeuille est alimenté par Privy (la solution de portefeuille intégré de GRVT). Pour exporter la clé privée :

1. Allez sur https://home.privy.io
2. Connectez-vous avec le même compte e-mail/Google utilisé pour vous inscrire sur GRVT
3. Depuis là, vous pouvez exporter la clé privée

*(Si vous avez besoin d'aide, vous pouvez visiter https://support.privy.io)*

CCXT est également un constructeur sur GRVT, ce qui signifie que par défaut les utilisateurs paieront 1 bps (0,01 %) supplémentaire pour l'utiliser via CCXT ; cependant, ce frais est totalement optionnel et peut être désactivé en fournissant l'option `builderFee: False` dans les options. Votre contribution est toutefois très appréciée.

```
exchange.options['builderFee'] = False
```
