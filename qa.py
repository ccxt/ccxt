import os

if os.name == 'posix':
    os.system('./fastflake.sh')
else:
    os.system('cd python && tox -e qa && cd ..')
