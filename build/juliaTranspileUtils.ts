// Helper that replaces all regex matches in a string with a replacement (or regex replacer)
// This is a local version of regexAll from the ast-transpiler
function regexAll(input, regex, replacer) {
    if (typeof input !== 'string') return input;
    if (input.indexOf && input.indexOf('snippets') === -1) {
        // replace all occurrences
        return input.replace(regex, typeof replacer === 'string' ? replacer : function(...args){
            // For callbacks
            return replacer.apply(null, args);
        });
    }
    return input;
}

module.exports = { regexAll };
