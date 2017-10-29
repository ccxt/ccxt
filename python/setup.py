# prefer setuptools over distutils
from setuptools import setup, find_packages

# use a consistent encoding
from codecs import open
from os import path
import json

here = path.abspath(path.dirname(__file__))

# long description from README file
with open(path.join(here, 'README.rst'), encoding='utf-8') as f:
    long_description = f.read()

# version number and all other params from package.json
with open(path.join(here, 'package.json'), encoding='utf-8') as f:
    package = json.load(f)

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

    install_requires=['setuptools'],
    extras_require={
        ':python_version>="3.5"': [
            'aiohttp',
            'cchardet',
            'aiodns',
        ],
        'qa': [
            'flake8'
        ],
        'doc': [
            'Sphinx'
        ]
    }
)
