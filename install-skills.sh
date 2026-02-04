#!/usr/bin/env bash

# CCXT Skills Installation Script
# Installs CCXT usage skills for Claude Code and OpenCode
#
# Usage:
#   Local:  ./install-skills.sh
#   Remote: curl -fsSL https://raw.githubusercontent.com/ccxt/ccxt/master/install-skills.sh | bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Skill names
ALL_SKILLS=("ccxt-typescript" "ccxt-python" "ccxt-php" "ccxt-csharp" "ccxt-go")

# GitHub URL for remote installation
GITHUB_RAW_URL="https://raw.githubusercontent.com/ccxt/ccxt/master/.claude/skills"

# Detect script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_SOURCE_DIR="$SCRIPT_DIR/.claude/skills"

# Target directories
CLAUDE_SKILLS_DIR="$HOME/.claude/skills"
OPENCODE_SKILLS_DIR="$HOME/.opencode/skills"

# Temporary directory for remote installation
TEMP_DIR=""
IS_REMOTE_INSTALL=false

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to display usage
usage() {
    cat <<EOF
CCXT Skills Installer

Usage: $0 [OPTIONS]

Install CCXT usage skills for Claude Code and OpenCode.

OPTIONS:
    --typescript    Install only ccxt-typescript skill
    --python        Install only ccxt-python skill
    --php           Install only ccxt-php skill
    --csharp        Install only ccxt-csharp skill
    --go            Install only ccxt-go skill
    --all           Install all skills (default)
    --help          Display this help message

EXAMPLES:
    $0                      # Interactive mode
    $0 --all               # Install all skills
    $0 --typescript        # Install only TypeScript skill
    $0 --python --php      # Install Python and PHP skills

The skills will be installed to:
  - ~/.claude/skills/ (for Claude Code)
  - ~/.opencode/skills/ (for OpenCode)

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
download_skill() {
    local skill_name=$1
    local temp_skill_dir="$TEMP_DIR/$skill_name"

    mkdir -p "$temp_skill_dir"

    # Download SKILL.md
    local skill_url="$GITHUB_RAW_URL/$skill_name/SKILL.md"
    print_info "Downloading $skill_name from GitHub..."

    if command -v curl &> /dev/null; then
        curl -fsSL "$skill_url" -o "$temp_skill_dir/SKILL.md" 2>/dev/null
    elif command -v wget &> /dev/null; then
        wget -q "$skill_url" -O "$temp_skill_dir/SKILL.md" 2>/dev/null
    else
        print_error "Neither curl nor wget found. Please install one of them."
        return 1
    fi

    if [ $? -eq 0 ] && [ -f "$temp_skill_dir/SKILL.md" ]; then
        return 0
    else
        print_warning "Failed to download $skill_name"
        return 1
    fi
}

# Function to setup remote installation
setup_remote_install() {
    print_info "Setting up remote installation..."

    # Create temporary directory
    TEMP_DIR=$(mktemp -d)
    if [ $? -ne 0 ]; then
        print_error "Failed to create temporary directory"
        exit 1
    fi

    # Download all selected skills
    local download_success=true
    for skill in "${ALL_SKILLS[@]}"; do
        if ! download_skill "$skill"; then
            download_success=false
        fi
    done

    if [ "$download_success" = false ]; then
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
install_skill() {
    local skill_name=$1
    local target_dir=$2
    local skill_source="$SKILLS_SOURCE_DIR/$skill_name"
    local skill_target="$target_dir/$skill_name"

    if [ ! -d "$skill_source" ]; then
        print_warning "Skill source not found: $skill_name"
        return 1
    fi

    # Create target directory if it doesn't exist
    mkdir -p "$target_dir"

    # Copy skill
    if [ -d "$skill_target" ]; then
        print_info "Updating $skill_name..."
        rm -rf "$skill_target"
    fi

    cp -r "$skill_source" "$skill_target"

    if [ $? -eq 0 ]; then
        print_success "Installed $skill_name to $target_dir"
        return 0
    else
        print_error "Failed to install $skill_name"
        return 1
    fi
}

# Function to install skills to a target directory
install_to_target() {
    local target_dir=$1
    local target_name=$2
    local skills=("${@:3}")

    if [ ${#skills[@]} -eq 0 ]; then
        print_info "No skills selected for $target_name"
        return
    fi

    echo ""
    print_info "Installing to $target_name ($target_dir)..."

    local success_count=0
    local fail_count=0

    for skill in "${skills[@]}"; do
        if install_skill "$skill" "$target_dir"; then
            ((success_count++))
        else
            ((fail_count++))
        fi
    done

    echo ""
    if [ $fail_count -eq 0 ]; then
        print_success "Successfully installed $success_count skill(s) to $target_name"
    else
        print_warning "Installed $success_count skill(s), $fail_count failed"
    fi
}

# Function for interactive mode
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
    echo "  6) All skills      - Install all of the above"
    echo "  7) Exit            - Cancel installation"
    echo ""
    read -p "Enter your choice (1-7): " choice

    case $choice in
        1)
            selected_skills=("ccxt-typescript")
            ;;
        2)
            selected_skills=("ccxt-python")
            ;;
        3)
            selected_skills=("ccxt-php")
            ;;
        4)
            selected_skills=("ccxt-csharp")
            ;;
        5)
            selected_skills=("ccxt-go")
            ;;
        6)
            selected_skills=("${ALL_SKILLS[@]}")
            ;;
        7)
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
    local selected_skills=()

    # Detect if running remotely and setup if needed
    if detect_remote_install; then
        # Remote installation - download skills from GitHub
        # In remote mode, default to installing all skills
        if [ $# -eq 0 ]; then
            selected_skills=("${ALL_SKILLS[@]}")
        fi
    fi

    # Parse command line arguments
    if [ $# -eq 0 ]; then
        # No arguments
        if [ "$IS_REMOTE_INSTALL" = false ]; then
            # Local mode - run interactive mode
            check_source_directory
            interactive_mode
        fi
        # Remote mode - already set selected_skills to ALL_SKILLS above
    else
        # Parse flags
        while [ $# -gt 0 ]; do
            case "$1" in
                --help|-h)
                    usage
                    ;;
                --typescript)
                    selected_skills+=("ccxt-typescript")
                    ;;
                --python)
                    selected_skills+=("ccxt-python")
                    ;;
                --php)
                    selected_skills+=("ccxt-php")
                    ;;
                --csharp)
                    selected_skills+=("ccxt-csharp")
                    ;;
                --go)
                    selected_skills+=("ccxt-go")
                    ;;
                --all)
                    selected_skills=("${ALL_SKILLS[@]}")
                    ;;
                *)
                    print_error "Unknown option: $1"
                    echo "Use --help for usage information."
                    exit 1
                    ;;
            esac
            shift
        done
    fi

    # If no skills selected, show error
    if [ ${#selected_skills[@]} -eq 0 ]; then
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
    for skill in "${selected_skills[@]}"; do
        echo "  • $skill"
    done
    echo ""

    # Install to Claude Code
    install_to_target "$CLAUDE_SKILLS_DIR" "Claude Code" "${selected_skills[@]}"

    # Install to OpenCode
    install_to_target "$OPENCODE_SKILLS_DIR" "OpenCode" "${selected_skills[@]}"

    # Display completion message
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    print_success "Installation complete!"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "The skills are now available in Claude Code and OpenCode."
    echo ""
    echo "Usage examples:"
    echo ""
    for skill in "${selected_skills[@]}"; do
        local lang=$(echo "$skill" | sed 's/ccxt-//')
        echo "  /$skill"
        echo "    Get help using CCXT in $lang"
        echo ""
    done
    echo "You can also ask questions like:"
    echo "  \"How do I connect to Binance using CCXT in Python?\""
    echo "  \"Show me how to fetch a ticker in TypeScript\""
    echo "  \"How do I handle errors in CCXT Go?\""
    echo ""
    print_info "Restart your Claude Code/OpenCode session to load the new skills."
    echo ""
}

# Run main function
main "$@"
