#!/bin/bash

# Check that all transitive dependencies are explicitly listed in composer.json
# This ensures dependency transparency and helps catch unexpected additions

set -e

# Color functions matching ollog color scheme from transpile.ts
# Green (bright): Success messages
# Red: Error messages  
# Yellow (bright): Warnings
# Magenta/Cyan: Progress/informational messages
color() {
    local color_name="$1"
    shift
    local text="$*"
    
    case "$color_name" in
        green)
            echo -e "\033[1;32m${text}\033[0m"  # bright green
            ;;
        red)
            echo -e "\033[31m${text}\033[0m"    # red
            ;;
        yellow)
            echo -e "\033[1;33m${text}\033[0m"  # bright yellow
            ;;
        magenta)
            echo -e "\033[35m${text}\033[0m"    # magenta
            ;;
        cyan)
            echo -e "\033[36m${text}\033[0m"    # cyan
            ;;
        *)
            echo "$text"
            ;;
    esac
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

color cyan "Checking composer.json dependency completeness..."
echo ""

# Check that all versions are exact (no ^, ~, >=, <=, >, <, *, ||, -)
color magenta "Checking for non-exact version constraints..."
NON_EXACT=$(jq -r '.require | to_entries[] | select(.key | startswith("ext-") | not) | select(.key != "php") | select(.value | test("[\\^~>=<\\*\\|\\-]")) | "\(.key): \(.value)"' composer.json)

if [ -n "$NON_EXACT" ]; then
    color red "✗ The following packages do not use exact version constraints:"
    echo ""
    echo "$NON_EXACT" | while read -r line; do
        color red "  - $line"
    done
    echo ""
    color red "All dependencies must use exact version constraints (e.g., \"1.2.3\" not \"^1.2.3\" or \">=1.2\")."
    exit 1
fi

color green "✓ All version constraints are exact"
echo ""

# Extract direct dependencies from composer.json (excluding php and ext-*)
DIRECT_DEPS=$(jq -r '.require | keys[] | select(startswith("ext-") | not) | select(. != "php")' composer.json | sort)

color yellow "Direct dependencies found in composer.json:"
color magenta "$DIRECT_DEPS" | sed 's/^/  - /'
echo ""

# Collect all transitive dependencies
ALL_TRANSITIVE_DEPS=""
MISSING_DEPS=""

for package in $DIRECT_DEPS; do
    color yellow "Checking transitive dependencies of: $package"
    
    # Get the package's dependencies using composer show with JSON format
    PACKAGE_DEPS=$(composer show "$package" --format=json 2>/dev/null | jq -r '.requires // {} | keys[]' 2>/dev/null || echo "")
    
    if [ -n "$PACKAGE_DEPS" ]; then
        for dep in $PACKAGE_DEPS; do
            # Skip php and ext-* dependencies
            if [[ "$dep" == "php" ]] || [[ "$dep" == ext-* ]]; then
                continue
            fi
            
            # Add to all transitive deps
            ALL_TRANSITIVE_DEPS="$ALL_TRANSITIVE_DEPS $dep"
            
            # Check if this transitive dep is in direct deps
            if ! echo "$DIRECT_DEPS" | grep -q "^${dep}$"; then
                MISSING_DEPS="${MISSING_DEPS}${dep} (required by ${package})
"
            fi
        done
    fi
done

echo ""
color cyan "==================================="
color cyan "Dependency Check Results"
color cyan "==================================="
echo ""

# Get unique missing dependencies
UNIQUE_MISSING=$(echo "$MISSING_DEPS" | grep -v '^$' | sort -u)

if [ -z "$UNIQUE_MISSING" ]; then
    color green "✓ All transitive dependencies are explicitly listed in composer.json"
else
    color red "✗ The following transitive dependencies are NOT in composer.json:"
    echo ""
    echo "$UNIQUE_MISSING" | while read -r line; do
        color red "  - $line"
    done
    echo ""
    color yellow "These packages are installed as dependencies of your direct dependencies"
    color yellow "but are not explicitly listed in composer.json's 'require' section."
    echo ""
    color yellow "To fix this, add them to composer.json with appropriate version constraints."
    exit 1
fi

echo ""
echo ""
color cyan "==================================="
color cyan "Checking package.json dependencies"
color cyan "==================================="
echo ""

# Check that all versions are exact (no ^, ~, >=, <=, >, <, *, ||, -)
color magenta "Checking for non-exact version constraints in package.json..."
NON_EXACT_NPM=$(jq -r '((.dependencies // {}) + (.optionalDependencies // {})) | to_entries[] | select(.value | test("[\\^~>=<\\*\\|\\-]")) | "\(.key): \(.value)"' package.json)

if [ -n "$NON_EXACT_NPM" ]; then
    color red "✗ The following npm packages do not use exact version constraints:"
    echo ""
    echo "$NON_EXACT_NPM" | while read -r line; do
        color red "  - $line"
    done
    echo ""
    color red "All dependencies must use exact version constraints (e.g., \"1.2.3\" not \"^1.2.3\" or \">=1.2\")."
    exit 1
fi

color green "✓ All npm version constraints are exact"
echo ""

# Extract direct dependencies from package.json (dependencies + optionalDependencies)
DIRECT_DEPS_NPM=$(jq -r '((.dependencies // {}) + (.optionalDependencies // {})) | keys[]' package.json | sort)

color yellow "Direct dependencies found in package.json:"
color magenta "$DIRECT_DEPS_NPM" | sed 's/^/  - /'
echo ""

# Collect all transitive dependencies
ALL_TRANSITIVE_DEPS_NPM=""
MISSING_DEPS_NPM=""

for package in $DIRECT_DEPS_NPM; do
    color yellow "Checking transitive dependencies of: $package"
    
    # Get the package's dependencies using npm ls with JSON format
    PACKAGE_DEPS_NPM=$(npm ls "$package" --json --depth=1 2>/dev/null | jq -r '.dependencies["'"$package"'"].dependencies // {} | keys[]' 2>/dev/null || echo "")
    
    if [ -n "$PACKAGE_DEPS_NPM" ]; then
        for dep in $PACKAGE_DEPS_NPM; do
            # Add to all transitive deps
            ALL_TRANSITIVE_DEPS_NPM="$ALL_TRANSITIVE_DEPS_NPM $dep"
            
            # Check if this transitive dep is in direct deps
            if ! echo "$DIRECT_DEPS_NPM" | grep -q "^${dep}$"; then
                MISSING_DEPS_NPM="${MISSING_DEPS_NPM}${dep} (required by ${package})
"
            fi
        done
    fi
done

echo ""
color cyan "==================================="
color cyan "npm Dependency Check Results"
color cyan "==================================="
echo ""

# Get unique missing dependencies
UNIQUE_MISSING_NPM=$(echo "$MISSING_DEPS_NPM" | grep -v '^$' | sort -u)

if [ -z "$UNIQUE_MISSING_NPM" ]; then
    color green "✓ All transitive dependencies are explicitly listed in package.json"
    exit 0
else
    color red "✗ The following transitive dependencies are NOT in package.json:"
    echo ""
    echo "$UNIQUE_MISSING_NPM" | while read -r line; do
        color red "  - $line"
    done
    echo ""
    color yellow "These packages are installed as dependencies of your direct dependencies"
    color yellow "but are not explicitly listed in package.json's 'dependencies' or 'devDependencies' section."
    echo ""
    color yellow "To fix this, add them to package.json with appropriate version constraints."
    exit 1
fi
