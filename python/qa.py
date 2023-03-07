import os

if os.name == 'posix':
    code = os.WEXITSTATUS(os.system('./fastflake.sh'))
    exit(code)
else:
    command = 'flake8 -v --ignore=F631,F722,F841,F821,W504,E402,E501,E275,E902 --exclude static_dependencies,node_modules,.tox'
    print(f'\n{command}\n')
    os.system(command)
