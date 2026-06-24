---
title: "Contribuir"
description: "Lee las notas al abrir un nuevo issue en github y proporciona los detalles solicitados para que podamos ayudarte mejor. También puedes leer la sección de Solución de problemas."
---

# Contribuir a la biblioteca CCXT

- [Cómo enviar una pregunta o issue](#how-to-submit-an-issue)
- [Cómo contribuir código](#how-to-contribute-code)
  - [Lo que necesitas tener](#what-you-need-to-have)
  - [Lo que necesitas saber](#what-you-need-to-know)

## Cómo enviar un issue

Lee las notas al abrir un [nuevo issue en github](https://github.com/ccxt/ccxt/issues/new/choose) y proporciona los detalles solicitados para que podamos ayudarte mejor. También puedes leer la sección de [Solución de problemas](/docs/manual#troubleshooting).


### Reportar vulnerabilidades e issues críticos

Si encontraste un problema de seguridad o una vulnerabilidad crítica y reportarlo públicamente implicaría un riesgo, no dudes en enviarnos un mensaje a <a href="mailto:info@ccxt.trade">info@ccxt.trade</a>.

## Cómo contribuir código

- **[ASEGÚRATE DE QUE TU CÓDIGO ESTÉ UNIFICADO](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes)!**

  **↑ ¡Esta es la regla más importante de todas!**

- **ANTES DE CUALQUIER PUSH ASEGÚRATE DE EJECUTAR ESTE COMANDO LOCALMENTE: `git config core.hooksPath .git-templates/hooks`**

- **POR FAVOR, NO INCLUYAS LOS SIGUIENTES ARCHIVOS EN PULL REQUESTS:**

  - `/build/*` (estos se generan automáticamente)
  - `/js/*` (estos se compilan desde la versión TypeScript)
  - `/php/*` (excepto las clases base)
  - `/python/*` (excepto las clases base)
  - `/cs/*` (excepto las clases base)
  - `/ccxt.js`
  - `/README.md` (las listas de exchanges se generan automáticamente)
  - `/package.json`
  - `/package.lock`
  - `/wiki/*` (excepto ediciones reales, las listas de exchanges se generan automáticamente)
  - `/dist/ccxt.browser.js` (esto también se browserifica automáticamente)


  Estos archivos son generados ([explicado más abajo](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support)) y serán sobreescritos al compilar. Por favor no los incluyas en commits para evitar que el repositorio, que ya es bastante grande, crezca innecesariamente. La mayoría de las veces solo necesitas hacer commit de un único archivo fuente para enviar una edición a la implementación de un exchange.

- **POR FAVOR, ENVÍA EDICIONES ATÓMICAS, UN PULL REQUEST POR EXCHANGE, NO LOS MEZCLES**
- **ASEGÚRATE DE QUE TU CÓDIGO PASE TODAS LAS VERIFICACIONES DE SINTAXIS EJECUTANDO `npm run build`**

## Tareas pendientes

A continuación se muestra una lista de funcionalidades que nos gustaría tener implementadas y completamente **unificadas** en la biblioteca en este momento. La mayoría de estas tareas ya están en progreso, implementadas para algunos exchanges, pero no para todos:

- Trading con margen
- Apalancamiento
- Derivados (futuros, opciones)
- Cuenta principal / subcuentas
- Órdenes condicionales (stop loss, take profit)
- `transfer` entre subcuentas y cuenta principal
- `fetchTransfer`
- `fetchTransfers`
- `fetchLedger`
- `fetchPositions`
- `closePosition`
- `closePositions`

Si deseas contribuir enviando implementaciones parciales, asegúrate de buscar ejemplos de cómo se hace dentro de la biblioteca (donde ya está implementado) y copiar las prácticas adoptadas.

Si tu propuesta, sugerencia o mejora no está relacionada con la lista de tareas anterior, antes de enviarla asegúrate de que:
1. sea realmente necesaria para la mayoría de los usuarios de ccxt
2. esté diseñada como una solución de propósito general, no codificada para tus necesidades específicas
3. se haga de manera generalizada, compatible con todos los exchanges (no específica de un exchange)
4. sea portable (disponible en todos los lenguajes compatibles)
5. sea robusta
6. sea explícita en lo que hace
7. no rompa nada (si cambias un método, asegúrate de que todos los demás métodos que llamen al método editado no se rompan)

A continuación se presenta un conjunto de reglas para contribuir al código base de la biblioteca ccxt.

## Lo que necesitas tener

Si no vas a desarrollar CCXT ni a contribuir código a la biblioteca CCXT, entonces no necesitas la imagen Docker ni el repositorio CCXT. Si solo quieres usar CCXT dentro de tu proyecto, simplemente instálalo como un paquete regular en la carpeta del proyecto tal como se documenta en el Manual (/docs/install):

- [JavaScript / Node.js / NPM](/docs/install#javascript-npm)

  ```bash
  # JavaScript / Node.js / NPM
  npm install ccxt
  ```

- [Python / PIP](/docs/install#python)

  ```bash
  # Python
  pip install ccxt  # or pip3 install ccxt
  ```

- [PHP / Composer](/docs/install#php)

  ```bash
  # PHP / Composer
  composer install ccxt
  ```

- [C# / Nugget](/docs/install#netc)

  ```bash
  # C# / Nugget
  dotnet add ccxt
  ```

- [Java / Gradle](/docs/install#java)

  ```bash
  # Java (clone and build from source)
  git clone https://github.com/ccxt/ccxt.git --depth 1
  cd ccxt/java && ./gradlew :lib:build
  ```

### Con Docker

La forma más sencilla es usar Docker para ejecutar un entorno de compilación y pruebas aislado con todas las dependencias instaladas:

```bash
docker-compose run --rm ccxt
```

Esto construye un contenedor y abre una shell, donde los comandos `npm run build` y `node run-tests` deberían funcionar directamente sin configuración adicional.

La carpeta CCXT está mapeada dentro del contenedor, excepto la carpeta `node_modules` — el contenedor tendrá su propia copia efímera — por lo que no interferirá con tus módulos instalados localmente. Esto significa que puedes editar las fuentes en tu máquina anfitriona usando tu editor favorito y compilarlas/probarlas en el contenedor en ejecución.

De esta manera puedes mantener las herramientas y procesos de compilación aislados, sin tener que pasar por el doloroso proceso de instalar todas esas dependencias en tu máquina anfitriona manualmente.

### Sin Docker

#### Dependencias

- Git
- [Node.js](https://nodejs.org/en/download/) 8+
- [Python](https://www.python.org/downloads/) 3.5.3+
  - requests (`pip install requests`)
  - [aiohttp](https://docs.aiohttp.org/) (`pip install aiohttp`)
  - [ruff](https://docs.astral.sh/ruff/) (`pip install ruff`)
  - [tox](https://tox.readthedocs.io)
    - vía pip: `pip install tox`
    - MacOS con [brew](https://brew.sh): `brew install tox`
    - Ubuntu Linux: `apt-get install tox`
- [PHP](https://secure.php.net/downloads.php) 8.1+ con las siguientes extensiones instaladas y habilitadas:
  - cURL
  - iconv
  - mbstring
  - PCRE
  - gmp
- [C#](https://dotnet.microsoft.com/en-us/download) 7.0
- [Java](https://adoptium.net/) 21+ con Gradle

#### Pasos de compilación

```bash
git clone https://github.com/ccxt/ccxt.git
```

```bash
cd ccxt
```

```bash
npm install
```

```bash
npm run build
```

## Lo que necesitas saber

### Estructura del repositorio

El contenido del repositorio está estructurado de la siguiente manera:

```bash
/                          # root directory aka npm module/package folder for Node.js
/.babelrc                  # babel config used for making the ES5 version of the library
/.eslintrc                 # linter
/.gitattributes            # contains linguist settings for language detection in repo
/.gitignore                # ignore it
/.npmignore                # files to exclude from the NPM package
/.travis.yml               # a YAML config for travis-ci (continuous integration)
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
/js/                       # the JS version of the library
/ts/                       # the TypeScript version of the library
/php/                      # PHP ccxt module/package folder
/cs/                       # C#/dotnet package folder
/python/                   # Python ccxt module/package folder for PyPI
/python/__init__.py        # entry point for the Python version of the ccxt.library
/python/async_support/     # asynchronous version of the ccxt.library for Python 3.5.3+ asyncio
/python/base/              # base code for the Python version of the ccxt library
/python/MANIFEST.in        # a PyPI-package file listing extra package files (license, configs, etc...)
/python/README.md          # a copy of README.md for PyPI
/python/setup.cfg          # wheels config file for the Python package
/python/setup.py           # pip/setuptools script (build/install) for ccxt in Python
/python/tox.ini            # tox config for Python
/examples/                 # self-explanatory
/examples/js               # ...
/examples/php              # ...
/examples/py               # ...
/java/examples/            # Java examples (Gradle module)
/exchanges.cfg             # custom bundle config for including only the exchanges you need
/package.json              # npm package file, also used in setup.py for version single-sourcing
/run-tests.js              # a front-end to run individual tests of all exchanges in all languages (JS/PHP/Python)
/wiki/                     # the source of all docs (edits go here)
```

### Soporte multilenguaje

La biblioteca ccxt está disponible en varios lenguajes diferentes (TypeScript, JavaScript, Python, PHP, C#, Go y Java). Animamos a los desarrolladores a diseñar código *portable*, de modo que un usuario de un solo lenguaje pueda leer el código en otros lenguajes y entenderlo fácilmente. Esto favorece la adopción de la biblioteca. El objetivo principal es proporcionar una interfaz generalizada, unificada, consistente y robusta con la mayor cantidad posible de exchanges de criptomonedas existentes.

Al principio, todas las versiones específicas de cada lenguaje se desarrollaron en paralelo, pero de forma independiente entre sí. Sin embargo, cuando resultó demasiado difícil mantener el código consistente entre todos los lenguajes compatibles, decidimos cambiar a lo que llamamos un proceso *fuente/generado*. Ahora existe una única versión fuente en un lenguaje, que es TypeScript. Las demás versiones específicas de cada lenguaje se derivan sintácticamente (se transpilan, se generan) automáticamente a partir de la versión fuente. Pero eso no significa que tengas que ser programador de TS o JS para contribuir. El principio de portabilidad permite que los desarrolladores de Python y PHP participen eficazmente en el desarrollo de la versión fuente también.

Los puntos de entrada del módulo son:
- `./python/__init__.py` para el paquete pip de Python
- `./python/async/__init__.py` para el subpaquete ccxt.async_support de Python 3.7.0+
- `./js/ccxt.js` para el paquete npm de Node.js
- `./ts/ccxt.ts` para TypeScript
- `./dist/ccxt.browser.js` para el paquete del navegador
- `./ccxt.php` para PHP
- `./java/lib/src/main/java/io/github/ccxt/` para Java

Las versiones generadas y la documentación se transpilan desde la carpeta fuente `ts/src` mediante el comando `npm run build`.

### Archivos transpilados (generados)

- Todas las clases de exchange derivadas son transpiladas por `tsc` de TypeScript a JavaScript y por nuestro transpilador personalizado de TypeScript a PHP y Python. Los archivos fuente son independientes del lenguaje, fácilmente mapeables línea a línea a cualquier otro lenguaje y escritos de manera compatible entre lenguajes. Cualquier programador puede leerlo (por diseño).
- Las clases base **no** están completamente transpiladas y solo se transpilan parcialmente, ya que son específicas del lenguaje.

#### JavaScript

El `ccxt.browser.js` se genera con Babel desde el código fuente.

#### Python

Estos archivos que contienen clases de exchange derivadas son transpilados de TS a Python:

- `ts/[_a-z].ts` → `python/ccxt/async/[_a-z].py`
- `python/ccxt/async[_a-z].py` → `python/ccxt/[_a-z].py` (etapa de transpilación de Python 3 asyncio → Python síncrono)
- `python/ccxt/test/test_async.py` → `python/ccxt/test/test_sync.py` (la prueba síncrona se genera a partir de la prueba asíncrona)

Estas clases base y archivos de Python no son transpilados:

- `python/ccxt/base/*`
- `python/ccxt/async/base/*`

#### PHP

Estos archivos que contienen clases de exchange derivadas son transpilados de TS a C#:

- `ts/[_a-z].ts` → `php/[_a-z].php`

Estas clases base y archivos de PHP no son transpilados:

- `php/Exchange.php php/ExchangeError.php php/Precise.php ...`

#### C#

Estos archivos que contienen clases de exchange derivadas son transpilados de TS a C#:

- `ts/src/[_a-z].ts` → `cs/src/exchanges/[_a-z].cs`

Estas clases base y archivos de C# no son transpilados:

- `cs/base/*`

#### Java

Estos archivos que contienen clases de exchange derivadas son transpilados de TS a Java:

- `ts/src/[_a-z].ts` → `java/lib/src/main/java/io/github/ccxt/exchanges/[A-Z]*.java`

Estas clases base y archivos de Java no son transpilados:

- `java/lib/src/main/java/io/github/ccxt/base/*`
- `java/lib/src/main/java/io/github/ccxt/ws/*`
- `java/lib/src/main/java/io/github/ccxt/Exchange.java`

#### Typescript

- El desarrollo se realiza usando estos archivos

### Clase base

``` CONSTRUCTION```

### Clases de exchange derivadas

El transpilador está basado en expresiones regulares y depende en gran medida de reglas de formato específicas. Si las incumples, el transpilador fallará al generar las clases de Python/PHP o generará sintaxis de Python/PHP malformada.

A continuación se presentan notas clave sobre cómo mantener el código JS transpilable.

Usa el linter `npm run lint js/your-exchange-implementation.js` antes de compilar. Cubrirá muchos (pero no todos) los problemas, por lo que aún se requerirá una revisión manual si la transpilación falla.

Si ves una excepción `[TypeError] Cannot read property '1' of null` u otro error de transpilación al ejecutar `npm run build`, verifica que tu código cumpla las siguientes reglas:

- no pongas líneas vacías dentro de tus métodos
- usa siempre la indentación estilo Python, se conserva tal cual para todos los lenguajes
- indenta con exactamente 4 espacios, evita las tabulaciones
- pon una línea vacía entre cada uno de tus métodos
- evita estilos de comentarios mixtos, usa doble barra `//` en JS para comentarios de línea
- evita los comentarios multilínea

Si el proceso de transpilación termina correctamente pero genera sintaxis incorrecta de Python/PHP, verifica lo siguiente:

- ¡cada corchete de apertura como `(` o `{` debe tener un espacio antes!
- no uses azúcar sintáctico específico del lenguaje, aunque tengas muchas ganas
- despliega todos los maps y comprensiones a bucles for básicos
- no cambies los argumentos de los métodos heredados sobreescritos, mantenlos uniformes entre todos los exchanges
- todo debe hacerse usando únicamente los métodos de la clase base (por ejemplo, usa `this.json ()` para convertir objetos a json)
- pon siempre un punto y coma `;` al final de cada instrucción, como en PHP/C-style
- todas las claves asociativas deben ser cadenas entre comillas simples en todas partes (`array['good']`), no uses la notación de punto (`array.bad`)
- nunca uses la palabra clave `var`, en su lugar usa `const` para constantes o `let` para variables

Y estructuralmente:

- si necesitas otro método base, tendrás que implementarlo en los tres lenguajes
- intenta no emitir más de una solicitud HTTP desde un método unificado
- evita modificar el contenido de los argumentos y parámetros pasados por referencia en las llamadas a funciones
- mantenlo simple, no hagas más de una instrucción por línea
- intenta reducir la sintaxis y la lógica (si es posible) a expresiones básicas de una sola línea
- varias líneas están bien, pero debes evitar el anidamiento profundo con muchos corchetes
- no uses instrucciones condicionales demasiado complejas (muchos if anidados)
- no uses ternarios condicionales pesados
- evita la acumulación de operadores (**no hagas esto**: `a && b || c ? d + 80 : e ** f`)
- no uses `.includes()`, ¡usa `.indexOf()` en su lugar!
- nunca uses `.toString()` sobre flotantes: `Number (0.00000001).toString () === '1e-8'`
- no uses cierres, `a.map` o `a.filter (x => (x === 'foobar'))` no es aceptable en clases derivadas
- no uses el operador `in` para comprobar si un valor está en un array no asociativo (lista)
- no añadas conversiones ni formatos personalizados de monedas o pares de símbolos, cópialos del código existente
- **¡no accedas a claves inexistentes, `array['key'] || {}` no funcionará en otros lenguajes!**

#### Envío de IDs de mercado

La mayoría de los endpoints de API de los exchanges requieren que se especifique en la solicitud un símbolo de mercado, par de trading o instrumento específico del exchange.

**¡No enviamos símbolos unificados directamente a los exchanges!** ¡No son intercambiables! Existe una diferencia significativa entre los *IDs de mercado específicos del exchange* y los *símbolos unificados*. Esto se explica en el Manual, aquí:

- /docs/manual#markets
- /docs/manual#symbols-and-market-ids

**NUNCA HAGAS ESTO:**

```javascript
async fetchTicker (symbol, params = {}) {
   const request = {
      'pair': symbol, // very bad, sending unified symbols to the exchange directly
   };
   const response = await this.publicGetEndpoint (request);
   // parse in a unified way...
}
```

**TAMPOCO HAGAS ESTO:**

```javascript
async fetchTicker (symbol, params = {}) {
   const request = {
      'symbol': symbol, // very bad, sending unified symbols to the exchange directly
   };
   const response = await this.publicGetEndpoint (request);
   // parse in a unified way...
}
```

En lugar de enviar un símbolo CCXT unificado al exchange, **siempre** tomamos el `id` de mercado específico del exchange que corresponde a ese símbolo. Si resulta que un ID de mercado específico del exchange es exactamente igual al símbolo unificado de CCXT, eso es una feliz coincidencia, pero nunca dependemos de ello en la API unificada de CCXT.

Para obtener el ID de mercado específico del exchange a partir de un símbolo CCXT unificado, usa los siguientes métodos:

- `this.market (symbol)` – devuelve la estructura de mercado unificada completa, que contiene el `id`, `baseId`, `quoteId` y muchas otras cosas interesantes
- `this.marketId (symbol)` – devuelve únicamente el `id` específico del exchange de un mercado a partir de un símbolo unificado (si no necesitas nada más)

**BUENOS EJEMPLOS:**

```javascript
async fetchTicker (symbol, params = {}) {
   const market = this.market (symbol); // the entire market structure
   const request = {
      'pair': market['id'], // good, they may be equal, but often differ, it's ok
   };
   const response = await this.publicGetEndpoint (this.extend (request, params));
   // parse in a unified way...
}
```

```javascript
async fetchTicker (symbol, params = {}) {
   const marketId = this.marketId (symbol); // just the id
   const request = {
      'symbol': marketId, // good, they may be equal, but often differ, it's ok
   };
   const response = await this.publicGetEndpoint (this.extend (request, params));
   // parse in a unified way...
}
```

#### Análisis de símbolos

Al enviar solicitudes al exchange, los símbolos unificados deben _"convertirse"_ a `id`s de mercado específicos del exchange como se muestra arriba. Lo mismo ocurre en el otro extremo: al recibir una respuesta del exchange, ésta contiene un `id` de mercado específico del exchange que debe _"reconvertirse"_ a un símbolo CCXT unificado.

**¡No colocamos `id`s de mercado específicos del exchange directamente en las estructuras unificadas!** ¡No podemos intercambiar libremente símbolos con IDs! Existe una diferencia significativa entre un *ID de mercado específico del exchange* y los *símbolos unificados*. Esto se explica en el Manual, aquí:

- /docs/manual#markets
- /docs/manual#symbols-and-market-ids

**NUNCA HAGAS ESTO:**:

```javascript
parseTrade (trade, market = undefined) {
   // parsing code...
   return {
      'info': trade,
      'symbol': trade['pair'], // very bad, returning exchange-specific market-ids in a unified structure!
      // other fields...
   };
}
```

**TAMPOCO HAGAS ESTO**

```javascript
parseTrade (trade, market = undefined) {
   // parsing code...
   return {
      'info': trade,
      'symbol': trade['symbol'], // very bad, returning exchange-specific market-ids in a unified structure!
      // other fields...
   };
}
```

Para manejar correctamente el `id` de mercado, debe buscarse en la información almacenada en caché en este exchange con `loadMarkets()`:

**BUEN EJEMPLO:**

```javascript
parseTrade (trade, market = undefined) {
    const marketId = this.safeString (trade, 'pair');
    // safeSymbol is used to parse the market id to a unified symbol
    const symbol = this.safeSymbol (marketId, market);
    return {
       'info': trade,
       'symbol': symbol, // very good, a unified symbol here now
       // other fields...
    };
}
```

#### Acceso a claves de diccionario

En JavaScript, se puede acceder a las claves de un diccionario con dos notaciones:

- `object['key']` (notación de clave de cadena entre comillas simples)
- `object.key` (notación de propiedad)

Ambas funcionan de manera casi idéntica y una se convierte implícitamente en la otra al ejecutar el código JavaScript.

Aunque lo anterior funciona en JavaScript, **no funcionará en Python ni en PHP**. En la mayoría de los lenguajes, las claves de diccionario asociativo no se tratan de la misma manera que las propiedades. Por lo tanto, en Python `object.key` no es lo mismo que `object['key']`. En PHP, `$object->key` tampoco es lo mismo que `$object['key']`. Los lenguajes que distinguen entre claves asociativas y propiedades usan notaciones diferentes para cada una.

Para mantener el código transpilable, recuerda esta regla simple: *¡usa siempre la notación de clave de cadena entre comillas simples `object['key']` para acceder a todas las claves de diccionario asociativo en todos los lenguajes en toda esta biblioteca!*

#### Saneamiento de la entrada con métodos `safe`

JavaScript es menos restrictivo que otros lenguajes. Tolerará un intento de desreferenciar una clave inexistente donde otros lenguajes lanzarían una excepción:

```javascript
// JavaScript

const someObject = {}

if (someObject['nonExistentKey']) {
    // the body of this conditional will not execute in JavaScript
    // because someObject['nonExistentKey'] === undefined === false
    // but JavaScript will not throw an exception on the if-clause
}
```

Sin embargo, la lógica anterior con *"un valor indefinido por defecto"* no funcionará en Python ni en PHP.

```python
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

La mayoría de los lenguajes no toleran el intento de acceder a una clave inexistente en un objeto.

Por las razones anteriores, **nunca hagas esto** en los archivos JS transpilados:

```javascript
// JavaScript
const value = object['key'] || other_value; // will not work in Python or PHP!
if (object['key'] || other_value) { /* will not work in Python or PHP! */ }
```

Por eso tenemos una familia de funciones `safe*`:

- `safeInteger (object, key, default)`, `safeInteger2 (object, key1, key2, default)` – para analizar marcas de tiempo en milisegundos
- `safeNumber (object, key, default)`, `safeNumber2 (object, key1, key2, default)` – para analizar cantidades, precios, costos
- `safeString (object, key, default)`, `safeString2 (object, key1, key2, default)` – para analizar IDs, tipos, estados
- `safeStringLower (object, key, default)`, `safeStringLower2 (object, key1, key2, default)` – para analizar y convertir a minúsculas
- `safeStringUpper (object, key, default)`, `safeStringUpper2 (object, key1, key2, default)` – para analizar y convertir a mayúsculas
- `safeBool(object, key, default)` - para analizar booleanos dentro de diccionarios y arrays/listas
- `safeList(object, key, default)` - para analizar listas/arrays dentro de diccionarios y arrays/listas
- `safeDict(object, key, default)` - para analizar diccionarios dentro de diccionarios y arrays/listas
- `safeValue (object, key, default)`, `safeValue2 (object, key1, key2, default)` – para analizar objetos (diccionarios) y arrays (listas)
- `safeTimestamp (object, key, default)`, `safeTimestamp2 (object, key1, key2, default)` – para analizar marcas de tiempo UNIX en segundos

La función `safeValue` se usa para objetos dentro de objetos, arrays dentro de objetos y valores booleanos `true/false` (**obsoleto, úsalo solo cuando no sabes exactamente qué tipo se devolverá; de lo contrario, prefiere** `safeBool/safeDict/safeList`).

Si necesitas buscar varias claves diferentes dentro de un objeto, tienes disponible la familia de funciones `safeMethodN` que permite la búsqueda con un número arbitrario de claves aceptando un array de claves como argumento.

```javascript
const price = this.safeStringN (object, [ 'key1', 'key2', 'key3' ], defaultValue)
```
Para cada método safe listado arriba, también existe el correspondiente `safeMethodN`.

Las funciones safe anteriores verificarán la existencia de la `key` (o `key1`, `key2`) en el objeto y devolverán correctamente los valores `undefined/None/null` para JS/Python/PHP. Cada función también acepta el valor `default` que se devolverá en lugar de `undefined/None/null` en el último argumento.

Alternativamente, podrías verificar primero la existencia de la clave...

Por lo tanto, debes cambiar esto:

```javascript
if (params['foo'] !== undefined) {
}
```

↓

```javascript
const foo = this.safeValue (params, 'foo');
if (foo !== undefined) {
}
```

O bien:

```javascript
if ('foo' in params) {
}
```

#### Uso de métodos criptográficos de la clase base para autenticación

No reinventes la rueda. Usa siempre los métodos de la clase base para criptografía.

La biblioteca CCXT soporta los siguientes algoritmos de autenticación y criptografía:

- HMAC
- JWT (JSON Web Token)
- RSA
- Criptografía de curva elíptica ECDSA
  - NIST P256
  - secp256k1
- OTP 2FA (contraseña de un solo uso con autenticación de dos factores)

La clase base `Exchange` ofrece varios métodos que son clave para prácticamente toda la criptografía en esta biblioteca. Las implementaciones de exchanges derivados no deben usar dependencias externas para criptografía; todo debe hacerse únicamente con métodos base.

- `hash (message, hash = 'md5', digest = 'hex')`
- `hmac (message, secret, hash = 'sha256', digest = 'hex')`
- `jwt (message, secret, hash = 'HS256')`
- `rsa (message, secret, alg = 'RS256')`
- `ecdsa (request, secret, algorithm = 'p256', hash = undefined)`
- `totp (secret)`
- `stringToBase64()`, `base64ToBinary()`, `binaryToBase64()`...

El método `hash()` soporta los siguientes algoritmos `hash`:

- `'md5'`
- `'sha1'`
- `'sha3'`
- `'sha256'`
- `'sha384'`
- `'sha512'`
- `'keccak'`

El argumento de codificación `digest` acepta los siguientes valores:

- `'hex'`
- `'binary'`

El método `hmac()` también soporta `'base64'` para el argumento `digest`. Esto es solo para `hmac()`; otras implementaciones deben usar `'binary'` con `binaryToBase64()`.

#### Marcas de tiempo

**¡Todas las marcas de tiempo en todas las estructuras unificadas de esta biblioteca son marcas de tiempo UTC enteras _en milisegundos_!**

Para convertir marcas de tiempo a milisegundos, CCXT implementa los siguientes métodos:

```javascript
const data = {
   'unixTimestampInSeconds': 1565242530,
   'unixTimestampInMilliseconds': 1565242530165,
   'unixTimestampAsDecimal': 1565242530.165,
   'stringInSeconds': '1565242530',
};

// convert to integer if the underlying value is already in milliseconds
const timestamp = this.safeInteger (data, 'unixTimestampInMilliseconds'); // === 1565242530165

// convert to integer and multiply by a thousand if the value has milliseconds after dot
const timestamp = this.safeTimestamp (data, 'unixTimestampAsDecimal'); // === 1565242530165

// convert to integer and multiply by a thousand if the value is a UNIX timestamp in seconds
const timestamp = this.safeTimestamp (data, 'unixTimestampInSeconds'); // === 1565242530000

// convert to integer and multiply by a thousand if the value is in seconds
const timestamp = this.safeTimestamp (data, 'stringInSeconds'); // === 1565242530000
```

#### Trabajo con longitudes de arrays

En JavaScript, la sintaxis habitual para obtener la longitud de una cadena o un array es referenciar la propiedad `.length` como se muestra aquí:

```javascript
someArray.length

// or

someString.length
```

Y funciona tanto para cadenas como para arrays. En Python esto se hace de manera similar:

```python
len(some_array)

# or

len(some_string)
```

Por lo tanto, la longitud es accesible de la misma manera tanto para cadenas como para arrays y ambas funcionan bien.

Sin embargo, con PHP esto es diferente, por lo que la sintaxis para las longitudes de cadenas y las longitudes de arrays es distinta:

```php
count(some_array);

// or

strlen(some_string); // or mb_strlen
```

Dado que el transpilador trabaja línea por línea y no realiza introspección del código, no puede distinguir arrays de cadenas y no puede transpilar correctamente `.length` a PHP sin una indicación adicional. Siempre transpilará JS `.length` a PHP `strlen` y preferirá las longitudes de cadenas sobre las longitudes de arrays. Para indicar correctamente la longitud de un array, debemos hacer lo siguiente:

```javascript
const arrayLength = someArray.length;
// the above line ends with .length;
// that ending is a hint for the transpiler that will recognize someArray
// as an array variable in this place, rather than a string type variable
// now we can use arrayLength for the arithmetic
```

Esa línea que termina en `.length;` hace el truco. El único caso en que la longitud de array `.length` tiene preferencia sobre la longitud de cadena `.length` es el bucle `for`. En el encabezado del bucle `for`, `.length` siempre se refiere a la longitud del array (no de la cadena).

#### Suma de números y concatenación de cadenas

En JS, el operador aritmético de adición `+` maneja tanto cadenas como números. Por lo tanto, puede concatenar cadenas con `+` y también sumar números con `+`. Lo mismo ocurre con Python. Con PHP esto es diferente, ya que tiene operadores distintos para la concatenación de cadenas (el operador "punto" `.`) y para la suma aritmética (el operador "más" `+`). Una vez más, como el transpilador no realiza introspección del código, no puede saber si estás sumando números o cadenas en JS. Esto funciona bien hasta que quieres transpilar esto a otros lenguajes, ya sea PHP o cualquier otro lenguaje.

Existe este aspecto de la representación de números a lo largo de la biblioteca.
El enfoque existente documentado en el Manual dice que la biblioteca aceptará y devolverá "flotantes en todas partes" para cantidades, precios, costos, etc.
Usar flotantes es la forma más sencilla de incorporar nuevos usuarios.
Esto tiene problemas conocidos; es imposible representar números exactos con flotantes (https://0.30000000000000004.com/)

Para solucionar eso, estamos cambiando a representaciones basadas en cadenas en todas partes.
Por lo tanto, estamos en proceso de avanzar hacia cadenas de manera no disruptiva.

El nuevo enfoque es:

Estamos añadiendo una capa interna para representaciones basadas en cadenas y matemáticas basadas en cadenas en los analizadores de respuestas.
Esa capa interna está construida sobre la clase base `Precise`, que se usa para hacer todas las matemáticas basadas en cadenas.
Esa clase requiere cadenas para operar con ellas y también devolverá cadenas.
Todos los analizadores antiguos existentes deben reescribirse para usar representaciones basadas en cadenas de `Precise`, al primer encuentro.
Todo el código nuevo de todos los analizadores nuevos debe escribirse inicialmente con representaciones basadas en cadenas de `Precise`.

Lo que eso significa exactamente:

Compare este pseudocódigo que muestra cómo se hacía **antes** (un ejemplo de código de análisis arbitrario con el propósito de explicarlo):

```javascript
const amount = this.safeFloat (order, 'amount');
const remaining = this.safeFloat (order, 'remaining');
if (remaining > 0) {
    status = 'open';
} else {
    status = 'closed';
}
// ...
return {
    // ...
    'amount': amount,
    'remaining': remaining,
    'status': status,
    // ...
};
```

Así es como debemos hacerlo **a partir de ahora**:

```javascript
const amount = this.safeNumber (order, 'amount'); // internal string-layer
const remaining = this.safeString (order, 'remaining'); // internal string-layer
if (Precise.stringGt (remaining, '0')) { // internal string-layer
    status = 'open';
} else {
    status = 'closed';
}
// ...
return {
    // ...
    'amount': amount, // external layer, goes to the user
    'remaining': this.parseNumber (remaining), // external layer, goes to the user
    'status': status,
    // ...
};
```

En todo el código nuevo de todos los analizadores debemos usar números basados en cadenas a lo largo del cuerpo del analizador. También debemos agregar `parseNumber` como el último paso del manejo de valores numéricos al devolver el resultado al llamador. Los dos fragmentos anteriores son solo ejemplos que muestran el uso de `Precise` con `safeString` y `parseNumber`. Los analizadores reales de órdenes también involucran métodos safeOrder: https://github.com/ccxt/ccxt/pulls?q=safeOrder2.

El usuario tendrá en última instancia la opción de elegir qué implementación de parseNumber desea: la que devuelve flotantes o la que devuelve cadenas. De esta manera todos quedarán satisfechos y la biblioteca funcionará de ambas maneras sin cambios incompatibles.

La regla general es: **`+` es solo para concatenación de cadenas (!)** y **TODAS las operaciones aritméticas deben usar `Precise`**.

#### Formateo de Números Decimales con Precisión

Esta sección cubre la parte de ensamblado de solicitudes. El método `.toFixed ()` tiene [errores de redondeo conocidos](https://www.google.com/search?q=toFixed+bug) en JavaScript, y lo mismo ocurre con los demás métodos de redondeo en los otros lenguajes también. Para trabajar con el formateo de números de manera consistente use el [`método decimalToPrecision como se describe en el Manual`](/docs/manual#methods-for-formatting-decimals).

#### Caracteres de Control Escapados

Cuando use cadenas que contengan caracteres de control como `"\n"`, `"\t"`, ¡enciérrelos siempre entre comillas dobles (`"`), no simples (`'`)! Las cadenas entre comillas simples no se analizan en busca de caracteres de control y se tratan tal como están en muchos lenguajes aparte de TypeScript. Por lo tanto, para que las tabulaciones y los saltos de línea funcionen en PHP, necesitamos rodearlos con comillas dobles (especialmente en la implementación de `sign()`).

Incorrecto:

```javascript
const a = 'GET' + method.toLowerCase () + '\n' + path;
const b = 'api\nfoobar.com\n';
```

Correcto:

```javascript
const a = 'GET' + method.toLowerCase () + "\n" + path; // eslint-disable-line quotes
// eslint-disable-next-line quotes
const b = "api\nfoobar.com\n";
```

**↑ ¡Los comentarios `eslint-*` son obligatorios!**

#### Uso de Condicionales Ternarios

No use condicionales ternarios (`?:`) complejos, **¡use siempre paréntesis en los operadores ternarios!**

A pesar de que existe precedencia de operadores en los propios lenguajes de programación, el transpilador está basado en expresiones regulares y no realiza introspección de código, por lo que trata todo como texto plano.

Los paréntesis son necesarios para indicarle al transpilador qué parte del condicional es cuál. En ausencia de paréntesis es difícil entender la línea y la intención del desarrollador.

Aquí hay algunos ejemplos de código mal diseñado que romperá el transpilador:

```javascript
// this is an example of bad code style that will likely break the transpiler
const foo = {
   'bar': 'a' + qux === 'baz' ? this.a () : this.b () + 'b',
};
```

```javascript
// this confuses the transpiler and a human developer as well
const foo = 'bar' + baz + qux ? 'a' : '' + this.c ();
```

Agregar paréntesis alrededor de las partes correspondientes sería una forma más o menos correcta de resolverlo.

```javascript
const foo = {
   'bar': (qux === 'baz') ? this.a () : this.b (), // much better now
};
```

La forma universalmente funcional de resolverlo es simplemente dividir la línea compleja en varias líneas más simples, incluso a costa de agregar líneas y condicionales adicionales:

```javascript
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

O incluso:

```javascript
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

### Nuevas Integraciones de Exchanges

**RECUERDE:** La razón principal por la que se usa esta biblioteca es la **Unificación**. Al desarrollar un nuevo archivo de exchange, el objetivo no es implementarlo de alguna manera, sino implementarlo de una manera muy pedante, precisa y exacta, tal como están implementados los demás exchanges. Para eso debemos copiar partes de la lógica de otros exchanges y asegurarnos de que el nuevo exchange cumpla con el Manual en los siguientes aspectos:

- los ids de mercado, símbolos de pares de trading, ids de divisas, códigos de tokens, la unificación simbólica y `commonCurrencies` deben estar estandarizados en todos los métodos de análisis (`fetchMarkets`, `fetchCurrencies`, `parseTrade`, `parseOrder`, ...)
- todos los nombres y argumentos de los métodos de la API unificada son estándar — no se pueden agregar ni cambiar libremente
- toda la entrada del analizador debe ser saneada con `safe` como [se describe arriba](#sanitizing-input-with-safe-methods)
- para operaciones masivas se deben usar los métodos base (`parseTrades`, `parseOrders`, nótese el plural con `s`)
- use tanta funcionalidad base como sea posible, no reinvente la rueda, ni la bicicleta, ni la rueda de la bicicleta
- respete los valores de argumentos predeterminados en los métodos `fetch`, compruebe si `since` y `limit` son `undefined` y no los envíe al exchange; en esos casos usamos intencionalmente los valores predeterminados del exchange
- al implementar un método unificado que tiene algunos argumentos — no podemos ignorar ni omitir ninguno de esos argumentos
- todas las estructuras devueltas por los métodos unificados deben ajustarse a sus especificaciones del Manual
- todos los endpoints de la API deben listarse con soporte adecuado para los parámetros sustituidos en las URLs

Por favor, consulte el siguiente documento para nuevas integraciones: /docs/requirements

Una fusión rápida de un Pull Request para una nueva integración de exchange depende de la consistencia y el cumplimiento de las reglas y estándares unificados anteriores. Incumplir uno de ellos es la razón principal para no fusionar un Pull Request.

**Si desea agregar (soporte para) otro exchange, o implementar un nuevo método para un exchange en particular, la mejor manera de convertirlo en una mejora consistente es aprender con el ejemplo. Observe cómo se implementan las mismas cosas en otros exchanges (recomendamos los exchanges certificados) e intente copiar el flujo y el estilo del código.**

El esqueleto JSON básico para una nueva integración de exchange es el siguiente:

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

### Métodos Implícitos de la API

En el código de cada exchange, notará que las funciones que realizan solicitudes a la API no están definidas explícitamente. Esto se debe a que la definición `api` en el JSON de descripción del exchange se usa para crear *funciones mágicas* (también conocidas como *funciones parciales* o *clausuras*) dentro de la subclase del exchange. Esa inyección implícita la realiza el método base del exchange `defineRestApi/define_rest_api`.

Cada función parcial toma un diccionario de `params` y devuelve la respuesta de la API. En el JSON de ejemplo anterior, `'endpoint/example'` resulta en la inyección de una función `this.publicGetEndpointExample`. De manera similar, `'orderbook/{pair}/full'` resulta en una función `this.publicGetOrderbookPairFull`, que toma un parámetro ``pair`` (nuevamente, pasado en el argumento `params`).

Al instanciarse, la clase base del exchange toma cada URL de su lista de endpoints, la divide en palabras y luego construye un nombre de función invocable a partir de esas palabras usando una construcción parcial. Ese proceso es el mismo en JS, Python y PHP también. También se describe aquí:

- /docs/manual#api-methods--endpoints
- /docs/manual#implicit-api-methods
- https://github.com/ccxt-dev/ccxt/wiki/Manual#api-method-naming-conventions

``` CONSTRUCTION```

### Docstrings

- cuando un método toma otro parámetro como propiedad en params (ej. `params['something']`), agregue ese parámetro al docstring como params.something
   - si ese parámetro es obligatorio, el tipo es `{str}`, `{int}`, `{etc}`; si es opcional el tipo es `{str|undefined}`, `{int|undefined}`, `{etc|undefined}`
- cuando el valor predeterminado de un parámetro es `undefined`, pero el método contiene algo como `if (symbol === undefined) { throw new ArgumentsRequired('...')}`, entonces establezca el tipo de ese parámetro como `{str}`, `{int}`, `{etc}`. Si no se lanza un error, entonces el tipo es `{str|undefined}`, `{int|undefined}`, `{etc|undefined}`
- si un método no usa uno de los parámetros unificados, establezca la descripción de ese parámetro como `not used by exchange_name.method_name ()` (reemplace `exchange_name` y `method_name` con los nombres reales del exchange y del método)
- si el método tiene otros casos de uso especiales, inclúyalos en la descripción del docstring; estos casos también pueden incluirse en el docstring de la clase

### Integración Continua

Las compilaciones están automatizadas con [Travis CI](https://app.travis-ci.com/github/ccxt/ccxt). Los pasos de compilación para Travis CI están descritos en el archivo [`.travis.yml`](https://github.com/ccxt/ccxt/blob/master/.travis.yml).

Las compilaciones en Windows están automatizadas con [Appveyor](https://ci.appveyor.com/project/ccxt/ccxt). Los pasos de compilación para Appveyor están en el archivo [`appveyor.yml`](https://github.com/ccxt/ccxt/blob/master/appveyor.yml).

Los pull requests entrantes son validados automáticamente por el servicio de CI. Puede ver el proceso de compilación en línea aquí: [app.travis-ci.com/github/ccxt/ccxt/builds](https://app.travis-ci.com/github/ccxt/ccxt/builds).

### Cómo Compilar y Ejecutar Pruebas en su Máquina Local

### Pruebas sin conexión
CCXT tiene varias pruebas sin conexión que ayudan a garantizar que no introduzcamos regresiones al agregar una nueva funcionalidad o corregir un error. Son fáciles y rápidas de ejecutar (ya que no requieren acceso a los exchanges), por lo que deben ser parte de nuestro flujo de desarrollo en CCXT.


Incluyen las pruebas base (precisión, criptografía, libro de órdenes, etc.) y las pruebas estáticas (de solicitud/respuesta).

Estas pruebas están ubicadas en la carpeta `ts/src/test/base/functions/`; la mayor parte de su contenido es transpilable automáticamente a todos los lenguajes; por lo tanto, se aplican las mismas convenciones de código.

Puede ejecutarlas con: `npm run test-base` y `npm run-test-ws`

Las pruebas estáticas también son sin conexión pero funcionan de manera diferente porque emulan una llamada ccxt unificada (createOrder/fetchTickers/etc) y simulan la respuesta del servidor y/o verifican la validez de la solicitud HTTP generada.

**Solicitud estática**:
- Emulan la solicitud HTTP, la detienen antes de que intente conectarse y verifican que la URL/cuerpo estén correctamente formados.

Carpeta: `ts/src/test/static/request/`

Puede crear una prueba estática de solicitud ejecutando este comando y pegando el resultado en el archivo correcto (ej: `static/request/binance.json`)

```bash
node cli.js binance fetchTrades "BTC/USDT:USDT" --report
````


**Respuesta estática**
- Emula una respuesta simulada del servidor y verifica que CCXT analice correctamente la respuesta HTTP sin procesar.

Carpeta: `ts/src/test/static/response/binance.json`

Puede crear una prueba estática de respuesta ejecutando este comando y pegando el resultado en el archivo correcto (ej: `static/response/binance.json`)

```bash
node cli.js binance fetchTrades "BTC/USDT:USDT"  undefined 1 --response
````
#### Agregar Credenciales del Exchange

CCXT tiene pruebas tanto para la API pública como para la API privada autenticada. De forma predeterminada, las pruebas integradas de CCXT solo probarán las APIs públicas, porque el repositorio de código no incluye las [claves de API](/docs/manual#authentication) que se requieren para las pruebas de la API privada. Además, las pruebas privadas incluidas no alterarán el saldo de la cuenta de ninguna manera; todas las pruebas son no intrusivas. Para habilitar las pruebas de la API privada, se deben configurar las claves de API. Esto puede hacerse en `keys.local.json` o con variables de entorno (`env`).

##### Configuración de claves de API y opciones en `keys.local.json`

Las claves de API del exchange pueden agregarse en `keys.local.json` en la carpeta raíz dentro del repositorio. Si no existe en su sistema, créelo primero. Ese archivo está en `.gitignore` y en `.npmignore`. Puede agregar credenciales del exchange y varias opciones para diferentes exchanges en el archivo `keys.local.json`.

Un ejemplo del archivo `keys.local.json`:

```json
{
    "okx": {
        "apiKey": "XXX",
        "secret": "YYY"
    },
    "binance": {
        "apiKey": "XXX",
        "secret": "YYY",
        "options": {
            "some-option": "some value"
        }
    },
    // ...
}
```

##### Configuración de claves de API como variables de entorno

También puede definir las claves de API como variables de entorno (`env`):

- https://www.google.com/search?q=set+env+variable+linux
- https://www.google.com/search?q=set+env+variable+mac
- https://www.google.com/search?q=set+env+variable+windows

Consulte la documentación de su sistema operativo y shell sobre cómo establecer una variable de entorno. La mayoría de las veces funcionará un comando `set` o un comando `export`. El comando `env` puede ayudar a verificar las variables de entorno ya establecidas.

Ejemplos de variables `env`: `BINANCE_APIKEY`, `BINANCE_SECRET`, `KRAKEN_APIKEY`, `KRAKEN_SECRET`, etc.

#### Compilación

Antes de compilar por primera vez, instala las dependencias de Node (omite este paso si estás usando nuestra imagen Docker):

```
npm install
```

El siguiente comando compilará todo y generará las versiones PHP/Python a partir de los archivos TS fuente:

```
npm run build
```

#### Pruebas

El siguiente comando probará los archivos generados compilados (para todos los exchanges, símbolos e idiomas):

```
node run-tests
```

Puedes restringir las pruebas a un idioma específico, un exchange o símbolo en particular:

```
node run-tests [--js] [--python] [--python-async] [--php] [--php-async] [exchange] [symbol]
```

El comando `node run-tests exchangename` intentará 5 pruebas: `js`, `python`, `python-async`, `php`, `php-async`. Puedes controlarlo de la siguiente manera:

```
node run-tests exchange --js
node run-tests exchange --js --python-async
node run-tests exchange --js --php
node run-tests exchange --python --python-async
...
```

Sin embargo, si eso falla, puede que tengas que profundizar un nivel más y ejecutar pruebas específicas por idioma para ver qué es exactamente lo que está mal:

```
node js/test/test exchange --verbose
python3 python/ccxt/test/test_sync.py exchange --verbose
python3 python/ccxt/test/test_async.py exchange --verbose
php -f php/test/test_sync.php exchange --verbose
php -f php/test/test_async.php exchange --verbose
```

El `test_sync` es simplemente una versión síncrona de `test_async`, así que en la mayoría de los casos basta con ejecutar `test_async.py` y `test_async.php`:

```
node js/test/test exchange --verbose
python3 python/ccxt/test/test_async.py exchange --verbose
php -f php/test/test_async.php exchange --verbose
```

Cuando todas las pruebas específicas por idioma funcionen, entonces node run-tests también tendrá éxito. Para ejecutar esas pruebas debes asegurarte de que la compilación se haya completado correctamente.

Por ejemplo, la primera de las siguientes líneas solo probará la versión JS fuente de la biblioteca (`ccxt.js`). No requiere ejecutar `npm run build` antes de ejecutarla (puede ser útil si necesitas verificar rápidamente si tus cambios rompen el código o no):

```bash

node run-tests --js                  # test master ccxt.js, all exchanges

# other examples require the 'npm run build' to run

node run-tests --python              # test Python sync version, all exchanges
node run-tests --php bitfinex        # test Bitfinex with PHP
node run-tests --python-async kraken # test Kraken with Python async test, requires 'npm run build'
```

#### Escribir Pruebas

Sigue estos pasos para añadir una prueba:

- Crea un archivo en [ts/tests/Exchange](https://github.com/ccxt/ccxt/tree/master/ts/test/Exchange) siguiendo una sintaxis que pueda ser transpilada.
- Añade la prueba a `runPrivateTests` o `runPublicTests` en [ts/src/test/tests.ts](https://github.com/ccxt/ccxt/blob/master/ts/src/test/tests.ts#L354) o para los endpoints de ccxt.pro en [ts/src/pro/test/tests.ts](https://github.com/ccxt/ccxt/blob/master/ts/src/pro/test/tests.ts#L121)
- ejecuta `npm run transpile` para generar el archivo de prueba en JavaScript, Python y PHP.
- Ejecuta las pruebas con `node run-tests`

## Confirmar Cambios en el Repositorio

El proceso de compilación genera muchos cambios en los archivos de exchange transpilados, por ejemplo para Python y PHP. **NO debes confirmarlos en GitHub, por favor confirma solo los cambios del archivo base (TS)**.

## Contribuciones Económicas

También aceptamos contribuciones económicas con total transparencia en nuestro [colectivo abierto](https://opencollective.com/ccxt).

## Créditos

### Colaboradores

¡Gracias a todas las personas que ya han contribuido a ccxt!

<a href="https://github.com/ccxt/ccxt/graphs/contributors"><img src="https://opencollective.com/ccxt/contributors.svg?width=890" /></a>

### Patrocinadores Individuales

¡Gracias a todos nuestros patrocinadores individuales! [[Conviértete en patrocinador individual](https://opencollective.com/ccxt#backer)]

<a href="https://opencollective.com/ccxt#backers" target="_blank"><img src="https://opencollective.com/ccxt/backers.svg?width=890"></a>

### Seguidores

Apoya este proyecto convirtiéndote en seguidor. Tu avatar aparecerá aquí con un enlace a tu sitio web.

[[Conviértete en seguidor](https://opencollective.com/ccxt#supporter)]

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

### Patrocinadores

¡Gracias a todos nuestros patrocinadores! (por favor pide a tu empresa que también apoye este proyecto de código abierto [convirtiéndose en patrocinador](https://opencollective.com/ccxt#sponsor))

[[Conviértete en patrocinador](https://opencollective.com/ccxt#sponsor)]

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
