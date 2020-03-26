python setup.py sdist bdist_wheel
twine upload dist/* -u x84 -p ${PYPI_PASSWORD} --repository-url https://pypi.python.org/pypi