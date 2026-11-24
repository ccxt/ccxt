import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const isWin = process.platform === 'win32';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const javaDir = path.join(root, 'java');
const args = process.argv.slice(2);

const result = isWin
    ? spawnSync(
        args.length > 0
            ? `gradlew.bat cli:run --args="${args.join(' ')}"`
            : 'gradlew.bat cli:run',
        {
            cwd: javaDir,
            stdio: 'inherit',
            shell: true,
        }
    )
    : spawnSync(
        path.join(javaDir, 'gradlew'),
        args.length > 0 ? ['cli:run', `--args=${args.join(' ')}`] : ['cli:run'],
        {
            cwd: javaDir,
            stdio: 'inherit',
        }
    );

if (result.error) {
    console.error(result.error);
}
process.exit(result.status ?? 1);
