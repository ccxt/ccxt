import os

if os.name == 'posix':
    os.system('./fastflake.sh')
else:
    command = 'flake8 --ignore=F722,F841,F821,W504,E402,E501 --exclude static_dependencies,node_modules,.tox'
    os.system(f'cd python && {command}')
