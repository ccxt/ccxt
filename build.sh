#!/bin/bash

npm run export-markets &&
npm run mdrst && 
npm run transpile &&
npm run vss &&
npm run build
