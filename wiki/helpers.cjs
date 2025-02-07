var arrayify = require('array-back')

const cache = {}

exports.getFragment = function (func) {
    // this function allows for links with the same name
    // and caches the link so we can regenerate the same id
    const { id, name, exchange } = func
    const selector = exchange ? exchange + name : name
    const lower = selector.toLowerCase ()
    if (exchange && !(id in cache)) {
        cache[lower] = cache[lower] || 0
        cache[id] = cache[lower]++
    }
    const part = (cache[id] >= 1) ? '-' + cache[id] : ''
    return lower + part
}

exports.cleanNames = function (names) {
    if (!names) return []
    return names.map (name => name.replace (/Array./g, 'Array'))
}

// this method is copied from dmd except for the option params handling
function methodSig () {
    const args = arrayify(this.params).filter(function (param) {
      return param.name && !/\./.test(param.name)
    })
    function firstOptionalIndex (params) {
        let i = 0;
        for (; i < params.length && !(params[i].optional); i++);
        return i
    }
    const names = args.map (arg => arg.name)
    if (args.length) {
        const firstOptional = firstOptionalIndex (args)
        if ((firstOptional > 0) && (args.length > 1)) {
            names[firstOptional - 1] = names[firstOptional - 1] + '['
        } else {
            names[firstOptional] = '[' + names[firstOptional]
        }
        names[names.length - 1] = names[names.length - 1] + ']'
    }
    return names.join (', ')
}

exports.methodSig = methodSig
