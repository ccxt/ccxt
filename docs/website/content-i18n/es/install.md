---
title: "Instalación"
description: "La forma más fácil de instalar la biblioteca ccxt es usar los gestores de paquetes integrados:"
---

## Instalación

La forma más fácil de instalar la biblioteca ccxt es usar los gestores de paquetes integrados:

- [ccxt en **NPM**](http://npmjs.com/package/ccxt) (JavaScript / Node v15+)
- [ccxt en **PyPI**](https://pypi.python.org/pypi/ccxt) (Python 3)

Esta biblioteca se distribuye como una implementación de módulo todo en uno con dependencias y requisitos minimalistas:

- [ccxt.js](https://github.com/ccxt/ccxt/blob/master/js/ccxt.js) en JavaScript
- [./python/](https://github.com/ccxt/ccxt/blob/master/python/) en Python (generado desde JS)
- [ccxt.php](https://github.com/ccxt/ccxt/blob/master/ccxt.php) en PHP (generado desde JS)
- [./java/](https://github.com/ccxt/ccxt/blob/master/java/) en Java (generado desde TS)

También puedes clonarlo en el directorio de tu proyecto desde el [repositorio GitHub de ccxt](https://github.com/ccxt/ccxt) y copiar los archivos manualmente en tu directorio de trabajo con la extensión de lenguaje apropiada para tu entorno.

```bash
git clone https://github.com/ccxt/ccxt.git
```

Una forma alternativa de instalar esta biblioteca es construir un paquete personalizado desde la fuente. Elige los exchanges que necesites en `exchanges.cfg`.

### JavaScript (NPM)

La versión de JavaScript de ccxt funciona tanto en Node como en navegadores web. Requiere soporte de ES6 y sintaxis `async/await` (Node 15+). Al compilar con Rspack (o Webpack) y Babel, asegúrate de que [no esté excluido](https://github.com/ccxt-dev/ccxt/issues/225#issuecomment-331582275) en tu configuración de `babel-loader`.

[Biblioteca de trading cripto ccxt en npm](http://npmjs.com/package/ccxt)

```bash
npm install ccxt
```

```javascript
var ccxt = require ('ccxt')

console.log (ccxt.exchanges) // imprimir todos los exchanges disponibles
```

### JavaScript (para usar con la etiqueta `<script>`):

Paquete todo en uno para navegador (dependencias incluidas), servido desde un CDN de tu elección:

* jsDelivr: https://cdn.jsdelivr.net/npm/ccxt@4.5.56/dist/ccxt.browser.min.js
* unpkg: https://unpkg.com/ccxt@4.5.56/dist/ccxt.browser.min.js
* ccxt: https://cdn.ccxt.com/latest/ccxt.min.js

Puedes obtener una versión actualizada del paquete eliminando el número de versión de la URL (la parte `@a.b.c`) o el /latest/ en nuestro cdn — sin embargo, no lo recomendamos, ya que podría romper tu aplicación eventualmente. Además, ten en cuenta que no somos responsables del funcionamiento correcto de esos servidores CDN.

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/ccxt@4.5.56/dist/ccxt.browser.min.js"></script>
```

El punto de entrada predeterminado para el navegador es `window.ccxt` y crea un objeto ccxt global:

```javascript
console.log (ccxt.exchanges) // imprimir todos los exchanges disponibles
```

### Compilaciones JavaScript Personalizadas

Cargar todos los scripts y recursos lleva tiempo. El problema con el uso en navegador es que toda la biblioteca CCXT pesa varios megabytes, lo cual es mucho para una aplicación web. A veces también es crítico para una aplicación Node. Por lo tanto, para reducir el tiempo de carga, es posible que desees crear tu propia compilación personalizada de CCXT para tu aplicación con solo los exchanges que necesitas. CCXT usa rspack para eliminar rutas de código muerto y hacer el paquete más pequeño.

Sigue estos pasos:

```bash
# 1. clonar el repositorio

git clone --depth 1 https://github.com/ccxt/ccxt.git

# 2. ir al repositorio clonado

cd ccxt

# 3. instalar dependencias

npm install

# 4. editar exchanges.cfg para los exchanges de tu interés

echo -e "binance\nokx" > exchanges.cfg

# 5. construir la biblioteca

npm run export-exchanges
npm run bundle-browser

# 6a. copiar el archivo del navegador a tu carpeta de proyecto si estás construyendo una aplicación web

cp dist/ccxt.browser.js path/to/your/html/project

# 6b. o vincular contra la biblioteca si estás construyendo una aplicación Node.js
npm link
cd path/to/your/node/project
npm link ccxt

# 6c. importar directamente ccxt desde el punto de entrada
touch app.js

# dentro de app.js

import ccxt from './js/ccxt.js'
console.log (ccxt)

# ahora puedes ejecutar tu aplicación así

node app.js
```

### Python

[Biblioteca de algotrading ccxt en PyPI](https://pypi.python.org/pypi/ccxt)

```bash
pip install ccxt
```

```python
import ccxt
print(ccxt.exchanges) # imprimir una lista de todas las clases de exchanges disponibles
```

La biblioteca soporta modo asíncrono concurrente con asyncio y async/await en Python 3.5.3+

```python
import ccxt.async_support as ccxt # vincular contra la versión asíncrona de ccxt
```

### PHP

La versión autocareable de ccxt puede instalarse con [**Packagist/Composer**](https://packagist.org/packages/ccxt/ccxt) (PHP 8.1+).

También puede instalarse desde el código fuente: [**`ccxt.php`**](https://raw.githubusercontent.com/ccxt/ccxt/master/php)

Requiere módulos PHP comunes:

- cURL
- mbstring (se recomienda encarecidamente usar UTF-8)
- PCRE
- iconv
- gmp

```php
include "ccxt.php";
var_dump (\ccxt\Exchange::$exchanges); // imprimir una lista de todas las clases de exchanges disponibles
```

La biblioteca soporta modo asíncrono concurrente usando herramientas de [ReactPHP](https://reactphp.org/) en PHP 8.1+. Lee el [Manual](/docs) para más detalles.

### .net/C#

[ccxt en C# con **Nugget**](https://www.nuget.org/packages/ccxt) (netstandard 2.0 y netstandard 2.1)
```c#
using ccxt;
Console.WriteLine(ccxt.Exchanges) // revisar esto después
```

### Java

La versión Java de CCXT requiere Java 21+ y usa Gradle como sistema de compilación.

Clonar y compilar desde la fuente:

```bash
git clone https://github.com/ccxt/ccxt.git --depth 1
cd ccxt/java
./gradlew :lib:build
```

```java
import io.github.ccxt.exchanges.Binance;
import io.github.ccxt.types.Ticker;

Binance exchange = new Binance();
exchange.loadMarkets(false);

Ticker ticker = exchange.fetchTicker("BTC/USDT");
System.out.println(ticker.symbol + " " + ticker.last);
```

Ejecutar los ejemplos:

```bash
cd java
./gradlew :examples:run -PmainClass=examples.FetchTicker
./gradlew :examples:run -PmainClass=examples.WatchOrderBook
```

Consulta [java/examples/](https://github.com/ccxt/ccxt/tree/master/java/examples) para la lista completa de ejemplos.

### Docker

Puedes obtener CCXT instalado en un contenedor junto con todos los lenguajes y dependencias compatibles. Esto puede ser útil si quieres contribuir a CCXT (por ejemplo, ejecutar scripts de compilación y pruebas — por favor consulta el documento de [Contribución](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) para más detalles).

No necesitas la imagen de Docker si no vas a desarrollar CCXT. Si solo quieres usar CCXT — simplemente instálalo como un paquete regular en tu proyecto.

Usando `docker-compose` (en el repositorio CCXT clonado):

```bash
docker-compose run --rm ccxt
```

Alternativamente:

```bash
docker build . --tag ccxt
docker run -it ccxt
```

## Proxy
Si no puedes obtener datos de los exchanges debido a restricciones de ubicación, lee la sección de [proxy](/docs/manual#proxy).
