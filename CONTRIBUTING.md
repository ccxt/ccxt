# Contributing To The CCXT Library

```diff
- This file is a work in progress, guidelines for contributing are being developed right now!
```

## How To Submit An Issue

If you want to submit an issue and you want your issue to be resolved quickly, here's a checklist for you:

- Read the [Manual](https://github.com/ccxt/ccxt/wiki/Manual), and especially carefully read the following sections:
  - [Exchange Properties](https://github.com/ccxt/ccxt/wiki/Manual#exchange-properties)
  - [Rate Limit](https://github.com/ccxt/ccxt/wiki/Manual#rate-limit)
  - [DDoS Protection](https://github.com/ccxt/ccxt/wiki/Manual#ddos-protection-by-cloudflare--incapsula)
  - [Authentication](https://github.com/ccxt/ccxt/wiki/Manual#authentication)
  - [API Keys Setup](https://github.com/ccxt/ccxt/wiki/Manual#api-keys-setup)
- Read the [Troubleshooting](https://github.com/ccxt/ccxt/wiki/Manual#troubleshooting) section and follow troubleshooting steps.
- Read the [FAQ](https://github.com/ccxt/ccxt/wiki/FAQ) for most frequently asked questions.
- Read the [API docs](https://github.com/ccxt/ccxt/wiki/Exchange-Markets) for your exchange.
- Search for similar issues first to avoid duplicates.
- If your issue is unique, along with a basic description of the failure, the following **IS REQUIRED**:
  - **set `exchange.verbose = true` property on the exchange instance before calling its functions or methods**
  - **DON'T POST SCREENSHOTS OF CODE OR ERRORS, POST THE OUTPUT AND CODE IN PLAIN TEXT!**
  - **surround code and output with triple backticks: &#096;&#096;&#096;GOOD&#096;&#096;&#096;**
  - don't confuse the backtick symbol (&#096;) with the quote symbol (\'): '''BAD'''
  - don't confuse a single backtick with triple backticks: &#096;BAD&#096;
  - paste a complete code snippet you're having difficulties with, avoid one-liners
  - paste the **full verbose output** of the failing method without your keys
  - the verbose output should include the request and response from the exchange (not just an error callstack)
  - write your language **and version**
  - write ccxt library version
  - which exchange it is
  - which method you're trying to call

## Reporting Vulnerabilities And Critical Issues

If you found a security issue or a critical vulnerability and reporting it in public would impose risk – please feel free to send us a message to <a href="mailto:info@ccxt.trade">info@ccxt.trade</a>.

## How To Contribute Code

- **[MAKE SURE YOUR CODE IS UNIFIED](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes)!**

  ↑ This is the most important rule of all.

- **PLEASE, DO NOT COMMIT THE FOLLOWING FILES IN PULL REQUESTS:**

  - `/doc/*` (these files are generated from `/wiki/*`, place your edits there)
  - `/build/*` (these are generated automatically)
  - `/php/*` (except for base classes)
  - `/python/*` (except for base classes)


  These files are generated ([explained below](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support)) and will be overwritten upon build. Please don't commit them to avoid bloating the repository which is already quite large. Most often, you have to commit just one single source file to submit an edit to the implementation of an exchange.

- **PLEASE, SUBMIT ATOMIC EDITS, ONE PULL REQUEST PER ONE EXCHANGE, DO NOT MIX THEM**
- **MAKE SURE YOUR CODE PASSES ALL SYNTAX CHECKS BY RUNNING `npm run build`**

## Pending Tasks

Below is a list of functionality we would like to have implemented in the library in the first place. Most of these tasks are already in progress, implemented for some exchanges, but not all of them:

- Unified fetchOrder
- Unified fetchOrders, fetchOpenOrders, fetchClosedOrders
- Unified fetchMyTrades, fetchOrderTrades
- Unified fetchDepositAddress, createDepositAddress
- Unified withdraw
- Unified fees
- Unified fetchTransactions, fetchDeposits, fetchWithdrawals
- Improved proxy support
- WebSocket interfaces:
  - Pub: Methods for trading and private calls where supported
  - Sub: Real-time balance, orderbooks and other properties with each exchange

If you want to contribute by submitting partial implementations be sure to look up examples of how it's done inside the library (where implemented already) and copy the adopted practices.

If your proposal, suggestion or improvement does not relate to the above list of tasks before submitting it make sure it is:
1. really needed by the majority of ccxt users
2. designed to be a general-purpose solution, not hardcoded for your specific needs
3. done in a generalized way compatible with all exchanges (not exchange-specific)
4. portable (available in all supported languages)
5. robust
6. explicit in what it's doing
7. doesn't break anything (if you change a method, make sure that all other methods calling the edited method are not broken)

The following is a set of rules for contributing to the ccxt library codebase.

## What You Need To Have

The easiest way is to use Docker to run an isolated build & test enviroment with all the dependencies installed:

```
docker-compose run --rm ccxt
```

That builds a container and opens a shell, where the `npm run build` and `node run-tests` commands should simply work out of the box.

The CCXT folder is mapped inside of the container, except the `node_modules` folder — the container would have its own ephemeral copy — so that won't mess up your locally installed modules. This means that you can edit sources on your host machine using your favorite editor and build/test them in the running container.

This way you can keep the build tools and processes isolated, not having to work through the painful process of installing all those dependencies to your host machine manually.

If you choose the hard way, here is the list of the dependencies you will need. It may be incomplete and outdated, so you may want to look into the [`Dockerfile`](https://github.com/ccxt/ccxt/blob/master/Dockerfile) and [`.travis.yml`](https://github.com/ccxt/ccxt/blob/master/.travis.yml) scripts for the list of commands we use to install the state-of-the-art dependencies needed to build and test CCXT.

- [Node.js](https://nodejs.org/en/download/) 8+
- [Python](https://www.python.org/downloads/) 3.5.3+ and Python 2.7+
  - tox (`brew install tox` or `pip install tox`)
  - requests (`pip install requests`)
  - aiohttp (`pip install aiohttp`)
- [PHP](https://secure.php.net/downloads.php) 5.3+ with the following extensions installed and enabled:
  - cURL
  - iconv
  - mbstring
  - PCRE
  - bcmath (php<7.1)
- [Pandoc](https://pandoc.org/installing.html) 1.19+

## What You Need To Know

### Repository Structure

The contents of the repository are structured as follows:

```shell
/                          # root directory aka npm module/package folder for Node.js
/.babelrc                  # babel config used for making the ES5 version of the library
/.eslintrc                 # linter
/.gitattributes            # contains linguist settings for language detection in repo
/.gitignore                # ignore it
/.npmignore                # files to exclude from the NPM package
/.travis.yml               # a YAML config for travis-ci (continuous integration)
/CHANGELOG.md              # self-explanatory
/CONTRIBUTING.md           # this file
/LICENSE.txt               # MIT
/README.md                 # master markdown for GitHub, npmjs.com, npms.io, yarn and others
/build/                    # build scripts
/build/export-exchanges.js # used to create tables of exchanges in the docs during the build
/build/transpile.js        # the transpilation script
/build/update-badges.js    # a JS script to update badges in the README and in docs
/build/vss.js              # reads single-sourced version from package.json and writes it everywhere
/dist/                     # a folder for the generated browser bundle of CCXT
/ccxt.js                   # entry point for the master JS version of the ccxt library
/ccxt.php                  # entry point for the PHP version of the ccxt library
/doc/                      # Sphinx-generated rst-docs for http://ccxt.readthedocs.io/
/js/                       # the JS version of the library
/php/                      # PHP ccxt module/package folder
/python/                   # Python ccxt module/package folder for PyPI
/python/__init__.py        # entry point for the Python version of the ccxt.library
/python/async/__init__.py  # asynchronous version of the ccxt.library for Python 3.5.3+ asyncio
/python/base/              # base code for the Python version of the ccxt library
/python/MANIFEST.in        # a PyPI-package file listing extra package files (license, configs, etc...)
/python/README.rst         # generated reStructuredText for PyPI
/python/setup.cfg          # wheels config file for the Python package
/python/setup.py           # pip/setuptools script (build/install) for ccxt in Python
/python/tox.ini            # tox config for Python
/examples/                 # self-explanatory
/examples/js               # ...
/examples/php              # ...
/examples/py               # ...
/exchanges.cfg             # custom bundle config for including only the exchanges you need
/package.json              # npm package file, also used in setup.py for version single-sourcing
/run-tests.js              # a front-end to run invididual tests of all exchanges in all languages (JS/PHP/Python)
/wiki/                     # the source of all docs (edits go here)
```

### Multilanguage Support

The ccxt library is available in three different languages (more to come). We encourage developers to design *portable* code, so that a single-language user could read the code in other languages and understand it easily. This helps the adoption of the library. The main goal is to provide a generalized, unified, consistent and robust interface to as many existing cryptocurrency exchanges as possible.

At first, all language-specific versions were developed in parallel, but separately from each other. But when it became too hard to maintain and keep the code consistent among all supported languages we have decided to switch to what we call a *source/generated* process. There is now a single source version in one language, that is JavaScript. Other language-specific versions are syntactically derived (transpiled, generated) automatically from the source version. But it doesn't mean that you have to be a JS coder to contribute. The portability principle allows Python and PHP devs to effectively participate in developing the source version as well.

The module entry points are:
- `./python/__init__.py` for the Python pip package
- `./python/async/__init__.py` for the Python 3.5.3+ ccxt.async_support subpackage
- `./ccxt.js` for the Node.js npm package
- `./dist/ccxt.browser.js` for the browser bundle
- `./ccxt.php` for PHP

Generated versions and docs are transpiled from the source `ccxt.js` file and files in `./js/` by the `npm run build` command.

### Transpiled (generated) files

- All derived exchange classes are transpiled automatically from source JS files. The source files are language-agnostic, easily mapped line-to-line to any other language and written in a cross-language-compatible way. Any coder can read it (by design).
- All base classes are **not** transpiled, those are language-specific.

#### JavaScript

The `ccxt.browser.js` is generated with Babel from source.

#### Python

These files containing derived exchange classes are transpiled from JS into Python:

- `js/[_a-z].js` → `python/ccxt/async/[_a-z].py`
- `python/ccxt/async[_a-z].py` → `python/ccxt/[_a-z].py` (Python 3 asyncio → Python 2 sync transpilation stage)
- `python/test/test_async.py` → `python/test/test.py` (the sync test is generated from the async test)

These Python base classes and files are not transpiled:

- `python/ccxt/base/*`
- `python/ccxt/async/base/*`

#### PHP

These files containing derived exchange classes are transpiled from JS into PHP:

- `js/[_a-z].js` → `php/[_a-z].php`

These PHP base classes and files are not transpiled:

- `php/base/*`

#### Typescript

- `js/[_a-z].js` → `ccxt.d.ts`

### Base Class

```UNDER CONSTRUCTION```

### Derived Exchange Classes

Transpiler is regex-based and heavily relies on specific formatting rules. If you break them then the transpiler will either
fail to generate Python/PHP classes at all or will generate malformed Python/PHP syntax.

Below are key notes on how to keep the JS code transpileable.

Use the linter `npm run lint js/your-exchange-implementation.js` before you build. It will cover many (but not all) the issues,
so manual checking will still be required if transpilation fails.

If you see a `[TypeError] Cannot read property '1' of null` exception or any other transpilation error when you `npm run build`, check if your code satisifes the following rules:

- don't put empty lines inside your methods
- always use Python-style indentation, it is preserved as is for all languages
- indent with 4 spaces **exactly**, avoid tabs
- put an empty line between each of your methods
- avoid mixed comment styles, use double-slash `//` in JS for line comments
- avoid multi-line comments

If the transpiling process finishes successfully, but generates incorrect Python/PHP syntax, check for the following:

- every opening bracket like `(` or `{` should have a space before it!
- do not use language-specific code syntax sugar, even if you really want to
- unfold all maps and comprehensions to basic for-loops
- don't change the arguments of overrided inherited methods, keep them uniform across all exchanges
- do everything with base class methods only (for example, use `this.json ()` for converting objects to json).
- always put a semicolon `;` at the end of each statement, as in PHP/C-style
- all associative keys must be single-quoted strings everywhere, `array['good'], array.bad`
- variables should be declared with `const` or `let` keywords semantically (no `var`!), prefer `const` everywhere

And structurally:

- if you need another base method you will have to implement it in all three languages
- do not issue more than one HTTP request from a unified method
- try to reduce syntax to basic one-liner expressions
- multiple lines are ok, but you should avoid deep nesting with lots of brackets
- avoid changing the contents of the arguments and params passed by reference into function calls
- do not use conditional statements that are too complex (heavy if-bracketing)
- do not use heavy ternary conditionals
- avoid operators clutter (**don't do this**: `a && b || c ? d + 80 : e ** f`)
- do not use `.includes()`, use `.indexOf()` instead!
- never use `.toString()` on floats: `Number (0.00000001).toString () === '1e-8'`
- do not use closures, `a.map` or `a.filter (x => (x === 'foobar'))` is not acceptable in derived classes
- do not use the `in` operator to check if a value is in a non-associative array (list)
- don't add custom currency or symbol/pair conversions and formatting, copy from existing code instead
- **don't access non-existent keys, `array['key'] || {}` won't work in other languages!**
- keep it simple, don't do more than one statement in one line

#### Sending Market Ids

Most of exchanges' API endpoints will require an exchange-specific market symbol or trading pair or instrument to be specified in the request.

**We don't send unified symbols to exchanges directly!** They are not interchangeable! There is a significant difference between *exchange-specific market-ids* and *unified symbols*! This is explained in the Manual, here:

- https://github.com/ccxt/ccxt/wiki/Manual#markets
- https://github.com/ccxt/ccxt/wiki/Manual#symbols-and-market-ids

**NEVER DO THIS:**

```JavaScript
async fetchTicker (symbol, params = {}) {
   const request = {
      'pair': symbol, // very bad, sending unified symbols to the exchange directly
   };
   const response = await this.publicGetEndpoint (request);
   // parse in a unified way...
}
```

**DO NOT DO THIS EITHER:**

```JavaScript
async fetchTicker (symbol, params = {}) {
   const request = {
      'symbol': symbol, // very bad, sending unified symbols to the exchange directly
   };
   const response = await this.publicGetEndpoint (request);
   // parse in a unified way...
}
```

Instead of sending a unified CCXT symbol to the exchange, we **always** take the exchange-specific market-`id` that corresponds to that symbol. If it so happens that an exchange specific market-id is exactly the same as the CCXT unified symbol – that's a happy coincidence, but we never rely on that in the unified CCXT API.

To get the exchange-specific market-id by a unified CCXT symbol, use the following methods:

- `this.market (symbol)` – returns the entire unified market structure, containing the `id`, `baseId`, `quoteId`, and many other interesting things
- `this.marketId (symbol)` – returns just the exchange-specific `id` of a market by a unified symbol (if you don't need anything else)

**GOOD EXAMPLES:**

```JavaScript
async fetchTicker (symbol, params = {}) {
   const market = this.market (symbol); // the entire market structure
   const request = {
      'pair': market['id'], // good, they may me equal, but often differ, it's ok
   };
   const response = await this.publicGetEndpoint (this.extend (request, params));
   // parse in a unified way...
}
```

```JavaScript
async fetchTicker (symbol, params = {}) {
   const marketId = this.marketId (symbol); // just the id
   const request = {
      'symbol': marketId, // good, they may me equal, but often differ, it's ok
   };
   const response = await this.publicGetEndpoint (this.extend (request, params));
   // parse in a unified way...
}
```

#### Parsing Symbols

When sending requests to the exchange unified symbols have to be _"converted"_ to exchange-specific market-`id`s like shown above. The same is true on the other side – when receiving an exchange response it has an exchange-specific market-`id` inside it that has to be _"converted back"_ to a unified CCXT symbol.

**We don't put exchange-specific market-`id`s in unified structures directly!** We can't freely interchange symbols with ids! There is a significant difference between an *exchange-specific market-ids* and *unified symbols*! This is explained in the Manual, here:

- https://github.com/ccxt/ccxt/wiki/Manual#markets
- https://github.com/ccxt/ccxt/wiki/Manual#symbols-and-market-ids

**NEVER DO THIS:**:

```JavaScript
parseTrade (trade, market = undefined) {
   // parsing code...
   return {
      'info': trade,
      'symbol': trade['pair'], // very bad, returning exchange-specific market-ids in a unified structure!
      // other fields...
   };
}
```

**DO NOT DO THIS EITHER**

```JavaScript
parseTrade (trade, market = undefined) {
   // parsing code...
   return {
      'info': trade,
      'symbol': trade['symbol'], // very bad, returning exchange-specific market-ids in a unified structure!
      // other fields...
   };
}
```

In order to handle the market-`id` properly it has to be looked-up in the info cached on this exchange with `loadMarkets()`:

**GOOD EXAMPLE:**

```JavaScript
parseTrade (trade, market = undefined) {
   let symbol = undefined;
   const marketId = this.safeString (trade, 'pair');
   if (marketId !== undefined) {
      if (marketId in this.markets_by_id) {
         // look up by an exchange-specific id in the preloaded markets first
         market = this.markets_by_id[market];
         symbol = market['symbol'];
      } else {
         // try to parse it somehow, if the format is known
         const [ baseId, quoteId ] = marketId.split ('/');
         const base = this.safeCurrencyCode (baseId); // unified
         const quote = this.safeCurrencyCode (quoteId);
         symbol = base + '/' + quote;
      }
   }
   // parsing code...
   return {
      'info': trade,
      'symbol': symbol, // very good, a unified symbol here now
      // other fields...
   };
}
```

#### Accessing Dictionary Keys

In JavaScript, dictionary keys can be accessed in two notations:

- `object['key']` (single-quoted string key notation)
- `object.key` (property notation)

Both work almost identically, and one is implicitly converted to another upon executing the JavaScript code.

While the above does work in JavaScript, it will not work in Python or PHP. In most languages, associative dictionary keys are not treated in the same way as properties. Therefore, in Python `object.key` is not the same as `object['key']`. In PHP `$object->key` is not the same as `$object['key']` as well. Languages that differentiate between associative keys and properties use different notations for the two.

To keep the code transpileable, please, remeber this simple rule: *always use the single-quoted string key notation `object['key']` for accessing all associative dictionary keys in all languages everywhere throughout this library!*

#### Sanitizing Input With `safe`-Methods

JavaScript is less restrictive than other languages. It will tolerate an attempt to dereference a non-existent key where other languages will throw an Exception:

```JavaScript
// JavaScript

const someObject = {}

if (someObject['nonExistentKey']) {
    // the body of this conditional will not execute in JavaScript
    // because someObject['nonExistentKey'] === undefined === false
    // but JavaScript will not throw an exception on the if-clause
}
```

However, the above logic with *"an undefined value by default"* will not work in Python or PHP.

```Python
# Python
some_dictionary = {}

# breaks
if some_dictionary['nonExistentKey']:
    # in Python the attempt to dereference the nonExistentKey value
    # will throw a standard built-in KeyError exception

# works
if 'nonExistentKey' in some_dictionary and some_dictionary['nonExistentKey']:
    # this is a way to check if the key exists before accessing the value

# also works
if some_dictionary.get('nonExistentKey'):
    # another a way to check if the key exists before accessing the value...
```

Most languages will not tolerate an attempt to access a non-existent key in an object.

For the above reasons, please, **never do this** in the transpiled JS files:

```JavaScript
// JavaScript
const value = object['key'] || other_value; // will not work in Python or PHP!
if (object['key'] || other_value) { /* will not work in Python or PHP! */ }
```

Therefore we have a family of `safe*` functions:

- `safeInteger (object, key)`, `safeInteger2 (object, key1, key2)`
- `safeFloat (object, key)`, `safeFloat2 (object, key1, key2)`
- `safeString (object, key)`, `safeString2 (object, key1, key2)`
- `safeValue (object, key)`, `safeValue2 (object, key1, key2)`

The `safeValue` function is used for objects inside objects, arrays inside objects and boolean `true/false` values.

The above safe-functions will check for the existence of the key in the object and will properly return `undefined/None/null` values for JS/Python/PHP. Each function also accepts the default value to be returned instead of `undefined/None/null` in the last argument.

Alternatively, you could check for the key existence first...

So, you have to change this:

```JavaScript
if (params['foo'] !== undefined) {
}
```

↓

```JavaScript
const foo = this.safeValue (params, 'foo');
if (foo !== undefined) {
}
```

Or:

```JavaScript
if ('foo' in params) {
}
```

#### Using Base Class Cryptography Methods For Authentication

Do not reinvent the wheel. Always use base-class methods for cryptography.

The CCXT library supports the following authentication algorithms and cryptography algorithms:

- HMAC
- JWT (JSON Web Token)
- RSA
- ECDSA Elliptic Curve Cryptography
  - NIST P256
  - secp256k1
- OTP 2FA (one-time password 2-factor authentication)

The base `Exchange` class offers several methods that are key to practically all cryptography in this lib. Derived exchange implementations must not use external dependencies for cryptography, everything should be done with base methods only.

- `hash (message, hash = 'md5', digest = 'hex')`
- `hmac (message, secret, hash = 'sha256', digest = 'hex')`
- `jwt (message, secret, hash = 'HS256')`
- `rsa (message, secret, alg = 'RS256')`
- `ecdsa (request, secret, algorithm = 'p256', hash = undefined)`
- `totp (secret)`
- `stringToBase64()`, `base64ToBinary()`, `binaryToBase64()`...

The `hash()` method supports the following `hash` algorithms:

- `'md5'`
- `'sha1'`
- `'sha3'`
- `'sha256'`
- `'sha384'`
- `'sha512'`
- `'keccak'`

The `digest` encoding argument accepts the following values:

- `'hex'`
- `'binary'`

The `hmac()` method also supports `'base64'` for the `digest` argument. This is for `hmac()` only, other implementations should use `'binary'` with `binaryToBase64()`.

#### Timestamps

**All timestamps throughout all unified structures within this library are integer timestamp _in milliseconds_!**

In order to convert to milliseconds timestamps, CCXT implementes the following methods:

```JavaScript
const data = {
   'unixTimestampInSeconds': 1565242530,
   'unixTimestampInMilliseconds': 1565242530165,
   'stringInSeconds': '1565242530',
};

// convert to integer if the underlying value is already in milliseconds
const timestamp = this.safeInteger (data, 'unixTimestampInMilliseconds'); // === 1565242530165

// convert to integer and multiply by a thousand if the value is a UNIX timestamp in seconds
const timestamp = this.safeTimestamp (data, 'unixTimestampInSeconds'); // === 1565242530000

// convert to integer and multiply by a thousand if the value is in seconds
const timestamp = this.safeTimestamp (data, 'stringInSeconds'); // === 1565242530000
```

#### Working With Array Lengths

In JavaScript the common syntax to get a length of a string or an array is to reference the `.length` property like shown here:

```JavaScript
someArray.length

// or

someString.length
```

And it works for both strings and arrays. In Python this is done in a similar way:

```Python
len(some_array)

# or

len(some_string)
```

So the length is accessible in the same way for both strings and arrays and both work fine.

However, with PHP this is different, so the syntax for string lengths and array lengths is different:

```PHP
count(some_array);

// or

strlen(some_string); // or mb_strlen
```

Because the transpiler works line-by-line and does no code introspection, it cannot tell arrays from strings and cannot properly transpile `.length` to PHP without additional hinting. It will always transpile JS `.length` to PHP `strlen` and will prefer string lengths over array lengths. In order to indicate an array length properly we have to do the following:

```JavaScript
const arrayLength = someArray.length;
// the above line ends with .length;
// that ending is a hint for the transpiler that will recognize someArray
// as an array variable in this place, rather than a string type variable
// now we can use arrayLength for the arithmetic
```

That `.length;` line ending does the trick. The only case when the array `.length` is preferred over the string `.length` is the `for` loop. In the header of the `for` loop, the `.length` always refers to array length (not string length).

#### Adding Numbers And Concatenating Strings

In JS the arithmetic addition `+` operator handles both strings and numbers. So, it can concatenate strings with `+` and can sum up numbers with `+` as well. The same is true with Python. With PHP this is different, so it has different operators for string concatenation (the "dot" operator `.`) and for arithmetic addition (the "plus" operator `+`). Once again, because the transpiler does no code introspection it cannot tell if you're adding up numbers or strings in JS. This works fine until you want to transpile this to other languages, be it PHP or whatever other language it is. In order to help the transpiler we have to use `this.sum` for arithmetic additions.

The rule of thumb is: **`+` is for string concatenation only (!)** and **`this.sum (a, b, c, ...)` is for arithmetic additions**. The same logic applies to operator `+=` vs operator `.=` – `this.sum()` has to be used in those cases as well.

#### Formatting Decimal Numbers To Precision

The `.toFixed ()` method has [known rounding bugs](https://www.google.com/search?q=toFixed+bug) in JavaScript, and so do the other rounding methods in the other languages as well. In order to work with number formatting consistently, we need to use the [`decimalToPrecision` method as described in the Manual](https://github.com/ccxt/ccxt/wiki/Manual#methods-for-formatting-decimals).

#### Escaped Control Characters

When using strings containing control characters like `"\n"`, `"\t"`, always enclose them in double quotes (`"`), not single quotes (`'`)! Single-quoted strings are not parsed for control characters and are treated as is in many languages apart from JavaScript. Therefore for tabs and newlines to work in PHP, we need to surround them with double quotes (especially in the `sign()` implementation).

Bad:

```JavaScript
const a = 'GET' + method.toLowerCase () + '\n' + path;
const b = 'api\nfoobar.com\n';
```

Good:

```JavaScript
const a = 'GET' + method.toLowerCase () + "\n" + path; // eslint-disable-line quotes
// eslint-disable-next-line quotes
const b = "api\nfoobar.com\n";
```

**↑ The `eslint-*` comments are mandatory!**

#### Using Ternary Conditionals

Do not use heavy ternary (`?:`) conditionals, **always use brackets in ternary operators!**

Despite that there is operator precedence in the programming languages themselves, the transpiler is regex-based and it does no code introspection, therefore it treats everything as plaintext.

The brackets are needed to hint the transpiler which part of the conditional is which. In the absence of brackets it's hard to understand the line and the intent of the developer.

Here are some examples of a badly-designed code that will break the transpiler:

```JavaScript
// this is an example of bad codestyle that will likely break the transpiler
const foo = {
   'bar': 'a' + qux === 'baz' ? this.a () : this.b () + 'b',
};
```

```JavaScript
// this confuses the transpiler and a human developer as well
const foo = 'bar' + baz + qux ? 'a' : '' + this.c ();
```

Adding surrounding brackets to corresponding parts would be a more or less correct way to resolve it.

```JavaScript
const foo = {
   'bar': (qux === 'baz') ? this.a () : this.b (), // much better now
};
```

The universally-working way to solve it is to just break the complex line into a few simpler lines, even at a cost of adding extra lines and conditionals:

```JavaScript
// before:
// const foo = {
//    'bar': 'a' + qux === 'baz' ? this.a () : this.b () + 'b',
// };
// ----------------------------------------------------------------------------
// after:
const bar = (qux === 'baz') ? this.a () : this.b ();
const foo = {
   'bar': 'a' + bar + 'b',
};
```

Or even:

```JavaScript
// before:
// const foo = 'bar' + baz + qux ? 'a' : '' + this.c ();
// ----------------------------------------------------------------------------
// after:
let foo = 'bar' + baz;
if (qux) {
   foo += 'a';
};
foo += this.c ();
```

---

### New Exchange Integrations

**REMEMBER:** The key reason why this library is used at all is **Unification**. When developing a new exchange file the goal is not to implement it somehow, but to implement it in a very pedantic, precise and exact way, just as the other exchanges are implemented. For that we have to copy bits of logic from other exchanges and make sure that the new exchange conforms to the Manual in the following aspects:

- market ids, trading pair symbols, currency ids, token codes, symbolic unification and `commonCurrencies` must be standardized in all parsing methods (`fetchMarkets`, `fetchCurrencies`, `parseTrade`, `parseOrder`, ...)
- all unified API method names and arguments are standard – can't add or change them freely
- all parser input must be `safe`-sanitized as [described above](#sanitizing-input-with-safe-methods)
- for bulk operations the base methods should be used (`parseTrades`, `parseOrders`, note the `s` plural ending)
- use as much of base functionality as you can, do not reinvent the wheel, nor the bicycle, nor the bicycle wheel
- respect default argument values in `fetch`-methods, check if `since` and `limit` are `undefined` and do not send them to the exchange, we intentionally use the exchanges' defaults in such cases
- when implementing a unified method that has some arguments – we can't ignore or miss any of those arguments
- all structures returned from the unified methods must conform to their specifications from the Manual

Please, see the following document for new integrations: https://github.com/ccxt/ccxt/wiki/Requirements

A quick merge of a Pull Request for a new exchange integration depends on consistency and compliance with the above unified rules and standards. Breaking one of those is the key reason for not merging a Pull Request.

**If you want to add (support for) another exchange, or implement a new method for a particular exchange, then the best way to make it a consistent improvement is to learn from example. Take a look at how same things are implemented in other exchanges (we recommend certified exchanges) and try to copy the code flow and style.**

The basic JSON-skeleton for a new exchange integration is as follows:

```
{
   'id': 'example',
   'name': 'Example Exchange',
   'country': [ 'US', 'EU', 'CN', 'RU' ],
   'rateLimit': 1000,
   'version': '1',
   'comment': 'This comment is optional',
   'urls': {
      'logo': 'https://example.com/image.jpg',
      'api': 'https://api.example.com/api',
      'www': 'https://www.example.com',
      'doc': [
         'https://www.example.com/docs/api',
         'https://www.example.com/docs/howto',
         'https://github.com/example/docs',
      ],
   },
   'api': {
      'public': {
         'get': [
            'endpoint/example',
            'orderbook/{pair}/full',
            '{pair}/ticker',
         ],
      },
      'private': {
         'post': [
            'balance',
         ],
      },
   },
}
```

### Implicit API Methods

In the code for each exchange, you'll notice that the functions that make API requests aren't explicitly defined. This is because the `api` definition in the exchange description JSON is used to create *magic functions* (aka *partial functions* or *closures*) inside the exchange subclass. That implicit injection is done by the `defineRestApi/define_rest_api` base exchange method.

Each partial function takes a dictionary of `params` and returns the API response. In the example JSON above, the `'endpoint/example'` results in the injection of a `this.publicGetEndpointExample` function. Similarly, the `'orderbook/{pair}/full'` results in a `this.publicGetOrderbookPairFull` function, that takes a ``pair`` parameter (again, passed in the `params` argument).

Upon instantiation the base exchange class takes each URL from its list of endpoints, splits it into words, and then makes up a callable function name from those words by using a partial construct. That process is the same in JS, Python and PHP as well. It is also described here:

- https://github.com/ccxt/ccxt/wiki/Manual#api-methods--endpoints
- https://github.com/ccxt/ccxt/wiki/Manual#implicit-api-methods
- https://github.com/ccxt-dev/ccxt/wiki/Manual#api-method-naming-conventions

```UNDER CONSTRUCTION```

### Continuous Integration

Builds are automated with [Travis CI](https://travis-ci.org/ccxt/ccxt). The build steps for Travis CI are described in the [`.travis.yml`](https://github.com/ccxt/ccxt/blob/master/.travis.yml) file.

Windows builds are automated with [Appveyor](https://ci.appveyor.com/project/ccxt/ccxt). The build steps for Appveyor are in the [`appveyor.yml`](https://github.com/ccxt/ccxt/blob/master/appveyor.yml) file.

Incoming pull requests are automatically validated by the CI service. You can watch the build process online here: [travis-ci.org/ccxt/ccxt/builds](https://travis-ci.org/ccxt/ccxt/builds).

### How To Build & Run Tests On Your Local Machine

Before building for the first time, install Node dependencies (skip this step if you're running our Docker image):

```
npm install
```

The command below will build everything and generate PHP/Python versions from source JS files:

```
npm run build
```

The following command will test the built generated files (for all exchanges, symbols and languages):

```
node run-tests
```

You can restrict tests to a specific language, a particular exchange or symbol:

```
node run-tests [--php] [--js] [--python] [--python3] [exchange] [symbol]
```

For example, the first of the following lines will only test the source JS version of the library (`ccxt.js`). It does not require an `npm run build` before running it (can be useful if you need to verify quickly whether your changes break the code or not):

```shell

node run-tests --js             # test master ccxt.js, all exchanges

# other examples require the 'npm run build' to run

node run-tests --python         # test Python 2 version, all exchanges
node run-tests --php bitfinex   # test Bitfinex with PHP
node run-tests --python3 kraken # test Kraken with Python 3, requires 'npm run build'
```

## Committing Changes To The Repository

The build process generates many changes in the transpiled exchange files, e.g. for Python and PHP. **You should NOT commit them to GitHub, commit only the base (JS) file changes please**.

You can hide the changes in the generated files by running this command (after that, the generated files are no longer marked as changed):

```
npm run git-ignore-generated-files
```

Previously we had that command implemented as a final build step, but it caused problems with subsequent `git pull` and also branch selection commands (when a conflict occured in those files that have been marked as ignored). So if you experience an issue with that, you can un-ignore those files by executing:

```
npm run git-unignore-generated-files
```

## Financial Contributions

We also welcome financial contributions in full transparency on our [open collective](https://opencollective.com/ccxt).
Anyone can file an expense. If the expense makes sense for the development of the community, it will be "merged" in the ledger of our open collective by the core contributors and the person who filed the expense will be reimbursed.

```
ETH 0x26a3CB49578F07000575405a57888681249c35Fd (ETH only!)
BTC 33RmVRfhK2WZVQR1R83h2e9yXoqRNDvJva
BCH 1GN9p233TvNcNQFthCgfiHUnj5JRKEc2Ze
LTC LbT8mkAqQBphc4yxLXEDgYDfEax74et3bP
```

## Credits

### Contributors

Thank you to all the people who have already contributed to ccxt!

<a href="graphs/contributors"><img src="https://opencollective.com/ccxt/contributors.svg?width=890" /></a>

### Backers

Thank you to all our backers! [[Become a backer](https://opencollective.com/ccxt#backer)]

<a href="https://opencollective.com/ccxt#backers" target="_blank"><img src="https://opencollective.com/ccxt/backers.svg?width=890"></a>

### Supporters

Support this project by becoming a supporter. Your avatar will show up here with a link to your website.

[[Become a supporter](https://opencollective.com/ccxt#supporter)]

<a href="https://opencollective.com/ccxt/tiers/supporter/0/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/0/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/1/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/1/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/2/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/2/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/3/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/3/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/4/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/4/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/5/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/5/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/6/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/6/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/7/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/7/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/8/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/8/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/9/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/9/avatar.svg"></a>

### Sponsors

Thank you to all our sponsors! (please ask your company to also support this open source project by [becoming a sponsor](https://opencollective.com/ccxt#sponsor))

[[Become a sponsor](https://opencollective.com/ccxt#sponsor)]

<a href="https://opencollective.com/ccxt/tiers/sponsor/0/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/1/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/2/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/3/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/4/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/5/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/6/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/7/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/8/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/9/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/9/avatar.svg"></a>
