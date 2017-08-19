# Always prefer setuptools over distutils
from setuptools import setup, find_packages
# To use a consistent encoding
from codecs import open
from os import path
import json
import sys

here = path.abspath(path.dirname(__file__))

# Get the long description from the README file
with open(path.join(here, 'README.rst'), encoding='utf-8') as f:
    long_description = f.read()

# Get the version number and all other params from package.json
with open(path.join(here, 'package.json'), encoding='utf-8') as f:
    package = json.load(f)

requirements = ['setuptools']
if sys.version_info[0] == 3:
    requirements += [
        'aiohttp',
        # 'cchardet', # reserved for future
        # 'aiodns', # reserved for future
    ]

setup(

    name=package['name'],
    version=package['version'],

    description=package['description'],
    long_description=long_description,

    url=package['homepage'],

    author=package['author']['name'],
    author_email=package['author']['email'],

    license=package['license'],

    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'Intended Audience :: Financial and Insurance Industry',
        'Intended Audience :: Information Technology',
        'Topic :: Software Development :: Build Tools',
        'Topic :: Office/Business :: Financial :: Investment',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 2',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: JavaScript',
        'Programming Language :: PHP',
        'Operating System :: OS Independent',
        'Environment :: Console'
    ],

    keywords=package['keywords'],
    packages=find_packages(),
    install_requires=requirements,
    extras_require={
        'qa': [
            'flake8'
        ]
    },
)
