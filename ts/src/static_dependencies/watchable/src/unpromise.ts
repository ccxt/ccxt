/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/promise-function-async */

import type {
  PromiseExecutor,
  PromiseWithResolvers,
  ProxyPromise,
  SubscribedPromise,
} from "./types";

/** Memory safe (weakmapped) cache of the ProxyPromise for each Promise,
 * which is retained for the lifetime of the original Promise.
 */
const subscribableCache = new WeakMap<
  PromiseLike<unknown>,
  ProxyPromise<unknown>
>();

/** A NOOP function allowing a consistent interface for settled
 * SubscribedPromises (settled promises are not subscribed - they resolve
 * immediately). */
const NOOP = () => {};

/**
 * Every `Promise<T>` can be shadowed by a single `ProxyPromise<T>`. It is
 * created once, cached and reused throughout the lifetime of the Promise. Get a
 * Promise's ProxyPromise using `Unpromise.proxy(promise)`.
 *
 * The `ProxyPromise<T>` attaches handlers to the original `Promise<T>`
 * `.then()` and `.catch()` just once. Promises derived from it use a
 * subscription- (and unsubscription-) based mechanism that monitors these
 * handlers.
 *
 * Every time you call `.subscribe()`, `.then()` `.catch()` or `.finally()` on a
 * `ProxyPromise<T>` it returns a `SubscribedPromise<T>` having an additional
 * `unsubscribe()` method. Calling `unsubscribe()` detaches reference chains
 * from the original, potentially long-lived Promise, eliminating memory leaks.
 *
 * This approach can eliminate the memory leaks that otherwise come about from
 * repeated `race()` or `any()` calls invoking `.then()` and `.catch()` multiple
 * times on the same long-lived native Promise (subscriptions which can never be
 * cleaned up).
 *
 * `Unpromise.race(promises)` is a reference implementation of `Promise.race`
 * avoiding memory leaks when using long-lived unsettled Promises.
 *
 * `Unpromise.any(promises)` is a reference implementation of `Promise.any`
 * avoiding memory leaks when using long-lived unsettled Promises.
 *
 * `Unpromise.resolve(promise)` returns an ephemeral `SubscribedPromise<T>` for
 * any given `Promise<T>` facilitating arbitrary async/await patterns. Behind
 * the scenes, `resolve` is implemented simply as
 * `Unpromise.proxy(promise).subscribe()`. Don't forget to call `.unsubscribe()`
 * to tidy up!
 *
 */
export class Unpromise<T> implements ProxyPromise<T> {
  /** INSTANCE IMPLEMENTATION */

  /** The promise shadowed by this Unpromise<T>  */
  protected readonly promise: Promise<T> | PromiseLike<T>;

  /** Promises expecting eventual settlement (unless unsubscribed first). This list is deleted
   * after the original promise settles - no further notifications will be issued. */
  protected subscribers: ReadonlyArray<PromiseWithResolvers<T>> | null = [];

  /** The Promise's settlement (recorded when it fulfils or rejects). This is consulted when
   * calling .subscribe() .then() .catch() .finally() to see if an immediately-resolving Promise
   * can be returned, and therefore subscription can be bypassed. */
  protected settlement: PromiseSettledResult<T> | null = null;

  /** Constructor accepts a normal Promise executor function like `new
   * Unpromise((resolve, reject) => {...})` or accepts a pre-existing Promise
   * like `new Unpromise(existingPromise)`. Adds `.then()` and `.catch()`
   * handlers to the Promise. These handlers pass fulfilment and rejection
   * notifications to downstream subscribers and maintains records of value
   * or error if the Promise ever settles. */
  protected constructor(promise: Promise<T>);
  protected constructor(promise: PromiseLike<T>);
  protected constructor(executor: PromiseExecutor<T>);
  protected constructor(arg: Promise<T> | PromiseLike<T> | PromiseExecutor<T>) {
    // handle either a Promise or a Promise executor function
    if (typeof arg === "function") {
      this.promise = new Promise(arg);
    } else {
      this.promise = arg;
    }

    // subscribe for eventual fulfilment and rejection

    // handle PromiseLike objects (that at least have .then)
    const thenReturn = this.promise.then((value) => {
      // atomically record fulfilment and detach subscriber list
      const { subscribers } = this;
      this.subscribers = null;
      this.settlement = {
        status: "fulfilled",
        value,
      };
      // notify fulfilment to subscriber list
      subscribers?.forEach(({ resolve }) => {
        resolve(value);
      });
    });

    // handle Promise (that also have a .catch behaviour)
    if ("catch" in thenReturn) {
      thenReturn.catch((reason) => {
        // atomically record rejection and detach subscriber list
        const { subscribers } = this;
        this.subscribers = null;
        this.settlement = {
          status: "rejected",
          reason,
        };
        // notify rejection to subscriber list
        subscribers?.forEach(({ reject }) => {
          reject(reason);
        });
      });
    }
  }

