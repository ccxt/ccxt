#!/usr/bin/env bash

# SBE Code Generator Script
# This script generates code from SBE XML schemas using the Java generator
# from the simple-binary-encoding repository

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SBE_REPO_URL="https://github.com/pcriadoperez/simple-binary-encoding.git"
SBE_BRANCH="add-languages"
SBE_FOLDER="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SBE_REPO_DIR="$(dirname "$SBE_FOLDER")/tmp/simple-binary-encoding"
LANGUAGES=("typescript" "python" "php" "csharp" "golang")

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Java is installed
check_java() {
    if ! command -v java &> /dev/null; then
        print_error "Java is not installed. Please install Java to run the SBE generator."
        exit 1
    fi
    # Check if Java actually works (not just the command exists)
    if ! java -version &> /dev/null; then
        print_error "Java command exists but cannot execute. Please check your Java installation."
        exit 1
    fi
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | awk -F '"' '{print $2}' || java -version 2>&1 | head -n 1)
    print_info "Found Java: $JAVA_VERSION"
}

# Function to clone or update the SBE repository
setup_sbe_repo() {
    if [ -d "$SBE_REPO_DIR" ]; then
        print_info "SBE repository already exists, updating..."
        cd "$SBE_REPO_DIR"
        # Try to update, but don't fail if git operations are restricted
        git fetch origin 2>/dev/null || print_warn "Could not fetch from origin (may be permission issue)"
        git checkout "$SBE_BRANCH" 2>/dev/null || git checkout -b "$SBE_BRANCH" "origin/$SBE_BRANCH" 2>/dev/null || true
        git pull origin "$SBE_BRANCH" 2>/dev/null || print_warn "Could not pull latest changes (using existing code)"
    else
        print_info "Cloning SBE repository..."
        if ! git clone -b "$SBE_BRANCH" "$SBE_REPO_URL" "$SBE_REPO_DIR" 2>/dev/null; then
            print_error "Failed to clone repository. Please check network connection and permissions."
            exit 1
        fi
    fi
    
    # Build the SBE tool if needed
    cd "$SBE_REPO_DIR"
    
    # First, try to find existing JAR files in common locations
    # Check sbe-all/build/libs first (Gradle default location)
    if [ -d "$SBE_REPO_DIR/sbe-all/build/libs" ]; then
        SBE_JAR=$(find "$SBE_REPO_DIR/sbe-all/build/libs" -name "*.jar" ! -name "*-sources.jar" ! -name "*-javadoc.jar" 2>/dev/null | head -n 1)
    fi
    # Check other possible locations
    if [ -z "$SBE_JAR" ]; then
        SBE_JAR=$(find "$SBE_REPO_DIR" -path "*/build/libs/*.jar" -name "*sbe*all*.jar" 2>/dev/null | head -n 1)
    fi
    if [ -z "$SBE_JAR" ]; then
        SBE_JAR=$(find "$SBE_REPO_DIR" -path "*/target/*.jar" -name "*sbe*all*.jar" 2>/dev/null | head -n 1)
    fi
    
    # If JAR not found, build it
    if [ -z "$SBE_JAR" ]; then
        print_info "SBE JAR not found. Building SBE tool..."
        
        # Try Gradle wrapper first, then system Gradle, then Maven
        if [ -f "$SBE_REPO_DIR/gradlew" ]; then
            print_info "Using Gradle wrapper to build..."
            chmod +x "$SBE_REPO_DIR/gradlew"
            cd "$SBE_REPO_DIR"
            ./gradlew build -x test --quiet 2>&1 | grep -v "^$" || true
        elif command -v gradle &> /dev/null; then
            print_info "Using system Gradle to build..."
            cd "$SBE_REPO_DIR"
            gradle build -x test --quiet 2>&1 | grep -v "^$" || true
        elif command -v mvn &> /dev/null; then
            print_info "Using Maven to build..."
            cd "$SBE_REPO_DIR"
            mvn clean package -DskipTests -q 2>&1 | grep -v "^$" || true
        else
            print_error "No build tool found (Gradle or Maven). Please install one."
            print_info "Install Gradle: https://gradle.org/install/"
            print_info "Or install Maven: https://maven.apache.org/download.cgi"
            exit 1
        fi
        
        # Find the JAR file after build
        if [ -d "$SBE_REPO_DIR/sbe-all/build/libs" ]; then
            SBE_JAR=$(find "$SBE_REPO_DIR/sbe-all/build/libs" -name "*.jar" ! -name "*-sources.jar" ! -name "*-javadoc.jar" 2>/dev/null | head -n 1)
        fi
        if [ -z "$SBE_JAR" ]; then
            SBE_JAR=$(find "$SBE_REPO_DIR" -path "*/build/libs/*.jar" -name "*sbe*all*.jar" 2>/dev/null | head -n 1)
        fi
        if [ -z "$SBE_JAR" ]; then
            SBE_JAR=$(find "$SBE_REPO_DIR" -path "*/target/*.jar" -name "*sbe*all*.jar" 2>/dev/null | head -n 1)
        fi
    fi
    
    if [ -z "$SBE_JAR" ]; then
        print_error "SBE JAR file not found after build."
        print_info "Please build manually:"
        print_info "  cd $SBE_REPO_DIR"
        if [ -f "$SBE_REPO_DIR/gradlew" ]; then
            print_info "  ./gradlew build"
        elif command -v gradle &> /dev/null; then
            print_info "  gradle build"
        else
            print_info "  mvn clean package"
        fi
        exit 1
    fi
    print_info "Using SBE JAR: $SBE_JAR"
}

