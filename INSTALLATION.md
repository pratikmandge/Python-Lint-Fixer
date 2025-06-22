# 🚀 Installation Guide - Python Lint Fixer

## 📋 Prerequisites

- **Visual Studio Code** (version 1.60.0 or higher)
- **Node.js** (version 14 or higher) - for development only
- **npm** (comes with Node.js) - for development only

## 🎯 Quick Installation

### Method 1: VSIX Package (Recommended)

1. **Download the VSIX file:**
   - Get `python-lint-fixer-0.1.0.vsix` from the releases
   - Or build it yourself (see Development section)

2. **Install in VS Code:**
   ```bash
   code --install-extension python-lint-fixer-0.1.0.vsix
   ```

3. **Reload VS Code:**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
   - Type "Developer: Reload Window"
   - Press Enter

4. **Verify Installation:**
   - Open any Python file (`.py`)
   - Look for the lightbulb button in the status bar
   - Or press `Ctrl+Shift+Q` to test the extension

### Method 2: Development Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pratik-mandge/python-lint-fixer.git
   cd python-lint-fixer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the extension:**
   ```bash
   npm run compile
   ```

4. **Package the extension:**
   ```bash
   npx vsce package
   ```

5. **Install the extension:**
   ```bash
   code --install-extension python-lint-fixer-0.1.0.vsix
   ```

## 🔧 Configuration

### Basic Settings

Add to your VS Code settings (`Ctrl+,`):

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

### Keybindings

Add to your keybindings (`Ctrl+K Ctrl+S`):

```json
[
  {
    "key": "ctrl+shift+q",
    "command": "python-lint-fixer.fixFile",
    "when": "editorLangId == python"
  }
]
```

## 🎮 Usage

### Quick Start

1. **Open a Python file** in VS Code
2. **Look for the lightbulb button** in the status bar (bottom-right)
3. **Click the button** or press `Ctrl+Shift+Q`
4. **Watch the magic happen!** ✨

### Commands

- **`Ctrl+Shift+P`** → "Fix Python File" - Fix current file
- **`Ctrl+Shift+P`** → "Fix All Python Files in Workspace" - Fix all files
- **`Ctrl+Shift+Q`** - Quick fix current file (when Python file is active)

### Context Menu

- **Right-click** in a Python file editor
- Select **"Fix Python File"** from the context menu

## 🔍 Verification

### Test the Extension

1. **Create a test file** `test.py`:
   ```python
   from payments.models import PaymentTransactions
   from accounting.models import Allocation, CashFlow, ColendingAllocation, ColendingCashFlow
   from bookkeeping.models import *
   from datetime import datetime
   
   pmt = PaymentTransactions.objects.get(payment_transaction_id="test-transaction-id-1211145")
   ```

2. **Format the file:**
   - Press `Ctrl+Shift+Q`
   - Or click the lightbulb button

3. **Expected result:**
   ```python
   from datetime import datetime
   
   from accounting.models import (
       Allocation, CashFlow, ColendingAllocation, ColendingCashFlow
   )
   
   from bookkeeping.models import *
   
   from payments.models import PaymentTransactions
   
   pmt = PaymentTransactions.objects.get(
       payment_transaction_id='test-transaction-id-1211145'
   )
   ```

## 🛠️ Troubleshooting

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

## 🔄 Updates

### Updating the Extension

1. **Download the new VSIX file**
2. **Uninstall the old version:**
   ```bash
   code --uninstall-extension pratik_mandge.python-lint-fixer
   ```
3. **Install the new version:**
   ```bash
   code --install-extension python-lint-fixer-0.1.0.vsix
   ```

### Building from Source

```bash
cd python-lint-fixer
npm install
npm run compile
npx vsce package
code --install-extension python-lint-fixer-0.1.0.vsix
```

## 📞 Support

### Getting Help

- **Documentation:** [README.md](README.md)
- **Issues:** [GitHub Issues](https://github.com/pratik-mandge/python-lint-fixer/issues)
- **Email:** pratik.mandge@example.com

### Common Issues

| Issue | Solution |
|-------|----------|
| Extension not showing | Reload VS Code window |
| No linting issues | Check if file has `.py` extension |
| Build errors | Ensure Node.js and npm are installed |
| Installation fails | Try running VS Code as administrator |

## 🎉 Success!

Once installed, you'll have:
- ✅ **Real-time Python linting**
- ✅ **One-click code formatting**
- ✅ **Smart import organization**
- ✅ **Professional code style**

**Happy coding! 🐍✨** 