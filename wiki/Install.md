## Install

The easiest way to install the ccxt library is to use builtin package managers:

- [ccxt in **PyPI**](https://pypi.python.org/pypi/ccxt) (Python 3)

This library is shipped as an all-in-one module implementation with minimalistic dependencies and requirements:

- [./python/](https://github.com/ccxt/ccxt/blob/master/python/) in Python (generated from JS)

You can also clone it into your project directory from [ccxt GitHub repository](https://github.com/ccxt/ccxt) and copy files
manually into your working directory with language extension appropriate for your environment.

```shell
git clone https://github.com/ccxt/ccxt.git
```

An alternative way of installing this library is to build a custom bundle from source. Choose exchanges you need in `exchanges.cfg`.

### Python

[ccxt algotrading library in PyPI](https://pypi.python.org/pypi/ccxt)

```shell
pip install ccxt
```

```python
import ccxt
print(ccxt.exchanges) # print a list of all available exchange classes
```

The library supports concurrent asynchronous mode with asyncio and async/await in Python 3.5.3+

```python
import ccxt.async_support as ccxt # link against the asynchronous version of ccxt
```


### Docker

You can get CCXT installed in a container along with all the supported languages and dependencies. This may be useful if you want to contribute to CCXT (e.g. run the build scripts and tests — please see the [Contributing](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) document for the details on that).

You don't need the Docker image if you're not going to develop CCXT. If you just want to use CCXT – just install it as a regular package into your project.

Using `docker-compose` (in the cloned CCXT repository):

```shell
docker-compose run --rm ccxt
```

Alternatively:

```shell
docker build . --tag ccxt
docker run -it ccxt
```

## Proxy
If you are unable to obtain data from exchanges due to location restrictions read the [proxy](https://github.com/ccxt/ccxt/wiki/Manual#proxy) section.