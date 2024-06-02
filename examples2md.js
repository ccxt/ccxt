import fs from 'fs'
import path from 'path'

const toTitleCase = (phrase) => {
    return phrase
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

// Define the Markdown file path
const docsDir = './wiki'
const examplesDir = './examples'
// Copy readme file
console.log ('📰 Creating Examples.md ');
const readmePath = './examples/README.md';
const readmeContent = fs.readFileSync(readmePath, 'utf8');
// replace github links to docs links
const modifiedContent = readmeContent.replaceAll('https://github.com/ccxt/ccxt/tree/master/examples', '/examples').replace (/#+ See Also[\S\s]+/, '')
fs.writeFileSync(path.join(docsDir, 'Examples.md'), modifiedContent);

const languagePaths = {
    'javascript': './examples/js',
    'python': './examples/py',
    'typescript': './examples/ts',
    'php': './examples/php',
}

// Define the Markdown content

const languages = Object.keys(languagePaths);

// create examples folder if doesn't exist
if (!fs.existsSync('./wiki/examples')) {
    fs.mkdirSync('./wiki/examples');
}

languages.forEach(language => {
    console.log (`📰 Creating docs for ${language} examples`);
    const languageDir = languagePaths[language];
    // create language folder if doesn't exist
    const docsLanguageDir = path.join(docsDir, languageDir);
    if (!fs.existsSync(docsLanguageDir)) {
        fs.mkdirSync(docsLanguageDir);
    }
    let mdContent = `<style>ul { margin-bottom: -10px; }</style>\n\n# [<-](Examples?id=${language})\n\n`;
    fs.readdirSync(languageDir).forEach(file => {
        // add to glossary of examplex
        const filename = path.basename(file, path.extname(file));
        //ignore files that start with .
        if (filename.startsWith('.')) return;
        const fileTitle = toTitleCase (filename.replaceAll ('-', ' '));
        // README file: add to existing readme
        if (filename === 'README' && path.extname(file) === '.md') {
            const readmeContent = fs.readFileSync(path.join(languageDir, file), 'utf8');
            mdContent += readmeContent + '\n\n';
            return;
        }
        // Folder: add to gloassy and create link to github
        if (fs.statSync(path.join(languageDir, file)).isDirectory()) {
            mdContent += `- [📂 ${fileTitle}](https://github.com/ccxt/ccxt/tree/master/${languageDir}/${filename})\n\n`;
            return
        }
        // Example file: add to glossary and create markdown file
        mdContent += `- [${fileTitle}](${languageDir}/${filename}.md)\n\n`;
        // create markdown file for example code
        let code = fs.readFileSync(path.join(languageDir, file), 'utf8');
        if (language === 'python') {
            code = code.replace (/^.*os.path.dirname.*$/mg, '').replace (/^sys.path.append.*$\n\n?/mg, '')
        } else if (language === 'php') {
            code = code.replace (/\n^\$root = .*$\n/mg, '').replace (/^include \$root.*$/mg, 'include \'./ccxt.php\';')
        }
        code = code.replace (/\n^#\s?-+$\n\n?/mg, '')
        const codeMd = `- [${fileTitle}](${languageDir}/)\n\n\n \`\`\`${language.replace('typescript', 'javascript')}\n ${code} \n\`\`\``;
        fs.writeFileSync(path.join(docsLanguageDir, `${filename}.md`), codeMd);
    });
    fs.writeFileSync(path.join(docsLanguageDir, 'README.md'), mdContent);
});
