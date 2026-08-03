---
title: "CLI"
description: "CCXT incluye un ejemplo que permite llamar a todos los métodos y propiedades del exchange desde la línea de comandos. Ni siquiera es necesario ser programador o escribir código –…"
---

# CCXT CLI (Interfaz de Línea de Comandos)

CCXT incluye un ejemplo que permite llamar a todos los métodos y propiedades del exchange desde la línea de comandos. ¡Ni siquiera es necesario ser programador o escribir código – cualquier usuario puede usarlo!

La interfaz CLI es un programa en CCXT que toma el nombre del exchange y algunos parámetros desde la línea de comandos y ejecuta una llamada correspondiente de CCXT, imprimiendo el resultado de la llamada al usuario. Así, con CLI puedes usar CCXT sin necesidad de escribir ni una sola línea de código.

La interfaz de línea de comandos de CCXT es muy práctica y útil para:

- scripting de bash api
- automatización de trading con cron/crontab
- resolver problemas con tu código
- depurar errores del exchange
- realizar trading de criptomonedas rápidamente desde la línea de comandos
- agregar datos para backtesting
- añadir interoperabilidad con otros sistemas y frameworks
- aprender los fundamentos del trading de exchanges de criptomonedas
- aprender CCXT y aspectos avanzados de APIs
- escribir nuevas integraciones de exchanges
- contribuir código a CCXT

Para los usuarios de la biblioteca CCXT – recomendamos encarecidamente probar CLI al menos unas pocas veces para tener una idea.
Para los desarrolladores de la biblioteca CCXT – CLI no es solo una recomendación, es un requisito.

La mejor manera de aprender y entender CCXT CLI – es mediante experimentación, prueba y error. **Advertencia: CLI ejecuta su comando y no solicita confirmación después de iniciarlo, así que tenga cuidado con los números, confundir cantidades con precios puede causar pérdida de fondos.**

El mismo diseño de CLI está implementado en todos los lenguajes soportados, TypeScript, JavaScript, Python y PHP – con fines de código de ejemplo para los desarrolladores.
En otras palabras, el CLI existente contiene tres implementaciones que son en muchos aspectos idénticas. El código en esos tres ejemplos de CLI está destinado a ser "fácilmente comprensible".

El código fuente del CLI está disponible aquí:

- https://github.com/ccxt/ccxt/blob/master/examples/ts/cli.ts
- https://github.com/ccxt/ccxt/blob/master/examples/js/cli.js
- https://github.com/ccxt/ccxt/blob/master/examples/py/cli.py
- https://github.com/ccxt/ccxt/blob/master/examples/php/cli.php

## Instalar globalmente
```bash
npm -g ccxt
```
- Actualizar usando `npm update ccxt -g`

## Instalar

1. Clonar el repositorio CCXT:
    ```bash
    git clone https://github.com/ccxt/ccxt
    ```
2. Cambiar al directorio del repositorio clonado:
    ```bash
    cd ccxt
    ```
3. Instalar las dependencias:
    - Node.js + npm: `npm install`
    - PHP + Composer: `composer install`

4. Ejecutar el script:
    - Node.js: `node examples/js/cli okx fetchTicker ETH/USDT`
    - Python: `python3 examples/py/cli.py okx fetch_ticker ETH/USDT`
    - PHP: `php -f examples/php/cli.php okx fetch_ticker ETH/USDT`

## Uso

El script CLI requiere al menos un argumento, es decir, el id del exchange ([la lista de exchanges soportados y sus ids](https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets)). Si no especifica el id del exchange, el script imprimirá la lista de todos los ids de exchanges para referencia.

