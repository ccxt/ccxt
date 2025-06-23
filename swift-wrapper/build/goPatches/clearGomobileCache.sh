#!/usr/bin/env bash
# older go/gomobile versions can cause `fatal error: bulkBarrierPreWrite: unaligned arguments`, clearing all the go/gomobile caches can fix this

set -eu

echo "Make sure go is v1.24.4 or higher"

echo "Gathering Go cache directories …"
declare -a CANDIDATES

# 1) Build cache
GOCACHE=$(go env GOCACHE 2>/dev/null || true)
[[ -d $GOCACHE ]] && CANDIDATES+=("$GOCACHE")

# 2) Module cache
GOMODCACHE=$(go env GOMODCACHE 2>/dev/null || true)
[[ -d $GOMODCACHE ]] && CANDIDATES+=("$GOMODCACHE")

# 3) GOPATH/pkg (compiled object files)
GOPATH=$(go env GOPATH 2>/dev/null || echo "$HOME/go")
[[ -d $GOPATH/pkg ]] && CANDIDATES+=("$GOPATH/pkg")
GOMOBILE_WORK="/var/folders/mt/*/T/gomobile-work-*"
[[ -d $GOMOBILE_WORK ]] && CANDIDATES+=("$GOMOBILE_WORK")
GOPATH_ROOT="~/go"
[[ -d $GOPATH_ROOT ]] && CANDIDATES+=("$GOMOBILE_WORK")
# 4) Older macOS build cache location
[[ -d $HOME/Library/Caches/go-build ]] && CANDIDATES+=("$HOME/Library/Caches/go-build")

# 5) gomobile caches
[[ -d $HOME/.cache/gomobile      ]] && CANDIDATES+=("$HOME/.cache/gomobile")
[[ -d $GOPATH/pkg/gomobile       ]] && CANDIDATES+=("$GOPATH/pkg/gomobile")
[[ -n ${GOMOBILE_WORK:-} && -d $GOMOBILE_WORK ]] && CANDIDATES+=("$GOMOBILE_WORK")

# stray gomobile work dirs
while IFS= read -r dir; do
    CANDIDATES+=("$dir")
done < <(find "${TMPDIR:-/var/folders}" 2>/dev/null -type d -name 'gomobile-work-*' -prune)

if ((${#CANDIDATES[@]} == 0)); then
    echo "No Go caches found – nothing to clean."
    exit 0
fi

echo
echo "The following cache directories will be removed:"
printf '  %s\n' "${CANDIDATES[@]}"
echo
read -rp "Proceed with deletion? [y/N] " ans
[[ $ans =~ ^[Yy]$ ]] || { echo "Aborted."; exit 1; }

echo "Deleting caches …"
for d in "${CANDIDATES[@]}"; do
    rm -rf "$d"
done
echo "Done – all Go / gomobile caches removed."
 
# sudo rm -rf /var/folders/mt/*/T/gomobile-work-*
# rm -rf ~/go
