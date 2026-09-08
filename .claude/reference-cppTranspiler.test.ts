import { Transpiler } from '../src/transpiler';

jest.mock('module',()=>({
    __esModule: true,                 // this makes it work
    default: jest.fn()
  }));

let transpiler: Transpiler;

beforeAll(() => {
    const config = {
        'verbose': false,
        'cpp': {
            'parser': {
                'NUM_LINES_END_FILE': 0,
            }
        }
    }
    transpiler = new Transpiler(config);
})

describe('cpp transpiling tests', () => {
    test('basic variable declaration', () => {
        const ts = "const x = 1;"
        const cpp = "std::any x = 1;"
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('string literals are wrapped in std::string', () => {
        const ts = 'const x = "foo, \'single\', \\"double\\" \\t \\n \\\\ ";'
        const cpp = 'std::any x = std::string("foo, \'single\', \\"double\\" \\t \\n \\\\ ");'
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('basic while loop', () => {
        const ts =
        "while (true) {\n" +
        "    const x = 1;\n" +
        "    break;\n" +
        "}"
        const cpp =
        "while (true)\n" +
        "{\n" +
        "    std::any x = 1;\n" +
        "    break;\n" +
        "}";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('basic class declaration', () => {
        const ts =
        "class Test {\n" +
        "    main() {\n" +
        "        return 1;\n" +
        "    }\n" +
        "}"
        const cpp =
        "class Test\n" +
        "{\n" +
        "public:\n" +
        "    virtual std::any main()\n" +
        "    {\n" +
        "        return 1;\n" +
        "    }\n" +
        "};";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('binary expressions are wrapped in helpers', () => {
        const ts =
        "const a = 1 + 2;\n" +
        "const b = a === 3;"
        const cpp =
        "std::any a = add(1, 2);\n" +
        "std::any b = isEqual(a, 3);";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('array, object literals and element access', () => {
        const ts =
        "const arr = [1, 2];\n" +
        "const d = {'k': 'v'};\n" +
        "const e = d['k'];"
        const cpp =
        "std::any arr = std::vector<std::any>{1, 2};\n" +
        "std::any d = std::unordered_map<std::string, std::any> {\n" +
        "    { std::string(\"k\"), std::string(\"v\") },\n" +
        "};\n" +
        "std::any e = ::getValue(d, std::string(\"k\"));";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('class with property, default parameter and array destructuring', () => {
        const ts =
        "class A {\n" +
        "    myProp: string = \"hi\";\n" +
        "    async run(x, y = 1) {\n" +
        "        const [q, w] = this.pair();\n" +
        "        return q;\n" +
        "    }\n" +
        "    pair() {\n" +
        "        return [1, 2];\n" +
        "    }\n" +
        "}"
        const cpp =
        "class A\n" +
        "{\n" +
        "public:\n" +
        "    std::any myProp = std::string(\"hi\");\n" +
        "\n" +
        "    virtual std::shared_future<std::any> run(std::any x, std::any y = 1)\n" +
        "    {\n" +
        "        return std::async(std::launch::async, [=]() -> std::any {\n" +
        "            std::any qwVariable = this->pair();\n" +
        "            std::any q = ::getValue(qwVariable, 0);\n" +
        "            std::any w = ::getValue(qwVariable, 1);\n" +
        "            return q;\n" +
        "        }).share();\n" +
        "    }\n" +
        "\n" +
        "    virtual std::any pair()\n" +
        "    {\n" +
        "        return std::vector<std::any>{1, 2};\n" +
        "    }\n" +
        "};";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('if, else if and else with wrapped conditions', () => {
        const ts =
        "const x = 1;\n" +
        "if (x === 1) {\n" +
        "    console.log('one');\n" +
        "} else if (x === 2) {\n" +
        "    console.log('two');\n" +
        "} else {\n" +
        "    console.log('other');\n" +
        "}"
        const cpp =
        "std::any x = 1;\n" +
        "if (isTrue(isEqual(x, 1)))\n" +
        "{\n" +
        "    consoleLog(std::string(\"one\"));\n" +
        "} else if (isTrue(isEqual(x, 2)))\n" +
        "{\n" +
        "    consoleLog(std::string(\"two\"));\n" +
        "} else\n" +
        "{\n" +
        "    consoleLog(std::string(\"other\"));\n" +
        "}";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('for loop with postfix increment', () => {
        const ts =
        "let i = 0;\n" +
        "for (let w = 0; w < 10; w++) {\n" +
        "    i = i + 1;\n" +
        "}"
        const cpp =
        "std::any i = 0;\n" +
        "for (std::any w = 0; isLessThan(w, 10); postFixIncrement(w))\n" +
        "{\n" +
        "    i = add(i, 1);\n" +
        "}";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('string methods map to helper calls', () => {
        const ts =
        "const s = 'hello world';\n" +
        "const up = s.toUpperCase();\n" +
        "const parts = s.split(' ');\n" +
        "const idx = s.indexOf('o');\n" +
        "const rep = s.replaceAll('l', 'x');\n" +
        "const sw = s.startsWith('hello');\n" +
        "const ew = s.endsWith('world');\n" +
        "const tr = s.trim();\n" +
        "const sl = s.slice(1, 3);"
        const cpp =
        "std::any s = std::string(\"hello world\");\n" +
        "std::any up = toUpperCase(s);\n" +
        "std::any parts = split(s, std::string(\" \"));\n" +
        "std::any idx = getIndexOf(s, std::string(\"o\"));\n" +
        "std::any rep = replaceAll(s, std::string(\"l\"), std::string(\"x\"));\n" +
        "std::any sw = startsWith(s, std::string(\"hello\"));\n" +
        "std::any ew = endsWith(s, std::string(\"world\"));\n" +
        "std::any tr = trim(s);\n" +
        "std::any sl = slice(s, 1, 3);";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('array methods map to helper calls', () => {
        const ts =
        "const arr = [1, 2, 3];\n" +
        "arr.push(4);\n" +
        "const popped = arr.pop();\n" +
        "const shifted = arr.shift();\n" +
        "arr.reverse();\n" +
        "const joined = arr.join(',');\n" +
        "const has = arr.includes(2);\n" +
        "const merged = arr.concat([5, 6]);"
        const cpp =
        "std::any arr = std::vector<std::any>{1, 2, 3};\n" +
        "arrayPush(arr, 4);\n" +
        "std::any popped = pop(arr);\n" +
        "std::any shifted = shift(arr);\n" +
        "reverse(arr);\n" +
        "std::any joined = join(arr, std::string(\",\"));\n" +
        "std::any has = includes(arr, 2);\n" +
        "std::any merged = concat(arr, std::vector<std::any>{5, 6});";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('object helpers: keys, values, delete and in operator', () => {
        const ts =
        "const d = {'a': 1};\n" +
        "const keys = Object.keys(d);\n" +
        "const values = Object.values(d);\n" +
        "delete d['a'];\n" +
        "const hasKey = 'a' in d;"
        const cpp =
        "std::any d = std::unordered_map<std::string, std::any> {\n" +
        "    { std::string(\"a\"), 1 },\n" +
        "};\n" +
        "std::any keys = getObjectKeys(d);\n" +
        "std::any values = getObjectValues(d);\n" +
        "deleteKey(d, std::string(\"a\"));\n" +
        "std::any hasKey = inOp(d, std::string(\"a\"));";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('element assignment lowers to setValue', () => {
        const ts =
        "const list = ['x'];\n" +
        "list[0] = 'y';\n" +
        "const d = {};\n" +
        "d['k'] = 'v';"
        const cpp =
        "std::any list = std::vector<std::any>{std::string(\"x\")};\n" +
        "::setValue(list, 0, std::string(\"y\"));\n" +
        "std::any d = std::unordered_map<std::string, std::any> {};\n" +
        "::setValue(d, std::string(\"k\"), std::string(\"v\"));";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('compound assignment lowers to add and subtract', () => {
        const ts =
        "let a = 1;\n" +
        "a += 2;\n" +
        "a -= 1;"
        const cpp =
        "std::any a = 1;\n" +
        "a = add(a, 2);\n" +
        "a = subtract(a, 1);";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('try/catch and throw new Error', () => {
        const ts =
        "function boom() {\n" +
        "    throw new Error('bad');\n" +
        "}\n" +
        "try {\n" +
        "    boom();\n" +
        "} catch (e) {\n" +
        "    console.log('caught');\n" +
        "}"
        const cpp =
        "void boom()\n" +
        "{\n" +
        "    throw Error(toString(std::string(\"bad\")));\n" +
        "}\n" +
        "try\n" +
        "{\n" +
        "    boom();\n" +
        "} catch(const std::exception& e)\n" +
        "{\n" +
        "    consoleLog(std::string(\"caught\"));\n" +
        "}";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('typeof comparisons lower to type check helpers', () => {
        const ts =
        "const s = 'a';\n" +
        "const isStr = typeof s === 'string';\n" +
        "const notNum = typeof s !== 'number';"
        const cpp =
        "std::any s = std::string(\"a\");\n" +
        "std::any isStr = isString(s);\n" +
        "std::any notNum = !isNumber(s);";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('ternary wraps both branches in std::any', () => {
        const ts =
        "const x = 1;\n" +
        "const y = x === 1 ? 'one' : 'other';"
        const cpp =
        "std::any x = 1;\n" +
        "std::any y = (isTrue(isEqual(x, 1)) ? std::any(std::string(\"one\")) : std::any(std::string(\"other\")));";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('inheritance: constructor forwards super and methods get override', () => {
        const ts =
        "class Base {\n" +
        "    myProp;\n" +
        "    constructor(x) {\n" +
        "        this.myProp = x;\n" +
        "    }\n" +
        "    greet(name) {\n" +
        "        return name;\n" +
        "    }\n" +
        "}\n" +
        "\n" +
        "class Child extends Base {\n" +
        "    constructor(x) {\n" +
        "        super(x);\n" +
        "    }\n" +
        "    greet(name) {\n" +
        "        return name;\n" +
        "    }\n" +
        "}"
        const cpp =
        "class Base\n" +
        "{\n" +
        "public:\n" +
        "    std::any myProp;\n" +
        "\n" +
        "    Base(std::any x)\n" +
        "    {\n" +
        "        this->myProp = x;\n" +
        "    }\n" +
        "\n" +
        "    virtual std::any greet(std::any name)\n" +
        "    {\n" +
        "        return name;\n" +
        "    }\n" +
        "};\n" +
        "class Child : public Base\n" +
        "{\n" +
        "public:\n" +
        "    Child(std::any x) : Base(x)\n" +
        "    {\n" +
        "\n" +
        "    }\n" +
        "\n" +
        "    std::any greet(std::any name) override\n" +
        "    {\n" +
        "        return name;\n" +
        "    }\n" +
        "};";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('undefined lowers to empty std::any', () => {
        const ts =
        "let c = undefined;\n" +
        "const isUndef = c === undefined;\n" +
        "if (c !== undefined) {\n" +
        "    console.log(c);\n" +
        "}"
        const cpp =
        "std::any c = std::any{};\n" +
        "std::any isUndef = isEqual(c, std::any{});\n" +
        "if (isTrue(!isEqual(c, std::any{})))\n" +
        "{\n" +
        "    consoleLog(c);\n" +
        "}";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('Math calls map to helper functions', () => {
        const ts =
        "const a = Math.min(1, 2);\n" +
        "const b = Math.max(1, 2);\n" +
        "const c = Math.abs(-1);\n" +
        "const d = Math.floor(1.5);\n" +
        "const e = Math.pow(2, 3);"
        const cpp =
        "std::any a = mathMin(1, 2);\n" +
        "std::any b = mathMax(1, 2);\n" +
        "std::any c = mathAbs(-1);\n" +
        "std::any d = mathFloor(1.5);\n" +
        "std::any e = mathPow(2, 3);";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('length property distinguishes arrays from strings', () => {
        const ts =
        "const arr = [1, 2];\n" +
        "const n = arr.length;\n" +
        "const s = 'abc';\n" +
        "const m = s.length;"
        const cpp =
        "std::any arr = std::vector<std::any>{1, 2};\n" +
        "std::any n = getArrayLength(arr);\n" +
        "std::any s = std::string(\"abc\");\n" +
        "std::any m = getStringLength(s);";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('negation wraps operand in isTrue', () => {
        const ts =
        "const x = false;\n" +
        "const y = !x;\n" +
        "if (!x) {\n" +
        "    console.log('yes');\n" +
        "}"
        const cpp =
        "std::any x = false;\n" +
        "std::any y = !isTrue(x);\n" +
        "if (!isTrue(x))\n" +
        "{\n" +
        "    consoleLog(std::string(\"yes\"));\n" +
        "}";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('async method returns shared_future and await lowers to awaitValue', () => {
        const ts =
        "class A {\n" +
        "    async fetchX() {\n" +
        "        return 1;\n" +
        "    }\n" +
        "    async main() {\n" +
        "        const x = await this.fetchX();\n" +
        "        console.log(x);\n" +
        "    }\n" +
        "}"
        const cpp =
        "class A\n" +
        "{\n" +
        "public:\n" +
        "    virtual std::shared_future<std::any> fetchX()\n" +
        "    {\n" +
        "        return std::async(std::launch::async, [=]() -> std::any {\n" +
        "            return 1;\n" +
        "        }).share();\n" +
        "    }\n" +
        "\n" +
        "    virtual std::shared_future<std::any> main()\n" +
        "    {\n" +
        "        return std::async(std::launch::async, [=]() -> std::any {\n" +
        "            std::any x = awaitValue(this->fetchX());\n" +
        "            consoleLog(x);\n" +
        "            return std::any{};\n" +
        "        }).share();\n" +
        "    }\n" +
        "};";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('bare return inside async body yields empty std::any', () => {
        const ts =
        "class A {\n" +
        "    async early(x) {\n" +
        "        if (x) {\n" +
        "            return;\n" +
        "        }\n" +
        "        console.log('no');\n" +
        "    }\n" +
        "}"
        const cpp =
        "class A\n" +
        "{\n" +
        "public:\n" +
        "    virtual std::shared_future<std::any> early(std::any x)\n" +
        "    {\n" +
        "        return std::async(std::launch::async, [=]() -> std::any {\n" +
        "            if (isTrue(x))\n" +
        "            {\n" +
        "                return std::any{};\n" +
        "            }\n" +
        "            consoleLog(std::string(\"no\"));\n" +
        "            return std::any{};\n" +
        "        }).share();\n" +
        "    }\n" +
        "};";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('Promise.all lowers to promiseAll over concurrent futures', () => {
        const ts =
        "class A {\n" +
        "    async one() {\n" +
        "        return 1;\n" +
        "    }\n" +
        "    async all() {\n" +
        "        const r = await Promise.all([this.one(), this.one()]);\n" +
        "        return r;\n" +
        "    }\n" +
        "}"
        const cpp =
        "class A\n" +
        "{\n" +
        "public:\n" +
        "    virtual std::shared_future<std::any> one()\n" +
        "    {\n" +
        "        return std::async(std::launch::async, [=]() -> std::any {\n" +
        "            return 1;\n" +
        "        }).share();\n" +
        "    }\n" +
        "\n" +
        "    virtual std::shared_future<std::any> all()\n" +
        "    {\n" +
        "        return std::async(std::launch::async, [=]() -> std::any {\n" +
        "            std::any r = awaitValue(promiseAll(std::vector<std::any>{this->one(), this->one()}));\n" +
        "            return r;\n" +
        "        }).share();\n" +
        "    }\n" +
        "};";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
    test('Array.isArray and toString map to helpers', () => {
        const ts =
        "const a = [1];\n" +
        "const is = Array.isArray(a);\n" +
        "const n = 5;\n" +
        "const str = n.toString();"
        const cpp =
        "std::any a = std::vector<std::any>{1};\n" +
        "std::any is = isArray(a);\n" +
        "std::any n = 5;\n" +
        "std::any str = toString(n);";
        const output = transpiler.transpileCpp(ts).content;
        expect(output).toBe(cpp);
    });
});
