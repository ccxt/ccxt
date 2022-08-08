python setup.py sdist bdist_wheel
twine upload dist/* -u __token__ -p ${PYPI_TOKEN}