Al iniciarse, CLI creará e inicializará la instancia del exchange y también llamará a [exchange.loadMarkets()](/docs/manual#loading-markets) en ese exchange.
Si no especifica otros argumentos de línea de comandos a CLI excepto el argumento del id del exchange, entonces el script CLI imprimirá todo el contenido del objeto exchange, incluyendo la lista de todos los métodos y propiedades y todos los mercados cargados (la salida puede ser extremadamente larga en ese caso).

Normalmente, después del argumento del id del exchange, uno especificaría un nombre de método para llamar con sus argumentos o una propiedad del exchange para inspeccionar en la instancia del exchange.

### Inspeccionando Propiedades del Exchange

Si el único parámetro que especifica a CLI es el id del exchange, entonces imprimirá el contenido de la instancia del exchange, incluyendo todas las propiedades, métodos, mercados, monedas, etc. **¡Advertencia: el contenido del exchange es ENORME y esto volcará MUCHÍSIMA salida en su pantalla!**

```bash
node examples/js/cli bybit
```

Puede especificar el nombre de la propiedad del exchange para reducir la salida a un tamaño razonable.

```bash
node examples/js/cli okx markets  # imprimirá la lista de todos los mercados cargados
node examples/js/cli binance currencies  # imprimirá una tabla de todas las monedas cargadas
node examples/js/cli gate options  # imprimirá el contenido de las opciones específicas del exchange
```

Puede ver fácilmente qué métodos son compatibles en los diversos exchanges:

```bash
node examples/js/exchange-capabilities | less -S -R
```

### Llamando a un Método Unificado por Nombre

Llamar a métodos unificados es fácil:

```bash
node examples/js/cli okx fetchOrderBook BTC/USDT  # recuperará el libro de órdenes de la instancia del exchange e imprimirá una tabla
node examples/js/cli binance fetchTrades ETH/USDT  # recuperará una lista de los trades públicos más recientes e imprimirá una tabla
node examples/js/cli bitget fetchTickers  # recuperará todos los tickers uno por uno
node examples/js/cli bitget fetchTickers --table  # recuperará todos los tickers e imprimirá una tabla
node examples/js/cli bitget fetchTickers '["BTC/USDT","ETH/USDT"]' # recuperará los tickers especificados en el argumento de array
```

Los parámetros específicos del exchange pueden establecerse en el último argumento de cada método unificado:

```bash
node examples/js/cli bybit setMarginMode isolated BTC/USDT '{"leverage":"8"}' # establecer el modo de margen mientras se especifica el parámetro de apalancamiento específico del exchange
```

### Llamando a un Método Específico del Exchange por Nombre

Aquí hay un ejemplo de recuperar el libro de órdenes en okx en modo sandbox usando la API implícita y los parámetros específicos del exchange instId y sz:

```bash
node examples/js/cli okx publicGetMarketBooks '{"instId":"BTC-USDT","sz":"3"}' --sandbox
```

## Autenticación y Anulaciones

Las API públicas de exchanges no requieren autenticación. Puede usar CLI para llamar a cualquier método de una API pública. La diferencia entre API públicas y privadas se describe en el Manual, aquí: [API Pública/Privada](/docs/manual#publicprivate-api).

Para llamadas a API privadas, por defecto el script CLI buscará claves API en el archivo `keys.local.json` en la raíz del repositorio clonado en su directorio de trabajo y también buscará credenciales de exchange en las variables de entorno. Más detalles aquí: [Añadiendo Credenciales de Exchange](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#adding-exchange-credentials).

## API Unificada vs API Específica del Exchange

CLI soporta todos los métodos y propiedades posibles que existen en la instancia del exchange.

### Ejecutar con jq
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

#### Ejemplos
- Obtener precio del ticker de BTC/USDT: `ccxt binance fetchTicker BTC/USDT | jq '.price'
- ver precio y cantidad de trades:
```bash
`ccxt binance watchTrades BTC/USDT --raw | jq -c '[.[] | {price: .price, amount: .amount}]'`
```

- búsqueda difusa entre trades (requiere fzf):
```bash
`ccxt binance fetchTrades --raw | jq -c '.[]' | fzf`
```

![render1710459605924](https://github.com/ccxt/ccxt/assets/12142844/39b22383-42d5-4ebd-8b09-617008b7e4f0)
