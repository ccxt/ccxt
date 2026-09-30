cd "$(dirname "$0")/.." && python -m build --outdir python/dist
twine upload python/dist/* -u __token__ -p ${PYPI_TOKEN}
