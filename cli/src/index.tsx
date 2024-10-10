#!/usr/bin/env node

import { Command } from 'commander';
import ccxt from 'ccxt';
import { createExchangeCommand } from './lib/exchangeExtractor.js';


const program = new Command();
program.version(ccxt.version)
.name ('ccxt')
.alias ('c')
.description ('ccxt command line interface')

for (let exchangeId of ccxt.exchanges) {
  let exchange = new ccxt[exchangeId]();
  if (exchange.pro) exchange = new ccxt.pro[exchangeId]();
  createExchangeCommand(program, exchange);
}

(async () => await program.parseAsync(process.argv))();



