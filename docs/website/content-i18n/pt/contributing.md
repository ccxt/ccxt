---
title: "Contribuindo"
description: "Leia as notas ao abrir um novo issue no github e forneça os detalhes solicitados para que possamos ajudá-lo melhor. Você também pode ler a seção de Solução de Problemas."
---

# Contribuindo Para A Biblioteca CCXT

- [Como Enviar Uma Pergunta Ou Issue](#how-to-submit-an-issue)
- [Como Contribuir Com Código](#how-to-contribute-code)
  - [O Que Você Precisa Ter](#what-you-need-to-have)
  - [O Que Você Precisa Saber](#what-you-need-to-know)

## Como Enviar Um Issue

Leia as notas ao abrir um [novo issue no github](https://github.com/ccxt/ccxt/issues/new/choose) e forneça os detalhes solicitados para que possamos ajudá-lo melhor. Você também pode ler a seção de [Solução de Problemas](/docs/manual#troubleshooting).


### Reportando Vulnerabilidades E Issues Críticos

Se você encontrou um problema de segurança ou uma vulnerabilidade crítica e reportá-lo publicamente representaria risco — sinta-se à vontade para nos enviar uma mensagem para <a href="mailto:info@ccxt.trade">info@ccxt.trade</a>.

## Como Contribuir Com Código

- **[CERTIFIQUE-SE DE QUE SEU CÓDIGO É UNIFICADO](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes)!**

  **↑ Esta é a regra mais importante de todas!!!**

- **ANTES DE QUALQUER PUSH, CERTIFIQUE-SE DE EXECUTAR ESTE COMANDO LOCALMENTE: `git config core.hooksPath .git-templates/hooks`**

- **POR FAVOR, NÃO FAÇA COMMIT DOS SEGUINTES ARQUIVOS EM PULL REQUESTS:**

  - `/build/*` (estes são gerados automaticamente)
  - `/js/*` (estes são compilados a partir da versão TypeScript)
  - `/php/*` (exceto classes base)
  - `/python/*` (exceto classes base)
  - `/cs/*` (exceto classes base)
  - `/ccxt.js`
  - `/README.md` (listas de exchanges são geradas automaticamente)
  - `/package.json`
  - `/package.lock`
  - `/wiki/*` (exceto edições reais; listas de exchanges são geradas automaticamente)
  - `/dist/ccxt.browser.js` (este também é gerado automaticamente com browserify)


  Esses arquivos são gerados ([explicado abaixo](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support)) e serão sobrescritos durante o build. Por favor, não os commite para evitar o inchaço do repositório, que já é bem grande. Na maioria das vezes, você precisa fazer commit de apenas um único arquivo-fonte para enviar uma edição à implementação de uma exchange.

- **POR FAVOR, ENVIE EDIÇÕES ATÔMICAS, UM PULL REQUEST POR EXCHANGE, NÃO OS MISTURE**
- **CERTIFIQUE-SE DE QUE SEU CÓDIGO PASSA EM TODAS AS VERIFICAÇÕES DE SINTAXE EXECUTANDO `npm run build`**

## Tarefas Pendentes

Abaixo está uma lista de funcionalidades que gostaríamos de ter implementadas e totalmente **unificadas** na biblioteca em primeiro lugar no momento. A maioria dessas tarefas já está em andamento, implementada para algumas exchanges, mas não para todas:

- Negociação com margem
- Alavancagem
- Derivativos (futuros, opções)
- Conta principal / subcontas
- Ordens condicionais (stop loss, take profit)
- `transfer` entre subcontas e conta principal
- `fetchTransfer`
- `fetchTransfers`
- `fetchLedger`
- `fetchPositions`
- `closePosition`
- `closePositions`

Se você quiser contribuir enviando implementações parciais, certifique-se de consultar exemplos de como isso é feito dentro da biblioteca (onde já implementado) e copie as práticas adotadas.

Se sua proposta, sugestão ou melhoria não estiver relacionada à lista de tarefas acima, antes de enviá-la certifique-se de que ela:
1. é realmente necessária pela maioria dos usuários do ccxt
2. foi projetada para ser uma solução de uso geral, não codificada especificamente para suas necessidades
3. foi feita de forma generalizada e compatível com todas as exchanges (não específica para uma exchange)
4. é portável (disponível em todos os idiomas suportados)
5. é robusta
6. é explícita no que faz
7. não quebra nada (se você alterar um método, certifique-se de que todos os outros métodos que chamam o método editado não sejam quebrados)

A seguir está um conjunto de regras para contribuir com a base de código da biblioteca ccxt.

## O Que Você Precisa Ter

Se você não vai desenvolver o CCXT e contribuir com código para a biblioteca CCXT, então você não precisa da imagem Docker nem do repositório CCXT. Se você apenas quiser usar o CCXT dentro do seu projeto, simplesmente instale-o como um pacote regular na pasta do projeto conforme documentado no Manual (/docs/install):

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

### Com Docker

A maneira mais fácil é usar Docker para executar um ambiente isolado de build e teste com todas as dependências instaladas:

```bash
docker-compose run --rm ccxt
```

Isso cria um contêiner e abre um shell, onde os comandos `npm run build` e `node run-tests` devem funcionar imediatamente.

A pasta CCXT é mapeada dentro do contêiner, exceto a pasta `node_modules` — o contêiner terá sua própria cópia efêmera — para não bagunçar seus módulos instalados localmente. Isso significa que você pode editar os fontes na sua máquina host usando seu editor favorito e fazer build/testes no contêiner em execução.

Dessa forma, você pode manter as ferramentas e processos de build isolados, sem precisar passar pelo processo doloroso de instalar todas essas dependências na sua máquina host manualmente.

### Sem Docker

#### Dependências

- Git
- [Node.js](https://nodejs.org/en/download/) 8+
- [Python](https://www.python.org/downloads/) 3.5.3+
  - requests (`pip install requests`)
  - [aiohttp](https://docs.aiohttp.org/) (`pip install aiohttp`)
  - [ruff](https://docs.astral.sh/ruff/) (`pip install ruff`)
  - [tox](https://tox.readthedocs.io)
    - via pip: `pip install tox`
    - MacOS com [brew](https://brew.sh): `brew install tox`
    - Ubuntu Linux: `apt-get install tox`
- [PHP](https://secure.php.net/downloads.php) 8.1+ com as seguintes extensões instaladas e habilitadas:
  - cURL
  - iconv
  - mbstring
  - PCRE
  - gmp
- [C#](https://dotnet.microsoft.com/en-us/download) 7.0
- [Java](https://adoptium.net/) 21+ com Gradle

#### Etapas de Build

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

## O Que Você Precisa Saber

### Estrutura do Repositório

O conteúdo do repositório está estruturado da seguinte forma:

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

### Suporte a Múltiplos Idiomas

A biblioteca ccxt está disponível em várias linguagens diferentes (TypeScript, JavaScript, Python, PHP, C#, Go e Java). Incentivamos os desenvolvedores a projetar código *portável*, para que um usuário de uma única linguagem possa ler o código em outros idiomas e entendê-lo facilmente. Isso ajuda na adoção da biblioteca. O objetivo principal é fornecer uma interface generalizada, unificada, consistente e robusta para o maior número possível de exchanges de criptomoedas existentes.

No início, todas as versões específicas por linguagem foram desenvolvidas em paralelo, mas separadamente umas das outras. Mas quando ficou muito difícil manter e manter o código consistente entre todos os idiomas suportados, decidimos mudar para o que chamamos de processo *fonte/gerado*. Agora existe uma única versão-fonte em um idioma, que é TypeScript. Outras versões específicas por linguagem são derivadas sintaticamente (transpiladas, geradas) automaticamente da versão-fonte. Mas isso não significa que você precisa ser um programador de TS ou JS para contribuir. O princípio de portabilidade permite que desenvolvedores de Python e PHP participem efetivamente do desenvolvimento da versão-fonte também.

Os pontos de entrada do módulo são:
- `./python/__init__.py` para o pacote pip Python
- `./python/async/__init__.py` para o subpacote Python 3.7.0+ ccxt.async_support
- `./js/ccxt.js` para o pacote npm Node.js
- `./ts/ccxt.ts` para TypeScript
- `./dist/ccxt.browser.js` para o bundle do navegador
- `./ccxt.php` para PHP
- `./java/lib/src/main/java/io/github/ccxt/` para Java

As versões geradas e a documentação são transpiladas da pasta-fonte `ts/src` pelo comando `npm run build`.

### Arquivos Transpilados (gerados)

- Todas as classes de exchange derivadas são transpiladas pelo `tsc` de TypeScript para JavaScript e pelo nosso transpilador personalizado de TypeScript para PHP e Python. Os arquivos-fonte são independentes de linguagem, facilmente mapeados linha a linha para qualquer outro idioma e escritos de forma compatível entre linguagens. Qualquer programador pode lê-lo (por design).
- As classes base **não** são inteiramente transpiladas e são apenas parcialmente transpiladas, pois são específicas de linguagem.

#### JavaScript

O `ccxt.browser.js` é gerado com Babel a partir do fonte.

#### Python

Estes arquivos contendo classes de exchange derivadas são transpilados de TS para Python:

- `ts/[_a-z].ts` → `python/ccxt/async/[_a-z].py`
- `python/ccxt/async[_a-z].py` → `python/ccxt/[_a-z].py` (estágio de transpilação Python 3 asyncio → Python síncrono)
- `python/ccxt/test/test_async.py` → `python/ccxt/test/test_sync.py` (o teste síncrono é gerado a partir do teste assíncrono)

Estas classes base e arquivos Python não são transpilados:

- `python/ccxt/base/*`
- `python/ccxt/async/base/*`

#### PHP

Estes arquivos contendo classes de exchange derivadas são transpilados de TS para C#:

- `ts/[_a-z].ts` → `php/[_a-z].php`

Estas classes base e arquivos PHP não são transpilados:

- `php/Exchange.php php/ExchangeError.php php/Precise.php ...`

#### C#

Estes arquivos contendo classes de exchange derivadas são transpilados de TS para C#:

- `ts/src/[_a-z].ts` → `cs/src/exchanges/[_a-z].cs`

Estas classes base e arquivos C# não são transpilados:

- `cs/base/*`

#### Java

Estes arquivos contendo classes de exchange derivadas são transpilados de TS para Java:

- `ts/src/[_a-z].ts` → `java/lib/src/main/java/io/github/ccxt/exchanges/[A-Z]*.java`

Estas classes base e arquivos Java não são transpilados:

- `java/lib/src/main/java/io/github/ccxt/base/*`
- `java/lib/src/main/java/io/github/ccxt/ws/*`
- `java/lib/src/main/java/io/github/ccxt/Exchange.java`

#### Typescript

- O desenvolvimento é feito usando esses arquivos

### Classe Base

``` CONSTRUCTION```

### Classes de Exchange Derivadas

O transpilador é baseado em regex e depende fortemente de regras de formatação específicas. Se você as quebrar, o transpilador irá ou
falhar em gerar as classes Python/PHP completamente ou gerará sintaxe Python/PHP malformada.

Abaixo estão notas importantes sobre como manter o código JS transpilável.

Use o linter `npm run lint js/your-exchange-implementation.js` antes de fazer o build. Ele cobrirá muitos (mas não todos) os problemas,
portanto, a verificação manual ainda será necessária se a transpilação falhar.

Se você vir uma exceção `[TypeError] Cannot read property '1' of null` ou qualquer outro erro de transpilação quando executar `npm run build`, verifique se seu código satisfaz as seguintes regras:

- não coloque linhas vazias dentro dos seus métodos
- sempre use indentação no estilo Python, ela é preservada como está para todos os idiomas
- indente com 4 espaços **exatamente**, evite tabulações
- coloque uma linha vazia entre cada um dos seus métodos
- evite estilos de comentários mistos, use barra dupla `//` em JS para comentários de linha
- evite comentários de múltiplas linhas

Se o processo de transpilação terminar com sucesso, mas gerar sintaxe Python/PHP incorreta, verifique o seguinte:

- todo colchete de abertura como `(` ou `{` deve ter um espaço antes dele!
- não use açúcar sintático específico de linguagem, mesmo que você realmente queira
- desdobre todos os maps e compreensões em loops for básicos
- não altere os argumentos de métodos herdados sobrescritos, mantenha-os uniformes em todas as exchanges
- tudo deve ser feito usando apenas métodos da classe base (por exemplo, use `this.json ()` para converter objetos para json)
- sempre coloque um ponto e vírgula `;` no final de cada instrução, como no estilo PHP/C
- todas as chaves associativas devem ser strings entre aspas simples em todos os lugares (`array['good']`), não use a notação de ponto (`array.bad`)
- nunca use a palavra-chave `var`, em vez disso use `const` para constantes ou `let` para variáveis

E estruturalmente:

- se você precisar de outro método base, terá que implementá-lo nos três idiomas
- tente não emitir mais de uma requisição HTTP a partir de um método unificado
- evite alterar o conteúdo dos argumentos e parâmetros passados por referência em chamadas de função
- mantenha simples, não faça mais de uma instrução por linha
- tente reduzir a sintaxe e a lógica (se possível) a expressões básicas de uma linha
- múltiplas linhas são permitidas, mas evite aninhamentos profundos com muitos colchetes
- não use instruções condicionais muito complexas (muito aninhamento com `if`)
- não use ternários condicionais pesados
- evite amontoado de operadores (**não faça isso**: `a && b || c ? d + 80 : e ** f`)
- não use `.includes()`, use `.indexOf()` em vez disso!
- nunca use `.toString()` em floats: `Number (0.00000001).toString () === '1e-8'`
- não use closures, `a.map` ou `a.filter (x => (x === 'foobar'))` não é aceitável em classes derivadas
- não use o operador `in` para verificar se um valor está em um array não-associativo (lista)
- não adicione conversões e formatações personalizadas de moeda ou símbolo/par, copie do código existente
- **não acesse chaves inexistentes, `array['key'] || {}` não funcionará em outros idiomas!**

#### Enviando IDs de Mercado

A maioria dos endpoints de API das corretoras exige que um símbolo de mercado específico da corretora, par de negociação ou instrumento seja especificado na requisição.

**Não enviamos símbolos unificados diretamente para as corretoras!** Eles não são intercambiáveis! Há uma diferença significativa entre *IDs de mercado específicos da corretora* e *símbolos unificados*! Isso está explicado no Manual, aqui:

- /docs/manual#markets
- /docs/manual#symbols-and-market-ids

**NUNCA FAÇA ISSO:**

```javascript
async fetchTicker (symbol, params = {}) {
   const request = {
      'pair': symbol, // very bad, sending unified symbols to the exchange directly
   };
   const response = await this.publicGetEndpoint (request);
   // parse in a unified way...
}
```

**NÃO FAÇA ISSO TAMBÉM:**

```javascript
async fetchTicker (symbol, params = {}) {
   const request = {
      'symbol': symbol, // very bad, sending unified symbols to the exchange directly
   };
   const response = await this.publicGetEndpoint (request);
   // parse in a unified way...
}
```

Em vez de enviar um símbolo CCXT unificado para a corretora, **sempre** usamos o `id` de mercado específico da corretora que corresponde a esse símbolo. Se por acaso um ID de mercado específico da corretora for exatamente igual ao símbolo unificado CCXT – isso é uma feliz coincidência, mas nunca dependemos disso na API CCXT unificada.

Para obter o ID de mercado específico da corretora a partir de um símbolo CCXT unificado, use os seguintes métodos:

- `this.market (symbol)` – retorna toda a estrutura de mercado unificada, contendo o `id`, `baseId`, `quoteId`, e muitas outras coisas interessantes
- `this.marketId (symbol)` – retorna apenas o `id` específico da corretora de um mercado a partir de um símbolo unificado (se você não precisar de mais nada)

**BONS EXEMPLOS:**

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

#### Analisando Símbolos

Ao enviar requisições para a corretora, os símbolos unificados precisam ser _"convertidos"_ para `id`s de mercado específicos da corretora conforme mostrado acima. O mesmo vale para o outro lado – ao receber uma resposta da corretora, ela contém um `id` de mercado específico da corretora que precisa ser _"convertido de volta"_ para um símbolo CCXT unificado.

**Não colocamos `id`s de mercado específicos da corretora diretamente nas estruturas unificadas!** Não podemos intercambiar livremente símbolos com ids! Há uma diferença significativa entre *IDs de mercado específicos da corretora* e *símbolos unificados*! Isso está explicado no Manual, aqui:

- /docs/manual#markets
- /docs/manual#symbols-and-market-ids

**NUNCA FAÇA ISSO:**:

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

**NÃO FAÇA ISSO TAMBÉM**

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

Para tratar o `id` de mercado corretamente, ele precisa ser consultado nas informações armazenadas em cache nesta corretora com `loadMarkets()`:

**BOM EXEMPLO:**

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

#### Acessando Chaves de Dicionário

Em JavaScript, as chaves de dicionário podem ser acessadas de duas formas:

- `object['key']` (notação de chave de string entre aspas simples)
- `object.key` (notação de propriedade)

Ambas funcionam de forma quase idêntica, e uma é implicitamente convertida para a outra ao executar o código JavaScript.

Embora o acima funcione em JavaScript, **não funcionará em Python ou PHP**. Na maioria das linguagens, as chaves de dicionário associativas não são tratadas da mesma forma que propriedades. Portanto, em Python `object.key` não é o mesmo que `object['key']`. Em PHP `$object->key` também não é o mesmo que `$object['key']`. Linguagens que diferenciam entre chaves associativas e propriedades usam notações diferentes para as duas.

Para manter o código transpilável, lembre-se desta regra simples: *sempre use a notação de chave de string entre aspas simples `object['key']` para acessar todas as chaves de dicionário associativas em todos os idiomas em toda esta biblioteca!*

#### Sanitizando Entradas Com Métodos `safe`

JavaScript é menos restritivo do que outras linguagens. Ele tolerará uma tentativa de desreferenciar uma chave inexistente onde outras linguagens lançariam uma exceção:

```javascript
// JavaScript

const someObject = {}

if (someObject['nonExistentKey']) {
    // the body of this conditional will not execute in JavaScript
    // because someObject['nonExistentKey'] === undefined === false
    // but JavaScript will not throw an exception on the if-clause
}
```

No entanto, a lógica acima com *"um valor indefinido por padrão"* não funcionará em Python ou PHP.

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

A maioria das linguagens não tolerará uma tentativa de acessar uma chave inexistente em um objeto.

Pelos motivos acima, por favor, **nunca faça isso** nos arquivos JS transpilados:

```javascript
// JavaScript
const value = object['key'] || other_value; // will not work in Python or PHP!
if (object['key'] || other_value) { /* will not work in Python or PHP! */ }
```

Portanto, temos uma família de funções `safe*`:

- `safeInteger (object, key, default)`, `safeInteger2 (object, key1, key2, default)` – para analisar timestamps em milissegundos
- `safeNumber (object, key, default)`, `safeNumber2 (object, key1, key2, default)` – para analisar quantidades, preços, custos
- `safeString (object, key, default)`, `safeString2 (object, key1, key2, default)` – para analisar ids, tipos, status
- `safeStringLower (object, key, default)`, `safeStringLower2 (object, key1, key2, default)` – para analisar e converter para minúsculas
- `safeStringUpper (object, key, default)`, `safeStringUpper2 (object, key1, key2, default)` – para analisar e converter para maiúsculas
- `safeBool(object, key, default)` - para analisar booleans dentro de dicionários e arrays/listas
- `safeList(object, key, default)` - para analisar listas/arrays dentro de dicionários e arrays/listas
- `safeDict(object, key, default)` - para analisar dicionários dentro de dicionários e arrays/listas
- `safeValue (object, key, default)`, `safeValue2 (object, key1, key2, default)` – para analisar objetos (dicionários) e arrays (listas)
- `safeTimestamp (object, key, default)`, `safeTimestamp2 (object, key1, key2, default)` – para analisar timestamps UNIX em segundos

A função `safeValue` é usada para objetos dentro de objetos, arrays dentro de objetos e valores booleanos `true/false` (**obsoleta, use-a apenas quando não souber exatamente qual tipo será retornado, caso contrário prefira** `safeBool/safeDict/safeList`).

Se você precisar procurar por várias chaves diferentes dentro de um objeto, há a família de funções `safeMethodN` disponível, que permite uma busca com um número arbitrário de chaves aceitando um array de chaves como argumento.

```javascript
const price = this.safeStringN (object, [ 'key1', 'key2', 'key3' ], defaultValue)
```
Para cada método safe listado acima, há também o correspondente `safeMethodN`.

As funções safe acima verificarão a existência da `key` (ou `key1`, `key2`) no objeto e retornarão corretamente os valores `undefined/None/null` para JS/Python/PHP. Cada função também aceita o valor `default` a ser retornado em vez de `undefined/None/null` no último argumento.

Alternativamente, você poderia verificar a existência da chave primeiro...

Então, você precisa mudar isso:

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

Ou:

```javascript
if ('foo' in params) {
}
```

#### Usando Métodos de Criptografia da Classe Base Para Autenticação

Não reinvente a roda. Sempre use métodos da classe base para criptografia.

A biblioteca CCXT suporta os seguintes algoritmos de autenticação e criptografia:

- HMAC
- JWT (JSON Web Token)
- RSA
- ECDSA Criptografia de Curva Elíptica
  - NIST P256
  - secp256k1
- OTP 2FA (senha de uso único com autenticação de dois fatores)

A classe base `Exchange` oferece vários métodos que são fundamentais para praticamente toda a criptografia nesta biblioteca. Implementações de corretoras derivadas não devem usar dependências externas para criptografia; tudo deve ser feito apenas com métodos base.

- `hash (message, hash = 'md5', digest = 'hex')`
- `hmac (message, secret, hash = 'sha256', digest = 'hex')`
- `jwt (message, secret, hash = 'HS256')`
- `rsa (message, secret, alg = 'RS256')`
- `ecdsa (request, secret, algorithm = 'p256', hash = undefined)`
- `totp (secret)`
- `stringToBase64()`, `base64ToBinary()`, `binaryToBase64()`...

O método `hash()` suporta os seguintes algoritmos `hash`:

- `'md5'`
- `'sha1'`
- `'sha3'`
- `'sha256'`
- `'sha384'`
- `'sha512'`
- `'keccak'`

O argumento de codificação `digest` aceita os seguintes valores:

- `'hex'`
- `'binary'`

O método `hmac()` também suporta `'base64'` para o argumento `digest`. Isso é apenas para `hmac()`, outras implementações devem usar `'binary'` com `binaryToBase64()`.

#### Timestamps

**Todos os timestamps em todas as estruturas unificadas desta biblioteca são timestamps UTC inteiros _em milissegundos_!**

Para converter timestamps para milissegundos, o CCXT implementa os seguintes métodos:

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

#### Trabalhando Com Comprimentos de Array

Em JavaScript, a sintaxe comum para obter o comprimento de uma string ou array é referenciar a propriedade `.length` conforme mostrado aqui:

```javascript
someArray.length

// or

someString.length
```

E funciona tanto para strings quanto para arrays. Em Python isso é feito de forma semelhante:

```python
len(some_array)

# or

len(some_string)
```

Portanto, o comprimento é acessível da mesma forma para strings e arrays e ambos funcionam bem.

No entanto, com PHP isso é diferente, então a sintaxe para comprimentos de string e comprimentos de array é diferente:

```php
count(some_array);

// or

strlen(some_string); // or mb_strlen
```

Como o transpilador trabalha linha a linha e não faz introspecção de código, ele não consegue distinguir arrays de strings e não consegue transpilir corretamente `.length` para PHP sem dicas adicionais. Ele sempre transpilirá `.length` do JS para `strlen` do PHP e preferirá comprimentos de string em vez de comprimentos de array. Para indicar corretamente um comprimento de array, precisamos fazer o seguinte:

```javascript
const arrayLength = someArray.length;
// the above line ends with .length;
// that ending is a hint for the transpiler that will recognize someArray
// as an array variable in this place, rather than a string type variable
// now we can use arrayLength for the arithmetic
```

Aquela linha terminando em `.length;` resolve o problema. O único caso em que o `.length` de array é preferido ao `.length` de string é o loop `for`. No cabeçalho do loop `for`, o `.length` sempre se refere ao comprimento do array (não ao comprimento da string).

#### Adicionando Números e Concatenando Strings

Em JS o operador aritmético de adição `+` lida tanto com strings quanto com números. Assim, ele pode concatenar strings com `+` e também pode somar números com `+`. O mesmo vale para Python. Com PHP isso é diferente, pois ele possui operadores diferentes para concatenação de strings (o operador "ponto" `.`) e para adição aritmética (o operador "mais" `+`). Mais uma vez, como o transpilador não faz introspecção de código, ele não consegue saber se você está somando números ou strings em JS. Isso funciona bem até você querer transpilar para outros idiomas, seja PHP ou qualquer outro.

Há esse aspecto da representação de números em toda a biblioteca.
A abordagem existente documentada no Manual diz que a biblioteca aceitará e retornará "floats em todo lugar" para quantidades, preços, custos, etc.
Usar floats é a forma mais fácil de integrar novos usuários.
Isso tem problemas conhecidos; é impossível representar números exatos com floats (https://0.30000000000000004.com/)

Para resolver isso, estamos migrando para representações baseadas em strings em todo lugar.
Portanto, estamos em processo de migração para strings de forma não-disruptiva.

A nova abordagem é:

Estamos adicionando uma camada interna para representações baseadas em strings e matemática baseada em strings nos parsers de resposta.
Essa camada interna é construída sobre a classe base `Precise`, que é usada para fazer toda a matemática baseada em strings.
Essa classe requer strings para operar e também retornará strings.
Todos os parsers antigos existentes devem ser reescritos para usar representações baseadas em strings do `Precise`, na primeira oportunidade.
Todo novo código de todos os novos parsers deve ser inicialmente escrito com representações baseadas em strings do `Precise`.

O que isso significa exatamente:

Compare este pseudocódigo mostrando como era feito **antes** (um exemplo de algum código de análise arbitrário com o propósito de explicar):

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

É assim que devemos fazer **a partir de agora**:

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

Em todo o novo código de todos os analisadores devemos usar números baseados em strings ao longo do corpo do analisador. Também devemos adicionar `parseNumber` como a última etapa do tratamento de valores numéricos ao retornar o resultado ao chamador. Os dois trechos acima são apenas exemplos, mostrando o uso de `Precise` com `safeString` e `parseNumber`. Os analisadores reais de ordens também envolvem métodos safeOrder: https://github.com/ccxt/ccxt/pulls?q=safeOrder2.

O utilizador terá, em última análise, a opção de escolher qual implementação de parseNumber deseja: a que retorna floats ou a que retorna strings. Desta forma, todos ficarão satisfeitos e a biblioteca funcionará de ambas as formas de maneira não disruptiva.

A regra geral é: **`+` é apenas para concatenação de strings (!)** e **TODAS as operações aritméticas devem usar `Precise`**.

#### Formatando Números Decimais com Precisão

Esta secção cobre a parte de montagem da requisição. O método `.toFixed ()` possui [bugs de arredondamento conhecidos](https://www.google.com/search?q=toFixed+bug) em JavaScript, assim como os outros métodos de arredondamento nas outras linguagens também. Para trabalhar com formatação de números de forma consistente, use o [`método decimalToPrecision conforme descrito no Manual`](/docs/manual#methods-for-formatting-decimals).

#### Caracteres de Controle Escapados

Ao usar strings contendo caracteres de controle como `"\n"`, `"\t"`, envolva-os sempre em aspas duplas (`"`), não em aspas simples (`'`)! Strings entre aspas simples não são processadas para caracteres de controle e são tratadas como estão em muitas linguagens além do TypeScript. Portanto, para que tabs e novas linhas funcionem em PHP, precisamos cercá-los com aspas duplas (especialmente na implementação de `sign()`).

Errado:

```javascript
const a = 'GET' + method.toLowerCase () + '\n' + path;
const b = 'api\nfoobar.com\n';
```

Correto:

```javascript
const a = 'GET' + method.toLowerCase () + "\n" + path; // eslint-disable-line quotes
// eslint-disable-next-line quotes
const b = "api\nfoobar.com\n";
```

**↑ Os comentários `eslint-*` são obrigatórios!**

#### Usando Condicionais Ternários

Não use condicionais ternários (`?:`) complexos, **sempre use parênteses em operadores ternários!**

Apesar de existir precedência de operadores nas próprias linguagens de programação, o transpilador é baseado em expressões regulares e não faz introspecção de código, portanto trata tudo como texto simples.

Os parênteses são necessários para indicar ao transpilador qual parte do condicional é qual. Na ausência de parênteses, é difícil entender a linha e a intenção do desenvolvedor.

Aqui estão alguns exemplos de código mal concebido que irá quebrar o transpilador:

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

Adicionar parênteses ao redor das partes correspondentes seria uma forma mais ou menos correta de resolver o problema.

```javascript
const foo = {
   'bar': (qux === 'baz') ? this.a () : this.b (), // much better now
};
```

A forma que funciona universalmente para resolvê-lo é simplesmente dividir a linha complexa em algumas linhas mais simples, mesmo ao custo de adicionar linhas e condicionais extras:

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

Ou até mesmo:

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

### Novas Integrações de Exchanges

**LEMBRE-SE:** A razão principal pela qual esta biblioteca é usada é a **Unificação**. Ao desenvolver um novo ficheiro de exchange, o objetivo não é implementá-lo de alguma forma, mas implementá-lo de maneira muito pedante, precisa e exata, assim como as outras exchanges são implementadas. Para isso, precisamos copiar partes da lógica de outras exchanges e garantir que a nova exchange esteja em conformidade com o Manual nos seguintes aspectos:

- ids de mercado, símbolos de pares de negociação, ids de moedas, códigos de tokens, unificação simbólica e `commonCurrencies` devem ser padronizados em todos os métodos de análise (`fetchMarkets`, `fetchCurrencies`, `parseTrade`, `parseOrder`, ...)
- todos os nomes e argumentos dos métodos da API unificada são padrão – não é possível adicioná-los ou alterá-los livremente
- toda a entrada do analisador deve ser sanitizada com `safe` como [descrito acima](#sanitizing-input-with-safe-methods)
- para operações em massa, os métodos base devem ser usados (`parseTrades`, `parseOrders`, observe o `s` no plural)
- use o máximo de funcionalidade base que puder, não reinvente a roda, nem a bicicleta, nem a roda da bicicleta
- respeite os valores padrão dos argumentos nos métodos `fetch`, verifique se `since` e `limit` são `undefined` e não os envie para a exchange; nestes casos usamos intencionalmente os padrões das exchanges
- ao implementar um método unificado que possui alguns argumentos – não podemos ignorar ou perder nenhum desses argumentos
- todas as estruturas retornadas pelos métodos unificados devem estar em conformidade com suas especificações do Manual
- todos os endpoints da API devem ser listados com suporte adequado para parâmetros substituídos nas URLs

Por favor, consulte o seguinte documento para novas integrações: /docs/requirements

Uma fusão rápida de um Pull Request para uma nova integração de exchange depende da consistência e conformidade com as regras e padrões unificados acima. Quebrar um desses é a principal razão para não mesclar um Pull Request.

**Se você deseja adicionar (suporte para) outra exchange, ou implementar um novo método para uma exchange específica, então a melhor forma de torná-lo uma melhoria consistente é aprender com exemplos. Veja como as mesmas coisas são implementadas em outras exchanges (recomendamos exchanges certificadas) e tente copiar o fluxo e o estilo do código.**

O esqueleto JSON básico para uma nova integração de exchange é o seguinte:

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

### Métodos Implícitos da API

No código de cada exchange, você notará que as funções que fazem requisições à API não são definidas explicitamente. Isso ocorre porque a definição `api` no JSON de descrição da exchange é usada para criar *funções mágicas* (também conhecidas como *funções parciais* ou *closures*) dentro da subclasse da exchange. Essa injeção implícita é feita pelo método base da exchange `defineRestApi/define_rest_api`.

Cada função parcial recebe um dicionário de `params` e retorna a resposta da API. No JSON de exemplo acima, o `'endpoint/example'` resulta na injeção de uma função `this.publicGetEndpointExample`. Da mesma forma, o `'orderbook/{pair}/full'` resulta em uma função `this.publicGetOrderbookPairFull`, que recebe um parâmetro ``pair`` (novamente, passado no argumento `params`).

Na instanciação, a classe base da exchange pega cada URL de sua lista de endpoints, divide-a em palavras e depois compõe um nome de função chamável a partir dessas palavras usando uma construção parcial. Esse processo é o mesmo em JS, Python e PHP também. Também é descrito aqui:

- /docs/manual#api-methods--endpoints
- /docs/manual#implicit-api-methods
- https://github.com/ccxt-dev/ccxt/wiki/Manual#api-method-naming-conventions

``` CONSTRUCTION```

### Docstrings

- quando um método recebe outro parâmetro como propriedade em params (ex. `params['something']`), adicione esse parâmetro à docstring como params.something
   - se esse parâmetro for obrigatório, o tipo é `{str}`, `{int}`, `{etc}`, se for opcional o tipo é `{str|undefined}`, `{int|undefined}`, `{etc|undefined}`
- quando o valor padrão de um parâmetro é `undefined`, mas o método contém algo como `if (symbol === undefined) { throw new ArgumentsRequired('...')}`, então defina o tipo desse parâmetro como `{str}`, `{int}`, `{etc}`. Se um erro não for lançado, então o tipo é `{str|undefined}`, `{int|undefined}`, `{etc|undefined}`
- se um método não usa um dos parâmetros unificados, defina a descrição desse parâmetro como `not used by exchange_name.method_name ()` (substitua `exchange_name` e `method_name` pelos nomes reais da exchange e do método)
- se o método tiver outros casos de uso especiais, inclua-os na descrição da docstring; esses casos também podem ser incluídos na docstring da classe

### Integração Contínua

As compilações são automatizadas com [Travis CI](https://app.travis-ci.com/github/ccxt/ccxt). As etapas de compilação para o Travis CI estão descritas no ficheiro [`.travis.yml`](https://github.com/ccxt/ccxt/blob/master/.travis.yml).

As compilações no Windows são automatizadas com [Appveyor](https://ci.appveyor.com/project/ccxt/ccxt). As etapas de compilação para o Appveyor estão no ficheiro [`appveyor.yml`](https://github.com/ccxt/ccxt/blob/master/appveyor.yml).

Os pull requests recebidos são automaticamente validados pelo serviço de CI. Você pode acompanhar o processo de compilação online aqui: [app.travis-ci.com/github/ccxt/ccxt/builds](https://app.travis-ci.com/github/ccxt/ccxt/builds).

### Como Compilar e Executar Testes na Sua Máquina Local

### Testes offline
O CCXT possui vários testes offline que ajudam a garantir que não introduzimos regressões ao adicionar um novo recurso ou corrigir um bug. Eles são fáceis e rápidos de executar (pois não requerem acesso às exchanges), portanto devem fazer parte do nosso fluxo de desenvolvimento no CCXT.


Eles incluem os testes base (precisão, crypto, orderbook, etc) e testes estáticos (request/response).

Esses testes estão localizados na pasta `ts/src/test/base/functions/`; a maior parte do seu conteúdo é automaticamente transpilável para cada linguagem; portanto, as mesmas convenções de código se aplicam.

Você pode executá-los com: `npm run test-base` e `npm run-test-ws`

Os testes estáticos também são offline, mas funcionam de forma diferente porque emulam uma chamada ccxt unificada (createOrder/fetchTickers/etc) e simulam a resposta do servidor e/ou afirmam a validade da requisição HTTP gerada.

**Request-static**:
- Eles emulam a requisição HTTP, a interrompem antes de tentar conectar e afirmam que a url/body estão corretamente formados.

Pasta: `ts/src/test/static/request/`

Você pode criar um teste estático de request executando este comando e colando o resultado no ficheiro correto (ex: `static/request/binance.json`)

```bash
node cli.js binance fetchTrades "BTC/USDT:USDT" --report
````


**Response-static**
- Emula uma resposta simulada do servidor e afirma que o CCXT analisa corretamente a resposta HTTP bruta.

Pasta: `ts/src/test/static/response/binance.json`

Você pode criar um teste estático de response executando este comando e colando o resultado no ficheiro correto (ex: `static/response/binance.json`)

```bash
node cli.js binance fetchTrades "BTC/USDT:USDT"  undefined 1 --response
````
#### Adicionando Credenciais de Exchange

O CCXT possui testes tanto para a API pública quanto para a API privada autenticada. Por padrão, os testes integrados do CCXT testam apenas as APIs públicas, porque o repositório de código não inclui as [chaves de API](/docs/manual#authentication) que são necessárias para os testes de API privada. Além disso, os testes privados incluídos não alterarão o saldo da conta de forma alguma; todos os testes são não intrusivos. Para habilitar os testes de API privada, é necessário configurar as chaves de API. Isso pode ser feito em `keys.local.json` ou com as variáveis `env`.

##### Configurando chaves de API e opções em `keys.local.json`

As chaves de API da exchange podem ser adicionadas ao `keys.local.json` na pasta raiz dentro do repositório. Se ele não existir do seu lado – crie-o primeiro. Esse ficheiro está no `.gitignore` e no `.npmignore`. Você pode adicionar credenciais de exchange e várias opções para diferentes exchanges ao ficheiro `keys.local.json`.

Um exemplo de ficheiro `keys.local.json`:

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

##### Configurando chaves de API como variáveis de ambiente

Você também pode definir chaves de API como variáveis `env`:

- https://www.google.com/search?q=set+env+variable+linux
- https://www.google.com/search?q=set+env+variable+mac
- https://www.google.com/search?q=set+env+variable+windows

Consulte a documentação do seu sistema operacional e shell sobre como definir uma variável de ambiente. Na maioria das vezes, um comando `set` ou `export` funcionará. O comando `env` pode ajudar a verificar as variáveis de ambiente já definidas.

Exemplos de variáveis `env`: `BINANCE_APIKEY`, `BINANCE_SECRET`, `KRAKEN_APIKEY`, `KRAKEN_SECRET`, etc.

#### Compilação

Antes de compilar pela primeira vez, instale as dependências do Node (pule esta etapa se estiver usando nossa imagem Docker):

```
npm install
```

O comando abaixo irá compilar tudo e gerar as versões PHP/Python a partir dos arquivos TS de origem:

```
npm run build
```

#### Testes

O comando a seguir irá testar os arquivos gerados compilados (para todas as exchanges, símbolos e linguagens):

```
node run-tests
```

Você pode restringir os testes a uma linguagem específica, uma exchange ou símbolo em particular:

```
node run-tests [--js] [--python] [--python-async] [--php] [--php-async] [exchange] [symbol]
```

O `node run-tests exchangename` tentará 5 testes: `js`, `python`, `python-async`, `php`, `php-async`. Você pode controlar isso da seguinte forma:

```
node run-tests exchange --js
node run-tests exchange --js --python-async
node run-tests exchange --js --php
node run-tests exchange --python --python-async
...
```

No entanto, se isso falhar, pode ser necessário ir um nível abaixo e executar testes específicos por linguagem para ver o que exatamente está errado:

```
node js/test/test exchange --verbose
python3 python/ccxt/test/test_sync.py exchange --verbose
python3 python/ccxt/test/test_async.py exchange --verbose
php -f php/test/test_sync.php exchange --verbose
php -f php/test/test_async.php exchange --verbose
```

O `test_sync` é apenas uma versão síncrona do `test_async`, portanto, na maioria dos casos, basta executar `test_async.py` e `test_async.php`:

```
node js/test/test exchange --verbose
python3 python/ccxt/test/test_async.py exchange --verbose
php -f php/test/test_async.php exchange --verbose
```

Quando todos os testes específicos por linguagem funcionarem, o node run-tests também terá sucesso. Para executar esses testes, certifique-se de que a compilação foi concluída com sucesso.

Por exemplo, a primeira das linhas a seguir testará apenas a versão JS de origem da biblioteca (`ccxt.js`). Ela não requer um `npm run build` antes de ser executada (pode ser útil caso precise verificar rapidamente se suas alterações quebram o código ou não):

```bash

node run-tests --js                  # test master ccxt.js, all exchanges

# other examples require the 'npm run build' to run

node run-tests --python              # test Python sync version, all exchanges
node run-tests --php bitfinex        # test Bitfinex with PHP
node run-tests --python-async kraken # test Kraken with Python async test, requires 'npm run build'
```

#### Escrevendo Testes

Siga estes passos para adicionar um teste:

- Crie um arquivo em [ts/tests/Exchange](https://github.com/ccxt/ccxt/tree/master/ts/test/Exchange) seguindo a sintaxe que pode ser transpilada.
- Adicione o teste em `runPrivateTests` ou `runPublicTests` em [ts/src/test/tests.ts](https://github.com/ccxt/ccxt/blob/master/ts/src/test/tests.ts#L354) ou para endpoints do ccxt.pro em [ts/src/pro/test/tests.ts](https://github.com/ccxt/ccxt/blob/master/ts/src/pro/test/tests.ts#L121)
- execute `npm run transpile` para gerar o arquivo de teste em JavaScript, Python e PHP.
- Execute os testes com `node run-tests`

## Enviando Alterações ao Repositório

O processo de compilação gera muitas alterações nos arquivos de exchange transpilados, por exemplo, para Python e PHP. **Você NÃO deve enviá-los ao GitHub; envie apenas as alterações do arquivo base (TS), por favor**.

## Contribuições Financeiras

Também aceitamos contribuições financeiras com total transparência em nosso [open collective](https://opencollective.com/ccxt).

## Créditos

### Contribuidores

Obrigado a todas as pessoas que já contribuíram para o ccxt!

<a href="https://github.com/ccxt/ccxt/graphs/contributors"><img src="https://opencollective.com/ccxt/contributors.svg?width=890" /></a>

### Apoiadores

Obrigado a todos os nossos apoiadores! [[Torne-se um apoiador](https://opencollective.com/ccxt#backer)]

<a href="https://opencollective.com/ccxt#backers" target="_blank"><img src="https://opencollective.com/ccxt/backers.svg?width=890"></a>

### Suportadores

Apoie este projeto tornando-se um suportador. Seu avatar aparecerá aqui com um link para o seu site.

[[Torne-se um suportador](https://opencollective.com/ccxt#supporter)]

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

### Patrocinadores

Obrigado a todos os nossos patrocinadores! (por favor, peça à sua empresa que também apoie este projeto de código aberto [tornando-se um patrocinador](https://opencollective.com/ccxt#sponsor))

[[Torne-se um patrocinador](https://opencollective.com/ccxt#sponsor)]

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
