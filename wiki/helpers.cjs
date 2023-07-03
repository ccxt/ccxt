const cache = {}

exports.getFragment = function (func) {
    // this function allows for links with the same name
    // and caches the link so we can regenerate the same id
    const { id, name } = func
    const lower = name.toLowerCase ()
    if (!(id in cache)) {
        cache[lower] = cache[lower] || 0
        cache[id] = cache[lower]++
    }
    const part = (cache[id] > 1) ? '-' + cache[id] : ''
    return lower + part
}

exports.cleanNames = function (names) {
    return names.map (name => name.replace ('Array.', 'Array'))
}
