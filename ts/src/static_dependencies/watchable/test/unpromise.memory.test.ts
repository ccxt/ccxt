import { describe, test, expect, vi } from "vitest";

import "expose-gc";

import { sleep } from "./util";

import { Unpromise } from "../src/unpromise";

const { gc } = global;
if (typeof gc === "undefined") {
  throw new Error("Test suite requires --expose-gc");
}

describe("Unpromise garbage collection", () => {
  test("Unpromise collected when corresponding promise out of scope", async () => {
    function createScopedPromises() {
      const promise = sleep(1);
      const unpromise = Unpromise.proxy(promise);
      return {
        unpromiseRef: new WeakRef(unpromise),
      };
    }
    const { unpromiseRef } = createScopedPromises();

    expect(typeof unpromiseRef.deref()).not.toBe("undefined");

    await vi.waitFor(() => {
      gc();
      expect(typeof unpromiseRef.deref()).toBe("undefined");
    });
  });

  test("SubscribedPromise collected when corresponding promise out of scope", async () => {
    function createScopedPromises() {
      const promise = sleep(1);
      const unpromise = Unpromise.proxy(promise);
      const subscribedPromise = unpromise.subscribe();
      return {
        subscribedPromiseRef: new WeakRef(subscribedPromise),
      };
    }
    const { subscribedPromiseRef } = createScopedPromises();

    expect(typeof subscribedPromiseRef.deref()).not.toBe("undefined");

    await vi.waitFor(() => {
      gc();
      expect(typeof subscribedPromiseRef.deref()).toBe("undefined");
    });
  });
});
