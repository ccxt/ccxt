#!/usr/bin/env node
/**
 * EDL Compiler CLI Entry Point
 *
 * This script bootstraps the PureScript-compiled EDL compiler.
 * Usage: edl-compile <input.edl.yaml> [options]
 */

const path = require('path');
const fs = require('fs');

// Check if the compiler has been built
const outputPath = path.join(__dirname, '..', 'output', 'Main', 'index.js');
const distPath = path.join(__dirname, '..', 'dist', 'edl-compiler.js');

let mainModule;

if (fs.existsSync(distPath)) {
  // Use bundled version if available
  mainModule = require(distPath);
} else if (fs.existsSync(outputPath)) {
  // Fall back to development output
  mainModule = require(outputPath);
} else {
  console.error('Error: EDL compiler not built.');
  console.error('Run "npm run build" in edl/purescript/ first.');
  process.exit(1);
}

// Run the main function
mainModule.main();
