---
title: "FAQ"
description: "Se a sua pergunta for formulada de forma resumida como acima, não ajudaremos. Não ensinamos programação. Se não conseguir ler e entender o…"
---

# Perguntas Frequentes


  ## Estou tentando executar o código, mas não está funcionando, como posso corrigir?

  Se a sua pergunta for formulada de forma resumida como acima, não ajudaremos. Não ensinamos programação. Se não conseguir ler e entender o [Manual](/docs) ou não conseguir seguir precisamente os guias do documento [CONTRIBUTING](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) sobre como reportar um problema, também não ajudaremos. Leia os guias do CONTRIBUTING sobre como reportar um problema e leia o Manual. Você não deve arriscar o dinheiro e o tempo de ninguém sem ler todo o Manual com muito cuidado. Não deve arriscar nada se não estiver acostumado a muita leitura com muitos detalhes. Além disso, se não tiver confiança na linguagem de programação que está usando, existem lugares muito melhores para os fundamentos e prática de programação. Pesquise por `python tutorials`, `js videos`, brinque com exemplos, é assim que outras pessoas sobem a curva de aprendizado. Sem atalhos, se você quer aprender algo.

  ## O que é necessário para obter ajuda?

  Ao fazer uma pergunta:

  - Use o botão de busca para verificar duplicatas primeiro!
  - **Publique sua requisição e resposta no modo `verbose`!** Adicione `exchange.verbose = true` logo antes da linha em que está tendo problemas e copie e cole o que você vê na tela. Está escrito e mencionado em toda parte, na seção [Troubleshooting](/docs/manual#troubleshooting), no [README](https://github.com/ccxt/ccxt/blob/master/README.md) e em muitas respostas a perguntas semelhantes entre [issues anteriores](https://github.com/ccxt/ccxt/issues) e [pull requests](https://github.com/ccxt/ccxt/pulls). Sem desculpas. A saída verbose deve incluir tanto a requisição quanto a resposta da exchange.
  - Inclua o callstack completo do erro!
  - Escreva sua linguagem de programação **e o número da versão da linguagem**
  - Escreva o número da versão da biblioteca CCXT / CCXT Pro
  - Qual exchange é
  - Qual método você está tentando chamar

  - **Publique seu código** para reproduzir o problema. Faça um programa completo e curto que possa ser executado, não omita linhas e torne-o o mais compacto possível (5-10 linhas de código), incluindo o código de instanciação da exchange. Remova todas as partes irrelevantes, deixando apenas a essência do código para reproduzir o problema.
    - **NÃO PUBLIQUE CAPTURAS DE TELA DE CÓDIGO OU ERROS, PUBLIQUE A SAÍDA E O CÓDIGO EM TEXTO SIMPLES!**
    - **Envolva o código e a saída com três acentos graves: &#096;&#096;&#096;BOM&#096;&#096;&#096;**.
    - Não confunda o símbolo de acento grave (&#096;) com o símbolo de aspas (\'): '''RUIM'''
    - Não confunda um único acento grave com três acentos graves: &#096;RUIM&#096;

  - **NÃO PUBLIQUE SUA `apiKey` E `secret`!** Mantenha-os seguros (remova-os antes de publicar)!

  ## Estou chamando um método e recebo um erro, o que estou fazendo de errado?

  Você não está reportando o problema corretamente ) Por favor, ajude a comunidade a ajudá-lo ) Leia isso e siga os passos: https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue. Mais uma vez, seu código para reproduzir o problema e sua requisição e resposta verbose **SÃO OBRIGATÓRIOS**. *Apenas o rastreamento de erro, ou apenas a resposta, ou apenas a requisição, ou apenas o código – não é suficiente!*

  ## Obtive um resultado incorreto de uma chamada de método, você pode ajudar?

  Basicamente a mesma resposta que a pergunta anterior. Leia e siga **precisamente**: https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue. Mais uma vez, seu código para reproduzir o problema e sua requisição e resposta verbose **SÃO OBRIGATÓRIOS**. *Apenas o rastreamento de erro, ou apenas a resposta, ou apenas a requisição, ou apenas o código – não é suficiente!*

  ## Você pode implementar o recurso `foo` na exchange `bar`?

  Sim, podemos. E iremos, se ninguém mais fizer isso antes de nós. Há muito pouco sentido em fazer esse tipo de pergunta, porque a resposta é sempre positiva. Quando alguém pergunta se podemos fazer isso ou aquilo, a questão não é sobre nossas capacidades, tudo se resume ao tempo e gerenciamento necessários para implementar todos os pedidos de recursos acumulados.

  Além disso, esta é uma biblioteca de código aberto que é um trabalho em andamento. Isso significa que este projeto se destina a ser desenvolvido pela comunidade de usuários que o utilizam. O que você está pedindo não é se podemos ou não implementá-lo; na verdade, você está nos dizendo para fazer aquela tarefa específica e não é assim que vemos uma colaboração voluntária. Suas contribuições, PRs e commits são bem-vindos: https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code.

  Não damos promessas ou estimativas sobre trabalho gratuito de código aberto. Se desejar acelerar, fique à vontade para nos contatar pelo e-mail info@ccxt.trade.

  ## Quando você vai adicionar o recurso `foo` para a exchange `bar`? Qual é o prazo estimado? Quando devemos esperar isso?

  Não damos promessas ou estimativas sobre o trabalho de código aberto. O raciocínio por trás disso está explicado no parágrafo anterior.

  ## Quando você vai adicionar suporte para uma exchange solicitada nas Issues?

  Novamente, não podemos prometer datas para adicionar esta ou aquela exchange, devido às razões descritas acima. A resposta sempre permanecerá a mesma: _assim que pudermos_.

  ## Quanto tempo devo esperar para que um recurso seja adicionado? Preciso decidir se devo implementá-lo eu mesmo ou esperar que a equipe de desenvolvimento do CCXT o implemente para mim.

  Por favor, vá em frente e implemente você mesmo, não espere por nós. Iremos adicioná-lo assim que pudermos. Além disso, suas contribuições são muito bem-vindas:

  - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

  ## Qual é o seu progresso na adição do recurso `foo` que foi solicitado anteriormente? Como está indo a implementação da exchange `bar`?

  Este tipo de pergunta geralmente é uma perda de tempo, porque respondê-la geralmente requer muito tempo para troca de contexto, e muitas vezes leva mais tempo para responder a essa pergunta do que para realmente satisfazer a solicitação com código para um novo recurso ou uma nova exchange. O progresso deste projeto de código aberto também é aberto, então, quando você estiver se perguntando como está indo, dê uma olhada no histórico de commits.

  ## Qual é o status deste PR? Alguma atualização?

  Se não foi mesclado, significa que o PR contém erros que devem ser corrigidos primeiro. Se pudesse ser mesclado como está – teríamos mesclado, e você não teria feito essa pergunta em primeiro lugar. O motivo mais frequente para não mesclar um PR é uma violação de qualquer uma das [diretrizes do CONTRIBUTING](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes). Essas diretrizes devem ser interpretadas literalmente, não se pode pular uma única linha ou palavra de lá se você quiser que seu PR seja mesclado rapidamente. Contribuições de código que não violam as diretrizes são mescladas quase imediatamente (geralmente, em horas).

  ## Você pode apontar os erros ou o que devo editar no meu PR para que seja mesclado no branch master?

  Infelizmente, nem sempre temos tempo para listar rapidamente cada erro no código que impede a mesclagem. Frequentemente é mais fácil e rápido simplesmente corrigir o erro do que explicar o que se deve fazer para corrigi-lo. A maioria deles já está descrita nas [diretrizes do CONTRIBUTING](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes). A principal regra prática é seguir **todas as diretrizes literalmente**.

  ## Ei! A correção que você enviou está em TypeScript, você também vai corrigir JavaScript / Python / PHP, por favor?

  Nosso sistema de build gera código JavaScript, Python, PHP, C#, Go e Java específico de exchange para nós automaticamente, então é transpilado a partir de TypeScript, e não há necessidade de corrigir todos os idiomas separadamente um por um.

  Portanto, se estiver corrigido em TypeScript, também estará corrigido em JavaScript NPM, Python pip, PHP Composer, C# NuGet, Go e Java. A build automática geralmente leva 15-20 minutos. Basta atualizar sua versão com `npm`, `pip` ou `composer` **após a chegada da nova versão** e tudo ficará bem.

  Mais sobre isso aqui:

  - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support
  - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#transpiled-generated-files


  ## Como criar uma ordem com takeProfit+stopLoss?
  Algumas exchanges suportam `createOrder` com as sub-ordens adicionais "anexadas" `stopLoss` e `takeProfit` - veja [Ordens StopLoss e TakeProfit Anexadas a uma Posição](/docs/manual#stoploss-and-takeprofit-orders-attached-to-a-position). 
  No entanto, algumas exchanges podem não suportar esse recurso e você precisará executar métodos `createOrder` separados para adicionar uma ordem condicional (por exemplo, ***ordem trigger | ordem stoploss | ordem takeprofit**) à posição já aberta - veja [Ordens Condicionais](/docs/manual#conditional-orders).
  Você também pode verificá-las consultando `exchange.has['createOrderWithTakeProfitAndStopLoss']`, `exchange.has['createStopLossOrder']` e `exchange.has['createTakeProfitOrder']`, porém eles não são tão precisos quanto a propriedade `.features`.

  ## Qual é a diferença entre ordens `takeProfit/stopLoss` e `takeProfitPrice/stopLossPrice`

  No CCXT, distinguimos entre vários tipos de ordens takeProfit/stopLoss. Se você quiser colocar uma ordem que abre uma posição e simultaneamente anexa uma ordem de take-profit ou stop-loss dentro da mesma requisição (desde que a exchange suporte esse recurso), você deve usar a sintaxe `takeProfit/stopLoss`.
  Referimo-nos a essas ordens TP/SL anexadas como **tipo 3**.

  Exemplo:
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

  Se a exchange não suportar essas ordens anexadas, ou se você quiser colocar uma ordem independente que atuará como uma ordem de stop loss/take profit, então você pode colocar uma ordem `stopLossPrice` **ou** `takeProfitPrice`; chamamos essas ordens sl/tp independentes de **tipo 2**.

  Exemplo
  ```python
      symbol = 'ADA/USDT:USDT'
      main_order = await binance.create_order(symbol, 'market', 'buy', 50) # open position
      tp_order = await binance.create_order(symbol, 'limit', 'sell', 50, 1.5, {"takeProfitPrice": 1.6}) # take profit order
      sl_order = await binance.create_order(symbol, 'limit', 'sell', 50, 0.24, {"stopLossPrice": 0.25}) # stop loss order
  ```

 ## Como funcionam as ordens trailing?
  Algumas exchanges suportam o uso de `createOrder` para criar uma ordem `trailingPercent` ou `trailingAmount` - veja: [Ordens Trailing](/docs/manual#trailing-orders)
  
  As ordens trailing seguem o preço de mercado atual por uma porcentagem ou um valor em moeda de cotação. A ordem segue em uma direção, mas não na outra, para que eventualmente possa ser executada. A ordem executada pode ser uma ordem a mercado ou uma ordem limitada. Uma ordem trailing geralmente pode ser colocada para abrir uma posição, ou combinada com o parâmetro `reduceOnly` definido como verdadeiro para fechar uma posição. Esses detalhes sobre quais ordens são permitidas dependem da exchange. As ordens trailing frequentemente suportam um parâmetro `trailingTriggerPrice` e, se o preço de mercado atual cruzar esse valor, iniciará a função de trailing definida por `trailingPercent` ou `trailingAmount`.
  
  Algumas exchanges podem não suportar esse recurso de trailing. Você pode verificar a propriedade `.features`. Você também pode verificar se `createOrder` na exchange que está usando tem `trailingPercent` ou `trailingAmount` como parâmetro disponível na docstring. Algumas exchanges podem ter `exchange.has['createTrailingPercentOrder']` ou `exchange.has['createTrailingAmountOrder']` definido como verdadeiro, o que indica que os parâmetros `trailingPercent` ou `trailingAmount` estão disponíveis em `createOrder`.

Exemplos de criação de ordens com `trailingPercent` e `trailingAmount`:
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

  ## Como criar uma compra a mercado no spot com custo?
  Para criar uma ordem de compra a mercado com custo, primeiro você precisa verificar se a exchange suporta esse recurso (`exchange.has['createMarketBuyOrderWithCost']).
  Se suportar, você pode usar o método `createMarketBuyOrderWithCost`.
  Exemplo:
  ```python
  order = await exchange.createMarketBuyOrderWithCost(symbol, cost)
  ```

## O que significa a opção `createMarketBuyRequiresPrice`?

Muitas exchanges exigem que o valor seja na moeda de cotação (não aceitam o valor na moeda base) ao realizar ordens de compra a mercado no spot. Nesses casos, a exchange terá a opção `createMarketBuyRequiresPrice` definida como `true`.

Exemplo: Se você quisesse comprar BTC/USDT com uma ordem de compra a mercado, precisaria fornecer um valor = 5 USDT em vez de 0.000X. Existe uma verificação para evitar erros que exige explicitamente o preço, pois os usuários geralmente fornecem o valor na moeda base.

Portanto, por padrão, se você fizer `create_order(symbol, 'market,' 'buy,' 10)`, um erro será lançado se a exchange tiver essa opção (`createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false...`).

Se a exchange exige o custo e o usuário forneceu o valor na moeda base, precisamos solicitar um parâmetro extra **price** e multiplicá-los para obter o custo. Se você está ciente desse comportamento, pode simplesmente desativar `createMarketBuyOrderRequiresPrice` e passar o custo no parâmetro de valor, mas desativá-lo não significa que você pode realizar a ordem usando o valor na moeda base em vez da moeda de cotação.

Se você fizer `create_order(symbol, 'market', 'buy', 0.001, 20000)`, o ccxt usará o preço fornecido para calcular o custo fazendo `0.01*20000` e enviará esse valor para a exchange.

Se você quiser fornecer o custo diretamente no argumento de valor, pode fazer `exchange.options['createMarketBuyOrderRequiresPrice'] = False` (você reconhece que o valor será o custo para compra a mercado) e então pode fazer `create_order(symbol, 'market', 'buy', 10)`

Isso serve basicamente para evitar que um usuário faça: `create_order('SHIB/USDT', market, buy, 1000000)` e pense que está tentando comprar 1kk de shib quando na realidade está comprando 1kk USDT em SHIB. Por esse motivo, por padrão o ccxt sempre aceita a moeda base no parâmetro de valor.

Alternativamente, você pode usar as funções `createMarketBuyOrderWithCost`/ `createMarketSellOrderWithCost` se estiverem disponíveis.

  Veja mais: [Market Buys](/docs/manual#market-buys)

  ## Qual é a diferença entre negociação spot e swap/futuros perpétuos?
  A negociação spot envolve a compra ou venda de um instrumento financeiro (como uma criptomoeda) para entrega imediata. É direta, envolvendo a troca direta de ativos.

  A negociação de swaps, por outro lado, envolve contratos derivativos onde duas partes trocam instrumentos financeiros ou fluxos de caixa em uma data futura definida, com base no ativo subjacente. Os swaps são frequentemente usados para alavancagem, especulação ou hedge e não necessariamente envolvem a troca do ativo subjacente até o vencimento do contrato.


  Além disso, você estará lidando com contratos ao negociar swaps e não diretamente com a moeda base (por exemplo, BTC), portanto, se você criar uma ordem com `amount = 1`, o valor em BTC variará dependendo do `contractSize`. Você pode verificar o tamanho do contrato fazendo:

  ```python
  await exchange.loadMarkets()
  symbol = 'XRP/USDT:USDT'
  market = exchange.market(symbol)
  print(market['contractSize'])
  ```

  ## Por que estou recebendo um erro que diz "must be greater than minimum amount precision of 1"?
  Este é um erro comum que ocorre ao criar ordens para mercados de contratos. Esse erro acontece quando a exchange espera um número natural de contratos (1, 2, 3, etc.) no argumento de valor de createOrder.
  
  Cada contrato vale uma certa quantidade do ativo base, determinada pelo contractSize. Você pode recuperar o contractSize da estrutura de mercado de um símbolo assim:
  ```python
  await exchange.loadMarkets()
  symbol = 'SOL/USDT:USDT'
  market = exchange.market(symbol)
  print(market['contractSize'])
  ```

  Se você criar uma ordem com `amount = 1`, o valor do ativo base utilizado na ordem variará dependendo do `contractSize` do símbolo.

  Abaixo está uma fórmula e um exemplo para encontrar o número de `contracts` que você deve usar para o argumento de valor se quiser usar 0.5 do ativo base:
  ```python
  await exchange.loadMarkets()
  symbol = 'SOL/USDT:USDT'
  market = exchange.market(symbol)
  # Converting a 0.5 base amount to the number of contracts:
  # Formula: contracts = (base amount / contract size)
  contracts = round(0.5 / market['contractSize'])
  ```

  Aqui está um exemplo de como encontrar o valor base que será usado com um argumento de valor de 1 contrato:
  ```python
  await exchange.loadMarkets()
  symbol = 'SOL/USDT:USDT'
  market = exchange.market(symbol)
  # Finding the base amount that will be used with 1 contract:
  # Formula: base amount = (contracts * contract size)
  contracts = 1
  base_amount = (contracts * market['contractSize'])
  ```

  ## Como colocar uma ordem reduceOnly?
  Uma ordem reduceOnly é um tipo de ordem que só pode reduzir uma posição, não aumentá-la. Para colocar uma ordem reduceOnly, você normalmente usa o método createOrder com o parâmetro reduceOnly definido como true. Isso garante que a ordem só será executada se diminuir o tamanho de uma posição aberta, e ela será parcialmente preenchida ou não será preenchida se a execução aumentar o tamanho da posição.


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


  ## Como verificar o endpoint usado pelo método unificado?
  Para verificar o endpoint usado por um método unificado na biblioteca CCXT, geralmente você precisaria consultar o código-fonte da biblioteca para a implementação específica da exchange em que está interessado. Os métodos unificados no CCXT abstraem os detalhes dos endpoints específicos com os quais interagem, portanto, essas informações não são diretamente expostas pela API da biblioteca. Para uma inspeção detalhada, você pode ver a implementação do método para a exchange específica no código-fonte da biblioteca CCXT no GitHub.

  Veja mais: [Unified API](/docs/manual#unified-api)

  ## Como diferenciar entre previousFundingRate, fundingRate e nextFundingRate na estrutura de taxa de financiamento?
  A estrutura de taxa de financiamento possui três valores diferentes de taxa de financiamento que podem ser retornados:
  1. `previousFundingRate` refere-se à taxa concluída mais recentemente.
  2. `fundingRate` é a taxa futura. Este valor está sempre mudando até que o tempo de financiamento passe e então se torna o previousFundingRate.
  3. `nextFundingRate` é suportado apenas em algumas exchanges e é a taxa de financiamento prevista após a taxa futura. Este valor representa duas taxas de financiamento a partir de agora.

  Como exemplo, digamos que são 12:30. O `previousFundingRate` aconteceu às 12:00 e estamos verificando qual será a taxa de financiamento futura pelo valor de `fundingRate`. Neste exemplo, dado intervalos de 4 horas, o `fundingRate` acontecerá no futuro às 4:00 e o `nextFundingRate` é a taxa prevista que acontecerá às 8:00.

## Como usar a Exchange Lighter no CCXT?

Lighter está disponível como parte do CCXT e funciona de forma semelhante a qualquer outra exchange CCXT, mas possui algumas particularidades que podem ser confusas para alguns usuários, as quais explicaremos em detalhes abaixo. Basta definir algumas credenciais básicas e dependências.


Após a última atualização, o CCXT simplificou o processo de autenticação e agora usar a chave privada L1 é suficiente.

## Requisitos de credenciais

Lighter requer o seguinte:
- `privateKey`: a chave privada L1 **obrigatória**
- `accountIndex` (um inteiro) em `exchange.options`: — **opcional** o CCXT buscará se não estiver disponível, defina-o se estiver usando uma subconta
- `apiKeyIndex` (um inteiro) em `exchange.options`: **opcional** o CCXT usará um valor padrão (254)

Exemplo

```python
lighter = ccxt.lighter({
	'privateKey': 'XXXXXXX', # l1 private key
})
```

### Requisitos de dependências

Como os algoritmos de assinatura e as structs não são suportados nativamente em todos os idiomas, o CCXT usa os binários oficialmente distribuídos e interage com eles para realizar o processo de assinatura (via FFI/WASM), portanto, dependendo do idioma, você precisa fornecer um caminho para esse binário.

### Usuários de Python/C#/PHP:

- Os binários podem ser baixados aqui: https://github.com/elliottech/lighter-python/tree/main/lighter/signers
- O caminho para o binário precisa ser fornecido como `libraryPath`
- Você precisa escolher o binário de acordo com seu sistema operacional/arquitetura

```python
lighter = ccxt.lighter({
	'options': {
		'libraryPath': 'path/to/lighter-signer-linux-arm64.so',
	}
})
```

### Usuários de Javascript/Typescript

- O CCXT está usando o binário WASM construído a partir do pacote oficial e pode ser baixado aqui https://github.com/ccxt/lighter-wasm ou construído a partir do código-fonte
- Você também precisa fornecer o caminho para `exec_wasm.js`, você pode baixá-lo do mesmo repositório ou verificar o caminho para o seu arquivo local (assumindo que Go está instalado)

```javascript
lighter = ccxt.lighter({
	'options': {
		'libraryPath': '/user/cjg/Git/lighter-wasm/lighter.wasm',
		'wasmExecPath': '/opt/homebrew/opt/go/libexec/lib/wasm/wasm_exec.js'
	}
})
```

### Usuários de GO

- Nada é necessário, o CCXT consome o pacote oficial de GO, basta fornecer as credenciais


## Como usar a Exchange DyDx no CCXT?

DyDx está disponível como parte do CCXT e funciona de forma semelhante a qualquer outra exchange CCXT, mas possui algumas particularidades que podem ser confusas para alguns usuários, as quais explicaremos em detalhes abaixo. Basta definir algumas credenciais básicas e dependências.

Devido aos requisitos atuais de dependências relacionadas à assinatura, a exchange está disponível apenas em Python e JavaScript. O suporte para idiomas adicionais será introduzido assim que as dependências necessárias tiverem sido portadas.


## Requisitos de credenciais

DyDx requer um dos seguintes:
- `privateKey`: a chave privada l1 (hex) usada no dydx, ou você pode definir o mnemônico l2 nas opções
- `mnemonic` em `exchange.options`: as 24 palavras para recuperar sua chave privada l2, você pode encontrá-las na interface web

Exemplo

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

### Requisitos de dependências

DyDx requer outra dependência para usuários de Python. Antes de usá-lo, você precisa instalar o pycryptodom localmente.

```bash
$ pip3 install pycryptodom
```


Além disso, o protobuf também é necessário, mas não é uma dependência direta do CCXT. Você precisará instalá-lo manualmente:

```
npm install protobufjs // javascript/typescript
pip install "protobuf==5.29.5" // python
```

### Uso

O uso é amplamente consistente com outras exchanges, embora certos comportamentos sejam diferentes.

Por exemplo, enquanto as ordens podem ser colocadas normalmente, cancelar uma ordem no dYdX não usa o orderId tradicional. Em vez disso, o dYdX requer campos adicionais como:

- clientOrderId, não o orderId
- orderFlags (0 para ordens de mercado e ordens não-limit GTT, 64 para ordens limit GTT e 32 para ordens condicionais), o ccxt assume 64 como padrão
- goodTillBlockTimeInSeconds (necessário para ordens de longo prazo e condicionais; o CCXT assume um padrão de 30 dias)
- subAccountId, o ccxt assume 0 como padrão

O CCXT fornece padrões sensatos para os casos de uso mais comuns; no entanto, pode ser necessário substituir esses valores (usando parâmetros ou opções) dependendo dos seus requisitos específicos.

### Como usar a Exchange GRVT no CCXT?

GRVT funciona de forma semelhante a qualquer outra DEX CCXT e requer apenas a chave privada l1 da carteira.

Um exemplo de como instanciar a exchange GRVT:

```
exchange = ccxt.grvt({
	'privateKey': 'XXXXXXX', // the l1 private key (hex)
})
```
Nota: Usuários que se cadastraram por e-mail têm sua carteira gerenciada pelo Privy (solução de carteira embarcada do GRVT). Para exportar a chave privada:

1. Acesse https://home.privy.io
2. Faça login com o mesmo e-mail/conta Google usado para se cadastrar no GRVT
3. A partir daí, você pode exportar a chave privada

*(Se precisar de ajuda, você pode visitar https://support.privy.io)*

O CCXT também é um builder no GRVT, o que significa que por padrão os usuários pagarão 1bps (0,01%) a mais por usá-lo através do CCXT, no entanto, essa taxa é totalmente opcional e pode ser desativada fornecendo a opção `builderFee: False` nas opções. No entanto, sua contribuição é muito apreciada.

```
exchange.options['builderFee'] = False
```
