ver=$(node -p "require('./package.json').version")
IFS='.' read -r major minor patch <<< "$ver"

patch=$((patch + 1))

# If patch hits 100, bump minor & reset patch, eg: 4.4.99 -> 4.5.0
if [ "$patch" -ge 100 ]; then
  minor=$((minor + 1))
  patch=0
fi

newver="$major.$minor.$patch"

echo "$newver"