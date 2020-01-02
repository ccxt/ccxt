![CCXT Pro](https://user-images.githubusercontent.com/1294454/71230147-79917b80-22f9-11ea-9c7e-dcd40123a1d0.png)

info@ccxt.pro

# CCXT Pro

CCXT Pro is a professional extension to the standard CCXT that is going to include:
- The support for unified public and private WebSockets (pub and sub) – work in progress now
- FIX protocol adapters – planned for the future
-

## Technicalities:

- public and private unified streaming APIs
- auto-connection and re-connection
- connection timeouts
- re-connection exponential backoff delay
- keep-alive ping-pong
- proxies

## The Access To The Repository

The access to the CCXT Pro repository is prepaid and restricted (by invitation only). In order to get the access to the repository, the user must buy an access plan at https://ccxt.pro and visit the repository on GitHub via https://github.com/kroitor/ccxt.pro.

## License Summary

The CCXT Pro License does not include mechanisms that enforce technical limitations on the user or any other restrictions that would affect direct communication between the users and the exchanges without intermediaries. The mechanism that protects the CCXT Pro license is not technical, but works based purely on laws.

CCXT Pro is open-source which is another important aspect in the licensing. Without imposing unnecessary technical limitations and introducing intermediary code, there is no technical way for us to know that someone is using CCXT Pro in-house without a license.

The CCXT Pro license addresses abusive access to the repository, leaking the source-code and republishing it without a permission from us. Violations of licensing terms will be pursued legally.

# How To Install

Installing CCXT Pro requires visiting the https://ccxt.pro website and obtaining a CCXT Pro license. The license gives the access to the CCXT Pro codebase in a private GitHub repository.

```diff
- this part of the doc is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

## JavaScript

```shell
# in your project directory
npm install ccxt.pro
```

## Python

```
pip install ccxtpro
```

## PHP

```shell
# in your project directory
composer install ccxt/ccxtpro
```

# How To Use

## The Technical Overview

The CCXT Pro stack is built upon CCXT and extends the core CCXT classes, using:

- JavaScript prototype-level mixins
- Python multiple inheritance
- PHP Traits

The CCXT Pro heavily relies on the transpiler of CCXT for [multilanguge support](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support).


```
                                 User

    +-------------------------------------------------------------+
    |                          CCXT Pro                           |
    +------------------------------+------------------------------+
    |            Public            .           Private            |
    +=============================================================+
    │                              .                              |
    │                  The Unified CCXT Pro API                   |
    |                              .                              |
    |       loadMarkets            .           watchBalance       |
    |       fetchMarkets           .            createOrder       |
    |       fetchCurrencies        .            cancelOrder       |
    |       fetchTicker            .             watchOrder       |
    |       fetchTickers           .            watchOrders       |
    |       fetchOrderBook         .        watcgOpenOrders       |
    |       fetchOHLCV             .      watchClosedOrders       |
    |       fetchStatus            .          watchMyTrades       |
    |       fetchTrades            .                deposit       |
    |                              .               withdraw       |
    │                              .                              |
    +=============================================================+
    │                              .                              |
    |            The Underlying Exchange-Specific APIs            |
    |         (Derived Classes And Their Implementations)         |
    │                              .                              |
    +=============================================================+
    │                              .                              |
    |                 CCXT Pro Base Exchange Class                |
    │                              .                              |
    +=============================================================+

    +-------------------------------------------------------------+
    |                                                             |
    |                            CCXT                             |
    |                                                             |
    +=============================================================+
```

## Usage

```diff
- this part of the doc is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

### Prerequisites

The best way to understand CCXT Pro is to make sure you grasp the entire CCXT Manual and practice standard CCXT first. CCXT Pro borrows a lot from CCXT, therefore the two libraries share a lot of commonalities, including:

- markets, symbols and ids
- unified data structures and formats, orderbooks, trades, orders, candles, ...
- exceptions and error mappings
- authentication and API keys (for private feeds and calls)
- configuration options

### Linking Against CCXT Pro

The process of including the CCXT Pro library into your script is pretty much the same as with the standard CCXT, the only difference is the name of the actual module (js), package (py) or namespace (php).

```JavaScript
// JavaScript
const ccxtpro = require ('ccxt.pro')
console.log ('CCXT Pro version', ccxtpro.version)
console.log ('Supported exchanges:', ccxtpro.exchanges)
```

```Python
# Python
import ccxtpro
print('CCXT Pro version', ccxtpro.__version__)
print('Supported exchanges:', ccxtpro.exchanges)
```

```PHP
// PHP
use \ccxtpro; // optional, since you can use fully qualified names
echo 'CCXT Pro version ', \ccxtpro\Exchange::VERSION, "\n";
echo 'Supported exchanges: ', json_encode(\ccxtpro\Exchange::$exchanges), "\n";
```

The imported CCXT Pro module wraps the CCXT inside itself – every exchange instantiated via CCXT Pro has all the CCXT methods inside itself as well as the additional functionality.

### Instantiation

```JavaScript
// JavaScript
```

```Python
# Python
```

```PHP
// PHP
```



