#!/bin/sh

# CCXT Skills Installation Script (POSIX sh)
# Installs CCXT usage skills for Claude Code, OpenCode, Codex, and Gemini
#
# Usage:
#   Local:  ./install-skills.sh
#   Remote: curl -fsSL https://raw.githubusercontent.com/ccxt/ccxt/master/install-skills.sh | sh
#   Remote with options: 
#       curl -fsSL https://raw.githubusercontent.com/ccxt/ccxt/master/install-skills.sh | sh -s -- --all
#       curl -fsSL https://raw.githubusercontent.com/ccxt/ccxt/master/install-skills.sh | sh -s -- --typescript
#       curl -fsSL https://raw.githubusercontent.com/ccxt/ccxt/master/install-skills.sh | sh -s -- --python
#       ...

set -e

# Colors for output (printf octal escapes are POSIX)
RED=$(printf '\033[0;31m')
GREEN=$(printf '\033[0;32m')
YELLOW=$(printf '\033[1;33m')
BLUE=$(printf '\033[0;34m')
NC=$(printf '\033[0m') # No Color

# Skill names (space-separated list instead of a bash array)
ALL_SKILLS="ccxt-typescript ccxt-python ccxt-php ccxt-csharp ccxt-go ccxt-cli ccxt-mcp"

# GitHub URL for remote installation
GITHUB_RAW_URL="https://raw.githubusercontent.com/ccxt/ccxt/master/.claude/skills"

# Detect script directory ($0 instead of BASH_SOURCE; falls back to "." when piped)
SCRIPT_DIR=$(cd "$(dirname "$0")" 2>/dev/null && pwd) || SCRIPT_DIR=$(pwd)
SKILLS_SOURCE_DIR="$SCRIPT_DIR/.claude/skills"

# Target directories
CLAUDE_SKILLS_DIR="$HOME/.claude/skills"
OPENCODE_SKILLS_DIR="$HOME/.opencode/skills"
CODEX_SKILLS_DIR="$HOME/skills"
GEMINI_SKILLS_DIR="$HOME/.gemini/skills"

# Temporary directory for remote installation
TEMP_DIR=""
IS_REMOTE_INSTALL=false

# Functions to print colored output
print_success() {
    printf '%s\n' "${GREEN}✓${NC} $1"
}

print_error() {
    printf '%s\n' "${RED}✗${NC} $1"
}

print_info() {
    printf '%s\n' "${BLUE}ℹ${NC} $1"
}

print_warning() {
    printf '%s\n' "${YELLOW}⚠${NC} $1"
}

# Function to display usage
usage() {
    cat <<EOF
CCXT Skills Installer

Usage: $0 [OPTIONS]

Install CCXT usage skills for Claude Code, OpenCode, Codex, and Gemini.

OPTIONS:
    --typescript    Install only ccxt-typescript skill
    --python        Install only ccxt-python skill
    --php           Install only ccxt-php skill
    --csharp        Install only ccxt-csharp skill
    --go            Install only ccxt-go skill
    --cli           Install only ccxt-cli skill
    --all           Install all skills (default)
    --remote        Force download from GitHub, even inside the repo
    --github        Alias for --remote
    --help          Display this help message

EXAMPLES:
    $0                      # Interactive mode
    $0 --all               # Install all skills
    $0 --typescript        # Install only TypeScript skill
    $0 --python --php      # Install Python and PHP skills
    $0 --remote --go       # Install Go skill from GitHub, ignore working tree

The skills will be installed to:
  - ~/.claude/skills/ (for Claude Code)
  - ~/.opencode/skills/ (for OpenCode)
  - ~/skills/ (for Codex)
  - ~/.gemini/skills/ (for Gemini)

EOF
    exit 0
}

# Function to detect if running remotely (piped from curl)
detect_remote_install() {
    # Check if .claude/skills directory exists locally
    if [ ! -d "$SKILLS_SOURCE_DIR" ]; then
        IS_REMOTE_INSTALL=true
        print_info "Running in remote mode - will download skills from GitHub"
        return 0
    fi
    return 1
}

# Function to download a skill from GitHub
# $1 = skill name
download_skill() {
    dl_skill_name=$1
    dl_temp_skill_dir="$TEMP_DIR/$dl_skill_name"

    mkdir -p "$dl_temp_skill_dir"

    # Download SKILL.md
    dl_skill_url="$GITHUB_RAW_URL/$dl_skill_name/SKILL.md"
    print_info "Downloading $dl_skill_name from GitHub..."

    if command -v curl >/dev/null 2>&1; then
        curl -fsSL "$dl_skill_url" -o "$dl_temp_skill_dir/SKILL.md" 2>/dev/null
        dl_status=$?
    elif command -v wget >/dev/null 2>&1; then
        wget -q "$dl_skill_url" -O "$dl_temp_skill_dir/SKILL.md" 2>/dev/null
        dl_status=$?
    else
        print_error "Neither curl nor wget found. Please install one of them."
        return 1
    fi

    if [ "$dl_status" -eq 0 ] && [ -f "$dl_temp_skill_dir/SKILL.md" ]; then
        return 0
    else
        print_warning "Failed to download $dl_skill_name"
        return 1
    fi
}

