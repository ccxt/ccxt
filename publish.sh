#!/bin/bash

npm version patch &&
npm publish &&
git push &&
python setup.py sdist upload
