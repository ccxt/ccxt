import stringify from './stringify.js';
import parse from './parse.js';
declare var formats: {
    default: string;
    formatters: {
        RFC1738: (value: any) => string;
        RFC3986: (value: any) => any;
    };
    RFC1738: string;
    RFC3986: string;
};
export { formats, parse, stringify };
declare const _default: {
    formats: {
        default: string;
        formatters: {
            RFC1738: (value: any) => string;
            RFC3986: (value: any) => any;
        };
        RFC1738: string;
        RFC3986: string;
    };
    parse: typeof parse;
    stringify: typeof stringify;
};
export default _default;