# Function to delete all non-XML files in sbe folder and subfolders
cleanup_non_xml() {
    print_info "Cleaning up non-XML files in sbe folder..."
    # Delete all non-XML files except the script itself and README
    find "$SBE_FOLDER" -type f ! -name "*.xml" ! -name "generate-sbe.sh" ! -name "README.md" -delete
    print_info "Cleanup complete. Only XML files, script, and README remain."
}

# Function to find all XML files recursively
find_xml_files() {
    find "$SBE_FOLDER" -type f -name "*.xml" | sort
}

# Function to get output directory for a language
# Returns path relative to SBE folder (matching instructions format)
get_output_dir() {
    local xml_file="$1"
    local language="$2"
    local xml_dir=$(dirname "$xml_file")
    
    # Get relative path from SBE folder
    local rel_dir="${xml_dir#$SBE_FOLDER/}"
    if [ "$rel_dir" = "$xml_dir" ]; then
        # If not a subdirectory, use just the directory name
        rel_dir=$(basename "$xml_dir")
    fi
    
    # Create generated-{language} folder in the same directory as the XML file
    # Return relative to SBE folder to match instructions
    if [ "$rel_dir" = "." ] || [ -z "$rel_dir" ]; then
        echo "generated-$language"
    else
        echo "$rel_dir/generated-$language"
    fi
}

# Function to generate code for a single XML file and language
generate_code() {
    local xml_file="$1"
    local language="$2"
    local output_dir=$(get_output_dir "$xml_file" "$language")
    
    print_info "Generating $language code from $(basename "$xml_file")..."
    
    # Map language names to SBE generator language codes (as per instructions)
    local sbe_language=""
    local extra_props=""
    case "$language" in
        "typescript")
            sbe_language="TYPESCRIPT"
            ;;
        "python")
            sbe_language="PYTHON"
            # Python needs keyword append token for reserved words like 'break'
            extra_props="-Dsbe.keyword.append.token=_"
            ;;
        "php")
            sbe_language="PHP"
            ;;
        "csharp")
            # C# uses the full class name
            sbe_language="uk.co.real_logic.sbe.generation.csharp.CSharp"
            ;;
        "golang")
            sbe_language="Golang"
            ;;
        *)
            print_error "Unknown language: $language"
            return 1
            ;;
    esac
    
    # Get relative XML file path (matching instructions format)
    local xml_rel_path="${xml_file#$SBE_FOLDER/}"
    if [ "$xml_rel_path" = "$xml_file" ]; then
        xml_rel_path=$(basename "$xml_file")
    fi
    
    # Run the SBE generator using system properties (as per instructions)
    # Format: java -Dsbe.output.dir=<dir> -Dsbe.target.language=<lang> [-Dsbe.keyword.append.token=_] -jar <jar> <xml>
    # Change to SBE folder directory to match instructions (uses relative paths)
    cd "$SBE_FOLDER"
    
    # Create output directory (relative to SBE folder)
    mkdir -p "$output_dir"
    
    local cmd="java -Dsbe.output.dir=$output_dir -Dsbe.target.language=$sbe_language"
    if [ -n "$extra_props" ]; then
        cmd="$cmd $extra_props"
    fi
    cmd="$cmd -jar $SBE_JAR $xml_rel_path"
    
    print_info "Running: $cmd"
    if eval "$cmd" 2>&1; then
        print_info "✓ Successfully generated $language code to $output_dir"
    else
        print_error "Failed to generate $language code from $xml_file"
        print_info "Command attempted: $cmd"
        return 1
    fi
}

# Main execution
main() {
    print_info "Starting SBE code generation..."
    print_info "SBE folder: $SBE_FOLDER"
    
    # Check prerequisites
    check_java
    
    # Setup SBE repository
    setup_sbe_repo
    
    # Cleanup non-XML files
    cleanup_non_xml
    
    # Find all XML files
    XML_FILES=($(find_xml_files))
    
    if [ ${#XML_FILES[@]} -eq 0 ]; then
        print_warn "No XML files found in $SBE_FOLDER"
        exit 0
    fi
    
    print_info "Found ${#XML_FILES[@]} XML file(s)"
    
    # Generate code for each XML file and each language
    local errors=0
    for xml_file in "${XML_FILES[@]}"; do
        print_info "Processing: $xml_file"
        for language in "${LANGUAGES[@]}"; do
            if ! generate_code "$xml_file" "$language"; then
                ((errors++))
            fi
        done
    done
    
    if [ $errors -eq 0 ]; then
        print_info "✓ All code generation completed successfully!"
    else
        print_warn "Completed with $errors error(s)"
        exit 1
    fi
}

# Run main function
main "$@"

