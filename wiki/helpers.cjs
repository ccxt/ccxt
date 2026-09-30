var arrayify = require('array-back')

const cache = {}

exports.getFragment = function (func) {
    // this function allows for links with the same name
    // and caches the link so we can regenerate the same id
    /*
    const { id, name, exchange } = func
    const selector = exchange ? exchange + name : name
    const lower = selector.toLowerCase ()
    if (exchange && !(id in cache)) {
        cache[lower] = cache[lower] || 0
        cache[id] = cache[lower]++
    }
    const part = (cache[id] >= 1) ? '-' + cache[id] : ''
    return lower + part
    */
    return func.name.toLowerCase ()
}

exports.cleanNames = function (names) {
    if (!names) return []
    return names.map (name => name.replace (/Array./g, 'Array'))
}

// builds the method signature param list, marking optional params with a trailing "?"
// e.g. createOrder (symbol, type, side, amount, price?, params?)
// (nested params like params.triggerPrice are filtered out)
function methodSig () {
    const args = arrayify(this.params).filter(function (param) {
      return param.name && !/\./.test(param.name)
    })
    return args.map (arg => arg.optional ? arg.name + '?' : arg.name).join (', ')
}

exports.methodSig = methodSig
