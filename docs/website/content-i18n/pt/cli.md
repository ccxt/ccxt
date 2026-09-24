---
title: "CLI"
description: "O CCXT inclui um exemplo que permite chamar todos os métodos e propriedades de uma exchange pela linha de comando. Não é preciso nem ser programador ou escrever código –…"
---

# CCXT CLI (Interface de Linha de Comando)

O CCXT inclui um exemplo que permite chamar todos os métodos e propriedades de uma exchange pela linha de comando. Não é preciso nem ser programador ou escrever código – qualquer usuário pode usá-lo!

A interface CLI é um programa no CCXT que recebe o nome da exchange e alguns parâmetros da linha de comando e executa uma chamada correspondente do CCXT, imprimindo o resultado da chamada de volta ao usuário. Assim, com o CLI você pode usar o CCXT sem precisar escrever uma única linha de código.

A interface de linha de comando do CCXT é muito útil e prática para:

- scripts de API bash
- automação de trading com cron/crontab
- resolução de problemas no seu código
- depuração de erros de exchange
- realizar trading de criptomoedas rapidamente pela linha de comando
- agregação de dados para backtesting
- adicionar interoperabilidade com outros sistemas e frameworks
- aprender o básico de trading em exchanges de criptomoedas
- aprender CCXT e aspectos avançados de APIs
- escrever novas integrações de exchanges
- contribuir com código para o CCXT

Para os usuários da biblioteca CCXT – recomendamos fortemente experimentar o CLI pelo menos algumas vezes para pegar o jeito.
Para os desenvolvedores da biblioteca CCXT – o CLI não é apenas uma recomendação, é um requisito.

A melhor maneira de aprender e entender o CCXT CLI – é através de experimentação, tentativa e erro. **Aviso: O CLI executa seu comando sem pedir confirmação após o lançamento, então tenha cuidado com números, confundir montantes com preços pode causar perda de fundos.**

O mesmo design de CLI é implementado em todas as linguagens suportadas, TypeScript, JavaScript, Python e PHP – para fins de código de exemplo para os desenvolvedores.
Em outras palavras, o CLI existente contém três implementações que são em muitos aspectos idênticas. O código nesses três exemplos de CLI destina-se a ser "facilmente compreensível".

O código-fonte do CLI está disponível aqui:

- https://github.com/ccxt/ccxt/blob/master/examples/ts/cli.ts
- https://github.com/ccxt/ccxt/blob/master/examples/js/cli.js
- https://github.com/ccxt/ccxt/blob/master/examples/py/cli.py
- https://github.com/ccxt/ccxt/blob/master/examples/php/cli.php

## Instalar globalmente
```bash
npm -g ccxt
```
- Atualizar usando `npm update ccxt -g`

## Instalação

1. Clonar o repositório CCXT:
    ```bash
    git clone https://github.com/ccxt/ccxt
    ```
2. Mudar para o diretório do repositório clonado:
    ```bash
    cd ccxt
    ```
3. Instalar as dependências:
    - Node.js + npm: `npm install`
    - PHP + Composer: `composer install`

4. Executar o script:
    - Node.js: `node examples/js/cli okx fetchTicker ETH/USDT`
    - Python: `python3 examples/py/cli.py okx fetch_ticker ETH/USDT`
    - PHP: `php -f examples/php/cli.php okx fetch_ticker ETH/USDT`

## Uso

O script CLI requer pelo menos um argumento, ou seja, o ID da exchange ([a lista de exchanges suportadas e seus IDs](https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets)). Se você não especificar o ID da exchange, o script imprimirá a lista de todos os IDs de exchanges para referência.