# Function to setup remote installation
setup_remote_install() {
    print_info "Setting up remote installation..."

    # Create temporary directory
    TEMP_DIR=$(mktemp -d) || {
        print_error "Failed to create temporary directory"
        exit 1
    }

    # Download the selected skills
    ri_download_success=true
    for ri_skill in $selected_skills; do
        if ! download_skill "$ri_skill"; then
            ri_download_success=false
        fi
    done

    if [ "$ri_download_success" = false ]; then
        print_error "Failed to download some skills from GitHub"
        cleanup_remote_install
        exit 1
    fi

    # Update source directory to temp directory
    SKILLS_SOURCE_DIR="$TEMP_DIR"
    print_success "Skills downloaded successfully"
}

# Function to cleanup remote installation
cleanup_remote_install() {
    if [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
}

# Function to check if skills source directory exists
check_source_directory() {
    if [ ! -d "$SKILLS_SOURCE_DIR" ]; then
        print_error "Skills source directory not found: $SKILLS_SOURCE_DIR"
        print_info "Please run this script from the CCXT repository root."
        exit 1
    fi
}

# Function to install a single skill
# $1 = skill name, $2 = target directory
install_skill() {
    is_skill_name=$1
    is_target_dir=$2
    is_skill_source="$SKILLS_SOURCE_DIR/$is_skill_name"
    is_skill_target="$is_target_dir/$is_skill_name"

    if [ ! -d "$is_skill_source" ]; then
        print_warning "Skill source not found: $is_skill_name"
        return 1
    fi

    # Create target directory if it doesn't exist
    mkdir -p "$is_target_dir"

    # Copy skill
    if [ -d "$is_skill_target" ]; then
        print_info "Updating $is_skill_name..."
        rm -rf "$is_skill_target"
    fi

    if cp -R "$is_skill_source" "$is_skill_target"; then
        print_success "Installed $is_skill_name to $is_target_dir"
        return 0
    else
        print_error "Failed to install $is_skill_name"
        return 1
    fi
}

# Function to install skills to a target directory
# $1 = target directory, $2 = target name, $3... = skills
install_to_target() {
    it_target_dir=$1
    it_target_name=$2
    shift 2

    if [ $# -eq 0 ]; then
        print_info "No skills selected for $it_target_name"
        return 0
    fi

    echo ""
    print_info "Installing to $it_target_name ($it_target_dir)..."

    it_success_count=0
    it_fail_count=0

    for it_skill in "$@"; do
        if install_skill "$it_skill" "$it_target_dir"; then
            it_success_count=$((it_success_count + 1))
        else
            it_fail_count=$((it_fail_count + 1))
        fi
    done

    echo ""
    if [ "$it_fail_count" -eq 0 ]; then
        print_success "Successfully installed $it_success_count skill(s) to $it_target_name"
    else
        print_warning "Installed $it_success_count skill(s), $it_fail_count failed"
    fi
}

# Function for interactive mode (sets $selected_skills)
interactive_mode() {
    echo ""
    echo "════════════════════════════════════════════════"
    echo "   CCXT Skills Installer - Interactive Mode"
    echo "════════════════════════════════════════════════"
    echo ""
    echo "Select which skills to install:"
    echo ""
    echo "  1) ccxt-typescript - TypeScript/JavaScript (Node.js & browser, REST & WebSocket)"
    echo "  2) ccxt-python     - Python (sync & async, REST & WebSocket)"
    echo "  3) ccxt-php        - PHP (sync & async, REST & WebSocket)"
    echo "  4) ccxt-csharp     - C#/.NET (REST & WebSocket)"
    echo "  5) ccxt-go         - Go (REST & WebSocket)"
    echo "  6) ccxt-cli        - Command-line interface (terminal, no code)"
    echo "  7) All skills      - Install all of the above"
    echo "  8) Exit            - Cancel installation"
    echo ""
    printf 'Enter your choice (1-8): '

    # When the script is piped into sh (curl ... | sh), stdin is the script
    # itself and is already at EOF, so read from the terminal directly.
    if [ -t 0 ]; then
        read -r choice
    elif (exec < /dev/tty) 2>/dev/null; then
        read -r choice < /dev/tty
    else
        # No terminal available (CI, docker build, etc.) - default to all
        echo ""
        print_warning "No terminal available for interactive input - installing all skills"
        selected_skills="$ALL_SKILLS"
        return 0
    fi

    case $choice in
        1)
            selected_skills="ccxt-typescript"
            ;;
        2)
            selected_skills="ccxt-python"
            ;;
        3)
            selected_skills="ccxt-php"
            ;;
        4)
            selected_skills="ccxt-csharp"
            ;;
        5)
            selected_skills="ccxt-go"
            ;;
        6)
            selected_skills="ccxt-cli"
            ;;
        7)
            selected_skills="$ALL_SKILLS"
            ;;
        8)
            echo "Installation cancelled."
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac

    return 0
}

