---
title: "FAQ"
description: "Si tu pregunta está formulada de forma tan breve como la anterior, no podremos ayudarte. No enseñamos programación. Si no puedes leer y comprender el…"
---

# Preguntas Frecuentes


  ## Estoy intentando ejecutar el código, pero no funciona, ¿cómo lo soluciono?

  Si tu pregunta está formulada de forma tan breve como la anterior, no podremos ayudarte. No enseñamos programación. Si no puedes leer y comprender el [Manual](/docs) o no puedes seguir con precisión las guías del documento [CONTRIBUTING](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) sobre cómo reportar un problema, tampoco podremos ayudarte. Lee las guías de CONTRIBUTING sobre cómo reportar un problema y lee el Manual. No deberías arriesgar el dinero ni el tiempo de nadie sin leer todo el Manual con mucho cuidado. No deberías arriesgar nada si no estás acostumbrado a leer mucho con gran cantidad de detalles. Además, si no tienes confianza con el lenguaje de programación que estás usando, hay lugares mucho mejores para los fundamentos y la práctica de programación. Busca `python tutorials`, `js videos`, juega con ejemplos, así es como otras personas escalan la curva de aprendizaje. Sin atajos, si quieres aprender algo.

  ## ¿Qué se necesita para obtener ayuda?

  Al hacer una pregunta:

  - ¡Usa el botón de búsqueda para ver duplicados primero!
  - **¡Publica tu solicitud y respuesta en modo `verbose`!** Añade `exchange.verbose = true` justo antes de la línea con la que tienes problemas, y copia y pega lo que ves en tu pantalla. Está escrito y mencionado en todas partes, en la sección [Troubleshooting](/docs/manual#troubleshooting), en el [README](https://github.com/ccxt/ccxt/blob/master/README.md) y en muchas respuestas a preguntas similares entre los [issues anteriores](https://github.com/ccxt/ccxt/issues) y las [pull requests](https://github.com/ccxt/ccxt/pulls). Sin excusas. La salida en modo verbose debe incluir tanto la solicitud como la respuesta del exchange.
  - ¡Incluye la pila de llamadas del error completa!
  - Escribe tu lenguaje de programación **y el número de versión del lenguaje**
  - Escribe el número de versión de la biblioteca CCXT / CCXT Pro
  - Qué exchange es
  - Qué método estás intentando llamar

  - **Publica tu código** para reproducir el problema. Hazlo un programa completo, corto y ejecutable, no omitas líneas y hazlo tan compacto como puedas (5-10 líneas de código), incluyendo el código de instanciación del exchange. Elimina todas las partes irrelevantes, dejando solo la esencia del código para reproducir el problema.
    - **¡NO PUBLIQUES CAPTURAS DE PANTALLA DE CÓDIGO O ERRORES, PUBLICA LA SALIDA Y EL CÓDIGO EN TEXTO PLANO!**
    - **Rodea el código y la salida con triple acento grave: &#096;&#096;&#096;BIEN&#096;&#096;&#096;**.
    - No confundas el símbolo de acento grave (&#096;) con el símbolo de comilla (\'): '''MAL'''
    - No confundas un solo acento grave con triple acento grave: &#096;MAL&#096;

  - **¡NO PUBLIQUES TU `apiKey` NI TU `secret`!** ¡Mantenlos seguros (elimínalos antes de publicar)!

  ## Estoy llamando a un método y obtengo un error, ¿qué estoy haciendo mal?

  No estás reportando el problema correctamente ) Por favor, ayuda a la comunidad a ayudarte ) Lee esto y sigue los pasos: https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue. Una vez más, tu código para reproducir el problema y tu solicitud y respuesta en modo verbose **SON OBLIGATORIOS**. *Solo el rastreo del error, o solo la respuesta, o solo la solicitud, o solo el código – ¡no es suficiente!*

  ## Obtuve un resultado incorrecto de una llamada a un método, ¿puedes ayudarme?

  Básicamente la misma respuesta que la pregunta anterior. Lee y sigue **con precisión**: https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue. Una vez más, tu código para reproducir el problema y tu solicitud y respuesta en modo verbose **SON OBLIGATORIOS**. *Solo el rastreo del error, o solo la respuesta, o solo la solicitud, o solo el código – ¡no es suficiente!*

  ## ¿Pueden implementar la característica `foo` en el exchange `bar`?

  Sí, podemos. Y lo haremos, si nadie más lo hace antes que nosotros. Hay muy poco sentido en hacer este tipo de preguntas, porque la respuesta siempre es positiva. Cuando alguien pregunta si podemos hacer esto o aquello, la pregunta no es sobre nuestras capacidades, todo se reduce al tiempo y la gestión necesarios para implementar todas las solicitudes de características acumuladas.

  Además, esta es una biblioteca de código abierto que es un trabajo en progreso. Esto significa que este proyecto está destinado a ser desarrollado por la comunidad de usuarios que lo utilizan. Lo que estás pidiendo no es si podemos o no implementarlo, de hecho realmente nos estás diciendo que vayamos a hacer esa tarea en particular y así no es como vemos una colaboración voluntaria. Tus contribuciones, PRs y commits son bienvenidos: https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code.

  No damos promesas ni estimaciones sobre el trabajo gratuito de código abierto. Si deseas acelerarlo, no dudes en contactarnos a través de info@ccxt.trade.

  ## ¿Cuándo añadirán la característica `foo` para el exchange `bar`? ¿Cuál es el tiempo estimado? ¿Cuándo deberíamos esperarlo?

  No damos promesas ni estimaciones sobre el trabajo de código abierto. El razonamiento detrás de esto se explica en el párrafo anterior.

  ## ¿Cuándo añadirán soporte para un exchange solicitado en los Issues?

  De nuevo, no podemos prometer fechas para añadir este o aquel exchange, debido a las razones descritas anteriormente. La respuesta siempre seguirá siendo la misma: _tan pronto como podamos_.

  ## ¿Cuánto tiempo debo esperar para que se añada una característica? Necesito decidir si implementarla yo mismo o esperar a que el Equipo de Desarrollo de CCXT la implemente por mí.

  Por favor, ve a implementarla tú mismo, no nos esperes. La añadiremos tan pronto como podamos. Además, tus contribuciones son muy bienvenidas:

  - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

  ## ¿Cuál es tu progreso en la adición de la característica `foo` que fue solicitada anteriormente? ¿Cómo va la implementación del exchange `bar`?

  Este tipo de preguntas suele ser una pérdida de tiempo, porque responderlas generalmente requiere demasiado tiempo para el cambio de contexto, y a menudo toma más tiempo responder esta pregunta que satisfacer realmente la solicitud con código para una nueva característica o un nuevo exchange. El progreso de este proyecto de código abierto también es abierto, así que, cuando te preguntes cómo va, echa un vistazo al historial de commits.

  ## ¿Cuál es el estado de este PR? ¿Alguna novedad?

  Si no está fusionado, significa que el PR contiene errores que deben corregirse primero. Si pudiera fusionarse tal como está, lo fusionaríamos, y tú no habrías hecho esta pregunta en primer lugar. La razón más frecuente para no fusionar un PR es una violación de alguna de las [pautas de CONTRIBUTING](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes). Esas pautas deben tomarse literalmente, no se puede omitir ni una sola línea o palabra si quieres que tu PR sea fusionado rápidamente. Las contribuciones de código que no violan las pautas se fusionan casi de inmediato (generalmente, en horas).

  ## ¿Puedes señalar los errores o lo que debo editar en mi PR para que sea fusionado en la rama master?

  Lamentablemente, no siempre tenemos tiempo para listar rápidamente cada error en el código que impide su fusión. A menudo es más fácil y rápido simplemente ir y corregir el error en lugar de explicar lo que uno debe hacer para corregirlo. La mayoría de ellos ya están descritos en las [pautas de CONTRIBUTING](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes). La regla general principal es seguir **todas las pautas literalmente**.

  ## ¡Oye! La corrección que subiste está en TypeScript, ¿también corregirías JavaScript / Python / PHP, por favor?

  Nuestro sistema de compilación genera código JavaScript, Python, PHP, C#, Go y Java específico de cada exchange automáticamente, por lo que es transpilado desde TypeScript, y no es necesario corregir todos los lenguajes por separado uno a uno.

  Por lo tanto, si está corregido en TypeScript, también está corregido en JavaScript NPM, Python pip, PHP Composer, C# NuGet, Go y Java. La compilación automática generalmente tarda 15-20 minutos. Solo actualiza tu versión con `npm`, `pip` o `composer` **después de que llegue la nueva versión** y todo estará bien.

  Más información aquí:

  - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support
  - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#transpiled-generated-files


  ## ¿Cómo crear una orden con takeProfit+stopLoss?
  Algunos exchanges soportan `createOrder` con las sub-órdenes adicionales "adjuntas" `stopLoss` y `takeProfit` - ver [StopLoss And TakeProfit Orders Attached To A Position](/docs/manual#stoploss-and-takeprofit-orders-attached-to-a-position). 
  Sin embargo, algunos exchanges podrían no soportar esa característica y necesitarás ejecutar métodos `createOrder` separados para añadir una orden condicional (por ejemplo, ***orden trigger | orden stoploss | orden takeprofit**) a la posición ya abierta - ver [Conditional orders](/docs/manual#conditional-orders).
  También puedes verificarlos consultando `exchange.has['createOrderWithTakeProfitAndStopLoss']`, `exchange.has['createStopLossOrder']` y `exchange.has['createTakeProfitOrder']`, aunque no son tan precisos como la propiedad `.features`.

  ## ¿Cuál es la diferencia entre las órdenes `takeProfit/stopLoss` y `takeProfitPrice/stopLossPrice`?

  En CCXT, distinguimos entre varios tipos de órdenes takeProfit/stopLoss. Si deseas colocar una orden que abra una posición y simultáneamente adjunte una orden de take-profit o stop-loss dentro de la misma solicitud (siempre que el exchange soporte esta característica), debes usar la sintaxis `takeProfit/stopLoss`.
  Nos referimos a estas órdenes TP/SL adjuntas como **tipo 3**.

  Ejemplo:
  ```python
    params = {
      'stopLoss': {
          'triggerPrice': 12.34,  # at what price it will trigger
          'price': 12.00,  # if exchange supports, 'price' param would be limit price (for market orders, don't include this param)
        },
        'takeProfit': {
            # similar params here
        }
    }
    order = exchange.create_order ('SOL/USDT', 'limit', 'buy', 0.5, 13, params)
  ```

  Si el exchange no soporta estas órdenes adjuntas, o deseas colocar una orden independiente que actúe como orden de stop loss/take profit, puedes colocar una orden `stopLossPrice` **o** `takeProfitPrice`; llamamos a estas órdenes sl/tp independientes **tipo 2**.

  Ejemplo
  ```python
      symbol = 'ADA/USDT:USDT'
      main_order = await binance.create_order(symbol, 'market', 'buy', 50) # open position
      tp_order = await binance.create_order(symbol, 'limit', 'sell', 50, 1.5, {"takeProfitPrice": 1.6}) # take profit order
      sl_order = await binance.create_order(symbol, 'limit', 'sell', 50, 0.24, {"stopLossPrice": 0.25}) # stop loss order
  ```

 ## ¿Cómo funcionan las órdenes trailing?
  Algunos exchanges soportan el uso de `createOrder` para crear una orden `trailingPercent` o `trailingAmount` - ver: [Trailing Orders](/docs/manual#trailing-orders)
  
  Las órdenes trailing siguen al precio de mercado actual por un porcentaje o una cantidad en la divisa de cotización. La orden sigue en una dirección pero no en la otra, de modo que eventualmente puede ejecutarse. La orden ejecutada puede ser una orden de mercado o una orden límite. Una orden trailing normalmente puede colocarse para abrir una posición, o combinarse con el parámetro `reduceOnly` establecido en true para cerrar una posición. Estos detalles sobre qué órdenes están permitidas dependen del exchange. Las órdenes trailing a menudo soportan un parámetro `trailingTriggerPrice` y si el precio de mercado actual cruza ese valor iniciará la función de seguimiento definida por `trailingPercent` o `trailingAmount`.
  
  Es posible que algunos exchanges no soporten esta característica de trailing. Puedes consultar la propiedad `.features`. También puedes verificar si `createOrder` en el exchange que estás usando tiene `trailingPercent` o `trailingAmount` como parámetro disponible en el docstring. Algunos exchanges podrían tener `exchange.has['createTrailingPercentOrder']` o `exchange.has['createTrailingAmountOrder']` establecidos en true, lo que indica que los parámetros `trailingPercent` o `trailingAmount` están disponibles en `createOrder`.

Ejemplos de creación de órdenes `trailingPercent` y `trailingAmount`:
  ```python
    params = {
      'trailingPercent': 1.0, # percentage away from the current market price, 1.0 means 1%
      # 'trailingAmount': 100.0, # quote amount away from the current market price, for a SOL/USDT pair this is 100 USDT away from the current market price.
      # 'trailingTriggerPrice': 44500.0, # the price to trigger activating a trailing stop order
      'reduceOnly': True, # set to true if you want to close a position, set to false if you want to open a new position
    }
    order = exchange.create_order ('SOL/USDT:USDT', 'market', 'sell', 0.5, None, params)
  ```
  ```python
    trailingAmount = 100.0
    trailingTriggerPrice = 115.0
    params = {
        'reduceOnly': True,
    }
    order = exchange.create_trailing_amount_order ('SOL/USDT:USDT', 'market', 'sell', 0.5, None, trailingAmount, trailingTriggerPrice, params)
  ```
  ```python
    trailingPercent = 1.0
    trailingTriggerPrice = 115.0
    params = {
        'reduceOnly': False,
    }
    order = exchange.create_trailing_percent_order ('SOL/USDT:USDT', 'limit', 'buy', 0.5, 13, trailingPercent, trailingTriggerPrice, params)
  ```

  ## ¿Cómo crear una compra de mercado spot con costo?
  Para crear una orden de compra de mercado con costo, primero debes verificar si el exchange admite esa función (`exchange.has['createMarketBuyOrderWithCost']).
  Si lo hace, puedes usar el método `createMarketBuyOrderWithCost`.
  Ejemplo:
  ```python
  order = await exchange.createMarketBuyOrderWithCost(symbol, cost)
  ```

## ¿Qué significa la opción `createMarketBuyRequiresPrice`?

Muchos exchanges requieren que el monto esté en la moneda de cotización (no aceptan el monto base) al colocar órdenes de compra de mercado spot. En esos casos, el exchange tendrá la opción `createMarketBuyRequiresPrice` establecida en `true`.

Ejemplo: Si quisieras comprar BTC/USDT con una orden de compra de mercado, deberías proporcionar un monto = 5 USDT en lugar de 0.000X. Tenemos una verificación para evitar errores que requieren explícitamente el precio porque los usuarios generalmente proporcionan el monto en la moneda base.

Por lo tanto, de forma predeterminada, si haces `create_order(symbol, 'market,' 'buy,' 10)` se lanzará un error si el exchange tiene esa opción (`createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false...`).

Si el exchange requiere el costo y el usuario proporcionó el monto base, necesitamos solicitar un parámetro adicional **price** y multiplicarlos para obtener el costo. Si conoces este comportamiento, simplemente puedes deshabilitar `createMarketBuyOrderRequiresPrice` y pasar el costo en el parámetro de monto, pero deshabilitarlo no significa que puedas colocar la orden usando el monto base en lugar de la cotización.

Si haces `create_order(symbol, 'market', 'buy', 0.001, 20000)` ccxt usará el precio requerido para calcular el costo haciendo `0.01*20000` y enviará ese valor al exchange.

Si deseas proporcionar el costo directamente en el argumento de monto, puedes hacer `exchange.options['createMarketBuyOrderRequiresPrice'] = False` (reconoces que el monto será el costo para la compra de mercado) y luego puedes hacer `create_order(symbol, 'market', 'buy', 10)`

Esto es básicamente para evitar que un usuario haga esto: `create_order('SHIB/USDT', market, buy, 1000000)` pensando que está intentando comprar 1kk de shib pero en realidad está comprando 1kk USDT en valor de SHIB. Por esa razón, de forma predeterminada ccxt siempre acepta la moneda base en el parámetro de monto.

Alternativamente, puedes usar las funciones `createMarketBuyOrderWithCost`/ `createMarketSellOrderWithCost` si están disponibles.

  Ver más: [Compras de mercado](/docs/manual#market-buys)

  ## ¿Cuál es la diferencia entre operar en spot y en swap/futuros perpetuos?
  El trading spot implica comprar o vender un instrumento financiero (como una criptomoneda) para entrega inmediata. Es sencillo e implica el intercambio directo de activos.

  El trading de swaps, por otro lado, implica contratos derivados donde dos partes intercambian instrumentos financieros o flujos de caja en una fecha futura establecida, basándose en el activo subyacente. Los swaps se usan frecuentemente para apalancamiento, especulación o cobertura y no necesariamente implican el intercambio del activo subyacente hasta que vence el contrato.


  Además de eso, estarás manejando contratos si operas con swaps y no la moneda base (por ejemplo, BTC) directamente, así que si creas una orden con `amount = 1`, el monto en BTC variará dependiendo del `contractSize`. Puedes verificar el tamaño del contrato haciendo:

  ```python
  await exchange.loadMarkets()
  symbol = 'XRP/USDT:USDT'
  market = exchange.market(symbol)
  print(market['contractSize'])
  ```

  ## ¿Por qué recibo un error que dice "must be greater than minimum amount precision of 1"?
  Este es un error común que ocurre al crear órdenes para mercados de contratos. Este error ocurre cuando el exchange espera un número natural de contratos (1, 2, 3, etc.) en el argumento de monto de createOrder.
  
  Cada contrato vale una cierta cantidad del activo base, determinada por el contractSize. Puedes obtener el contractSize de la estructura de mercado de un símbolo así:
  ```python
  await exchange.loadMarkets()
  symbol = 'SOL/USDT:USDT'
  market = exchange.market(symbol)
  print(market['contractSize'])
  ```

  Si creas una orden con `amount = 1`, la cantidad del activo base que se usa para la orden variará dependiendo del `contractSize` del símbolo.

  A continuación se muestra una fórmula y un ejemplo para encontrar el número de `contracts` que debes usar para el argumento de monto si quieres usar 0.5 del activo base:
  ```python
  await exchange.loadMarkets()
  symbol = 'SOL/USDT:USDT'
  market = exchange.market(symbol)
  # Converting a 0.5 base amount to the number of contracts:
  # Formula: contracts = (base amount / contract size)
  contracts = round(0.5 / market['contractSize'])
  ```

  Aquí hay un ejemplo para encontrar el monto base que se usará con un argumento de monto de 1 contrato:
  ```python
  await exchange.loadMarkets()
  symbol = 'SOL/USDT:USDT'
  market = exchange.market(symbol)
  # Finding the base amount that will be used with 1 contract:
  # Formula: base amount = (contracts * contract size)
  contracts = 1
  base_amount = (contracts * market['contractSize'])
  ```

  ## ¿Cómo colocar una orden reduceOnly?
  Una orden reduceOnly es un tipo de orden que solo puede reducir una posición, no aumentarla. Para colocar una orden reduceOnly, normalmente usas el método createOrder con un parámetro reduceOnly establecido en true. Esto garantiza que la orden solo se ejecutará si disminuye el tamaño de una posición abierta, y se llenará parcialmente o no se llenará en absoluto si ejecutarla aumentaría el tamaño de la posición.


```javascript tab="JavaScript"
const params = {
    'reduceOnly': true, // set to true if you want to close a position, set to false if you want to open a new position
}
const order = await exchange.createOrder (symbol, type, side, amount, price, params)
```
```python tab="Python"
params = {
    'reduceOnly': True, # set to True if you want to close a position, set to False if you want to open a new position
}
order = exchange.create_order (symbol, type, side, amount, price, params)
```
```php tab="PHP"
$params = {
    'reduceOnly': true, // set to true if you want to close a position, set to false if you want to open a new position
}
$order = $exchange->create_order ($symbol, $type, $side, $amount, $price, $params);
```


  ## ¿Cómo verificar el endpoint usado por el método unificado?
  Para verificar el endpoint usado por un método unificado en la biblioteca CCXT, normalmente necesitarías consultar el código fuente de la biblioteca para la implementación del exchange específico que te interesa. Los métodos unificados en CCXT abstraen los detalles de los endpoints específicos con los que interactúan, por lo que esta información no está expuesta directamente a través de la API de la biblioteca. Para una inspección detallada, puedes consultar la implementación del método para el exchange particular en el código fuente de la biblioteca CCXT en GitHub.

  Ver más: [API unificada](/docs/manual#unified-api)

  ## ¿Cómo diferenciar entre previousFundingRate, fundingRate y nextFundingRate en la estructura de tasa de financiamiento?
  La estructura de tasa de financiamiento tiene tres valores diferentes de tasa de financiamiento que pueden ser devueltos:
  1. `previousFundingRate` se refiere a la tasa completada más recientemente.
  2. `fundingRate` es la tasa próxima. Este valor cambia constantemente hasta que pasa el tiempo de financiamiento y luego se convierte en el previousFundingRate.
  3. `nextFundingRate` solo está soportado en unos pocos exchanges y es la tasa de financiamiento predicha después de la tasa próxima. Este valor corresponde a dos tasas de financiamiento a partir de ahora.

  Como ejemplo, supongamos que son las 12:30. El `previousFundingRate` ocurrió a las 12:00 y estamos revisando cuál será la próxima tasa de financiamiento consultando el valor de `fundingRate`. En este ejemplo, dado intervalos de 4 horas, el `fundingRate` ocurrirá en el futuro a las 4:00 y el `nextFundingRate` es la tasa predicha que ocurrirá a las 8:00.

## ¿Cómo usar el exchange Lighter en CCXT?

Lighter está disponible como parte de CCXT y funciona de manera similar a cualquier otro exchange de CCXT, pero tiene algunas particularidades que pueden resultar confusas para algunos usuarios, aunque las explicaremos en detalle a continuación. Solo necesitamos establecer algunas credenciales y dependencias básicas.


Después de la última actualización, CCXT ha simplificado el proceso de autenticación y ahora basta con usar la clave privada L1.

## Requisitos de credenciales

Lighter requiere lo siguiente:
- `privateKey`: la clave privada L1 **obligatoria**
- `accountIndex` (un entero) en `exchange.options`: — **opcional** CCXT lo obtendrá si no está disponible, configúralo si usas una subcuenta
- `apiKeyIndex` (un entero) en `exchange.options`: **opcional** CCXT usará un valor predeterminado (254)

Ejemplo

```python
lighter = ccxt.lighter({
	'privateKey': 'XXXXXXX', # l1 private key
})
```

### Requisitos de dependencias

Dado que los algoritmos de firma y las estructuras no están soportados de forma nativa en todos los lenguajes, CCXT usa los binarios distribuidos oficialmente e interactúa con ellos para realizar el proceso de firma (a través de FFI/WASM), por lo que dependiendo del lenguaje necesitas proporcionar una ruta para ese binario.

### Usuarios de Python/C#/PHP:

- Los binarios se pueden descargar aquí: https://github.com/elliottech/lighter-python/tree/main/lighter/signers
- La ruta al binario debe proporcionarse como `libraryPath`
- Debes elegir el binario según tu sistema operativo/arquitectura

```python
lighter = ccxt.lighter({
	'options': {
		'libraryPath': 'path/to/lighter-signer-linux-arm64.so',
	}
})
```

### Usuarios de Javascript/Typescript

- CCXT usa el binario WASM construido a partir del paquete oficial y puede descargarse aquí https://github.com/ccxt/lighter-wasm o construirse desde el código fuente
- También necesitas proporcionar la ruta a `exec_wasm.js`, puedes descargarlo del mismo repositorio o verificar la ruta a tu archivo local (asumiendo que Go está instalado)

```javascript
lighter = ccxt.lighter({
	'options': {
		'libraryPath': '/user/cjg/Git/lighter-wasm/lighter.wasm',
		'wasmExecPath': '/opt/homebrew/opt/go/libexec/lib/wasm/wasm_exec.js'
	}
})
```

### Usuarios de GO

- No se requiere nada, CCXT consume el paquete GO oficial, solo necesitas proporcionar las credenciales


## ¿Cómo usar el exchange DyDx en CCXT?

DyDx está disponible como parte de CCXT y funciona de manera similar a cualquier otro exchange de CCXT, pero tiene algunas particularidades que pueden resultar confusas para algunos usuarios, aunque las explicaremos en detalle a continuación. Solo necesitamos establecer algunas credenciales y dependencias básicas.

Debido a los requisitos actuales de dependencias relacionadas con la firma, el exchange solo está disponible en Python y JavaScript. El soporte para lenguajes adicionales se introducirá una vez que las dependencias necesarias hayan sido portadas.


## Requisitos de credenciales

DyDx requiere uno de los siguientes:
- `privateKey`: la clave privada l1 (hex) usada en dydx, o puedes establecer el mnemónico l2 en las opciones
- `mnemonic` en `exchange.options`: las 24 palabras para recuperar tu clave privada l2, puedes encontrarlas en la interfaz web

Ejemplo

```python
dydx = ccxt.dydx({
	'privateKey': 'XXXXXXX',
})

# or
dydx = ccxt.dydx({
	'options': {
		'mnemonic': 'test test ...',
	}
})
```

### Requisitos de dependencias

DyDx requiere una dependencia adicional para usuarios de Python. Antes de usarlo, necesitas instalar pycryptodom localmente.

```bash
$ pip3 install pycryptodom
```


Además, protobuf también es necesario, pero no es una dependencia directa de CCXT. Necesitarás instalarlo manualmente:

```
npm install protobufjs // javascript/typescript
pip install "protobuf==5.29.5" // python
```

### Uso

El uso es en gran medida consistente con otros exchanges, aunque ciertos comportamientos difieren.

Por ejemplo, aunque las órdenes se pueden colocar normalmente, cancelar una orden en dYdX no usa el orderId tradicional. En cambio, dYdX requiere campos adicionales como:

- clientOrderId, no el orderId
- orderFlags (0 para órdenes de mercado y GTT no limitadas, 64 para órdenes GTT limitadas y 32 para órdenes condicionales), ccxt asume 64 como predeterminado
- goodTillBlockTimeInSeconds (requerido para órdenes a largo plazo y condicionales; CCXT asume un valor predeterminado de 30 días)
- subAccountId, ccxt asume 0 como predeterminado

CCXT proporciona valores predeterminados razonables para los casos de uso más comunes; sin embargo, es posible que necesites anular estos valores (usando params u opciones) según tus requisitos específicos.

### ¿Cómo usar el exchange GRVT en CCXT?

GRVT funciona de manera similar a cualquier otro DEX de CCXT y solo requiere la clave privada l1 de la billetera.

Un ejemplo de cómo instanciar el exchange GRVT:

```
exchange = ccxt.grvt({
	'privateKey': 'XXXXXXX', // the l1 private key (hex)
})
```
Nota: Los usuarios que se registraron por correo electrónico tienen su billetera impulsada por Privy (la solución de billetera integrada de GRVT). Para exportar la clave privada:

1. Ve a https://home.privy.io
2. Inicia sesión con el mismo correo electrónico/cuenta de Google usado para registrarse en GRVT
3. Desde allí, puedes exportar la clave privada

*(Si necesitas ayuda, puedes visitar https://support.privy.io)*

CCXT también es un constructor en GRVT, lo que significa que de forma predeterminada los usuarios pagarán 1bps (0.01%) extra por usarlo a través de CCXT, sin embargo esta tarifa es totalmente opcional y puede deshabilitarse proporcionando la opción `builderFee: False` en las opciones. Sin embargo, tu contribución es muy apreciada.

```
exchange.options['builderFee'] = False
```