Ao iniciar, o CLI criará e inicializará a instância da exchange e também chamará [exchange.loadMarkets()](/docs/manual#loading-markets) nessa exchange.
Se você não especificar outros argumentos de linha de comando para o CLI além do argumento de ID da exchange, o script CLI imprimirá todo o conteúdo do objeto da exchange, incluindo a lista de todos os métodos e propriedades e todos os mercados carregados (a saída pode ser extremamente longa nesse caso).

Normalmente, após o argumento de ID da exchange, especifica-se um nome de método para chamar com seus argumentos ou uma propriedade da exchange para inspecionar na instância da exchange.

### Inspecionando Propriedades da Exchange

Se o único parâmetro que você especificar para o CLI for o ID da exchange, ele imprimirá o conteúdo da instância da exchange, incluindo todas as propriedades, métodos, mercados, moedas, etc. **Aviso: o conteúdo da exchange é ENORME e isso despejará MUITA saída na sua tela!**

```bash
node examples/js/cli bybit
```

Você pode especificar o nome da propriedade da exchange para reduzir a saída para um tamanho razoável.

```bash
node examples/js/cli okx markets  # imprimirá a lista de todos os mercados carregados
node examples/js/cli binance currencies  # imprimirá uma tabela de todas as moedas carregadas
node examples/js/cli gate options  # imprimirá o conteúdo das opções específicas da exchange
```

Você pode facilmente ver quais métodos são suportados nas várias exchanges:

```bash
node examples/js/exchange-capabilities | less -S -R
```

### Chamando um Método Unificado por Nome

Chamar métodos unificados é fácil:

```bash
node examples/js/cli okx fetchOrderBook BTC/USDT  # buscará o livro de ordens da instância da exchange e o imprimirá como uma tabela
node examples/js/cli binance fetchTrades ETH/USDT  # buscará uma lista das negociações públicas mais recentes e imprimirá uma tabela
node examples/js/cli bitget fetchTickers  # buscará todos os tickers um por um
node examples/js/cli bitget fetchTickers --table  # buscará todos os tickers e os imprimirá como uma tabela
node examples/js/cli bitget fetchTickers '["BTC/USDT","ETH/USDT"]' # buscará os tickers especificados na matriz de argumentos
```

Parâmetros específicos da exchange podem ser definidos no último argumento de cada método unificado:

```bash
node examples/js/cli bybit setMarginMode isolated BTC/USDT '{"leverage":"8"}' # definir o modo de margem especificando o parâmetro de alavancagem específico da exchange
```

### Chamando um Método Específico da Exchange por Nome

Aqui está um exemplo de buscar o livro de ordens na okx em modo sandbox usando a API implícita e os parâmetros específicos instId e sz:

```bash
node examples/js/cli okx publicGetMarketBooks '{"instId":"BTC-USDT","sz":"3"}' --sandbox
```

## Autenticação e Substituições

APIs públicas de exchanges não requerem autenticação. Você pode usar o CLI para chamar qualquer método de uma API pública. A diferença entre APIs públicas e privadas é descrita no Manual, aqui: [API Pública/Privada](/docs/manual#publicprivate-api).

Para chamadas de API privadas, por padrão, o script CLI procurará chaves de API no arquivo `keys.local.json` no diretório raiz do repositório clonado e também procurará credenciais de exchange nas variáveis de ambiente. Mais detalhes aqui: [Adicionando Credenciais de Exchange](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#adding-exchange-credentials).

## API Unificada vs API Específica da Exchange

O CLI suporta todos os métodos e propriedades possíveis que existem na instância da exchange.

### Executar com jq
Instalar jq 

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

#### Exemplos
- Obter o preço do ticker de BTC/USDT: `ccxt binance fetchTicker BTC/USDT | jq '.price'
- observar preço e quantidade de negociações:
```bash
`ccxt binance watchTrades BTC/USDT --raw | jq -c '[.[] | {price: .price, amount: .amount}]'`
```

- pesquisa difusa entre negociações (requer fzf):
```bash
`ccxt binance fetchTrades --raw | jq -c '.[]' | fzf`
```

![render1710459605924](https://github.com/ccxt/ccxt/assets/12142844/39b22383-42d5-4ebd-8b09-617008b7e4f0)
