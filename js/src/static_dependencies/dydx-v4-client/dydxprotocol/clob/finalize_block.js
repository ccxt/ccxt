import { ClobPair } from "./clob_pair.js";
import _m0 from "protobufjs/minimal.js";
function createBaseClobStagedFinalizeBlockEvent() {
    return {
        createClobPair: undefined
    };
}
export const ClobStagedFinalizeBlockEvent = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.createClobPair !== undefined) {
            ClobPair.encode(message.createClobPair, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseClobStagedFinalizeBlockEvent();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.createClobPair = ClobPair.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseClobStagedFinalizeBlockEvent();
        message.createClobPair = object.createClobPair !== undefined && object.createClobPair !== null ? ClobPair.fromPartial(object.createClobPair) : undefined;
        return message;
    }
};
