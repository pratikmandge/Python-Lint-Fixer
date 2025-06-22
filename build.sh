#!/bin/bash

# Build script for Python Lint Fixer VS Code Extension

echo "Building Python Lint Fixer Extension..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Compile TypeScript
echo "Compiling TypeScript..."
npm run compile

# Create VSIX package
echo "Creating VSIX package..."
npx vsce package

echo "Build complete! VSIX package created."
echo "To install the extension, run:"
echo "code --install-extension python-lint-fixer-0.1.0.vsix" 