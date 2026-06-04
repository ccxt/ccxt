import fs from 'fs'
import path from 'path'

// Capitalize the first letter of each word but PRESERVE the rest, so acronym/camelCase
// filenames stay readable (fetchOHLCV -> FetchOHLCV, not Fetchohlcv).
const toTitleCase = (phrase) => phrase.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// Define the Markdown file path
const docsDir = './wiki'
// Copy readme file
console.log ('📰 Creating Examples.md ');
const readmePath = './examples/README.md';
const readmeContent = fs.readFileSync(readmePath, 'utf8');
// replace github links to docs links
const modifiedContent = readmeContent.replaceAll('https://github.com/ccxt/ccxt/tree/master/examples', '/examples').replace (/#+ See Also[\S\s]+/, '')
fs.writeFileSync(path.join(docsDir, 'Examples.md'), modifiedContent);

// language -> source dir, wiki output dir (wiki/examples/<dir>), fence language, and
// in-doc link base. `ext` restricts to that source extension (skips project files like
// .csproj/.sln/.gradle.kts); `recurse` walks subdirs (Java keeps examples under src/).
const languagePaths = {
    'javascript': { src: './examples/js',          dir: 'js',   fence: 'javascript', link: './examples/js' },
    'python':     { src: './examples/py',          dir: 'py',   fence: 'python',     link: './examples/py' },
    'typescript': { src: './examples/ts',          dir: 'ts',   fence: 'javascript', link: './examples/ts' },
    'php':        { src: './examples/php',         dir: 'php',  fence: 'php',        link: './examples/php' },
    'csharp':     { src: './examples/cs/examples', dir: 'cs',   fence: 'csharp', ext: '.cs',   link: 'examples/cs' },
    'go':         { src: './examples/go',          dir: 'go',   fence: 'go',     ext: '.go',   link: 'examples/go' },
    'java':       { src: './java/examples',        dir: 'java', fence: 'java',   ext: '.java', recurse: true, link: 'examples/java' },
}

const languages = Object.keys(languagePaths);

// create examples folder if doesn't exist
if (!fs.existsSync('./wiki/examples')) {
    fs.mkdirSync('./wiki/examples');
}

// list top-level entries, or (recurse) all matching files flattened by basename
function listEntries (root, recurse) {
    if (recurse) {
        const out = [];
        for (const e of fs.readdirSync(root, { withFileTypes: true })) {
            const full = path.join(root, e.name);
            if (e.isDirectory()) out.push(...listEntries(full, true));
            else out.push({ name: e.name, full, isDir: false });
        }
        return out;
    }
    return fs.readdirSync(root, { withFileTypes: true }).map(e => ({
        name: e.name, full: path.join(root, e.name), isDir: e.isDirectory(),
    }));
}

languages.forEach(language => {
    const cfg = languagePaths[language];
    console.log (`📰 Creating docs for ${language} examples`);
    // create language folder if doesn't exist
    const docsLanguageDir = path.join(docsDir, 'examples', cfg.dir);
    if (!fs.existsSync(docsLanguageDir)) {
        fs.mkdirSync(docsLanguageDir, { recursive: true });
    }
    let mdContent = `<style>ul { margin-bottom: -10px; }</style>\n\n# [<-](Examples?id=${language})\n\n`;
    listEntries(cfg.src, cfg.recurse).forEach(entry => {
        const file = entry.name;
        // add to glossary of examplex
        const filename = path.basename(file, path.extname(file));
        //ignore files that start with .
        if (filename.startsWith('.')) return;
        const fileTitle = toTitleCase (filename.replaceAll ('-', ' '));
        // README file: add to existing readme
        if (filename === 'README' && path.extname(file) === '.md') {
            const readmeContent = fs.readFileSync(entry.full, 'utf8');
            mdContent += readmeContent + '\n\n';
            return;
        }
        // Folder: add to gloassy and create link to github
        if (entry.isDir) {
            mdContent += `- [📂 ${fileTitle}](https://github.com/ccxt/ccxt/tree/master/${cfg.link}/${filename})\n\n`;
            return
        }
        // skip non-source files (e.g. .csproj / .sln / .gradle.kts) when an extension is pinned
        if (cfg.ext && path.extname(file) !== cfg.ext) return;
        // Example file: add to glossary and create markdown file
        mdContent += `- [${fileTitle}](${cfg.link}/${filename}.md)\n\n`;
        // create markdown file for example code
        let code = fs.readFileSync(entry.full, 'utf8');
        if (language === 'python') {
            code = code.replace (/^.*os.path.dirname.*$/mg, '').replace (/^sys.path.append.*$\n\n?/mg, '')
        } else if (language === 'php') {
            code = code.replace (/\n^\$root = .*$\n/mg, '').replace (/^include \$root.*$/mg, 'include \'./ccxt.php\';')
        }
        code = code.replace (/\n^#\s?-+$\n\n?/mg, '')
        // just the code block — the breadcrumb + sidebar already handle navigation
        const codeMd = `\`\`\`${cfg.fence}\n${code}\n\`\`\`\n`;
        fs.writeFileSync(path.join(docsLanguageDir, `${filename}.md`), codeMd);
    });
    fs.writeFileSync(path.join(docsLanguageDir, 'README.md'), mdContent);
});
