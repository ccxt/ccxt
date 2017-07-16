#!/bin/bash

npm version patch &&
npm vss &&
git commit -am 'version updated'
git push
npm publish &&
git push &&
python setup.py sdist upload