# Main installation function
main() {
    selected_skills=""
    FORCE_REMOTE=false

    # Parse command line arguments first, so --remote/--github can
    # influence source detection below
    while [ $# -gt 0 ]; do
        case "$1" in
            --help|-h)
                usage
                ;;
            --remote|--github)
                FORCE_REMOTE=true
                ;;
            --typescript)
                selected_skills="$selected_skills ccxt-typescript"
                ;;
            --python)
                selected_skills="$selected_skills ccxt-python"
                ;;
            --php)
                selected_skills="$selected_skills ccxt-php"
                ;;
            --csharp)
                selected_skills="$selected_skills ccxt-csharp"
                ;;
            --go)
                selected_skills="$selected_skills ccxt-go"
                ;;
            --cli)
                selected_skills="$selected_skills ccxt-cli"
                ;;
            --all)
                selected_skills="$ALL_SKILLS"
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information."
                exit 1
                ;;
        esac
        shift
    done

    # Decide the skills source:
    #   --remote/--github  -> always pull from GitHub
    #   otherwise          -> local working tree if present (default),
    #                         GitHub if not (e.g. piped via curl outside the repo)
    if [ "$FORCE_REMOTE" = true ]; then
        IS_REMOTE_INSTALL=true
        print_info "Remote mode forced - will download skills from GitHub"
    else
        detect_remote_install || true
    fi

    # If no skills were selected via flags:
    #   remote mode -> default to all skills
    #   local mode  -> interactive menu
    if [ -z "$selected_skills" ]; then
        if [ "$IS_REMOTE_INSTALL" = true ]; then
            selected_skills="$ALL_SKILLS"
        else
            check_source_directory
            interactive_mode
        fi
    fi

    # Trim leading whitespace from accumulated list
    selected_skills=$(printf '%s' "$selected_skills" | sed 's/^ *//')

    # If no skills selected, show error
    if [ -z "$selected_skills" ]; then
        print_error "No skills selected for installation."
        exit 1
    fi

    # Setup remote installation if needed
    if [ "$IS_REMOTE_INSTALL" = true ]; then
        setup_remote_install
        # Set trap to cleanup on exit
        trap cleanup_remote_install EXIT
    else
        check_source_directory
    fi

    # Display installation summary
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  Installing CCXT Skills"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "Skills to install:"
    for skill in $selected_skills; do
        echo "  • $skill"
    done
    echo ""

    # Install to Claude Code
    # (word splitting of $selected_skills is intentional; skill names contain no spaces)
    # shellcheck disable=SC2086
    install_to_target "$CLAUDE_SKILLS_DIR" "Claude Code" $selected_skills

    # Install to OpenCode
    # shellcheck disable=SC2086
    install_to_target "$OPENCODE_SKILLS_DIR" "OpenCode" $selected_skills

    # Install to Codex
    # shellcheck disable=SC2086
    install_to_target "$CODEX_SKILLS_DIR" "Codex" $selected_skills

    # Install to Gemini
    # shellcheck disable=SC2086
    install_to_target "$GEMINI_SKILLS_DIR" "Gemini" $selected_skills

    # Display completion message
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    print_success "Installation complete!"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "The skills are now available in Claude Code, OpenCode, Codex, and Gemini."
    echo ""
    echo "Usage examples:"
    echo ""
    for skill in $selected_skills; do
        lang=$(printf '%s' "$skill" | sed 's/ccxt-//')
        echo "  /$skill"
        echo "    Get help using CCXT in $lang"
        echo ""
    done
    echo "You can also ask questions like:"
    echo "  \"How do I connect to Binance using CCXT in Python?\""
    echo "  \"Show me how to fetch a ticker in TypeScript\""
    echo "  \"How do I handle errors in CCXT Go?\""
    echo ""
    print_info "Restart your Claude Code/OpenCode/Codex/Gemini session to load the new skills."
    echo ""
}

# Run main function
main "$@"