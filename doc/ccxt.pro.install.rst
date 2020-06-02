`⌂ Home <ccxt.pro>`__

How To Install
==============

Installing CCXT Pro requires visiting the https://ccxt.pro website and obtaining a CCXT Pro license. The license gives you the access to the CCXT Pro codebase in a private GitHub repository.

.. code:: diff

   - this part of the doc is currenty a work in progress
   - there may be some issues here and there
   - feedback and pull requests appreciated

JavaScript
----------

.. code:: shell

   # in your project directory

   # if you're using Git/HTTPS authentication
   npm install git+https://github.com/kroitor/ccxt.pro.git

   # if you are connecting to GitHub with SSH
   npm install ssh://git@github.com/kroitor/ccxt.pro.git
   # or
   npm install git@ssh://github.com/kroitor/ccxt.pro.git
   # or if you have git and github.com in your ~/.ssh/config
   npm install ssh://github.com/kroitor/ccxt.pro.git

JavaScript Dependency
~~~~~~~~~~~~~~~~~~~~~

Adding CCXT Pro as a dependency to ``package.json`` in your Node.js project or package is done automatically by the above commands. To add it manually list it in your ``package.json`` among your ``dependencies`` or ``devDependencies`` as usual:

.. code:: javascript

   // package.json
   {
     // ...
     "dependencies": {
       "ccxt.pro": "git+https://github.com/kroitor/ccxt.pro.git"
     }
     // ...
   }

Running ``npm install`` in the same folder after adding the above to ``package.json`` will install CCXT Pro to your ``node_modules/``. To update it later run ``npm update ccxt.pro``.

Python
------

.. code:: shell

   # if you're using Git/HTTPS authentication
   pip3 install git+https://github.com/kroitor/ccxt.pro.git#subdirectory=python

   # if you are connecting to GitHub with SSH
   pip3 install git+ssh://git@github.com/kroitor/ccxt.pro.git#subdirectory=python

Python Dependency
~~~~~~~~~~~~~~~~~

With `setuptools <https://setuptools.readthedocs.io/en/latest/>`__ adding CCXT Pro as a dependency to your Python package can be done by listing it in ``setup.py`` or in your `Requirements Files <https://pip.pypa.io/en/latest/user_guide/#requirements-files>`__:

.. code:: python

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

PHP
---

.. code:: shell

   # in your project directory
   composer config repositories.ccxtpro '{"type": "git", "url": "https://github.com/kroitor/ccxt.pro.git"}'
   composer require ccxt/ccxtpro

PHP Dependency
~~~~~~~~~~~~~~

The CCXT Pro is added as a dependency to ``composer.json`` in your PHP package with the above commands automatically. To add it manually list it in your ``composer.json`` as usual:

.. code:: php

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
