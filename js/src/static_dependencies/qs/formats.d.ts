declare var defaultFormat: string;
declare var formatters: {
    RFC1738: (value: any) => string;
    RFC3986: (value: any) => any;
};
declare var RFC1738: string;
declare var RFC3986: string;
export default defaultFormat;
export { formatters, RFC1738, RFC3986 };
