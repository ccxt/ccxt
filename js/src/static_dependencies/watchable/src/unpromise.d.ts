import type { PromiseExecutor, PromiseWithResolvers, ProxyPromise, SubscribedPromise } from "./types";
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
export declare class Unpromise<T> implements ProxyPromise<T> {
    /** INSTANCE IMPLEMENTATION */
    /** The promise shadowed by this Unpromise<T>  */
    protected readonly promise: Promise<T> | PromiseLike<T>;
    /** Promises expecting eventual settlement (unless unsubscribed first). This list is deleted
     * after the original promise settles - no further notifications will be issued. */
    protected subscribers: ReadonlyArray<PromiseWithResolvers<T>> | null;
    /** The Promise's settlement (recorded when it fulfils or rejects). This is consulted when
     * calling .subscribe() .then() .catch() .finally() to see if an immediately-resolving Promise
     * can be returned, and therefore subscription can be bypassed. */
    protected settlement: PromiseSettledResult<T> | null;
    /** Constructor accepts a normal Promise executor function like `new
     * Unpromise((resolve, reject) => {...})` or accepts a pre-existing Promise
     * like `new Unpromise(existingPromise)`. Adds `.then()` and `.catch()`
     * handlers to the Promise. These handlers pass fulfilment and rejection
     * notifications to downstream subscribers and maintains records of value
     * or error if the Promise ever settles. */
    protected constructor(promise: Promise<T>);
    protected constructor(promise: PromiseLike<T>);
    protected constructor(executor: PromiseExecutor<T>);
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
    subscribe(): SubscribedPromise<T>;
    /** STANDARD PROMISE METHODS (but returning a SubscribedPromise) */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): SubscribedPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): SubscribedPromise<T | TResult>;
    finally(onfinally?: (() => void) | null | undefined): SubscribedPromise<T>;
    /** TOSTRING SUPPORT */
    readonly [Symbol.toStringTag] = "Unpromise";
    /** Unpromise STATIC METHODS */
    /** Create or Retrieve the proxy Unpromise (a re-used Unpromise for the VM lifetime
     * of the provided Promise reference) */
    static proxy<T>(promise: PromiseLike<T>): ProxyPromise<T>;
    /** Create and store an Unpromise keyed by an original Promise. */
    protected static createSubscribablePromise<T>(promise: PromiseLike<T>): Unpromise<T>;
    /** Retrieve a previously-created Unpromise keyed by an original Promise. */
    protected static getSubscribablePromise<T>(promise: PromiseLike<T>): ProxyPromise<T>;
    /** Promise STATIC METHODS */
    /** Lookup the Unpromise for this promise, and derive a SubscribedPromise from
     * it (that can be later unsubscribed to eliminate Memory leaks) */
    static resolve<T>(value: T | PromiseLike<T>): SubscribedPromise<Awaited<T>>;
    /** Perform Promise.any() via SubscribedPromises, then unsubscribe them.
     * Equivalent to Promise.any but eliminates memory leaks from long-lived
     * promises accumulating .then() and .catch() subscribers. */
    static any<T extends readonly unknown[] | []>(values: T): Promise<Awaited<T[number]>>;
    /** Perform Promise.race via SubscribedPromises, then unsubscribe them.
     * Equivalent to Promise.race but eliminates memory leaks from long-lived
     * promises accumulating .then() and .catch() subscribers. */
    static race<T extends readonly unknown[] | []>(values: T): Promise<Awaited<T[number]>>;
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
    static raceReferences<P extends Promise<unknown>>(promises: readonly P[]): Promise<readonly [P]>;
}
/** Promises a 1-tuple containing the original promise when it resolves. Allows
 * awaiting the eventual Promise ***reference*** (easy to destructure and
 * exactly compare with ===). Avoids resolving to the Promise ***value*** (which
 * may be ambiguous and therefore hard to identify as the winner of a race).
 * You can call unsubscribe on the Promise to mitigate memory leaks.
 * */
export declare function resolveSelfTuple<P extends Promise<unknown>>(promise: P): SubscribedPromise<readonly [P]>;
