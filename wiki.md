# Python Lint Fixer Wiki

## Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Features](#features)
5. [Configuration](#configuration)
6. [Usage Guide](#usage-guide)
7. [Troubleshooting](#troubleshooting)
8. [Development](#development)
9. [Contributing](#contributing)
10. [FAQ](#faq)

## Overview

Python Lint Fixer is a comprehensive VS Code extension designed to automatically format and lint Python code according to custom rules. It provides real-time formatting suggestions, import organization, and code style enforcement to maintain consistent code quality across Python projects.

### Key Benefits
- **Automated Formatting**: Consistent code style without manual effort
- **Smart Import Management**: Organized and deduplicated imports
- **Real-time Feedback**: Visual indicators for formatting suggestions
- **Customizable Rules**: Configurable formatting preferences
- **Performance Optimized**: Fast processing even for large files

## Installation

### Method 1: VSIX Installation (Recommended)
1. Download the latest `.vsix` file from the [releases page](https://github.com/pratikmandge/python-lint-fixer/releases)
2. Open VS Code
3. Go to Extensions (Ctrl+Shift+X)
4. Click the "..." menu in the Extensions panel
5. Select "Install from VSIX..."
6. Choose the downloaded `.vsix` file
7. Click "Install"

### Method 2: Manual Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/pratikmandge/python-lint-fixer.git
   cd python-lint-fixer
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run compile
   ```
4. Package the extension:
   ```bash
   npm run package
   ```
5. Install the generated `.vsix` file

## Quick Start

1. **Open a Python file** in VS Code
2. **Format instantly** by pressing `Ctrl+Shift+Q`
3. **View suggestions** - green highlights indicate formatting opportunities
4. **Apply changes** - the extension automatically formats your code

### First-Time Setup
- The extension activates automatically when you open Python files
- No additional configuration required for basic usage
- Customize settings in VS Code preferences if needed

## Features

### 1. Quote Standardization
- Converts double quotes to single quotes
- Preserves quotes in docstrings and complex dictionary keys
- Maintains string literal integrity

**Before:**
```python
message = "Hello, world!"
data = {"key": "value"}
```

**After:**
```python
message = 'Hello, world!'
data = {'key': 'value'}
```

### 2. Import Organization
- Groups imports into logical categories
- Removes duplicate imports
- Adds proper spacing between groups

**Before:**
```python
import os
import sys
from django import forms
import os  # duplicate
from .models import User
import json
```

**After:**
```python
import json
import os
import sys

from django import forms

from .models import User
```

### 3. Spacing Enforcement
- Ensures consistent spacing before classes and methods
- Maintains proper indentation
- Adds blank lines where needed

**Before:**
```python
class MyClass:
    def method1(self):
        pass
    def method2(self):
        pass
```

**After:**
```python
class MyClass:
    def method1(self):
        pass

    def method2(self):
        pass
```

### 4. Line Wrapping
- Wraps lines exceeding the configured length (default: 85 characters)
- Respects Python syntax and indentation
- Handles complex expressions intelligently

**Before:**
```python
def very_long_function_name_with_many_parameters(param1, param2, param3, param4, param5, param6):
    return param1 + param2 + param3 + param4 + param5 + param6
```

**After:**
```python
def very_long_function_name_with_many_parameters(
    param1, param2, param3, param4, param5, param6
):
    return param1 + param2 + param3 + param4 + param5 + param6
```

### 5. File Endings
- Ensures all files end with a blank line
- Complies with PEP 8 standards

## Configuration

### Settings

Access configuration in VS Code:
1. Open Settings (Ctrl+,)
2. Search for "Python Lint Fixer"
3. Modify settings as needed

### Available Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `pythonLintFixer.maxLineLength` | number | 85 | Maximum line length before wrapping |
| `pythonLintFixer.enableQuotesFix` | boolean | true | Enable quote standardization |
| `pythonLintFixer.enableImportSort` | boolean | true | Enable import sorting and grouping |
| `pythonLintFixer.enableSpacingFix` | boolean | true | Enable spacing fixes |

### Workspace Settings

Create `.vscode/settings.json` in your project root:

```json
{
    "pythonLintFixer.maxLineLength": 88,
    "pythonLintFixer.enableQuotesFix": true,
    "pythonLintFixer.enableImportSort": true,
    "pythonLintFixer.enableSpacingFix": true
}
```

### Keyboard Shortcuts

| Command | Shortcut | Description |
|---------|----------|-------------|
| Fix Current File | Ctrl+Shift+Q | Format the active Python file |
| Fix Workspace | Command Palette | Format all Python files in workspace |

## Usage Guide

### Basic Usage

1. **Format Current File**
   - Press `Ctrl+Shift+Q` while in a Python file
   - Or click the "Fix Python" button in the status bar
   - Or right-click and select "Fix Python File"

2. **Format Entire Workspace**
   - Open Command Palette (Ctrl+Shift+P)
   - Type "Python Lint Fixer: Fix All Python Files in Workspace"
   - Press Enter

3. **View Suggestions**
   - Green highlights indicate formatting opportunities
   - Hover over highlights for detailed explanations
   - Suggestions are non-intrusive and don't block editing

### Advanced Usage

#### Custom Import Grouping
The extension automatically groups imports, but you can influence the grouping:

```python
# System imports (built-in Python modules)
import os
import sys

# External imports (third-party packages)
import django
from flask import Flask

# Project imports (local modules)
from .models import User
from .utils import helper
```

#### Handling Complex Cases

**Long Function Definitions:**
```python
def complex_function(
    param1: str,
    param2: int,
    param3: List[str],
    param4: Optional[Dict[str, Any]] = None,
) -> bool:
    # Function body
    pass
```

**Long Assignments:**
```python
very_long_variable_name = (
    complex_expression_that_needs_wrapping
    + another_part_of_expression
    + final_part
)
```

## Troubleshooting

### Common Issues

#### 1. Extension Not Activating
**Problem**: Extension doesn't work in Python files
**Solution**:
- Ensure the file has `.py` extension
- Check if extension is enabled in Extensions panel
- Restart VS Code

#### 2. Formatting Not Applied
**Problem**: Ctrl+Shift+Q doesn't format the file
**Solution**:
- Check if file is saved
- Verify file is recognized as Python
- Check VS Code's Output panel for errors

#### 3. Import Grouping Issues
**Problem**: Imports not grouped correctly
**Solution**:
- Ensure proper import syntax
- Check for syntax errors in imports
- Verify file encoding is UTF-8

#### 4. Performance Issues
**Problem**: Slow formatting on large files
**Solution**:
- Disable unnecessary features in settings
- Consider breaking large files into smaller modules
- Check for circular imports

### Debug Mode

Enable debug logging:
1. Open Command Palette (Ctrl+Shift+P)
2. Type "Developer: Toggle Developer Tools"
3. Check Console tab for extension logs

### Error Reporting

If you encounter issues:
1. Check the VS Code Output panel
2. Look for "Python Lint Fixer" in the output
3. Report issues with error messages and file examples

## Development

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- VS Code

### Setup Development Environment

1. **Clone the repository**
   ```bash
   git clone https://github.com/pratikmandge/python-lint-fixer.git
   cd python-lint-fixer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Compile TypeScript**
   ```bash
   npm run compile
   ```

4. **Open in VS Code**
   ```bash
   code .
   ```

5. **Press F5** to launch extension in debug mode

### Project Structure

```
python-lint-fixer/
├── src/                    # TypeScript source code
│   ├── extension.ts       # Main extension entry point
│   ├── formatter.ts       # Core formatting logic
│   ├── importSorter.ts    # Import organization
│   └── utils.ts           # Utility functions
├── test/                  # Test files
├── out/                   # Compiled JavaScript
├── package.json           # Extension manifest
├── tsconfig.json          # TypeScript configuration
└── README.md              # Documentation
```

### Building

```bash
# Compile TypeScript
npm run compile

# Run tests
npm test

# Package extension
npm run package
```

### Testing

```bash
# Run unit tests
npm test

# Run linting
npm run lint

# Run all checks
npm run pretest
```

## Contributing

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Add tests** for new functionality
5. **Run tests** to ensure everything works
6. **Submit a pull request**

### Development Guidelines

- Follow TypeScript best practices
- Add comments for complex logic
- Write tests for new features
- Update documentation for changes
- Follow the existing code style

### Code Style

- Use TypeScript strict mode
- Prefer const over let
- Use meaningful variable names
- Add JSDoc comments for public functions
- Keep functions small and focused

## FAQ

### Q: Does this extension conflict with other Python formatters?
A: The extension is designed to work alongside other formatters. It focuses on specific formatting rules and can be used in combination with tools like Black, autopep8, or yapf.

### Q: Can I disable specific formatting features?
A: Yes, you can disable individual features in the VS Code settings. Each formatting feature has its own toggle.

### Q: How does the extension handle existing code?
A: The extension is designed to be non-destructive. It only applies formatting changes and preserves the logical structure of your code.

### Q: Is there a way to preview changes before applying them?
A: Currently, the extension applies changes directly. You can use VS Code's undo feature (Ctrl+Z) to revert changes if needed.

### Q: Does the extension work with Python virtual environments?
A: Yes, the extension works with any Python environment. It operates on the file content and doesn't require a specific Python installation.

### Q: Can I customize the import grouping rules?
A: The current version uses predefined grouping rules. Custom grouping rules may be added in future versions.

### Q: How do I report a bug or request a feature?
A: Please create an issue on the GitHub repository with:
- Detailed description of the problem
- Steps to reproduce
- Expected vs actual behavior
- File examples if applicable

### Q: Is the extension compatible with VS Code Insiders?
A: Yes, the extension is compatible with both stable VS Code and VS Code Insiders.

---

For more information, visit the [GitHub repository](https://github.com/pratikmandge/python-lint-fixer) or check the [README](README.md) file. 