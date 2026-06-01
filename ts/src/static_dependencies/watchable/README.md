# Unpromise: Proxy promises for unsubscription

Javascript's built-in implementation of
[Promise.race](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)
and
[Promise.any](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)
have a bug/feature that leads to
[uncontrollable memory leaks](https://github.com/nodejs/node/issues/17469#issuecomment-349794909).
See the `Typical Problem Case` below for reference.

The Memory leaks are fixed by using @watchable/unpromise.

In general the `Promise` API doesn't allow for an unsubscription model. The
`@watchable/unpromise` package wraps individual promises to provide an
unsubscribe method. It uses this approach to provide safe implementations of
`Unpromise.race` and `Unpromise.any`. However, the ability to unsubscribe
Promises may be useful for other cases where the Promise reference chains (and
therefore memory leaks) are otherwise out of your control.

# Usage

Substitute `Unpromise.race` or `Unpromise.any` in place of `Promise.race` and
`Promise.any`...

```ts
import { Unpromise } from "@watchable/unpromise";

const raceResult = await Unpromise.race([taskPromise, interruptPromise]);

const anyResult = await Unpromise.any([taskPromise, interruptPromise]);
```

Advanced users exploring other async/await patterns should consider
`Unpromise.proxy()` or `Unpromise.resolve()`. Read more at the
[API docs](https://watchable.dev/api/modules/_watchable_unpromise.html).

## Install

```zsh
npm install @watchable/unpromise
```

## Import OR Require

```javascript
import { Unpromise } from "@watchable/unpromise"; // esm build
const { Unpromise } = require("@watchable/unpromise"); // commonjs build
```

## Under the hood: Step 1 - proxy

The library manages a single lazy-created `ProxyPromise` for you that shadows
any `Promise`. For every native Promise there is only one `ProxyPromise`. It
remains cached in a WeakMap for the lifetime of the Promise itself. On creation,
the shadow `ProxyPromise` adds handlers to the native Promise's `.then()` and
`.catch()` just once. This eliminates memory leaks from adding multiple
handlers.

```ts
const proxyPromise = Unpromise.proxy(promise);
```

As an alternative if you are constructing your own `Promise`, you can use
`Unpromise` to create a `ProxyPromise` right from the beginning...

```ts
const proxyPromise = new Unpromise((resolve) => setTimeout(resolve, 1000));
```

## Under the hood: Step 2 - subscribe

Once you have a `ProxyPromise` you can call `proxyPromise.then()`
`proxyPromise.catch()` or `proxyPromise.finally()` in the normal way. A promise
returned by these methods is a `SubscribedPromise`. It behaves like any normal
`Promise` except it has an `unsubscribe()` method that will remove its handlers
from the `ProxyPromise`.

## Under the hood: Step 3 - unsubscribe

Finally you must call `subscribedPromise.unsubscribe()` before you release the
promise reference. This eliminates memory leaks from subscription and
(therefore) from reference retention.

## Under the hood: Simple Shortcuts

Using `Unpromise.race()` or `Unpromise.any()` is recommended. Using these static
methods, the proxying, subscribing and unsubscribing steps are handled behind
the scenes for you automatically.

Alternatively `const subscribedPromise = Unpromise.resolve(promise)` completes
both Step 1 and Step 2 for you (it's equivalent to
`const subscribedPromise = Unpromise.proxy(promise).subscribe()` ). Then later
you can call `subscribedPromise.unsubscribe()` to tidy up.

## Typical Problem Case

In the example app below, we have a long-lived Promise that we await every time
around the loop with `Promise.race(...)`. We use `race` so that we can respond
to _**either**_ the task result _**or**_ the keyboard interrupt.

Unfortunately this leads to a memory leak. Every call to `Promise.race` creates
an unbreakable reference chain from the `interruptPromise` to the `taskPromise`
(and its task result), and these references can never be garbage-collected,
leading to an out of memory error.

```js
const interruptPromise = new Promise((resolve) => {
  process.once("SIGINT", () => resolve("interrupted"));
});

async function run() {
  let count = 0;
  for (; ; count++) {
    const taskPromise = new Promise((resolve) => {
      // an imaginary task
      setImmediate(() => resolve("task_result"));
    });
    const result = await Promise.race([taskPromise, interruptPromise]);
    if (result === "interrupted") {
      break;
    }
    console.log(`Completed ${count} tasks`);
  }
  console.log(`Interrupted by user`);
}

run();
```
