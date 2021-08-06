# How To Install

Installing CCXT Pro requires visiting the https://ccxt.pro website and obtaining a CCXT Pro license. The license gives you the access to the CCXT Pro codebase in a private GitHub repository.

CCXT Pro is a tool for professionals and it requires a certain expertise in programming, cryptocurrencies and trading.

**You have to configure your** [GitHub authentication](https://docs.github.com/en/github/authenticating-to-github) **over SSH or HTTPS.**

```diff
- this part of the doc is currenty a work in progress
- there may be some issues here and there
- feedback and pull requests appreciated
```

## JavaScript

```shell
# in your project directory

# if you're using Git/HTTPS authentication
npm install git+https://github.com/kroitor/ccxt.pro.git

# if you are connecting to GitHub with SSH
npm install ssh://git@github.com/kroitor/ccxt.pro.git
# or
npm install git@ssh://github.com/kroitor/ccxt.pro.git
# or if you have git and github.com in your ~/.ssh/config
npm install ssh://github.com/kroitor/ccxt.pro.git
```

### JavaScript Dependency

Adding CCXT Pro as a dependency to `package.json` in your Node.js project or package is done automatically by the above commands. To add it manually list it in your `package.json` among your `dependencies` or `devDependencies` as usual:

```JavaScript
// package.json
{
  // ...
  "dependencies": {
    "ccxt.pro": "git+https://github.com/kroitor/ccxt.pro.git"
  }
  // ...
}
```

1. Add the above to your `package.json`.
2. Run `npm install` in your project.
3. To update it later run `npm update ccxt.pro` in your project.

### JavaScript Installation From A Cloned Source Code Repository

Steps to add changes or to make a custom build:

```shell
# Step 1: Clone the CCXT Pro repository
# If you are using HTTPS authentication by login+password
git clone https://github.com/kroitor/ccxt.pro.git
# If you are using SSH authentication (recommended)
# git clone ssh://git@github.com/kroitor/ccxt.pro.git

# Step 2: Add your changes if necessary
cd ccxt.pro
# ...

# Step 3: Install CCXT Pro's dependencies
npm install

# Step 4: Build the CCXT Pro library with Node.js and NPM
npm run build

# Step 5: Make an NPM link to CCXT Pro
npm link

# Step 6: Link your project to CCXT Pro
cd path/to/your/project
npm link ccxt
```

## Python

```shell
# if you're using Git/HTTPS authentication
pip3 install git+https://github.com/kroitor/ccxt.pro.git#subdirectory=python

# if you are connecting to GitHub with SSH
pip3 install git+ssh://git@github.com/kroitor/ccxt.pro.git#subdirectory=python
```

### Python Dependency

With [setuptools](https://setuptools.readthedocs.io/en/latest/) adding CCXT Pro as a dependency to your Python package can be done by listing it in `setup.py` or in your [Requirements Files](https://pip.pypa.io/en/latest/user_guide/#requirements-files):

```Python
# setup.py
setup(
    # ...
    install_requires=[
        # install the most recent version
        'ccxtpro @ git+https://github.com/kroitor/ccxt.pro.git#subdirectory=python'
        # install a specific version number
        # 'ccxtpro @ git+https://github.com/kroitor/ccxt.pro.git@0.1.13#subdirectory=python'
    ]
    # ...
)
```

### Python Installation From A Cloned Source Code Repository

You will need Node.js and NPM for your system: https://nodejs.org/en/.
By default, both Node.js and NPM are installed together from the same Node.js distribution.

Steps to add changes or to make a custom build:

```shell
# Step 1: Clone the CCXT Pro repository
# If you are using HTTPS authentication by login+password
git clone https://github.com/kroitor/ccxt.pro.git
# If you are using SSH authentication (recommended)
# git clone ssh://git@github.com/kroitor/ccxt.pro.git

# Step 2: Add your changes if necessary
cd ccxt.pro
# ...

# Step 3: Build the CCXT Pro library with Node.js and NPM
npm run build

# Step 4: Install the CCXT Pro Python package from the local repository
# The actual command will depend on how Python is installed and configured in the system
pip install python/
# or
# pip3 install

# Step 5: Add to your project dependencies or import directly in Python
#
#
#     # Python
#
#     import ccxtpro
#
#     # your code here
#     print('CCXT Pro Version:', ccxtpro.__version__)
#     print('CCXT Pro Exchanges:', ccxtpro.exchanges)
#
#
#
```

## PHP

```shell
# in your project directory
composer config repositories.ccxtpro '{"type": "git", "url": "https://github.com/kroitor/ccxt.pro.git"}'
composer require --ignore-platform-reqs ccxt/ccxtpro
```

### PHP Dependency

The CCXT Pro is added as a dependency to `composer.json` in your PHP package with the above commands automatically. To add it manually list it in your `composer.json` as usual:

```PHP
// composer.json
{
    // ...
    "require": {
        "ccxt/ccxtpro": "^0.0.70"
    },
    "repositories": {
        "ccxtpro": {
            "type": "git",
            "url": "https://github.com/kroitor/ccxt.pro.git"
        }
    }
    // ...
}
```

### PHP Installation From A Cloned Source Code Repository

You will need Node.js and NPM for your system: https://nodejs.org/en/.
By default, both Node.js and NPM are installed together from the same Node.js distribution.

Steps to add changes or to make a custom build:

```shell
# Step 1: Clone the CCXT Pro repository
# If you are using HTTPS authentication by login+password
git clone https://github.com/kroitor/ccxt.pro.git
# If you are using SSH authentication (recommended)
# git clone ssh://git@github.com/kroitor/ccxt.pro.git

# Step 2: Add your changes if necessary
cd ccxt.pro
# ...

# Step 3: Build the CCXT Pro library with Node.js and NPM
npm run build

# Step 4: Build the CCXT Pro PHP Composer package from the local repository
composer install --ignore-platform-reqs

# Step 5: Add to your project's composer.json
cd path/to/your/project
#
#     "require": {
#         ...
#         "ccxtpro/ccxtpro": "dev-master",  # add this line to your requirements
#         ...
#     },
#     "repositories": [
#
#         {
#             "type": "vcs",
#             "url": "../ccxt.pro"  # relative path to cloned repository of CCXT Pro
#         }
#     ]
#

# Step 6: Include into your project:
#
#
#     <?php
#
#     include "vendor/autoload.php";
#
#     // your code here
#     echo "CCXT Pro version: " . \ccxtpro\Exchange::VERSION . "\n";
#     echo "CCXT Pro Exchanges:\n";
#     print_r(\ccxtpro\Exchange::$exchanges);
#
#
#
```
