#!/bin/bash

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source .venv/bin/activate

# Check if packages are installed and install only if needed
echo "Checking and installing required packages..."

# Function to check if a package is installed
check_package() {
    python -c "import pkg_resources; pkg_resources.require('$1')" 2>/dev/null
    return $?
}

# Check and install setuptools
if ! check_package "setuptools"; then
    echo "Installing setuptools..."
    pip install setuptools
else
    echo "setuptools already installed."
fi

# Check and install wheel
if ! check_package "wheel"; then
    echo "Installing wheel..."
    pip install wheel
else
    echo "wheel already installed."
fi

# Check and install twine
if ! check_package "twine"; then
    echo "Installing twine..."
    pip install twine
else
    echo "twine already installed."
fi

# Build and upload
echo "Building distribution packages..."
python setup.py sdist bdist_wheel

echo "Uploading to PyPI..."
twine upload dist/* -u __token__ -p  ${PYPI_TOKEN}

# Deactivate virtual environment
echo "Deactivating virtual environment..."
deactivate