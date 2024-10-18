/* eslint-disable @typescript-eslint/promise-function-async */
import { describe, test, expect } from "vitest";
import { Unpromise } from "../src/unpromise";

function sleep(delayMs: number) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function createComplianceSuite(options: {
  wrapper: <T>(promise: Promise<T>) => Promise<T>;
  wrapperName: string;
  wrapperDescription: string;
}) {
  const { wrapper, wrapperName, wrapperDescription } = options;
  describe(`${wrapperDescription} : Promise<T> compliance`, () => {
    test(`${wrapperName} resolves (subscribed)`, async () => {
      // create Unpromise immediately (don't give promise a chance to settle)
      const wrapped = wrapper(sleep(1).then(() => "foo"));
      // should resolve like CONTROL
      expect(await wrapped).toBe("foo");
    });

    test(`${wrapperName} resolves (settled)`, async () => {
      // create promise
      const promise = sleep(1).then(() => "foo");
      // allow it to settle
      await promise;
      // create Unpromise from settled promise
      const wrapped = wrapper(promise);
      // should resolve like CONTROL
      expect(await wrapped).toBe("foo");
    });

    test(`${wrapperName} rejects (subscribed)`, async () => {
      // create Unpromise immediately (without underlying promise having time to settle)
      const unpromise = wrapper(
        sleep(1).then(() => {
          throw new Error("bar");
        })
      );

      try {
        await unpromise;
      } catch (error) {
        // should reject like CONTROL
        expect(error).toEqual(new Error("bar"));
      }
    });

    test(`${wrapperName} rejects (settled)`, async () => {
      // create promise
      const promise = sleep(1).then(() => {
        throw new Error("bar");
      });

      // allow it to settle
      try {
        await promise;
      } catch (error) {
        // ignore error
      }

      // then create Unpromise
      const unpromise = wrapper(promise);

      try {
        await unpromise;
      } catch (error) {
        // should reject like CONTROL
        expect(error).toEqual(new Error("bar"));
      }
    });

    test(`${wrapperName} finally - then condition (subscribed)`, async () => {
      let finallyCalled = false;
      try {
        await wrapper(sleep(1));
      } catch (error) {
        // do nothing - error is expected
      } finally {
        finallyCalled = true;
      }
      expect(finallyCalled).toBe(true);
    });

    test(`${wrapperName} finally - catch condition (subscribed)`, async () => {
      let finallyCalled = false;
      try {
        await wrapper(
          sleep(1).then(() => {
            throw new Error("bar");
          })
        );
      } catch (error) {
        // do nothing - error is expected
      } finally {
        finallyCalled = true;
      }
      expect(finallyCalled).toBe(true);
    });

    test(`${wrapperName} finally - then condition (settled)`, async () => {
      // create promise
      const promise = sleep(1);

      // allow promise to settle
      await promise;

      let finallyCalled = false;
      try {
        await wrapper(promise);
      } catch (error) {
        // do nothing - error is expected
      } finally {
        finallyCalled = true;
      }
      expect(finallyCalled).toBe(true);
    });

    test(`${wrapperName} finally - catch condition (settled)`, async () => {
      const promise = sleep(1).then(() => {
        throw new Error("bar");
      });

      try {
        await promise;
      } catch (error) {
        // error is expected
      }

      let finallyCalled = false;
      try {
        await wrapper(promise);
      } catch (error) {
        // do nothing - error is expected
      } finally {
        finallyCalled = true;
      }
      expect(finallyCalled).toBe(true);
    });
  });
}

describe("Unpromise compliance", () => {
  createComplianceSuite({
    wrapper: <T>(promise: Promise<T>) => promise,
    wrapperDescription: "Platform Native Promise (CONTROL)",
    wrapperName: "Promise<T>",
  });

  createComplianceSuite({
    /* Unpromise.proxy(promise) is a 'memoized' call to new Unpromise(promise) */
    wrapper: <T>(promise: Promise<T>) => Unpromise.proxy(promise),
    wrapperDescription: "Weakmap-cached Unpromise",
    wrapperName: "Unpromise<T>",
  });

  createComplianceSuite({
    /* Unpromise.resolve(promise) is equivalent to Unpromise.proxy(promise).subscribe() */
    wrapper: <T>(promise: Promise<T>) => Unpromise.resolve(promise),
    wrapperDescription: "Promise<T> subscribed to Unpromise",
    wrapperName: "SubscribedPromise<T>",
  });
});
