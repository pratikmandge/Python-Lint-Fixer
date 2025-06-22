# Python Lint Fixer - Usage Guide

## Quick Start

1. **Install the Extension**
   ```bash
   cd other/extensions/python-lint-fixer
   ./build.sh
   code --install-extension python-lint-fixer-0.1.0.vsix
   ```

2. **Open a Python File**
   - Open any `.py` file in VS Code
   - The extension will automatically start linting

3. **Fix Issues**
   - Use `Ctrl+Shift+P` and run "Fix Python File"
   - Or use "Fix All Python Files in Workspace" for bulk fixing

## Features in Detail

### 1. Quote Standardization (PLF002)

**What it does:**
- Converts double quotes to single quotes
- Preserves double quotes in docstrings and complex objects

**Examples:**

❌ **Before:**
```python
message = "Hello, world!"
data = {"key": "value"}
```

✅ **After:**
```python
message = 'Hello, world!'
data = {'key': 'value'}
```

**Exceptions:**
```python
# These keep double quotes
docstring = """This is a docstring with "quotes" inside"""
complex_data = {"key": {"nested": "value", "list": [1, 2, 3]}}
```

### 2. Import Organization (PLF003, PLF007)

**What it does:**
- Groups imports by type (system, external, local)
- Sorts alphabetically within groups
- Adds proper spacing

**Examples:**

❌ **Before:**
```python
import json, os
from datetime import datetime
import sys
from myapp.models import User
```

✅ **After:**
```python
import json
import os
import sys

from datetime import datetime

from myapp.models import User
```

### 3. Spacing Rules (PLF004, PLF005)

**What it does:**
- 2 blank lines before classes
- 1 blank line before methods

**Examples:**

❌ **Before:**
```python
def helper():
    pass
class MyClass:
    def __init__(self):
        pass
    def method1(self):
        pass
    def method2(self):
        pass
```

✅ **After:**
```python
def helper():
    pass


class MyClass:
    def __init__(self):
        pass

    def method1(self):
        pass

    def method2(self):
        pass
```

### 4. Line Length Management (PLF001)

**What it does:**
- Enforces 85-character line limit
- Wraps long lines at logical break points

**Examples:**

❌ **Before:**
```python
result = very_long_function_name(parameter1, parameter2, parameter3, parameter4, parameter5)
```

✅ **After:**
```python
result = very_long_function_name(
    parameter1, parameter2, parameter3, parameter4, parameter5
)
```

### 5. File Structure (PLF006)

**What it does:**
- Ensures files end with exactly one blank line

## Configuration

### VS Code Settings

Add to your `settings.json`:

```json
{
  "pythonLintFixer.maxLineLength": 85,
  "pythonLintFixer.enableQuotesFix": true,
  "pythonLintFixer.enableImportSort": true,
  "pythonLintFixer.enableSpacingFix": true,
  "pythonLintFixer.autoFixOnSave": false
}
```

### Workspace Settings

Create `.vscode/settings.json` in your project:

```json
{
  "pythonLintFixer.maxLineLength": 88,
  "pythonLintFixer.autoFixOnSave": true
}
```

## Error Codes Reference

| Code | Description | Severity | Auto-fixable |
|------|-------------|----------|--------------|
| PLF001 | Line exceeds maximum length | Warning | ✅ |
| PLF002 | Use single quotes instead of double quotes | Warning | ✅ |
| PLF003 | Multiple imports should be on separate lines | Warning | ✅ |
| PLF004 | Classes should be preceded by 2 blank lines | Warning | ✅ |
| PLF005 | Methods should be preceded by 1 blank line | Warning | ✅ |
| PLF006 | File should end with a blank line | Warning | ✅ |
| PLF007 | Import groups should be separated by at least 1 blank line | Warning | ✅ |

## Troubleshooting

### Extension Not Working

1. **Check if it's activated:**
   - Open a Python file
   - Check the Problems panel for issues
   - Look for green underlines in the editor

2. **Reload VS Code:**
   - `Ctrl+Shift+P` → "Developer: Reload Window"

3. **Check Output:**
   - `Ctrl+Shift+P` → "Developer: Show Output"
   - Select "Python Lint Fixer" from dropdown

### Issues Not Being Detected

1. **File not recognized as Python:**
   - Ensure file has `.py` extension
   - Check VS Code language mode (bottom-right corner)

2. **Configuration issues:**
   - Check your VS Code settings
   - Ensure extension is enabled

### Performance Issues

1. **Large files:**
   - The extension processes files line by line
   - Very large files (>10k lines) may be slow

2. **Many files:**
   - Use "Fix All Python Files in Workspace" sparingly
   - Consider running it in smaller batches

## Advanced Usage

### Keyboard Shortcuts

Add to `keybindings.json`:

```json
[
  {
    "key": "ctrl+shift+f",
    "command": "python-lint-fixer.fixFile",
    "when": "editorLangId == python"
  }
]
```

### Integration with Other Tools

The extension works well with:
- **Black**: Use this extension first, then Black for additional formatting
- **Flake8**: This extension follows many flake8 rules
- **Pylint**: Complementary static analysis

### Custom Rules

To add custom rules, modify the source code:
1. Edit `src/pythonLinter.ts`
2. Add new linting methods
3. Rebuild the extension

## Examples

### Complete Example

**Before:**
```python
import json, os
from datetime import datetime
import sys

class MyClass:
    def __init__(self):
        self.data = {"key": "value"}
    
    def process_data(self, input_data):
        result = input_data + "processed"
        return result

def main():
    obj = MyClass()
    obj.process_data("test")
    print("This is a very long line that exceeds the maximum line length and should be wrapped to multiple lines for better readability and maintainability")
    return True
```

**After:**
```python
import json
import os
import sys

from datetime import datetime


class MyClass:
    def __init__(self):
        self.data = {'key': 'value'}

    def process_data(self, input_data):
        result = input_data + 'processed'
        return result


def main():
    obj = MyClass()
    obj.process_data('test')
    print(
        'This is a very long line that exceeds the maximum line length and '
        'should be wrapped to multiple lines for better readability and '
        'maintainability'
    )
    return True

```

## Support

For issues and feature requests:
1. Check this usage guide
2. Review the README.md
3. Check the Problems panel for specific error messages
4. Reload VS Code if issues persist 