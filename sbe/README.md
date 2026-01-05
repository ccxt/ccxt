# SBE Code Generation

This directory contains SBE (Simple Binary Encoding) XML schemas and generated code for multiple programming languages.

## Overview

The SBE code generation script automatically:
1. Clones/updates the simple-binary-encoding repository (branch `add-languages`)
2. Cleans all non-XML files from the `sbe` folder and subfolders
3. Generates code for each XML schema file in multiple languages
4. Outputs generated code to `generated-{language}` folders

## Prerequisites

Before running the script, ensure you have the following installed:

- **Java** (JDK 8 or higher)
  - Check: `java -version`
  - Install: [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://openjdk.org/)

- **Maven** (for building the SBE tool)
  - Check: `mvn -version`
  - Install: [Maven Download](https://maven.apache.org/download.cgi)

- **Git**
  - Check: `git --version`
  - Install: [Git Download](https://git-scm.com/downloads)

## Usage

### Running the Script

From the repository root directory:

```bash
./sbe/generate-sbe.sh
```

Or from the `sbe` directory:

```bash
cd sbe
./generate-sbe.sh
```

### What the Script Does

1. **Checks Prerequisites**: Verifies Java is installed
2. **Clones/Updates Repository**: 
   - Clones `https://github.com/pcriadoperez/simple-binary-encoding.git`
   - Checks out the `add-languages` branch
   - Builds the SBE Java generator tool (if needed)
3. **Cleans Non-XML Files**: Removes all files except `.xml` files from the `sbe` folder and subfolders
4. **Generates Code**: For each XML file found:
   - Generates TypeScript code → `generated-typescript/`
   - Generates Python code → `generated-python/`
   - Generates PHP code → `generated-php/`
   - Generates C# code → `generated-csharp/`
   - Generates Go code → `generated-golang/`

### Output Structure

After running the script, your `sbe` directory structure will look like:

```
sbe/
├── binance/
│   ├── spot_3_2.xml
│   ├── generated-typescript/
│   ├── generated-python/
│   ├── generated-php/
│   ├── generated-csharp/
│   └── generated-golang/
├── okx/
│   ├── okx_sbe_1_0.xml
│   ├── generated-typescript/
│   ├── generated-python/
│   ├── generated-php/
│   ├── generated-csharp/
│   └── generated-golang/
└── generate-sbe.sh
```

## Supported Languages

The script generates code for the following languages:

- **TypeScript** (`typescript`)
- **Python** (`python`)
- **PHP** (`php`)
- **C#** (`csharp`)
- **Go** (`golang`)

## Troubleshooting

### Java Not Found

If you see an error about Java not being found:

```bash
# On macOS with Homebrew
brew install openjdk

# On Ubuntu/Debian
sudo apt-get install openjdk-11-jdk

# On Fedora/RHEL
sudo dnf install java-11-openjdk-devel
```

### Maven Build Fails

If the Maven build fails, you can manually build the SBE tool:

```bash
cd /tmp/simple-binary-encoding
mvn clean package -DskipTests
```

### SBE Generator Command Not Found

If the script can't find the SBE generator, check:

1. The repository was cloned successfully
2. Maven build completed without errors
3. The JAR file exists in `sbe-all/target/`

You can manually locate the JAR:

```bash
find /tmp/simple-binary-encoding -name "sbe-all-*.jar"
```

### Language Not Supported

If a specific language fails to generate:

1. Check that the `add-languages` branch includes support for that language
2. Verify the language name mapping in the script matches the SBE tool's expected format
3. Check the SBE repository documentation for supported languages

## Manual Generation

If you need to generate code manually for a specific schema:

```bash
# Set variables
SBE_JAR="/tmp/simple-binary-encoding/sbe-all/target/sbe-all-*.jar"
XML_FILE="sbe/binance/spot_3_2.xml"
OUTPUT_DIR="sbe/binance/generated-typescript"
LANGUAGE="TypeScript"

# Run generator
java -cp "$SBE_JAR" uk.co.real_logic.sbe.SbeTool "$XML_FILE" "$OUTPUT_DIR" "$LANGUAGE"
```

## Notes

- The script uses `/tmp/simple-binary-encoding` as a temporary directory for the SBE repository
- Generated code is placed in `generated-{language}` folders relative to each XML file's location
- The script preserves XML files but removes all other files during cleanup
- If generation fails for a specific language, the script continues with other languages

## Contributing

When adding new SBE schemas:

1. Place the `.xml` file in the appropriate subdirectory (e.g., `sbe/exchange-name/`)
2. Run the generation script
3. Verify the generated code compiles/works for your target language
4. Commit both the XML schema and generated code

