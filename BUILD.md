# Building

## Prerequisites

To build CCXT you will need:
- git (from a command prompt: `git --version`)
- node (from a command prompt: `node --version`)
    - v14.3.0 is known to work
- [Homebrew](https://brew.sh/) (macOS)
- tox
    - macOS: brew install tox
    - linux: apt-get install tox
    - windows: __________________

## Build Steps

1. Open a command prompt and cd to the root directory
2. If you want to only build specific exchanges, edit `exchanges.cfg` (by default it will build them all)
3. Run `npm install`
4. Run `npm run build`
    - If you get the error " let rstExchangeTableLines = match[2].split ("\n") then instead run `npm run build-without-docs`

