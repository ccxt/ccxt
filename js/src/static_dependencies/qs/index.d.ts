declare namespace _default {
    export { formats };
    export { parse };
    export { stringify };
}
export default _default;
export namespace formats {
    export { defaultFormat as default };
    export { formatters };
    export { RFC1738 };
    export { RFC3986 };
}
import parse from "./parse.js";
import stringify from "./stringify.js";
import defaultFormat from "./formats.js";
import { formatters } from "./formats.js";
import { RFC1738 } from "./formats.js";
import { RFC3986 } from "./formats.js";
export { parse, stringify };
