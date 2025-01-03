import fs from 'fs/promises';
import { exec } from 'child_process';


const COMMIT_MESSAGE = process.env.COMMIT_MESSAGE;
const tagsUrl = `https://api.github.com/repos/ccxt/ccxt/tags?per_page=100`;
const prsUrl = `https://api.github.com/repos/ccxt/ccxt/pulls?state=closed&per_page=100`;
const filePath = 'CHANGELOG.md';

const token = ''; // Replace with your GitHub personal access token

const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
};

// Function to fetch data from GitHub API with pagination
async function fetchPaginatedData(url) {
    let page = 1;
    let allData = [];

    while (true) {
        console.log(`Fetching page ${page}...`)
        const response = await fetch(`${url}&page=${page}`, { headers });

        if (!response.ok) {
            throw new Error(`Failed to fetch data from ${url}. Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.length === 0) {
            break; // No more data
        }

        allData = allData.concat(data);
        page++;
    }

    return allData;
}

// Function to get all tags
async function getAllTags() {
    return await fetchPaginatedData(tagsUrl);
}

// Function to get all PRs
async function getAllPRs() {
    return await fetchPaginatedData(prsUrl);
}

// fetchAndWriteFullChangelog fetches and writes the full changelog
async function fetchAndWriteFullChangelog() {
    try {
        const tags = await getAllTags();
        let changelog = '# Changelog\n\n';
        const changelogContent = await generateChangelog(tags.map (tag => tag.name));
        await fs.writeFile('CHANGELOG.md', changelogContent);
        console.log('Changelog created successfully.');
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}

async function updateChangelogSinceLastTag() {
    try {
        const changelogContent = await generateLastChangeLog();
        // Read existing content from CHANGELOG.md
        const existingContent = await fs.readFile('CHANGELOG.md', 'utf-8');
        // Insert changelog content into line 2
        const updatedContent = existingContent.replace(/^([^\n]*\n)([^\n]*\n)/, `$1\n${changelogContent}$2`);
        // Write the updated content back to CHANGELOG.md
        await fs.writeFile('CHANGELOG.md', updatedContent);
        console.log('Changelog created successfully.');
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}

async function generateLastChangeLog() {
    const currentCommit = await runCommand('git rev-parse HEAD');
    const lastTag = await runCommand ('git describe --tags --abbrev=0');
    const prs = await fetch (prsUrl).then (res => res.json ());

    let changelog = `## ${COMMIT_MESSAGE}\n\n`;

    const commitsBetweenTags = await getCommitsBetweenTags(currentCommit, lastTag);

    commitsBetweenTags.forEach(commit => {
        const pr = prs.find(pr => pr.merge_commit_sha === commit);
        if (pr) changelog += `- ${pr.title} [#${pr.number}](${pr.html_url})\n`;
    });

    changelog += `\n\n**Full Changelog**: https://github.com/ccxt/ccxt/compare/${lastTag}...${COMMIT_MESSAGE}\n\n`

    return changelog;
}

// generateChangelog generates the changelog for an array of tags
async function generateChangelog(tags) {
    let changelog = '# Changelog\n\n';

    const prs = await getAllPRs();
    for (let i = 0; i < tags.length - 1; i++) {
        const currentTag = tags[i];
        const nextTag = tags[i + 1];

        changelog += `## ${nextTag.name}\n\n`;

        const commitsBetweenTags = await getCommitsBetweenTags(currentTag.name, nextTag.name);

        commitsBetweenTags.forEach(commit => {
            const pr = prs.find(pr => pr.merge_commit_sha === commit);
            if (pr) changelog += `- ${pr.title} [#${pr.number}](${pr.html_url})\n`;
        });

        changelog += '\n\n';
    }

    return changelog;
}

// getCommitsBetweenTags gets the commits between two tags
async function getCommitsBetweenTags(tag1, tag2) {
    console.log(`Fetching commits for ${tag2}...`)
    const commitsUrl = `https://api.github.com/repos/ccxt/ccxt/compare/${tag2}...${tag1}`;
    const commitsData = await fetch(commitsUrl, token ? { headers } : {}).then(res => res.json()).catch(err => console.log(err));
    if (commitsData && commitsData.commits) {
        return commitsData.commits.map(commit => commit.sha)
    } else {
        console.log ('No commits found: ' + JSON.stringify (commitsData))
        return [];
    }
}

// runCommand executes a shell command and returns a promise
function runCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Command execution failed: ${stderr}`));
          return;
        }
        resolve(stdout.trim());
      });
    });
  }

// fetchAndWriteFullChangelog(); Uncomment and run if you wish to get full Changelog.md
// ----------------------------------------------------------------------------
updateChangelogSinceLastTag();
