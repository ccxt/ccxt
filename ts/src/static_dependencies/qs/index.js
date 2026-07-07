import stringify from './stringify.js';
import parse from './parse.js';
import defaultFormat, { formatters, RFC1738, RFC3986 } from './formats.js';

var formats = {
    default: defaultFormat,
    formatters: formatters,
    RFC1738: RFC1738,
    RFC3986: RFC3986
};

export {
    formats,
    parse,
    stringify
};

export default {
    formats: formats,
    parse: parse,
    stringify: stringify
};
