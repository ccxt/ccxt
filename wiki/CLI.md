# CCXT CLI (Command-Line Interface)

CCXT includes an example that allows calling all exchange methods and properties from command line. One doesn't even have to be a programmer or write code – any user can use it!

The CLI interface is a program in CCXT that takes the exchange name and some params from the command line and executes a corresponding call from CCXT printing the output of the call back to the user. Thus, with CLI you can use CCXT out of the box, not a single line of code needed.

CCXT command line interface is very handy and useful for:

- bash api scripting
- cron/crontab trading automation
- resolving issues with your code
- debugging the exchange errors
- performing quick cryptocurrency trading from command-line
- aggregating data for backtesting
- adding interoperability with other systems and frameworks
- learning the basics of cryptocurrency exchange trading
- learning CCXT and the advanced aspects of APIs
- writing new exchange integrations
- contributing code to CCXT

For the CCXT library users – we highly recommend to try CLI at least a few times to get a feel of it.
For the CCXT library developers – CLI is more than just a recommendation, it's a must.

The best way to learn and understand CCXT CLI – is by experimentation, trial and error. **Warning: CLI executes your command and does not ask for a confirmation after you launch it, so be careful with numbers, confusing amounts with prices can cause a loss of funds.**

The CLI design is implemented in Python – for the purposes of example code for the developers.
The code in the CLI example is intended to be "easily understandable".

The source code of the CLI is available here:

- https://github.com/ccxt/ccxt/blob/master/examples/py/cli.py


## Install

1. Clone the CCXT repository:
    ```shell
    git clone https://github.com/ccxt/ccxt
    ```
2. Change directory to the cloned repository:
    ```shell
    cd ccxt
    ```
3. Install the dependencies:
    - Python: `pip install -r requirements.txt`

4. Run the script:
    - Python: `python3 examples/py/cli.py okx fetch_ticker ETH/USDT`

## Usage

The CLI script requires at least one argument, that is, the exchange id ([the list of supported exchanges and their ids](https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets)). If you don't specify the exchange id, the script will print the list of all exchange ids for reference.

Upon launch, CLI will create and initialize the exchange instance and will also call [exchange.loadMarkets()](https://github.com/ccxt/ccxt/wiki/Manual#loading-markets) on that exchange.
If you don't specify any other command-line arguments to CLI except the exchange id argument, then the CLI script will print out all the contents of the exchange object, including the list of all the methods and properties and all the loaded markets (the output may be extremely long in that case).

Normally, following the exchange id argument one would specify a method name to call with its arguments or an exchange property to inspect on the exchange instance.


## Authentication And Overrides

Public exchange APIs don't require authentication. You can use the CLI to call any method of a public API. The difference between public APIs and private APIs is described in the Manual, here: [Public/Private API](https://github.com/ccxt/ccxt/wiki/Manual#publicprivate-api).

For private API calls, by default the CLI script will look for API keys in the `keys.local.json` file in the root of the repository cloned to your working directory and will also look up exchange credentials in the environment variables. More details here: [Adding Exchange Credentials](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#adding-exchange-credentials).

## Unified API vs Exchange-Specific API

CLI supports all possible methods and properties that exist on the exchange instance.

