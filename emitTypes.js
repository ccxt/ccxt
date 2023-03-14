import { spawnSync, execSync } from 'child_process';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isCmd() {
  if (os.platform() !== 'win32') {
    return false
  }

  try {
    const result = spawnSync(`ls`, {
      stdio: 'pipe',
    })

    return result.error !== undefined
  } catch (err) {
    return true
  }
}

try {
            
    const cmd = 'tsc --emitDeclarationOnly --declaration';
    if (process.platform === 'win32') {
        const suffix = ' -p "' + __dirname + '"' ; 
        const commandCmd = cmd + suffix + ' > NUL 2>&1';
        const commandPowershell = cmd +  suffix + ' > $null';
        // different command for cmd vs powershell (https://stackoverflow.com/questions/52021428/)
        if (isCmd()) {
            execSync(commandCmd, {stdio: 'inherit'});
        } else {
            execSync(commandPowershell, {stdio: 'inherit'});
        }
    } else {
        execSync(cmd + ' > /dev/null 2>&1');
    }
}
catch (err) {
    //console.log(err);
}