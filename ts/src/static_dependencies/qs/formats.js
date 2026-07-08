var replace = String.prototype.replace;
var percentTwenties = /%20/g;

var defaultFormat = 'RFC3986';
var formatters = {
    RFC1738: function (value) {
        return replace.call(value, percentTwenties, '+');
    },
    RFC3986: function (value) {
        return value;
    }
};
var RFC1738 = 'RFC1738';
var RFC3986 = 'RFC3986';

export default defaultFormat;
export {
    formatters,
    RFC1738,
    RFC3986
};