  /** Create a promise that mitigates uncontrolled subscription to a long-lived
   * Promise via .then() and .catch() - otherwise a source of memory leaks.
   *
   * The returned promise has an `unsubscribe()` method which can be called when
   * the Promise is no longer being tracked by application logic, and which
   * ensures that there is no reference chain from the original promise to the
   * new one, and therefore no memory leak.
   *
   * If original promise has not yet settled, this adds a new unique promise
   * that listens to then/catch events, along with an `unsubscribe()` method to
   * detach it.
   *
   * If original promise has settled, then creates a new Promise.resolve() or
   * Promise.reject() and provided unsubscribe is a noop.
   *
   * If you call `unsubscribe()` before the returned Promise has settled, it
   * will never settle.
   */
  subscribe(): SubscribedPromise<T> {
    // in all cases we will combine some promise with its unsubscribe function
    let promise: Promise<T>;
    let unsubscribe: () => void;

    const { settlement } = this;
    if (settlement === null) {
      // not yet settled - subscribe new promise. Expect eventual settlement
      if (this.subscribers === null) {
        // invariant - it is not settled, so it must have subscribers
        throw new Error("Unpromise settled but still has subscribers");
      }
      const subscriber = withResolvers<T>();
      this.subscribers = listWithMember(this.subscribers, subscriber);
      promise = subscriber.promise;
      unsubscribe = () => {
        if (this.subscribers !== null) {
          this.subscribers = listWithoutMember(this.subscribers, subscriber);
        }
      };
    } else {
      // settled - don't create subscribed promise. Just resolve or reject
      const { status } = settlement;
      if (status === "fulfilled") {
        promise = Promise.resolve(settlement.value);
      } else {
        promise = Promise.reject(settlement.reason);
      }
      unsubscribe = NOOP;
    }

    // extend promise signature with the extra method
    return Object.assign(promise, { unsubscribe });
  }

