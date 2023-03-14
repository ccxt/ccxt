import subprocess
# using this script to run it on windows and linux while supressing the output
# because it is expected to fail on the static_dependencies folder
# but the build process should not be stopped
command = 'tsc --emitDeclarationOnly --declaration'
subprocess.getoutput(command)