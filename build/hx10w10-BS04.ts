// hx10 wave10 BS04 (cs): the value-typed view of urls['api'] sections. Exchange.Options.cs
// declares urlsApiSections (section dictionaries only) and RefreshUrlsViews; a literal-key read
// through a section becomes the native ContainsKey/indexer chain, every other shape keeps the
// helper call. urls is written at config time, so each write gets the refresh call.

const URLS_WRITE = /^(\s*)this\.urls(?:\[[^\]]*\]|)\s*=\s*(?!=)/
const REFRESH_LINE = /^\s*this\.RefreshUrlsViews\(\);$/
const SECTION_READ = /getValue\(\(\(?\s*this\.urlsApi != null && this\.urlsApi\.ContainsKey\(("(?:[^"\\]|\\.)*")\)\s*\?\s*this\.urlsApi\[\1\]\s*:\s*null\s*\)\)?,\s*("(?:[^"\\]|\\.)*")\)/g

function sectionRead (section: string, key: string): string {
    return `(this.urlsApiSections.ContainsKey(${section}) && this.urlsApiSections[${section}].ContainsKey(${key}) ? this.urlsApiSections[${section}][${key}] : null)`
}

// `getValue((urlsApi ... ContainsKey("k") ? urlsApi["k"] : null), "k2")` -> the typed view
export function hx10w10SectionReads (content: string): string {
    if (!content.includes ('this.urlsApiSections') && !content.includes ('this.urlsApi')) {
        return content
    }
    let changed = false
    const lines = content.split ('\n')
    const out = lines.map ((line) => {
        if (!line.includes ('getValue(') || line.trimStart ().startsWith ('//')) {
            return line
        }
        const rewritten = line.replace (SECTION_READ, (whole, section, key) => sectionRead (section, key))
        if (rewritten === line || rewritten.length > 400) {
            return line
        }
        changed = true
        return rewritten
    })
    return changed ? out.join ('\n') : content
}

// a write of urls (or of one of its entries) re-derives the view; a write this pass cannot place
// after a single statement leaves the whole file alone
export function hx10w10UrlsRefresh (content: string): string {
    if (!/this\.urls(?:\[|\s*=)/.test (content)) {
        return content
    }
    const lines = content.split ('\n')
    const out: string[] = []
    let unsafe = false
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        out.push (line)
        if ((line.trimStart ().startsWith ('//')) || !URLS_WRITE.test (line)) {
            continue
        }
        if (!line.trimEnd ().endsWith (';')) {
            unsafe = true;
            continue
        }
        if (REFRESH_LINE.test (lines[i + 1] ?? '')) {
            continue
        }
        out.push (/^(\s*)/.exec (line)![1] + 'this.RefreshUrlsViews();')
    }
    return unsafe ? content : out.join ('\n')
}

export function hx10w10Bs04Apply (content: string): string {
    if (content.includes ('namespace Tests;')) {
        return content
    }
    return hx10w10SectionReads (hx10w10UrlsRefresh (content))
}

// snippet checks (run from `csharpTranspiler.ts --self-test`)
export function hx10w10SnippetChecks (): string[] {
    const problems: string[] = []
    const head = 'namespace ccxt;\n\npublic partial class BaseExchange\n{\n'
    const tail = '\n}\n'
    const body = (lines: string) => head + lines + tail
    const check = (name: string, input: string, expected: string, forbidden?: string) => {
        const output = hx10w10Bs04Apply (input)
        const ok = output.includes (expected) && ((forbidden === undefined) || !output.includes (forbidden))
        if (!ok) {
            problems.push (`hx10w10 BS04: ${name}: ${output.replace (/\n/g, ' | ').slice (0, 320)}`)
        }
    }
    check ('a literal section read is the typed view',
        body ('    object url = getValue((this.urlsApi != null && this.urlsApi.ContainsKey("ws") ? this.urlsApi["ws"] : null), "public");'),
        '(this.urlsApiSections.ContainsKey("ws") && this.urlsApiSections["ws"].ContainsKey("public") ? this.urlsApiSections["ws"]["public"] : null)',
        'getValue(')
    check ('a non-string key in the section keeps the helper',
        body ('    object url = getValue((this.urlsApi != null && this.urlsApi.ContainsKey("ws") ? this.urlsApi["ws"] : null), type);'),
        'getValue(', 'urlsApiSections')
    check ('a read that is not a literal section keeps the helper',
        body ('    object url = getValue((this.urlsApi != null && this.urlsApi.ContainsKey("ws") ? this.urlsApi["ws"] : null), api);'),
        'getValue(', 'urlsApiSections')
    check ('a write of an entry refreshes the view',
        body ('    void f()\n    {\n        this.urls["api"] = this.urls["test"];\n    }'),
        '        this.urls["api"] = this.urls["test"];\n        this.RefreshUrlsViews();')
    check ('a write of urls refreshes the view',
        body ('    void f()\n    {\n        this.urls = newUrls;\n    }'),
        'this.urls = newUrls;\n        this.RefreshUrlsViews();')
    check ('a comparison is not a write',
        body ('    void f()\n    {\n        if (this.urls != null && this.urls.ContainsKey("api")) { return; }\n    }'),
        'this.urls != null', 'RefreshUrlsViews')
    check ('a tests file is untouched',
        'namespace Tests;\n\npublic partial class T\n{\n    void f() { object u = getValue((this.urlsApi != null && this.urlsApi.ContainsKey("ws") ? this.urlsApi["ws"] : null), "public"); }\n}\n',
        'getValue(')
    const once = hx10w10Bs04Apply (body ('    object url = getValue((this.urlsApi != null && this.urlsApi.ContainsKey("ws") ? this.urlsApi["ws"] : null), "public");\n    void f()\n    {\n        this.urls["api"] = this.urls["test"];\n    }'))
    const twice = hx10w10Bs04Apply (once)
    if (once !== twice) {
        problems.push ('hx10w10 BS04: the pass is not idempotent')
    }
    return problems
}
