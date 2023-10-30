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
const docsfolder = './wiki'
// Copy readme file
console.log ('📰 Creating Examples.md ');
const readmePath = './examples/README.md';
const readmeContent = fs.readFileSync(readmePath, 'utf8');
// replace github links to docs links
const modifiedContent = readmeContent.replaceAll('https://github.com/ccxt/ccxt/tree/master/examples', '/examples');
fs.writeFileSync(path.join(docsfolder, 'Examples.md'), modifiedContent);

const languagePaths = {
    'javascript': './examples/js',
    'python': './examples/py',
    'typescript': './examples/ts',
    'php': './examples/php',
}

// Define the Markdown content

const languages = Object.keys(languagePaths);

languages.forEach(language => {
    console.log (`📰 Creating docs for ${language} examples`);
    let mdContent = `<style>ul { margin-bottom: -10px; }</style>\n\n# Examples - ${toTitleCase (language)}\n\n`;
    const languageFolder = languagePaths[language];
    fs.readdirSync(languageFolder).forEach(file => {
        // add to glossary of examplex
        const filename = path.basename(file, path.extname(file));
        //ignore files that start with .
        if (filename.startsWith('.')) return;
        const fileTitle = toTitleCase (filename.replaceAll ('-', ' '));
        // README file: add to existing readme
        if (filename === 'README' && path.extname(file) === '.md') {
            const readmeContent = fs.readFileSync(path.join(languageFolder, file), 'utf8');
            mdContent += readmeContent + '\n\n';
            return;
        }
        // Folder: add to gloassy and create link to github
        if (fs.statSync(path.join(languageFolder, file)).isDirectory()) {
            mdContent += `- [📂 ${fileTitle}](https://github.com/ccxt/ccxt/tree/master/${languageFolder}/${filename})\n\n`;
            return
        }
        // Example file: add to glossary and create markdown file
        mdContent += `- [${fileTitle}](${languageFolder}/${filename}.md)\n\n`;
        // create markdown file for example code
        const code = fs.readFileSync(path.join(languageFolder, file), 'utf8');
        const codeMd = `# ${language} Example \n ## ${fileTitle} \n\n \`\`\`${language.replace('typescript', 'javascript')}\n + ${code} \n\`\`\``;
        fs.writeFileSync(path.join(docsfolder, languageFolder, `${filename}.md`), codeMd);
    });
    fs.writeFileSync(path.join(docsfolder, languageFolder, 'README.md'), mdContent);
});
