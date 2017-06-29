#!/bin/bash

comment="'$@'"

npm run transpile &&
npm run build &&
git commit -am $comment &&
npm version patch &&
npm publish &&
git push &&
python setup.py sdist upload
