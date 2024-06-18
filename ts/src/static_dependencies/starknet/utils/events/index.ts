import {
  Abi,
  AbiEnums,
  AbiEvents,
  AbiStructs,
  Cairo1Event,
  EventAbi,
  LegacyEvent,
  ParsedEvent,
  ParsedEvents,
  RPC,
} from '../../types';
import responseParser from '../calldata/responseParser';
import { starkCurve } from '../ec';
import { addHexPrefix, utf8ToArray } from '../encode.js';

/**
 * Retrieves the events from the given ABI.
 *
 * @param {Abi} abi - The ABI to extract events from.
 * @return {AbiEvents} - An object containing the extracted events.
 */
export function getAbiEvents(abi: Abi): AbiEvents {
  return abi
    .filter((abiEntry) => abiEntry.type === 'event' && (abiEntry.size || abiEntry.kind !== 'enum'))
    .reduce((acc, abiEntry) => {
      const entryName = abiEntry.name.slice(abiEntry.name.lastIndexOf(':') + 1);
      const abiEntryMod = { ...abiEntry };
      abiEntryMod.name = entryName;
      return {
        ...acc,
        [addHexPrefix(starkCurve.keccak(utf8ToArray(entryName)).toString(16))]: abiEntryMod,
      };
    }, {});
}

/**
 * Parse raw events and structure them into response object based on a contract structs and defined events
 * @param providerReceivedEvents ProviderEvent[] - Array of raw events
 * @param abiEvents AbiEvents - Events defined in the abi
 * @param abiStructs AbiStructs - Structs defined in the abi
 * @param abiEnums
 * @return ParsedEvents - parsed events corresponding to the abi
 */
export function parseEvents(
  providerReceivedEvents: RPC.Event[],
  abiEvents: AbiEvents,
  abiStructs: AbiStructs,
  abiEnums: AbiEnums
): ParsedEvents {
  const ret = providerReceivedEvents.flat().reduce((acc, recEvent) => {
    const abiEvent: EventAbi = abiEvents[recEvent.keys[0]];
    if (!abiEvent) {
      return acc;
    }

    // Create our final event object
    const parsedEvent: ParsedEvent = {};
    parsedEvent[abiEvent.name] = {};
    // Remove the event's name hashed from the keys array
    recEvent.keys.shift();

    const keysIter = recEvent.keys[Symbol.iterator]();
    const dataIter = recEvent.data[Symbol.iterator]();

    const abiEventKeys =
      (abiEvent as Cairo1Event).members?.filter((it) => it.kind === 'key') ||
      (abiEvent as LegacyEvent).keys;
    const abiEventData =
      (abiEvent as Cairo1Event).members?.filter((it) => it.kind === 'data') ||
      (abiEvent as LegacyEvent).data;

    abiEventKeys.forEach((key) => {
      parsedEvent[abiEvent.name][key.name] = responseParser(
        keysIter,
        key,
        abiStructs,
        abiEnums,
        parsedEvent[abiEvent.name]
      );
    });

    abiEventData.forEach((data) => {
      parsedEvent[abiEvent.name][data.name] = responseParser(
        dataIter,
        data,
        abiStructs,
        abiEnums,
        parsedEvent[abiEvent.name]
      );
    });
    acc.push(parsedEvent);
    return acc;
  }, [] as ParsedEvents);
  return ret;
}
