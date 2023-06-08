import os
import sys

if len(sys.argv) > 1:
    flak8_args = sys.argv[1:]
    command = 'flake8 --ignore=F722,F841,F821,W504,E402,E501,E275,E902 ' + 'ccxt/' + ' ccxt/'.join(flak8_args)
    print(f'\n{command}\n')
    os.system(command)
    exit()

if os.name == 'posix':
    code = os.WEXITSTATUS(os.system('./fastflake.sh'))
    exit(code)
else:
    command = 'flake8 --ignore=F722,F841,F821,W504,E402,E501,E275,E902 --exclude static_dependencies,node_modules,.tox,build'
    print(f'\n{command}\n')
    os.system(command)
