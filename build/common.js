"use strict";

function regexAll (text, array) {
    for (let i in array) {
        let regex = array[i][0]
        regex = typeof regex === 'string' ? new RegExp (regex, 'g') : new RegExp (regex)
        text = text.replace (regex, array[i][1])
    }
    return text
}

module.exports = {
    regexAll,
}
