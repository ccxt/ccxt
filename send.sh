#!/bin/bash

npm version patch &&
npm run vss &&
git commit -am 'version updated' &&
git push 
