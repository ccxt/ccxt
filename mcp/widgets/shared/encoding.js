const Encoding = {
  toBase64(bytes) {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)));
  },

  fromBase64(text) {
    return Uint8Array.from(atob(text), (character) => character.charCodeAt(0));
  },

  toHex(bytes) {
    return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
  },

  toUtf8(text) {
    return new TextEncoder().encode(text);
  },

  fromUtf8(bytes) {
    return new TextDecoder().decode(bytes);
  },
};
