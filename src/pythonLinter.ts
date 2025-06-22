import * as vscode from 'vscode';

export interface LintIssue {
    line: number;
    character: number;
    message: string;
    severity: vscode.DiagnosticSeverity;
    code: string;
    range: vscode.Range;
}

export class PythonLinter {
    private maxLineLength: number = 85;

    constructor() {
        const config = vscode.workspace.getConfiguration('pythonLintFixer');
        this.maxLineLength = config.get('maxLineLength', 85);
    }

    public lintDocument(document: vscode.TextDocument): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNumber = i + 1;
            const lineIssues = this.lintLine(line, lineNumber, document);
            diagnostics.push(...lineIssues);
        }

        // Check for file-level issues
        const fileIssues = this.lintFile(text, document);
        diagnostics.push(...fileIssues);

        return diagnostics;
    }

    private lintLine(line: string, lineNumber: number, document: vscode.TextDocument): vscode.Diagnostic[] {
        const issues: vscode.Diagnostic[] = [];
        const range = new vscode.Range(lineNumber - 1, 0, lineNumber - 1, line.length);

        // Check line length
        if (line.length > this.maxLineLength) {
            issues.push(new vscode.Diagnostic(
                range,
                `Line exceeds ${this.maxLineLength} characters (${line.length})`,
                vscode.DiagnosticSeverity.Warning
            ));
        }

        // Check for double quotes that should be single quotes
        const quoteIssues = this.checkQuotes(line, lineNumber, document);
        issues.push(...quoteIssues);

        // Check for import formatting
        if (line.trim().startsWith('import ') || line.trim().startsWith('from ')) {
            const importIssues = this.checkImportFormat(line, lineNumber, document);
            issues.push(...importIssues);
        }

        // Check for spacing issues
        const spacingIssues = this.checkSpacing(line, lineNumber, document);
        issues.push(...spacingIssues);

        return issues;
    }

    private checkQuotes(line: string, lineNumber: number, document: vscode.TextDocument): vscode.Diagnostic[] {
        const issues: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        // Skip docstrings
        if (this.isInDocstring(lineNumber, lines)) {
            return issues;
        }

        // Find double quotes that should be single quotes
        const doubleQuoteRegex = /"([^"]*)"(?!\s*[=:])/g;
        let match;

        while ((match = doubleQuoteRegex.exec(line)) !== null) {
            const content = match[1];
            
            // Skip if it's a Python object key/value with non-string/non-number content
            if (this.isPythonObjectKeyValue(content)) {
                continue;
            }

            // Skip if it contains special characters that require double quotes
            if (this.requiresDoubleQuotes(content)) {
                continue;
            }

            const startPos = new vscode.Position(lineNumber - 1, match.index);
            const endPos = new vscode.Position(lineNumber - 1, match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);

            issues.push(new vscode.Diagnostic(
                range,
                'Use single quotes instead of double quotes',
                vscode.DiagnosticSeverity.Warning
            ));
        }

        return issues;
    }

    private isInDocstring(lineNumber: number, lines: string[]): boolean {
        // Simple docstring detection
        for (let i = 0; i < lineNumber; i++) {
            const line = lines[i];
            if (line.includes('"""') || line.includes("'''")) {
                return true;
            }
        }
        return false;
    }

    private isPythonObjectKeyValue(content: string): boolean {
        // Check if this is likely a Python object key/value with complex content
        return /[{}[\],]/.test(content) || /\s+/.test(content);
    }

    private requiresDoubleQuotes(content: string): boolean {
        // Check if content requires double quotes (contains single quotes)
        return content.includes("'");
    }

    private checkImportFormat(line: string, lineNumber: number, document: vscode.TextDocument): vscode.Diagnostic[] {
        const issues: vscode.Diagnostic[] = [];
        const range = new vscode.Range(lineNumber - 1, 0, lineNumber - 1, line.length);

        // Check if import is properly formatted
        if (line.trim().startsWith('import ')) {
            const importMatch = line.match(/^(\s*)import\s+([^#\n]+)/);
            if (importMatch) {
                const modules = importMatch[2].split(',').map(m => m.trim());
                if (modules.length > 1) {
                    issues.push(new vscode.Diagnostic(
                        range,
                        'Multiple imports should be on separate lines',
                        vscode.DiagnosticSeverity.Warning
                    ));
                }
            }
        }

        return issues;
    }

    private checkSpacing(line: string, lineNumber: number, document: vscode.TextDocument): vscode.Diagnostic[] {
        const issues: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        // Check class spacing
        if (line.trim().startsWith('class ')) {
            const classSpacingIssues = this.checkClassSpacing(lineNumber, lines);
            issues.push(...classSpacingIssues);
        }

        // Check method spacing
        if (line.trim().match(/^\s*def\s+\w+\s*\(/)) {
            const methodSpacingIssues = this.checkMethodSpacing(lineNumber, lines);
            issues.push(...methodSpacingIssues);
        }

        return issues;
    }

    private checkClassSpacing(lineNumber: number, lines: string[]): vscode.Diagnostic[] {
        const issues: vscode.Diagnostic[] = [];
        
        // Check if there are 2 blank lines before class
        if (lineNumber > 2) {
            const prevLine1 = lines[lineNumber - 2];
            const prevLine2 = lines[lineNumber - 3];
            
            if (prevLine1.trim() !== '' || prevLine2.trim() !== '') {
                const range = new vscode.Range(lineNumber - 1, 0, lineNumber - 1, 0);
                issues.push(new vscode.Diagnostic(
                    range,
                    'Classes should be preceded by 2 blank lines',
                    vscode.DiagnosticSeverity.Warning
                ));
            }
        }

        return issues;
    }

    private checkMethodSpacing(lineNumber: number, lines: string[]): vscode.Diagnostic[] {
        const issues: vscode.Diagnostic[] = [];
        
        // Check if there is 1 blank line before method
        if (lineNumber > 1) {
            const prevLine = lines[lineNumber - 2];
            
            // Skip if this is the first method in a class (no spacing needed)
            let isFirstMethodInClass = false;
            for (let i = lineNumber - 2; i >= 0; i--) {
                const line = lines[i];
                if (line.trim().startsWith('class ')) {
                    isFirstMethodInClass = true;
                    break;
                } else if (line.trim().startsWith('def ') || line.trim() === '') {
                    break;
                }
            }
            
            if (!isFirstMethodInClass && prevLine.trim() !== '') {
                const range = new vscode.Range(lineNumber - 1, 0, lineNumber - 1, 0);
                issues.push(new vscode.Diagnostic(
                    range,
                    'Methods should be preceded by 1 blank line',
                    vscode.DiagnosticSeverity.Warning
                ));
            }
        }

        return issues;
    }

    private lintFile(text: string, document: vscode.TextDocument): vscode.Diagnostic[] {
        const issues: vscode.Diagnostic[] = [];
        const lines = text.split('\n');

        // Check if file ends with blank line
        if (lines.length > 0 && lines[lines.length - 1].trim() !== '') {
            const lastLineRange = new vscode.Range(lines.length - 1, 0, lines.length - 1, 0);
            issues.push(new vscode.Diagnostic(
                lastLineRange,
                'File should end with a blank line',
                vscode.DiagnosticSeverity.Warning
            ));
        }

        // Check import grouping
        const importIssues = this.checkImportGrouping(text, document);
        issues.push(...importIssues);

        return issues;
    }

    private checkImportGrouping(text: string, document: vscode.TextDocument): vscode.Diagnostic[] {
        const issues: vscode.Diagnostic[] = [];
        const lines = text.split('\n');
        const importLines: { line: number; content: string; type: 'import' | 'from' }[] = [];

        // Collect all import lines
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim().startsWith('import ')) {
                importLines.push({ line: i + 1, content: line.trim(), type: 'import' });
            } else if (line.trim().startsWith('from ')) {
                importLines.push({ line: i + 1, content: line.trim(), type: 'from' });
            }
        }

        // Check if imports are grouped properly
        if (importLines.length > 1) {
            for (let i = 1; i < importLines.length; i++) {
                const prev = importLines[i - 1];
                const curr = importLines[i];
                
                // Check if there's proper spacing between import groups
                const linesBetween = curr.line - prev.line - 1;
                if (linesBetween < 1) {
                    const range = new vscode.Range(curr.line - 1, 0, curr.line - 1, 0);
                    issues.push(new vscode.Diagnostic(
                        range,
                        'Import groups should be separated by at least 1 blank line',
                        vscode.DiagnosticSeverity.Warning
                    ));
                }
            }
        }

        return issues;
    }
} 