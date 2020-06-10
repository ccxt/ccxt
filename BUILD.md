# Building

## Prerequisites

To build CCXT you will need:
- git (from a command prompt: `git --version`)
- node (from a command prompt: `node --version`)
    - v14.3.0 confirmed working
- tox
    - via pip: `pip install tox` (confirmed works)
    - [macOS](https://brew.sh): `brew install tox` (confirmed works)
    - linux: `apt-get install tox`
    - windows: 

## Build Steps

1. Checkout code:
    > git clone https://github.com/ccxt/ccxt.git
2. cd into to the root directory
2. If you want to only build specific exchanges, edit `exchanges.cfg` (by default it will build them all)
3. Run `npm install`. This will fetch packages and should end with a message saying "Thank you!"
4. Run `npm run build`. If you get [the error](https://github.com/ccxt/ccxt/issues/4195):

    > let rstExchangeTableLines = match[2].split ("\n") 
   
   then instead run `npm run build-without-docs`

