var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _EventPayload_listener;
/**
 *  Events allow for applications to use the observer pattern, which
 *  allows subscribing and publishing events, outside the normal
 *  execution paths.
 *
 *  @_section api/utils/events:Events  [about-events]
 */
import { defineProperties } from "./properties.js";
/**
 *  When an [[EventEmitterable]] triggers a [[Listener]], the
 *  callback always ahas one additional argument passed, which is
 *  an **EventPayload**.
 */
export class EventPayload {
    /**
     *  Create a new **EventPayload** for %%emitter%% with
     *  the %%listener%% and for %%filter%%.
     */
    constructor(emitter, listener, filter) {
        _EventPayload_listener.set(this, void 0);
        __classPrivateFieldSet(this, _EventPayload_listener, listener, "f");
        defineProperties(this, { emitter, filter });
    }
    /**
     *  Unregister the triggered listener for future events.
     */
    async removeListener() {
        if (__classPrivateFieldGet(this, _EventPayload_listener, "f") == null) {
            return;
        }
        await this.emitter.off(this.filter, __classPrivateFieldGet(this, _EventPayload_listener, "f"));
    }
}
_EventPayload_listener = new WeakMap();
