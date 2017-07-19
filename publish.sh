#!/bin/bash

npm publish &&
python setup.py sdist upload
