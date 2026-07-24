---
title: "Instalação"
description: "A maneira mais fácil de instalar a biblioteca ccxt é usar os gerenciadores de pacotes integrados:"
---

## Instalação

A maneira mais fácil de instalar a biblioteca ccxt é usar os gerenciadores de pacotes integrados:

- [ccxt no **NPM**](http://npmjs.com/package/ccxt) (JavaScript / Node v15+)
- [ccxt no **PyPI**](https://pypi.python.org/pypi/ccxt) (Python 3)

Esta biblioteca é fornecida como uma implementação de módulo tudo-em-um com dependências e requisitos minimalistas:

- [ccxt.js](https://github.com/ccxt/ccxt/blob/master/js/ccxt.js) em JavaScript
- [./python/](https://github.com/ccxt/ccxt/blob/master/python/) em Python (gerado a partir de JS)
- [ccxt.php](https://github.com/ccxt/ccxt/blob/master/ccxt.php) em PHP (gerado a partir de JS)
- [./java/](https://github.com/ccxt/ccxt/blob/master/java/) em Java (gerado a partir de TS)

Você também pode cloná-lo para o diretório do seu projeto a partir do [repositório GitHub do ccxt](https://github.com/ccxt/ccxt) e copiar os arquivos manualmente para seu diretório de trabalho com a extensão de linguagem apropriada para seu ambiente.

```bash
git clone https://github.com/ccxt/ccxt.git
```

Uma forma alternativa de instalar esta biblioteca é construir um pacote personalizado a partir do código-fonte. Escolha as exchanges que você precisa em `exchanges.cfg`.

### JavaScript (NPM)

A versão JavaScript do ccxt funciona tanto no Node quanto em navegadores web. Requer suporte a ES6 e sintaxe `async/await` (Node 15+). Ao compilar com Rspack (ou Webpack) e Babel, certifique-se de que não está [excluído](https://github.com/ccxt-dev/ccxt/issues/225#issuecomment-331582275) na sua configuração do `babel-loader`.

[Biblioteca de trading de criptomoedas ccxt no npm](http://npmjs.com/package/ccxt)

```bash
npm install ccxt
```

```javascript
var ccxt = require ('ccxt')

console.log (ccxt.exchanges) // imprime todas as exchanges disponíveis
```

### JavaScript (para uso com a tag `<script>`):

Pacote de navegador tudo-em-um (dependências incluídas), servido de um CDN de sua escolha:

* jsDelivr: https://cdn.jsdelivr.net/npm/ccxt@4.5.56/dist/ccxt.browser.min.js
* unpkg: https://unpkg.com/ccxt@4.5.56/dist/ccxt.browser.min.js
* ccxt: https://cdn.ccxt.com/latest/ccxt.min.js

Você pode obter uma versão atualizada do pacote removendo o número da versão da URL (a parte `@a.b.c`) ou o /latest/ no nosso cdn — no entanto, não recomendamos fazer isso, pois pode eventualmente quebrar seu aplicativo. Além disso, tenha em mente que não somos responsáveis pelo funcionamento correto desses servidores CDN.

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/ccxt@4.5.56/dist/ccxt.browser.min.js"></script>
```

O ponto de entrada padrão para o navegador é `window.ccxt` e ele cria um objeto ccxt global:

```javascript
console.log (ccxt.exchanges) // imprime todas as exchanges disponíveis
```

### Builds Personalizados em JavaScript

Leva tempo para carregar todos os scripts e recursos. O problema com o uso em navegador é que a biblioteca CCXT inteira pesa alguns megabytes, o que é muito para uma aplicação web. Às vezes, também é crítico para uma aplicação Node. Portanto, para reduzir o tempo de carregamento, você pode querer fazer sua própria compilação personalizada do CCXT para seu aplicativo com apenas as exchanges que precisa. O CCXT usa rspack para remover caminhos de código morto para tornar o pacote menor.

Siga estas etapas:

```bash
# 1. clonar o repositório

git clone --depth 1 https://github.com/ccxt/ccxt.git

# 2. ir para o repositório clonado

cd ccxt

# 3. instalar dependências

npm install

# 4. editar exchanges.cfg para as exchanges de seu interesse

echo -e "binance\nokx" > exchanges.cfg

# 5. construir a biblioteca

npm run export-exchanges
npm run bundle-browser

# 6a. copiar o arquivo do navegador para sua pasta de projeto se estiver construindo um aplicativo web

cp dist/ccxt.browser.js path/to/your/html/project

# 6b. ou vincular contra a biblioteca se estiver construindo um aplicativo Node.js
npm link
cd path/to/your/node/project
npm link ccxt

# 6c. importar ccxt diretamente do ponto de entrada
touch app.js

# dentro de app.js

import ccxt from './js/ccxt.js'
console.log (ccxt)

# agora você pode executar seu aplicativo assim

node app.js
```

### Python

[Biblioteca de algotrading ccxt no PyPI](https://pypi.python.org/pypi/ccxt)

```bash
pip install ccxt
```

```python
import ccxt
print(ccxt.exchanges) # imprime uma lista de todas as classes de exchange disponíveis
```

A biblioteca suporta modo assíncrono concorrente com asyncio e async/await no Python 3.5.3+

```python
import ccxt.async_support as ccxt # vincular contra a versão assíncrona do ccxt
```

### PHP

A versão autocarregável do ccxt pode ser instalada com [**Packagist/Composer**](https://packagist.org/packages/ccxt/ccxt) (PHP 8.1+).

Também pode ser instalada a partir do código-fonte: [**`ccxt.php`**](https://raw.githubusercontent.com/ccxt/ccxt/master/php)

Requer módulos PHP comuns:

- cURL
- mbstring (usar UTF-8 é altamente recomendado)
- PCRE
- iconv
- gmp

```php
include "ccxt.php";
var_dump (\ccxt\Exchange::$exchanges); // imprime uma lista de todas as classes de exchange disponíveis
```

A biblioteca suporta modo assíncrono concorrente usando ferramentas do [ReactPHP](https://reactphp.org/) no PHP 8.1+. Leia o [Manual](/docs) para mais detalhes.

### .net/C#

[ccxt em C# com **Nugget**](https://www.nuget.org/packages/ccxt) (netstandard 2.0 e netstandard 2.1)
```c#
using ccxt;
Console.WriteLine(ccxt.Exchanges) // verificar depois
```

### Java

A versão Java do CCXT requer Java 21+ e usa Gradle como seu sistema de build.

Clonar e construir a partir do código-fonte:

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

Executar os exemplos:

```bash
cd java
./gradlew :examples:run -PmainClass=examples.FetchTicker
./gradlew :examples:run -PmainClass=examples.WatchOrderBook
```

Veja [java/examples/](https://github.com/ccxt/ccxt/tree/master/java/examples) para a lista completa de exemplos.

### Docker

Você pode obter o CCXT instalado em um contêiner junto com todas as linguagens e dependências suportadas. Isso pode ser útil se você quiser contribuir para o CCXT (por exemplo, executar scripts de build e testes — consulte o documento [Contribuindo](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) para mais detalhes).

Você não precisa da imagem Docker se não for desenvolver o CCXT. Se apenas quiser usar o CCXT – basta instalá-lo como um pacote regular em seu projeto.

Usando `docker-compose` (no repositório CCXT clonado):

```bash
docker-compose run --rm ccxt
```

Alternativamente:

```bash
docker build . --tag ccxt
docker run -it ccxt
```

## Proxy
Se você não conseguir obter dados de exchanges devido a restrições de localização, leia a seção [proxy](/docs/manual#proxy).
