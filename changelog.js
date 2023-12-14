import fs from 'fs/promises';

const owner = 'ccxt';
const repo = 'ccxt';

const tagsUrl = `https://api.github.com/repos/${owner}/${repo}/tags?per_page=100&page=1`;
const prsUrl = `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&per_page=100&page=1`;
const filePath = 'CHANGELOG.md';

const token = 'GITHUB_TOKEN'; // Replace with your GitHub personal access token

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

async function fetchAndWriteFullChangelog() {
    try {
        const tags = await getAllTags();

        const changelogContent = await generateChangelog(tags);
        await fs.writeFile('CHANGELOG.md', changelogContent);
        console.log('Changelog created successfully.');
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}

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

// Function to get the commits between two tags
async function getCommitsBetweenTags(tag1, tag2) {
    console.log(`Fetching commits for ${tag2}...`)
    const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/compare/${tag2}...${tag1}`;
    const commitsData = await fetch(commitsUrl, { headers }).then(res => res.json()).catch(err => console.log(err));
    if (commitsData && commitsData.commits) {
        return commitsData.commits.map(commit => commit.sha)
    } else {
        console.log ('No commits found: ' + JSON.stringify (commitsData))
        return [];
    }
}

fetchAndWriteFullChangelog();
