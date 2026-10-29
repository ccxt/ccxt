// A base method whose TS parameter is an array and that no exchange overrides or calls with a
// non-List value prints `List<Object>`; the declared type lets the J03 pass read it natively.
const LIST_PARAMS: { [method: string]: string } = {
    'filterByLimit': 'array',
    'findNearestCeiling': 'arr',
};

export function hx11w8BasePinnedListParams (content: string): string {
    let out = content;
    for (const method of Object.keys (LIST_PARAMS)) {
        const name = LIST_PARAMS[method];
        const sig = new RegExp ('^(    public [\\w<>.?, ]+ ' + method + '\\()Object ' + name + '([,)])', 'm');
        out = out.replace (sig, '$1List<Object> ' + name + '$2');
    }
    return out;
}
