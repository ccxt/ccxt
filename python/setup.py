# prefer setuptools over distutils
from setuptools import setup, find_packages
from setuptools.command.develop import develop
from setuptools.command.install import install

# use a consistent encoding
from codecs import open
from os import path
import json


def postinstall():
    print("                                                                 ")
    print("              ---------------------------------------------------")
    print("                                                                 ")
    print("                        :Siiiiiiiiiiir    rSiiiiiiiiiiS:         ")
    print("                        r&9hh&&&&&&&A5    SG99h&&&&&&GHr         ")
    print("                        ;hX32;::::::;,    i9X9S:;:::::;,         ")
    print("                        ;hX9S             ihXhr                  ")
    print("                        ;hX32::::::,:,    i9X9i::::::,:.         ")
    print("                        rG999GGGGGGGAS    iG99hGGGGGGGAr         ")
    print("                        ;2S55SSSSSSS2r    r2555SSSSSSS2;         ")
    print("                        ;2S5s    ;2S2r    r2SS555555SS2;         ")
    print("                        rAh&2    sAhAS    SAGGh9999GGGAr         ")
    print("                        .:,::rrrs::::,    ,:,,;9X3X:,,:.         ")
    print("                             &A&H,            ,hX33              ")
    print("                        ,;:;;;;;r;;:;,        ,hX3X.             ")
    print("                        rHGAX    sAGA5        :&9h9.             ")
    print("                        :Ssir    ;isir        ,Siii              ")
    print("                                                                 ")
    print("                       Thanks for installing ccxt 🙏             ")
    print("                Please consider donating to our open collective  ")
    print("                       to help us maintain this package.         ")
    print("                                                                 ")
    print("            👉  Donate: https://opencollective.com/ccxt/donate   ")
    print("                                                                 ")
    print("              ---------------------------------------------------")
    print("                                                                 ")
    print("                     You can contribute in crypto directly:      ")
    print("                                                                 ")
    print("                 ETH 0xa7c2b18b7c8b86984560cad3b1bc3224b388ded0  ")
    print("                 BTC 33RmVRfhK2WZVQR1R83h2e9yXoqRNDvJva          ")
    print("                 BCH 1GN9p233TvNcNQFthCgfiHUnj5JRKEc2Ze          ")
    print("                 LTC LbT8mkAqQBphc4yxLXEDgYDfEax74et3bP          ")
    print("                                                                 ")
    print("              ---------------------------------------------------")
    print("                                                                 ")
    print("                                   Thank you!                    ")
    print("                                                                 ")


class PostDevelopCommand(develop):
    """Post-installation for development mode."""
    def run(self):
        # PUT YOUR POST-INSTALL SCRIPT HERE or CALL A FUNCTION
        postinstall()
        develop.run(self)


class PostInstallCommand(install):
    """Post-installation for installation mode."""
    def run(self):
        # PUT YOUR POST-INSTALL SCRIPT HERE or CALL A FUNCTION
        postinstall()
        install.run(self)


here = path.abspath(path.dirname(__file__))
root = path.dirname(here)

readme_rst = path.join(here, 'README.rst')
package_json = path.join(here, 'package.json')

# a workaround when installing locally from git repository with pip install -e .
if not path.isfile(package_json):
    package_json = path.join(root, 'package.json')

# long description from README file
with open(readme_rst, encoding='utf-8') as f:
    long_description = f.read()

# version number and all other params from package.json
with open(package_json, encoding='utf-8') as f:
    package = json.load(f)

setup(

    cmdclass={
        'develop': PostDevelopCommand,
        'install': PostInstallCommand,
    },

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

    install_requires=[
        'setuptools==38.5.1',
        'certifi==2018.1.18',
        'requests==2.18.4'
    ],

    extras_require={
        ':python_version>="3.5"': [
            'aiohttp==3.0.1',
            'cchardet==2.1.1',
            'aiodns==1.1.1',
            'yarl==1.1.0'
        ],
        'qa': [
            'flake8==3.5.0'
        ],
        'doc': [
            'Sphinx==1.7.0'
        ]
    }
)
