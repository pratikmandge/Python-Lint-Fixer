"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonFormatter = void 0;
const vscode = __importStar(require("vscode"));
class PythonFormatter {
    constructor() {
        this.maxLineLength = 85;
        const config = vscode.workspace.getConfiguration('pythonLintFixer');
        this.maxLineLength = config.get('maxLineLength', 85);
    }
    async formatDocument(document) {
        const text = document.getText();
        const formattedText = this.formatText(text);
        if (formattedText !== text) {
            const edit = new vscode.WorkspaceEdit();
            const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
            edit.replace(document.uri, fullRange, formattedText);
            await vscode.workspace.applyEdit(edit);
        }
    }
    formatText(text) {
        let formatted = text;
        // Check if already formatted to prevent re-formatting
        if (this.isAlreadyFormatted(text)) {
            return text;
        }
        // Apply all formatting rules
        formatted = this.fixQuotes(formatted);
        formatted = this.formatImports(formatted);
        formatted = this.fixSpacing(formatted);
        formatted = this.fixLineLength(formatted);
        formatted = this.ensureFileEnding(formatted);
        return formatted;
    }
    isAlreadyFormatted(text) {
        const lines = text.split('\n');
        // Check for already formatted imports with parentheses
        for (const line of lines) {
            if (line.trim().startsWith('from ') && line.includes('import (') && line.includes(')')) {
                return true;
            }
        }
        // Check for already formatted function definitions
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim().startsWith('def ') && line.includes('(') && !line.includes(')')) {
                // Look for closing parenthesis on next lines
                for (let j = i + 1; j < lines.length; j++) {
                    if (lines[j].trim().includes(')')) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    fixQuotes(text) {
        const lines = text.split('\n');
        const fixedLines = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Skip docstrings
            if (this.isInDocstring(i, lines)) {
                fixedLines.push(line);
                continue;
            }
            // Replace double quotes with single quotes where appropriate
            let fixedLine = line.replace(/"([^"]*)"(?!\s*[=:])/g, (match, content) => {
                // Skip if it's a Python object key/value with complex content
                if (this.isPythonObjectKeyValue(content)) {
                    return match;
                }
                // Skip if it contains single quotes
                if (content.includes("'")) {
                    return match;
                }
                return `'${content}'`;
            });
            fixedLines.push(fixedLine);
        }
        return fixedLines.join('\n');
    }
    isInDocstring(lineIndex, lines) {
        // Simple docstring detection
        for (let i = 0; i <= lineIndex; i++) {
            const line = lines[i];
            if (line.includes('"""') || line.includes("'''")) {
                return true;
            }
        }
        return false;
    }
    isPythonObjectKeyValue(content) {
        return /[{}[\],]/.test(content) || /\s+/.test(content);
    }
    formatImports(text) {
        const lines = text.split('\n');
        const importLines = [];
        const nonImportLines = [];
        // Parse imports and detect multi-line imports
        let i = 0;
        while (i < lines.length) {
            const line = lines[i];
            if (line.trim().startsWith('import ') || line.trim().startsWith('from ')) {
                // Check if this is a multi-line import
                let isMultiLine = false;
                let fullImport = line;
                let j = i + 1;
                // Look for continuation lines (parentheses, backslashes, etc.)
                while (j < lines.length) {
                    const nextLine = lines[j];
                    if (nextLine.trim().startsWith('(') ||
                        nextLine.trim().startsWith(')') ||
                        nextLine.trim().endsWith('\\') ||
                        nextLine.trim().startsWith('    ') ||
                        nextLine.trim().startsWith('\t')) {
                        fullImport += '\n' + nextLine;
                        isMultiLine = true;
                        j++;
                    }
                    else {
                        break;
                    }
                }
                importLines.push({
                    line: i,
                    content: fullImport,
                    type: line.trim().startsWith('import ') ? 'import' : 'from',
                    isMultiLine: isMultiLine
                });
                i = j;
            }
            else {
                nonImportLines.push({ line: i, content: line });
                i++;
            }
        }
        if (importLines.length === 0) {
            return text;
        }
        // Group and sort imports
        const groupedImports = this.groupAndSortImports(importLines);
        // Reconstruct the file with imports first, then other content
        const result = [];
        // Add grouped imports
        for (let i = 0; i < groupedImports.length; i++) {
            result.push(...groupedImports[i]);
            if (i < groupedImports.length - 1) {
                result.push(''); // Add blank line between groups
            }
        }
        // Add blank line after imports
        if (groupedImports.length > 0) {
            result.push('');
        }
        // Add non-import lines
        for (const nonImportLine of nonImportLines) {
            result.push(nonImportLine.content);
        }
        return result.join('\n');
    }
    groupAndSortImports(importLines) {
        // Remove duplicates first
        const uniqueImports = importLines.filter((importLine, index, self) => index === self.findIndex(t => t.content === importLine.content));
        // Categorize imports
        const systemImports = [];
        const externalImports = [];
        const projectImports = [];
        for (const importLine of uniqueImports) {
            const moduleName = this.extractModuleName(importLine.content);
            if (this.isSystemModule(moduleName)) {
                systemImports.push(importLine.content);
            }
            else if (this.isExternalModule(moduleName)) {
                externalImports.push(importLine.content);
            }
            else {
                projectImports.push(importLine.content);
            }
        }
        // Sort each category alphabetically
        systemImports.sort();
        externalImports.sort();
        projectImports.sort();
        // Group project imports by first module part
        const groupedProjectImports = this.groupProjectImports(projectImports);
        // Combine all groups in the correct order
        const allGroups = [];
        if (systemImports.length > 0) {
            allGroups.push(systemImports);
        }
        if (externalImports.length > 0) {
            allGroups.push(externalImports);
        }
        allGroups.push(...groupedProjectImports);
        return allGroups;
    }
    isSystemModule(moduleName) {
        const systemModules = [
            'os', 'sys', 're', 'json', 'datetime', 'time', 'math', 'random',
            'collections', 'itertools', 'functools', 'pathlib', 'typing',
            'urllib', 'http', 'socket', 'threading', 'multiprocessing',
            'subprocess', 'logging', 'traceback', 'weakref', 'copy',
            'pickle', 'shelve', 'sqlite3', 'hashlib', 'hmac', 'base64',
            'zlib', 'gzip', 'bz2', 'lzma', 'zipfile', 'tarfile',
            'shutil', 'tempfile', 'glob', 'fnmatch', 'linecache',
            'stat', 'pwd', 'grp', 'pwd', 'crypt', 'termios', 'tty',
            'pty', 'fcntl', 'select', 'epoll', 'kqueue', 'signal',
            'atexit', 'gc', 'inspect', 'ast', 'dis', 'pickletools',
            'profile', 'pstats', 'timeit', 'trace', 'tracemalloc',
            'asyncio', 'concurrent', 'contextlib', 'abc', 'enum',
            'dataclasses', 'typing_extensions'
        ];
        return systemModules.some(module => moduleName.startsWith(module));
    }
    isExternalModule(moduleName) {
        const externalModules = [
            'django', 'flask', 'fastapi', 'requests', 'numpy', 'pandas',
            'matplotlib', 'seaborn', 'scipy', 'sklearn', 'tensorflow',
            'torch', 'pytorch', 'opencv', 'pillow', 'selenium', 'beautifulsoup',
            'lxml', 'xml', 'yaml', 'toml', 'configparser', 'argparse',
            'click', 'typer', 'pydantic', 'sqlalchemy', 'psycopg2', 'mysql',
            'redis', 'celery', 'kombu', 'boto3', 'azure', 'google',
            'stripe', 'paypal', 'twilio', 'sendgrid', 'mailgun',
            'elasticsearch', 'kafka', 'rabbitmq', 'pika', 'aiohttp',
            'httpx', 'websockets', 'socketio', 'jinja2', 'mako',
            'markdown', 'rst', 'docutils', 'sphinx', 'pytest', 'unittest',
            'mock', 'factory_boy', 'faker', 'freezegun', 'responses',
            'vcrpy', 'coverage', 'black', 'flake8', 'pylint', 'mypy',
            'isort', 'pre-commit', 'tox', 'pip', 'setuptools', 'wheel',
            'twine', 'build', 'poetry', 'pipenv', 'conda', 'anaconda'
        ];
        return externalModules.some(module => moduleName.startsWith(module));
    }
    groupProjectImports(projectImports) {
        const groups = {};
        for (const importLine of projectImports) {
            const moduleName = this.extractModuleName(importLine);
            const firstPart = moduleName.split('.')[0];
            if (!groups[firstPart]) {
                groups[firstPart] = [];
            }
            groups[firstPart].push(importLine);
        }
        // Convert to array and sort by module name
        return Object.keys(groups)
            .sort()
            .map(key => groups[key].sort());
    }
    extractModuleName(importLine) {
        const importMatch = importLine.match(/^import\s+([^#\n]+)/);
        const fromMatch = importLine.match(/^from\s+([^#\n]+)/);
        if (importMatch) {
            return importMatch[1].split('.')[0];
        }
        else if (fromMatch) {
            return fromMatch[1].split('.')[0];
        }
        return '';
    }
    fixSpacing(text) {
        const lines = text.split('\n');
        const fixedLines = [];
        let inClass = false;
        let lastClassLine = -1;
        let lastMethodLine = -1;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            // Check for class definition
            if (trimmedLine.startsWith('class ')) {
                // Add 2 blank lines before class if not at the beginning
                if (i > 0 && fixedLines.length > 0) {
                    fixedLines.push('', '');
                }
                inClass = true;
                lastClassLine = i;
                fixedLines.push(line);
                continue;
            }
            // Check for method definition
            if (trimmedLine.match(/^def\s+\w+\s*\(/)) {
                // Add 1 blank line before method if not immediately after class
                if (i > lastClassLine + 1 && i > lastMethodLine + 1) {
                    fixedLines.push('');
                }
                lastMethodLine = i;
                fixedLines.push(line);
                continue;
            }
            // Check for end of class
            if (inClass && trimmedLine === '' && i > lastMethodLine) {
                inClass = false;
            }
            fixedLines.push(line);
        }
        return fixedLines.join('\n');
    }
    fixLineLength(text) {
        const lines = text.split('\n');
        const fixedLines = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.length <= this.maxLineLength) {
                fixedLines.push(line);
                continue;
            }
            // Handle import statements with long import lists
            if (line.trim().startsWith('from ') && line.includes('import ') && line.includes(',')) {
                const wrappedImport = this.wrapImportLine(line);
                fixedLines.push(...wrappedImport);
                continue;
            }
            // Handle function definitions
            if (line.trim().startsWith('def ') && line.includes('(') && !line.includes(')')) {
                const wrappedFunction = this.wrapFunctionDefinition(lines, i);
                fixedLines.push(...wrappedFunction.lines);
                i = wrappedFunction.nextIndex - 1; // Adjust index
                continue;
            }
            // Try to wrap long lines
            const wrappedLines = this.wrapLine(line);
            fixedLines.push(...wrappedLines);
        }
        return fixedLines.join('\n');
    }
    wrapImportLine(line) {
        const originalIndent = this.getIndentation(line);
        const content = line.substring(originalIndent.length);
        // Extract the import part and the items
        const importMatch = content.match(/^(from\s+\S+\s+import\s+)(.+)$/);
        if (!importMatch) {
            return [line];
        }
        const importPart = importMatch[1];
        const items = importMatch[2];
        // Split items by comma
        const itemList = items.split(',').map(item => item.trim()).filter(item => item);
        if (itemList.length <= 1) {
            return [line];
        }
        // Format with parentheses
        const result = [];
        result.push(originalIndent + importPart + '(');
        for (let i = 0; i < itemList.length; i++) {
            const item = itemList[i];
            const isLast = i === itemList.length - 1;
            result.push(originalIndent + '    ' + item + (isLast ? '' : ','));
        }
        result.push(originalIndent + ')');
        return result;
    }
    wrapFunctionDefinition(lines, startIndex) {
        const result = [];
        const originalIndent = this.getIndentation(lines[startIndex]);
        const content = lines[startIndex].substring(originalIndent.length);
        // Extract function name and parameters
        const funcMatch = content.match(/^(def\s+\w+\s*\()(.+)$/);
        if (!funcMatch) {
            return { lines: [lines[startIndex]], nextIndex: startIndex + 1 };
        }
        const funcStart = funcMatch[1];
        const params = funcMatch[2];
        // Check if parameters end on this line
        if (params.includes(')')) {
            // Simple case - parameters fit on one line
            return { lines: [lines[startIndex]], nextIndex: startIndex + 1 };
        }
        // Complex case - parameters span multiple lines
        result.push(originalIndent + funcStart);
        // Collect all parameter lines
        let paramLines = [];
        let i = startIndex + 1;
        let foundClosing = false;
        while (i < lines.length) {
            const line = lines[i];
            paramLines.push(line);
            if (line.trim().includes(')')) {
                foundClosing = true;
                break;
            }
            i++;
        }
        if (!foundClosing) {
            // Malformed function, return as is
            return { lines: [lines[startIndex]], nextIndex: startIndex + 1 };
        }
        // Format parameters
        const allParams = paramLines.join(' ').replace(/\s+/g, ' ').trim();
        const paramMatch = allParams.match(/^(.+)\)(.*)$/);
        if (paramMatch) {
            const params = paramMatch[1];
            const suffix = paramMatch[2];
            // Split parameters
            const paramList = params.split(',').map(p => p.trim()).filter(p => p);
            for (let j = 0; j < paramList.length; j++) {
                const param = paramList[j];
                const isLast = j === paramList.length - 1;
                result.push(originalIndent + '    ' + param + (isLast ? '' : ','));
            }
            if (suffix) {
                result.push(originalIndent + ')' + suffix);
            }
            else {
                result.push(originalIndent + ')');
            }
        }
        return { lines: result, nextIndex: i + 1 };
    }
    wrapLine(line) {
        // Simple line wrapping logic
        if (line.length <= this.maxLineLength) {
            return [line];
        }
        // Get the original indentation
        const originalIndent = this.getIndentation(line);
        const content = line.substring(originalIndent.length);
        // Don't break assignment statements at the equals sign
        if (content.includes(' = ') && !content.includes('(')) {
            // For simple assignments, try to break at logical points after the assignment
            const equalIndex = content.indexOf(' = ');
            const beforeEqual = content.substring(0, equalIndex + 3);
            const afterEqual = content.substring(equalIndex + 3);
            if (afterEqual.length > this.maxLineLength - originalIndent.length - beforeEqual.length) {
                // Try to break the part after the equals sign
                const breakPoints = [
                    '.',
                    '(',
                    '[',
                    '{',
                    ', ',
                    ' and ',
                    ' or ',
                    ' + ',
                    ' - ',
                    ' * ',
                    ' / '
                ];
                for (const breakPoint of breakPoints) {
                    const index = afterEqual.lastIndexOf(breakPoint, this.maxLineLength - originalIndent.length - beforeEqual.length);
                    if (index > 0) {
                        const firstPart = afterEqual.substring(0, index);
                        const secondPart = afterEqual.substring(index + breakPoint.length);
                        return [
                            originalIndent + beforeEqual + firstPart + breakPoint,
                            originalIndent + '    ' + secondPart
                        ];
                    }
                }
            }
        }
        // Try to break at logical points for Python code
        const breakPoints = [
            ' = ',
            ' += ',
            ' -= ',
            ' *= ',
            ' /= ',
            ' == ',
            ' != ',
            ' > ',
            ' < ',
            ' >= ',
            ' <= ',
            ' in ',
            ' not in ',
            ' is ',
            ' is not ',
            ' and ',
            ' or ',
            ' + ',
            ' - ',
            ' * ',
            ' / ',
            ', ',
            ' (',
            ' [',
            ' {'
        ];
        for (const breakPoint of breakPoints) {
            const index = content.lastIndexOf(breakPoint, this.maxLineLength - originalIndent.length);
            if (index > 0) {
                const firstPart = content.substring(0, index);
                const secondPart = content.substring(index + breakPoint.length);
                // Calculate proper indentation for continuation line
                let continuationIndent = originalIndent;
                // For function calls, add extra indentation
                if (breakPoint === ' (' || breakPoint === ' [' || breakPoint === ' {') {
                    continuationIndent += '    ';
                }
                else {
                    continuationIndent += '    ';
                }
                return [
                    originalIndent + firstPart + breakPoint,
                    continuationIndent + secondPart
                ];
            }
        }
        // If no good break point found, try to break at spaces
        const spaceIndex = content.lastIndexOf(' ', this.maxLineLength - originalIndent.length);
        if (spaceIndex > 0) {
            const firstPart = content.substring(0, spaceIndex);
            const secondPart = content.substring(spaceIndex + 1);
            return [
                originalIndent + firstPart,
                originalIndent + '    ' + secondPart
            ];
        }
        // If still no good break point, just return the original line
        return [line];
    }
    getIndentation(line) {
        const match = line.match(/^(\s*)/);
        return match ? match[1] : '';
    }
    ensureFileEnding(text) {
        // Ensure file ends with exactly one blank line
        const trimmed = text.trimEnd();
        return trimmed + '\n';
    }
}
exports.PythonFormatter = PythonFormatter;
//# sourceMappingURL=pythonFormatter.js.map