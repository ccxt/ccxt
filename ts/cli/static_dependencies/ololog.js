"use strict";

/*  ------------------------------------------------------------------------ */

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _defineEnumerableProperties(obj, descs) { for (var key in descs) { var desc = descs[key]; desc.configurable = desc.enumerable = true; if ("value" in desc) desc.writable = true; Object.defineProperty(obj, key, desc); } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var O = Object,
    StackTracey = require('stacktracey'),
    ansi = require('ansicolor'),
    bullet = require('string.bullet'),
    pipez = require('pipez');

/*  ------------------------------------------------------------------------ */

var _stringify = require('string.ify').configure({
    formatter: function formatter(x, stringify) {

        if (x instanceof Error && !(typeof Symbol !== 'undefined' && x[Symbol.for('String.ify')])) {

            if (stringify.state.depth > 0) return '<Error: ' + x.message + '>'; // prevents unwanted pretty printing for Errors that are properties of complex objects

            var indent = '    ',
                why = stringify.limit((x.message || '').replace(/\r|\n/g, '').trim(), stringify.state.maxErrorMessageLength || 120),
                stack = new StackTracey(x).withSources().asTable(),
                stackIndented = stack.split('\n').map(function (x) {
                return indent + x;
            }).join('\n'),
                isAssertion = 'actual' in x && 'expected' in x,
                type = x.constructor.name || 'Error';

            if (isAssertion) {

                var str = stringify.configure({ maxStringLength: Number.MAX_VALUE, maxDepth: 8 });

                var actual = bullet(indent + 'actual:   ', str(x.actual)),
                    expected = bullet(indent + 'expected: ', str(x.expected));

                if (actual.split('\n').length > 1 || expected.split('\n').length > 1) // if multiline actual/expected, need extra whitespace inbetween
                    actual += '\n';

                return '[' + type + '] ' + why + '\n\n' + ansi.red(actual) + '\n' + ansi.green(expected) + '\n\n' + stackIndented + '\n';
            } else {
                return '[' + type + '] ' + why + '\n\n' + stackIndented + '\n';
            }
        }
    }
});

/*  ------------------------------------------------------------------------ */

var _require = require('printable-characters'),
    isBlank = _require.isBlank,
    blank = _require.blank,
    changeLastNonemptyLine = function changeLastNonemptyLine(lines, fn) {

    for (var i = lines.length - 1; i >= 0; i--) {

        if (i === 0 || !isBlank(lines[i])) {

            lines[i] = fn(lines[i]);
            break;
        }
    }
    return lines;
};

/*  ------------------------------------------------------------------------ */

var log = pipez({

    /*  ------------------------------------------------------------------------ */

    stringify: function stringify(args, cfg) {
        var print = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : cfg.print || _stringify.configure(cfg);
        return args.map(function (arg) {
            return typeof arg === 'string' ? arg : print(arg);
        });
    },

    trim: function trim(tokens, _ref) {
        var _ref$max = _ref.max,
            max = _ref$max === undefined ? undefined : _ref$max;
        return !max ? tokens : tokens.map(function (t) {
            return _stringify.limit(t, max);
        });
    },

    lines: function lines(tokens, _ref2) {
        var _ref2$linebreak = _ref2.linebreak,
            linebreak = _ref2$linebreak === undefined ? '\n' : _ref2$linebreak;


        var lines = [[]];
        var leftPad = [];

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = tokens[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var t = _step.value;

                var _t$split = t.split(linebreak),
                    _t$split2 = _toArray(_t$split),
                    first = _t$split2[0],
                    rest = _t$split2.slice(1);

                lines[lines.length - 1].push(first);
                lines = [].concat(_toConsumableArray(lines), _toConsumableArray(rest.map(function (t) {
                    return t ? [].concat(leftPad, [t]) : [];
                })));

                var pad = blank(!rest.length ? t : rest[rest.length - 1]);

                if (pad) {
                    leftPad.push(pad);
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return lines;
    },

    concat: function concat(lines, _ref3) {
        var _ref3$separator = _ref3.separator,
            separator = _ref3$separator === undefined ? ' ' : _ref3$separator;
        return lines.map(function (tokens) {
            return tokens.join(separator);
        });
    },

    indent: function indent(lines, _ref4) {
        var _ref4$level = _ref4.level,
            level = _ref4$level === undefined ? 0 : _ref4$level,
            _ref4$pattern = _ref4.pattern,
            pattern = _ref4$pattern === undefined ? '\t' : _ref4$pattern;
        return lines.map(function (line) {
            return pattern.repeat(level) + line;
        });
    },

    tag: function tag(lines, _ref5) {
        var _ref5$level = _ref5.level,
            level = _ref5$level === undefined ? '' : _ref5$level,
            _ref5$levelColor = _ref5.levelColor,
            levelColor = _ref5$levelColor === undefined ? {
            'info': ansi.cyan,
            'warn': ansi.yellow,
            'debug': ansi.blue,
            'error': ansi.bright.red } : _ref5$levelColor;
        return bullet((levelColor[level] || function (s) {
            return s;
        })(level.toUpperCase().padStart(6) + '\t'), lines);
    },

    time: function time(lines, _ref6) {
        var _ref6$when = _ref6.when,
            when = _ref6$when === undefined ? new Date() : _ref6$when,
            _ref6$format = _ref6.format,
            format = _ref6$format === undefined ? 'locale' : _ref6$format,
            _ref6$locale = _ref6.locale,
            locale = _ref6$locale === undefined ? [] : _ref6$locale,
            _ref6$options = _ref6.options,
            options = _ref6$options === undefined ? {} : _ref6$options,
            _ref6$print = _ref6.print,
            print = _ref6$print === undefined ? function (when) {
            return ansi.darkGray(format === 'iso' ? when.toISOString() : format === 'locale' ? when.toLocaleString(locale, options) : format === 'utc' ? when.toUTCString() : when.toString()) + '\t';
        } : _ref6$print;
        return bullet(print(when), lines);
    },

    locate: function locate(lines, _ref7) {
        var _ref7$shift = _ref7.shift,
            shift = _ref7$shift === undefined ? 0 : _ref7$shift,
            _ref7$where = _ref7.where,
            where = _ref7$where === undefined ? new StackTracey().clean().at(1 + shift) : _ref7$where,
            _ref7$join = _ref7.join,
            join = _ref7$join === undefined ? function (a, sep, b) {
            return a && b ? a + sep + b : a || b;
        } : _ref7$join,
            _ref7$print = _ref7.print,
            print = _ref7$print === undefined ? function (_ref8) {
            var calleeShort = _ref8.calleeShort,
                _ref8$fileName = _ref8.fileName,
                fileName = _ref8$fileName === undefined ? [] : _ref8$fileName,
                _ref8$line = _ref8.line,
                line = _ref8$line === undefined ? [] : _ref8$line;
            return ansi.darkGray('(' + join(calleeShort, ' @ ', join(fileName, ':', line)) + ')');
        } : _ref7$print;
        return changeLastNonemptyLine(lines, function (line) {
            return join(line, ' ', print(where));
        });
    },

    join: function join(lines, _ref9) {
        var _ref9$linebreak = _ref9.linebreak,
            linebreak = _ref9$linebreak === undefined ? '\n' : _ref9$linebreak;
        return lines.join(linebreak);
    },

    render: function render(text, _ref10) {
        var _ref10$engine = _ref10.engine,
            engine = _ref10$engine === undefined ? typeof window !== 'undefined' && window.window === window && window.navigator ? navigator.userAgent.indexOf('Chrome') >= 0 ? 'chrome' : 'generic' : 'ansi' : _ref10$engine,
            _ref10$engines = _ref10.engines,
            engines = _ref10$engines === undefined ? {/* configurable */} : _ref10$engines,
            _ref10$consoleMethod = _ref10.consoleMethod,
            consoleMethod = _ref10$consoleMethod === undefined ? 'log' : _ref10$consoleMethod,
            _ref10$defaults = _ref10.defaults,
            defaults = _ref10$defaults === undefined ? {

            ansi: function ansi(s) {
                return console[consoleMethod](s);
            },
            chrome: function chrome(s) {
                var _console;

                return (_console = console)[consoleMethod].apply(_console, _toConsumableArray(ansi.parse(s).asChromeConsoleLogArguments));
            },
            generic: function generic(s) {
                return console[consoleMethod](ansi.strip(s));
            }
        } : _ref10$defaults;
        return text && O.assign(defaults, engines)[engine](text), text;
    },

    returnValue: function returnValue(__, _ref11) {
        var _ref11$initialArgumen = _slicedToArray(_ref11.initialArguments, 1),
            firstArgument = _ref11$initialArgumen[0];

        return firstArgument;
    }

    /*  ------------------------------------------------------------------------ */

}).configure({

    time: false, // disables some steps (until enabled back explicitly)
    tag: false

    /*  ------------------------------------------------------------------------ */

}).methods({

    get noop() {
        return pipez({ returnValue: function returnValue(args) {
                return args[0];
            } }).methods(this.methods_);
    },
    get null() {
        return this.noop;
    }, // LEGACY, DEPRECATED (left here for backward compatibility)

    indent: function indent(level) {
        return this.configure({ indent: { level: level } });
    },


    get error() {
        return this.configure({ tag: { level: 'error' }, render: { consoleMethod: 'error' } });
    },
    get warn() {
        return this.configure({ tag: { level: 'warn' }, render: { consoleMethod: 'warn' } });
    },
    get info() {
        return this.configure({ tag: { level: 'info' }, render: { consoleMethod: 'info' } });
    },
    get debug() {
        return this.configure({ tag: { level: 'debug' }, render: { consoleMethod: 'debug' } });
    },

    maxArrayLength: function maxArrayLength(n) {
        return this.configure({ stringify: { maxArrayLength: n } });
    },
    maxObjectLength: function maxObjectLength(n) {
        return this.configure({ stringify: { maxObjectLength: n } });
    },
    maxDepth: function maxDepth(n) {
        return this.configure({ stringify: { maxDepth: n } });
    },
    maxLength: function maxLength(n) {
        return this.configure({ stringify: { maxLength: n } });
    },


    get unlimited() {
        return this.configure({ stringify: { maxStringLength: Number.MAX_VALUE,
                maxObjectLength: Number.MAX_VALUE,
                maxArrayLength: Number.MAX_VALUE,
                maxDepth: Number.MAX_VALUE,
                maxErrorMessageLength: Number.MAX_VALUE } });
    },

    get noPretty() {
        return this.configure({ stringify: { pretty: false } });
    },
    get noFancy() {
        return this.configure({ stringify: { fancy: false } });
    },
    get noRightAlignKeys() {
        return this.configure({ stringify: { rightAlignKeys: false } });
    },
    get noLocate() {
        return this.configure({ locate: false });
    },
    precision: function precision(n) {
        return this.configure({ stringify: { precision: n } });
    },


    get serialize() {
        return this.before('render');
    },
    get deserialize() {
        return this.from('render');
    },

    newline: function newline() {
        return this.from('join')(['']);
    },
    handleNodeErrors: function handleNodeErrors() {
        var _this = this;

        process.on('uncaughtException', function (e) {
            _this.bright.red.error.noLocate(e);process.exit(1);
        });
        process.on('unhandledRejection', function (e) {
            _this.bright.red.error.noLocate(e);process.exit(1);
        });
        return this;
    }
});

/*  ------------------------------------------------------------------------ */

ansi.names.forEach(function (color) {
    var _log$methods, _mutatorMap;

    log.methods((_log$methods = {}, _mutatorMap = {}, _mutatorMap[color] = _mutatorMap[color] || {}, _mutatorMap[color].get = function () {
        return this.configure({ 'concat+': function concat(lines) {
                return lines.map(ansi[color]);
            } });
    }, _defineEnumerableProperties(_log$methods, _mutatorMap), _log$methods));
});

/*  ------------------------------------------------------------------------ */

module.exports = log;

/*  ------------------------------------------------------------------------ */

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFQO0FBQWlDLEtBaEN0QztBQWtDUixvQkFsQ1EsOEJBa0NZO0FBQUE7O0FBQ2hCLGdCQUFRLEVBQVIsQ0FBWSxtQkFBWixFQUFrQyxhQUFLO0FBQUUsa0JBQUssTUFBTCxDQUFZLEdBQVosQ0FBZ0IsS0FBaEIsQ0FBc0IsUUFBdEIsQ0FBZ0MsQ0FBaEMsRUFBb0MsUUFBUSxJQUFSLENBQWMsQ0FBZDtBQUFrQixTQUEvRjtBQUNBLGdCQUFRLEVBQVIsQ0FBWSxvQkFBWixFQUFrQyxhQUFLO0FBQUUsa0JBQUssTUFBTCxDQUFZLEdBQVosQ0FBZ0IsS0FBaEIsQ0FBc0IsUUFBdEIsQ0FBZ0MsQ0FBaEMsRUFBb0MsUUFBUSxJQUFSLENBQWMsQ0FBZDtBQUFrQixTQUEvRjtBQUNBLGVBQU8sSUFBUDtBQUNIO0FBdENPLENBL0ZBLENBQVo7O0FBd0lBOztBQUVBLEtBQUssS0FBTCxDQUFXLE9BQVgsQ0FBb0IsaUJBQVM7QUFBQTs7QUFFekIsUUFBSSxPQUFKLG1EQUVTLEtBRlQsZ0JBRVMsS0FGVCxxQkFFUyxLQUZULG9CQUVtQjtBQUFFLGVBQU8sS0FBSyxTQUFMLENBQWdCLEVBQUUsV0FBVztBQUFBLHVCQUFTLE1BQU0sR0FBTixDQUFXLEtBQUssS0FBTCxDQUFYLENBQVQ7QUFBQSxhQUFiLEVBQWhCLENBQVA7QUFBeUUsS0FGOUY7QUFJSCxDQU5EOztBQVFBOztBQUVBLE9BQU8sT0FBUCxHQUFpQixHQUFqQjs7QUFFQSIsImZpbGUiOiJvbG9sb2cuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxuLyogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG5jb25zdCBPICAgICAgICAgICAgICAgICA9IE9iamVjdFxuICAgICwgU3RhY2tUcmFjZXkgICAgICAgPSByZXF1aXJlICgnc3RhY2t0cmFjZXknKVxuICAgICwgYW5zaSAgICAgICAgICAgICAgPSByZXF1aXJlICgnYW5zaWNvbG9yJylcbiAgICAsIGJ1bGxldCAgICAgICAgICAgID0gcmVxdWlyZSAoJ3N0cmluZy5idWxsZXQnKVxuICAgICwgcGlwZXogICAgICAgICAgICAgPSByZXF1aXJlICgncGlwZXonKVxuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cblxuY29uc3Qgc3RyaW5naWZ5ID0gcmVxdWlyZSAoJ3N0cmluZy5pZnknKS5jb25maWd1cmUgKHtcblxuICAgIGZvcm1hdHRlciAoeCwgc3RyaW5naWZ5KSB7XG5cbiAgICAgICAgaWYgKCh4IGluc3RhbmNlb2YgRXJyb3IpICYmICEodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgeFtTeW1ib2wuZm9yICgnU3RyaW5nLmlmeScpXSkpIHtcblxuICAgICAgICAgICAgaWYgKHN0cmluZ2lmeS5zdGF0ZS5kZXB0aCA+IDApIHJldHVybiBgPEVycm9yOiAke3gubWVzc2FnZX0+YCAvLyBwcmV2ZW50cyB1bndhbnRlZCBwcmV0dHkgcHJpbnRpbmcgZm9yIEVycm9ycyB0aGF0IGFyZSBwcm9wZXJ0aWVzIG9mIGNvbXBsZXggb2JqZWN0c1xuXG4gICAgICAgICAgICBjb25zdCBpbmRlbnQgICAgICAgID0gJyAgICAnXG4gICAgICAgICAgICAgICAgLCB3aHkgICAgICAgICAgID0gc3RyaW5naWZ5LmxpbWl0ICgoeC5tZXNzYWdlIHx8ICcnKS5yZXBsYWNlICgvXFxyfFxcbi9nLCAnJykudHJpbSAoKSwgc3RyaW5naWZ5LnN0YXRlLm1heEVycm9yTWVzc2FnZUxlbmd0aCB8fCAxMjApXG4gICAgICAgICAgICAgICAgLCBzdGFjayAgICAgICAgID0gbmV3IFN0YWNrVHJhY2V5ICh4KS53aXRoU291cmNlcyAoKS5hc1RhYmxlICgpXG4gICAgICAgICAgICAgICAgLCBzdGFja0luZGVudGVkID0gc3RhY2suc3BsaXQgKCdcXG4nKS5tYXAgKHggPT4gaW5kZW50ICsgeCkuam9pbiAoJ1xcbicpXG4gICAgICAgICAgICAgICAgLCBpc0Fzc2VydGlvbiA9ICgnYWN0dWFsJyBpbiB4KSAmJiAoJ2V4cGVjdGVkJyBpbiB4KVxuICAgICAgICAgICAgICAgICwgdHlwZSAgICAgICAgPSB4LmNvbnN0cnVjdG9yLm5hbWUgfHwgJ0Vycm9yJ1xuXG4gICAgICAgICAgICBpZiAoaXNBc3NlcnRpb24pIHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHN0ciA9IHN0cmluZ2lmeS5jb25maWd1cmUgKHsgbWF4U3RyaW5nTGVuZ3RoOiBOdW1iZXIuTUFYX1ZBTFVFLCBtYXhEZXB0aDogOCB9KVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxldCBhY3R1YWwgICA9IGJ1bGxldCAoaW5kZW50ICsgJ2FjdHVhbDogICAnLCBzdHIgKHguYWN0dWFsKSlcbiAgICAgICAgICAgICAgICAgICwgZXhwZWN0ZWQgPSBidWxsZXQgKGluZGVudCArICdleHBlY3RlZDogJywgc3RyICh4LmV4cGVjdGVkKSlcblxuICAgICAgICAgICAgICAgIGlmICgoYWN0dWFsLnNwbGl0ICgnXFxuJykubGVuZ3RoID4gMSkgfHwgKGV4cGVjdGVkLnNwbGl0ICgnXFxuJykubGVuZ3RoID4gMSkpIC8vIGlmIG11bHRpbGluZSBhY3R1YWwvZXhwZWN0ZWQsIG5lZWQgZXh0cmEgd2hpdGVzcGFjZSBpbmJldHdlZW5cbiAgICAgICAgICAgICAgICAgICAgYWN0dWFsICs9ICdcXG4nXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gYFske3R5cGV9XSAke3doeX1cXG5cXG4ke2Fuc2kucmVkIChhY3R1YWwpfVxcbiR7YW5zaS5ncmVlbiAoZXhwZWN0ZWQpfVxcblxcbiR7c3RhY2tJbmRlbnRlZH1cXG5gXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBgWyR7dHlwZX1dICR7d2h5fVxcblxcbiR7c3RhY2tJbmRlbnRlZH1cXG5gXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KVxuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbmNvbnN0IHsgaXNCbGFuaywgYmxhbmsgfSA9IHJlcXVpcmUgKCdwcmludGFibGUtY2hhcmFjdGVycycpXG5cbiAgICAsIGNoYW5nZUxhc3ROb25lbXB0eUxpbmUgPSAobGluZXMsIGZuKSA9PiB7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IGxpbmVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICgoaSA9PT0gMCkgfHwgIWlzQmxhbmsgKGxpbmVzW2ldKSkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxpbmVzW2ldID0gZm4gKGxpbmVzW2ldKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaW5lc1xuICAgIH1cblxuLyogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG5jb25zdCBsb2cgPSBwaXBleiAoe1xuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbiAgICBzdHJpbmdpZnk6IChhcmdzLCBjZmcsIHByaW50ID0gY2ZnLnByaW50IHx8IHN0cmluZ2lmeS5jb25maWd1cmUgKGNmZykpID0+IGFyZ3MubWFwIChhcmcgPT4gKHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnKSA/IGFyZyA6IHByaW50IChhcmcpKSxcbiAgICBcbiAgICB0cmltOiAodG9rZW5zLCB7IG1heCA9IHVuZGVmaW5lZCB9KSA9PiAhbWF4ID8gdG9rZW5zIDogdG9rZW5zLm1hcCAodCA9PiBzdHJpbmdpZnkubGltaXQgKHQsIG1heCkpLFxuXG4gICAgbGluZXM6ICh0b2tlbnMsIHsgbGluZWJyZWFrID0gJ1xcbicgfSkgPT4ge1xuXG4gICAgICAgIGxldCBsaW5lcyA9IFtbXV1cbiAgICAgICAgbGV0IGxlZnRQYWQgPSBbXVxuXG4gICAgICAgIGZvciAoY29uc3QgdCBvZiB0b2tlbnMpIHtcblxuICAgICAgICAgICAgY29uc3QgW2ZpcnN0LCAuLi5yZXN0XSA9IHQuc3BsaXQgKGxpbmVicmVhaylcblxuICAgICAgICAgICAgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ucHVzaCAoZmlyc3QpXG4gICAgICAgICAgICBsaW5lcyA9IFsuLi5saW5lcywgLi4ucmVzdC5tYXAgKHQgPT4gdCA/IFsuLi5sZWZ0UGFkLCB0XSA6IFtdKV1cblxuICAgICAgICAgICAgY29uc3QgcGFkID0gYmxhbmsgKCFyZXN0Lmxlbmd0aCA/IHQgOiByZXN0W3Jlc3QubGVuZ3RoIC0gMV0pXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChwYWQpIHsgbGVmdFBhZC5wdXNoIChwYWQpIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBsaW5lc1xuICAgIH0sXG5cbiAgICBjb25jYXQ6IChsaW5lcywgeyBzZXBhcmF0b3IgPSAnICcgfSkgPT4gbGluZXMubWFwICh0b2tlbnMgPT4gdG9rZW5zLmpvaW4gKHNlcGFyYXRvcikpLFxuXG4gICAgaW5kZW50OiAobGluZXMsIHsgbGV2ZWwgPSAwLCBwYXR0ZXJuID0gJ1xcdCcgfSkgPT4gbGluZXMubWFwIChsaW5lID0+IHBhdHRlcm4ucmVwZWF0IChsZXZlbCkgKyBsaW5lKSxcbiAgICBcbiAgICB0YWc6IChsaW5lcywgeyBsZXZlbCA9ICcnLFxuICAgICAgICAgICAgICAgICAgIGxldmVsQ29sb3IgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICdpbmZvJzogYW5zaS5jeWFuLFxuICAgICAgICAgICAgICAgICAgICAgICAnd2Fybic6IGFuc2kueWVsbG93LFxuICAgICAgICAgICAgICAgICAgICAgICAnZGVidWcnOiBhbnNpLmJsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICdlcnJvcic6IGFuc2kuYnJpZ2h0LnJlZCB9IH0pID0+IGJ1bGxldCAoKGxldmVsQ29sb3JbbGV2ZWxdIHx8IChzID0+IHMpKSAobGV2ZWwudG9VcHBlckNhc2UgKCkucGFkU3RhcnQgKDYpICsgJ1xcdCcpLCBsaW5lcyksXG5cbiAgICB0aW1lOiAobGluZXMsIHsgd2hlbiAgID0gbmV3IERhdGUgKCksXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdCA9ICdsb2NhbGUnLFxuICAgICAgICAgICAgICAgICAgICBsb2NhbGUgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucyA9IHt9LFxuICAgICAgICAgICAgICAgICAgICBwcmludCAgPSB3aGVuID0+IGFuc2kuZGFya0dyYXkgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgoZm9ybWF0ID09PSAnaXNvJykgICAgPyB3aGVuLnRvSVNPU3RyaW5nICgpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKGZvcm1hdCA9PT0gJ2xvY2FsZScpID8gd2hlbi50b0xvY2FsZVN0cmluZyAobG9jYWxlLCBvcHRpb25zKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKChmb3JtYXQgPT09ICd1dGMnKSAgICA/IHdoZW4udG9VVENTdHJpbmcgKCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuLnRvU3RyaW5nICgpKSkpKSArICdcXHQnIH0pID0+IGJ1bGxldCAocHJpbnQgKHdoZW4pLCBsaW5lcyksXG5cbiAgICBsb2NhdGU6IChsaW5lcywge1xuXG4gICAgICAgICAgICAgICAgICAgIHNoaWZ0ID0gMCxcbiAgICAgICAgICAgICAgICAgICAgd2hlcmUgPSAobmV3IFN0YWNrVHJhY2V5ICgpLmNsZWFuICgpLmF0ICgxICsgc2hpZnQpKSxcbiAgICAgICAgICAgICAgICAgICAgam9pbiAgPSAoKGEsIHNlcCwgYikgPT4gKGEgJiYgYikgPyAoYSArIHNlcCArIGIpIDogKGEgfHwgYikpLFxuICAgICAgICAgICAgICAgICAgICBwcmludCA9ICh7IGNhbGxlZVNob3J0LCBmaWxlTmFtZSA9IFtdLCBsaW5lID0gW10gfSkgPT4gYW5zaS5kYXJrR3JheSAoJygnICsgam9pbiAoY2FsbGVlU2hvcnQsICcgQCAnLCBqb2luIChmaWxlTmFtZSwgJzonLCBsaW5lKSkgKyAnKScpXG5cbiAgICAgICAgICAgICAgICB9KSA9PiBjaGFuZ2VMYXN0Tm9uZW1wdHlMaW5lIChsaW5lcywgbGluZSA9PiBqb2luIChsaW5lLCAnICcsIHByaW50ICh3aGVyZSkpKSxcblxuICAgIGpvaW46IChsaW5lcywgeyBsaW5lYnJlYWsgPSAnXFxuJyB9KSA9PiBsaW5lcy5qb2luIChsaW5lYnJlYWspLFxuXG4gICAgcmVuZGVyOiAodGV4dCwge1xuXG4gICAgICAgIGVuZ2luZSA9ICgodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpICYmICh3aW5kb3cud2luZG93ID09PSB3aW5kb3cpICYmIHdpbmRvdy5uYXZpZ2F0b3IpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IChuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YgKCdDaHJvbWUnKSA+PSAwKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ2Nocm9tZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnZ2VuZXJpYydcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ2Fuc2knLFxuXG4gICAgICAgIGVuZ2luZXMgPSB7IC8qIGNvbmZpZ3VyYWJsZSAqLyB9LFxuXG4gICAgICAgIGNvbnNvbGVNZXRob2QgPSAnbG9nJyxcblxuICAgICAgICBkZWZhdWx0cyA9IHtcblxuICAgICAgICAgICAgYW5zaTogICAgcyA9PiBjb25zb2xlW2NvbnNvbGVNZXRob2RdIChzKSxcbiAgICAgICAgICAgIGNocm9tZTogIHMgPT4gY29uc29sZVtjb25zb2xlTWV0aG9kXSAoLi4uYW5zaS5wYXJzZSAocykuYXNDaHJvbWVDb25zb2xlTG9nQXJndW1lbnRzKSxcbiAgICAgICAgICAgIGdlbmVyaWM6IHMgPT4gY29uc29sZVtjb25zb2xlTWV0aG9kXSAoYW5zaS5zdHJpcCAocykpXG4gICAgICAgIH1cblxuICAgIH0pID0+ICgodGV4dCAmJiBPLmFzc2lnbiAoZGVmYXVsdHMsIGVuZ2luZXMpW2VuZ2luZV0gKHRleHQpLCB0ZXh0KSksXG5cbiAgICByZXR1cm5WYWx1ZTogKF9fLCB7IGluaXRpYWxBcmd1bWVudHM6IFtmaXJzdEFyZ3VtZW50XSB9KSA9PiBmaXJzdEFyZ3VtZW50XG5cbi8qICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxufSkuY29uZmlndXJlICh7XG5cbiAgICB0aW1lOiBmYWxzZSwgLy8gZGlzYWJsZXMgc29tZSBzdGVwcyAodW50aWwgZW5hYmxlZCBiYWNrIGV4cGxpY2l0bHkpXG4gICAgdGFnOiAgZmFsc2VcblxuLyogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG59KS5tZXRob2RzICh7XG5cbiAgICBnZXQgbm9vcCAoKSB7IHJldHVybiBwaXBleiAoeyByZXR1cm5WYWx1ZTogYXJncyA9PiBhcmdzWzBdIH0pLm1ldGhvZHMgKHRoaXMubWV0aG9kc18pIH0sXG4gICAgZ2V0IG51bGwgKCkgeyByZXR1cm4gdGhpcy5ub29wIH0sIC8vIExFR0FDWSwgREVQUkVDQVRFRCAobGVmdCBoZXJlIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5KVxuXG4gICAgaW5kZW50IChsZXZlbCkgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgaW5kZW50OiB7IGxldmVsOiBsZXZlbCB9fSkgfSxcblxuICAgIGdldCBlcnJvciAoKSB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyB0YWc6IHsgbGV2ZWw6ICdlcnJvcicgfSwgcmVuZGVyOiB7IGNvbnNvbGVNZXRob2Q6ICdlcnJvcicgfSB9KSB9LFxuICAgIGdldCB3YXJuICgpICB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyB0YWc6IHsgbGV2ZWw6ICd3YXJuJyB9LCAgcmVuZGVyOiB7IGNvbnNvbGVNZXRob2Q6ICd3YXJuJyB9IH0pIH0sXG4gICAgZ2V0IGluZm8gKCkgIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7IHRhZzogeyBsZXZlbDogJ2luZm8nIH0sICByZW5kZXI6IHsgY29uc29sZU1ldGhvZDogJ2luZm8nIH0gfSkgfSxcbiAgICBnZXQgZGVidWcgKCkgIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7IHRhZzogeyBsZXZlbDogJ2RlYnVnJyB9LCAgcmVuZGVyOiB7IGNvbnNvbGVNZXRob2Q6ICdkZWJ1ZycgfSB9KSB9LFxuXG4gICAgbWF4QXJyYXlMZW5ndGggKG4pICB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyBzdHJpbmdpZnk6IHsgbWF4QXJyYXlMZW5ndGg6IG4gfSB9KSB9LFxuICAgIG1heE9iamVjdExlbmd0aCAobikgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgc3RyaW5naWZ5OiB7IG1heE9iamVjdExlbmd0aDogbiB9IH0pIH0sXG4gICAgbWF4RGVwdGggKG4pICAgICAgICB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyBzdHJpbmdpZnk6IHsgbWF4RGVwdGg6IG4gfSB9KSB9LFxuICAgIG1heExlbmd0aCAobikgICAgICAgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgc3RyaW5naWZ5OiB7IG1heExlbmd0aDogbiB9IH0pIH0sXG4gICAgXG4gICAgZ2V0IHVubGltaXRlZCAoKSB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyBzdHJpbmdpZnk6IHsgbWF4U3RyaW5nTGVuZ3RoOiBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heE9iamVjdExlbmd0aDogTnVtYmVyLk1BWF9WQUxVRSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhBcnJheUxlbmd0aDogTnVtYmVyLk1BWF9WQUxVRSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhEZXB0aDogTnVtYmVyLk1BWF9WQUxVRSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhFcnJvck1lc3NhZ2VMZW5ndGg6IE51bWJlci5NQVhfVkFMVUUgfSB9KSB9LFxuXG4gICAgZ2V0IG5vUHJldHR5ICgpIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7IHN0cmluZ2lmeTogeyBwcmV0dHk6IGZhbHNlIH0gfSkgfSxcbiAgICBnZXQgbm9GYW5jeSAoKSB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyBzdHJpbmdpZnk6IHsgZmFuY3k6IGZhbHNlIH0gfSkgfSxcbiAgICBnZXQgbm9SaWdodEFsaWduS2V5cyAoKSB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyBzdHJpbmdpZnk6IHsgcmlnaHRBbGlnbktleXM6IGZhbHNlIH0gfSkgfSxcbiAgICBnZXQgbm9Mb2NhdGUgKCkgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgbG9jYXRlOiBmYWxzZSB9KSB9LFxuICAgIHByZWNpc2lvbiAobikgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgc3RyaW5naWZ5OiB7IHByZWNpc2lvbjogbiB9IH0pIH0sXG5cbiAgICBnZXQgc2VyaWFsaXplICgpIHsgcmV0dXJuIHRoaXMuYmVmb3JlICgncmVuZGVyJykgfSxcbiAgICBnZXQgZGVzZXJpYWxpemUgKCkgeyByZXR1cm4gdGhpcy5mcm9tICgncmVuZGVyJykgfSxcblxuICAgIG5ld2xpbmUgKCkgeyByZXR1cm4gdGhpcy5mcm9tICgnam9pbicpKFsnJ10pIH0sXG5cbiAgICBoYW5kbGVOb2RlRXJyb3JzICgpIHtcbiAgICAgICAgcHJvY2Vzcy5vbiAoJ3VuY2F1Z2h0RXhjZXB0aW9uJywgIGUgPT4geyB0aGlzLmJyaWdodC5yZWQuZXJyb3Iubm9Mb2NhdGUgKGUpOyBwcm9jZXNzLmV4aXQgKDEpIH0pXG4gICAgICAgIHByb2Nlc3Mub24gKCd1bmhhbmRsZWRSZWplY3Rpb24nLCBlID0+IHsgdGhpcy5icmlnaHQucmVkLmVycm9yLm5vTG9jYXRlIChlKTsgcHJvY2Vzcy5leGl0ICgxKSB9KVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH1cbn0pXG5cbi8qICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuYW5zaS5uYW1lcy5mb3JFYWNoIChjb2xvciA9PiB7XG5cbiAgICBsb2cubWV0aG9kcyAoe1xuXG4gICAgICAgIGdldCBbY29sb3JdICgpIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7ICdjb25jYXQrJzogbGluZXMgPT4gbGluZXMubWFwIChhbnNpW2NvbG9yXSkgfSkgfVxuICAgIH0pXG59KVxuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbm1vZHVsZS5leHBvcnRzID0gbG9nXG5cbi8qICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuXG4iXX0=