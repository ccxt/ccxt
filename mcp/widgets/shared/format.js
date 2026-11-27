const Format = {
  quantity: new Intl.NumberFormat(undefined, { maximumSignificantDigits: 21 }),

  capitalize(text) {
    return text[0].toUpperCase() + text.slice(1);
  },

  splitSymbol(symbol) {
    return (symbol ?? '').split(':')[0].split('/');
  },

  joinPresent(parts, separator) {
    return parts.filter(Boolean).join(separator);
  },
};