  /** STANDARD PROMISE METHODS (but returning a SubscribedPromise) */

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined
  ): SubscribedPromise<TResult1 | TResult2> {
    const subscribed = this.subscribe();
    const { unsubscribe } = subscribed;
    return Object.assign(subscribed.then(onfulfilled, onrejected), {
      unsubscribe,
    });
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | null
      | undefined
  ): SubscribedPromise<T | TResult> {
    const subscribed = this.subscribe();
    const { unsubscribe } = subscribed;
    return Object.assign(subscribed.catch(onrejected), {
      unsubscribe,
    });
  }

  finally(onfinally?: (() => void) | null | undefined): SubscribedPromise<T> {
    const subscribed = this.subscribe();
    const { unsubscribe } = subscribed;
    return Object.assign(subscribed.finally(onfinally), {
      unsubscribe,
    });
  }

  /** TOSTRING SUPPORT */

  readonly [Symbol.toStringTag] = "Unpromise";

  /** Unpromise STATIC METHODS */

  /** Create or Retrieve the proxy Unpromise (a re-used Unpromise for the VM lifetime
   * of the provided Promise reference) */
  static proxy<T>(promise: PromiseLike<T>): ProxyPromise<T> {
    const cached = Unpromise.getSubscribablePromise(promise);
    return typeof cached !== "undefined"
      ? cached
      : Unpromise.createSubscribablePromise(promise);
  }

  /** Create and store an Unpromise keyed by an original Promise. */
  protected static createSubscribablePromise<T>(promise: PromiseLike<T>) {
    const created = new Unpromise<T>(promise);
    subscribableCache.set(promise, created as Unpromise<unknown>); // resolve promise to unpromise
    subscribableCache.set(created, created as Unpromise<unknown>); // resolve the unpromise to itself
    return created;
  }

  /** Retrieve a previously-created Unpromise keyed by an original Promise. */
  protected static getSubscribablePromise<T>(promise: PromiseLike<T>) {
    return subscribableCache.get(promise) as ProxyPromise<T> | undefined;
  }

  /** Promise STATIC METHODS */

  /** Lookup the Unpromise for this promise, and derive a SubscribedPromise from
   * it (that can be later unsubscribed to eliminate Memory leaks) */
  static resolve<T>(value: T | PromiseLike<T>) {
    const promise: PromiseLike<T> =
      typeof value === "object" &&
      value !== null &&
      "then" in value &&
      typeof value.then === "function"
        ? value
        : Promise.resolve(value);
    return Unpromise.proxy(promise).subscribe() as SubscribedPromise<
      Awaited<T>
    >;
  }

  /** Perform Promise.any() via SubscribedPromises, then unsubscribe them.
   * Equivalent to Promise.any but eliminates memory leaks from long-lived
   * promises accumulating .then() and .catch() subscribers. */
  static async any<T extends readonly unknown[] | []>(
    values: T
  ): Promise<Awaited<T[number]>>;
  static async any<T>(
    values: Iterable<T | PromiseLike<T>>
  ): Promise<Awaited<T>> {
    const valuesArray = Array.isArray(values) ? values : [...values];
    const subscribedPromises = valuesArray.map(Unpromise.resolve);
    try {
      return await Promise.any(subscribedPromises);
    } finally {
      subscribedPromises.forEach(({ unsubscribe }) => {
        unsubscribe();
      });
    }
  }

  /** Perform Promise.race via SubscribedPromises, then unsubscribe them.
   * Equivalent to Promise.race but eliminates memory leaks from long-lived
   * promises accumulating .then() and .catch() subscribers. */
  static async race<T extends readonly unknown[] | []>(
    values: T
  ): Promise<Awaited<T[number]>>;
  static async race<T>(
    values: Iterable<T | PromiseLike<T>>
  ): Promise<Awaited<T>> {
    const valuesArray = Array.isArray(values) ? values : [...values];
    const subscribedPromises = valuesArray.map(Unpromise.resolve);
    try {
      return await Promise.race(subscribedPromises);
    } finally {
      subscribedPromises.forEach(({ unsubscribe }) => {
        unsubscribe();
      });
    }
  }

  /** Create a race of SubscribedPromises that will fulfil to a single winning
   * Promise (in a 1-Tuple). Eliminates memory leaks from long-lived promises
   * accumulating .then() and .catch() subscribers. Allows simple logic to
   * consume the result, like...
   * ```ts
   * const [ winner ] = await Unpromise.race([ promiseA, promiseB ]);
   * if(winner === promiseB){
   *   const result = await promiseB;
   *   // do the thing
   * }
   * ```
   * */
  static async raceReferences<P extends Promise<unknown>>(
    promises: readonly P[]
  ) {
    // map each promise to an eventual 1-tuple containing itself
    const selfPromises = promises.map(resolveSelfTuple);

    // now race them. They will fulfil to a readonly [P] or reject.
    try {
      return await Promise.race(selfPromises);
    } finally {
      for (const promise of selfPromises) {
        // unsubscribe proxy promises when the race is over to mitigate memory leaks
        promise.unsubscribe();
      }
    }
  }
}

/** Promises a 1-tuple containing the original promise when it resolves. Allows
 * awaiting the eventual Promise ***reference*** (easy to destructure and
 * exactly compare with ===). Avoids resolving to the Promise ***value*** (which
 * may be ambiguous and therefore hard to identify as the winner of a race).
 * You can call unsubscribe on the Promise to mitigate memory leaks.
 * */
export function resolveSelfTuple<P extends Promise<unknown>>(
  promise: P
): SubscribedPromise<readonly [P]> {
  return Unpromise.proxy(promise).then(() => [promise] as const);
}

/** VENDORED (Future) PROMISE UTILITIES */

/** Reference implementation of https://github.com/tc39/proposal-promise-with-resolvers */
function withResolvers<T>(): PromiseWithResolvers<T> {
  let resolve!: PromiseWithResolvers<T>["resolve"];
  let reject!: PromiseWithResolvers<T>["reject"];
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return {
    promise,
    resolve,
    reject,
  };
}

/** IMMUTABLE LIST OPERATIONS */

function listWithMember<T>(arr: readonly T[], member: T): readonly T[] {
  return [...arr, member];
}

function listWithoutIndex<T>(arr: readonly T[], index: number) {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

function listWithoutMember<T>(arr: readonly T[], member: unknown) {
  const index = arr.indexOf(member as T);
  if (index !== -1) {
    return listWithoutIndex(arr, index);
  }
  return arr;
}
