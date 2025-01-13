/**
 * Convert JSON string to JSON object
 *
 * NOTE: the String() wrapping is used so the behavior conforms to JSON.parse()
 * which can accept simple data types but is not represented in the default typing
 * @param x JSON string
 */
export declare const parse: (x: string) => any;
/**
 * Convert JSON string to JSON object with all numbers as bigint
 * @param x JSON string
 */
export declare const parseAlwaysAsBig: (x: string) => any;
/**
 * Convert JSON object to JSON string
 *
 * NOTE: the not-null assertion is used so the return type conforms to JSON.stringify()
 * which can also return undefined but is not represented in the default typing
 * json.NumberStringifier[]
 * @returns JSON string
 */
export declare const stringify: (value: unknown, replacer?: any, space?: string | number | undefined, numberStringifiers?: any[] | undefined) => string;
/** @deprecated equivalent to 'stringify', alias will be removed */
export declare const stringifyAlwaysAsBig: (value: unknown, replacer?: any, space?: string | number | undefined, numberStringifiers?: any[] | undefined) => string;
