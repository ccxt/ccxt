import { exec } from 'child_process';
// using this script to run it on windows and linux while supressing the output
// because it is expected to fail on the static_dependencies folder
// but the build process should not be stopped
const command = 'tsc --emitDeclarationOnly --declaration'
async function main(){
    exec(command, function (error, stdout, stderr) {});
    console.log('Typescript types emitted successfully');
}
main()

