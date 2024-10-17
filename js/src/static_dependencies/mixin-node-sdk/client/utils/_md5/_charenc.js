const utf8 = {
    // Convert a string to a byte array
    stringToBytes: function (str) {
        return bin.stringToBytes(unescape(encodeURIComponent(str)));
    },
    // Convert a byte array to a string
    bytesToString: function (bytes) {
        return decodeURIComponent(escape(bin.bytesToString(bytes)));
    }
};
// Binary encoding
const bin = {
    // Convert a string to a byte array
    stringToBytes: function (str) {
        for (var bytes = [], i = 0; i < str.length; i++)
            bytes.push(str.charCodeAt(i) & 0xFF);
        return bytes;
    },
    // Convert a byte array to a string
    bytesToString: function (bytes) {
        for (var str = [], i = 0; i < bytes.length; i++)
            str.push(String.fromCharCode(bytes[i]));
        return str.join('');
    }
};
export { utf8, bin };
