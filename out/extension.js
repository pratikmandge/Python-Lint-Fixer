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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const pythonLinter_1 = require("./pythonLinter");
const pythonFormatter_1 = require("./pythonFormatter");
function activate(context) {
    console.log('Python Lint Fixer extension is now active!');
    const linter = new pythonLinter_1.PythonLinter();
    const formatter = new pythonFormatter_1.PythonFormatter();
    // Create status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(lightbulb) Fix Python";
    statusBarItem.tooltip = "Fix current Python file";
    statusBarItem.command = 'python-lint-fixer.fixFile';
    statusBarItem.hide();
    // Show status bar item when Python file is opened
    const updateStatusBar = () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'python') {
            statusBarItem.show();
        }
        else {
            statusBarItem.hide();
        }
    };
    // Register commands
    let fixFileCommand = vscode.commands.registerCommand('python-lint-fixer.fixFile', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'python') {
            try {
                // Show progress
                await vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "Fixing Python file...",
                    cancellable: false
                }, async (progress) => {
                    progress.report({ increment: 0 });
                    // Format the document
                    await formatter.formatDocument(editor.document);
                    progress.report({ increment: 100 });
                });
                // Show success message
                vscode.window.showInformationMessage('[Python Lint Fixer] Python file fixed successfully!');
            }
            catch (error) {
                vscode.window.showErrorMessage(`[Python Lint Fixer] Error fixing Python file: ${error}`);
            }
        }
        else {
            vscode.window.showWarningMessage('[Python Lint Fixer] Please open a Python file to use this command.');
        }
    });
    let fixWorkspaceCommand = vscode.commands.registerCommand('python-lint-fixer.fixWorkspace', () => {
        vscode.workspace.findFiles('**/*.py').then(files => {
            if (files.length === 0) {
                vscode.window.showInformationMessage('[Python Lint Fixer] No Python files found in workspace.');
                return;
            }
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Fixing Python files...",
                cancellable: false
            }, async (progress) => {
                let processed = 0;
                for (const file of files) {
                    progress.report({
                        message: `Processing ${file.fsPath.split('/').pop()}`,
                        increment: (100 / files.length)
                    });
                    try {
                        const document = await vscode.workspace.openTextDocument(file);
                        await formatter.formatDocument(document);
                        processed++;
                    }
                    catch (error) {
                        console.error(`Error processing ${file.fsPath}:`, error);
                    }
                }
                vscode.window.showInformationMessage(`[Python Lint Fixer] Processed ${processed} Python files.`);
            });
        });
    });
    // Register diagnostics collection
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('python-lint-fixer');
    context.subscriptions.push(diagnosticCollection);
    // Register document change listener for real-time linting
    let changeListener = vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId === 'python') {
            const diagnostics = linter.lintDocument(event.document);
            diagnosticCollection.set(event.document.uri, diagnostics);
        }
    });
    // Register document open listener
    let openListener = vscode.workspace.onDidOpenTextDocument((document) => {
        if (document.languageId === 'python') {
            const diagnostics = linter.lintDocument(document);
            diagnosticCollection.set(document.uri, diagnostics);
        }
        updateStatusBar();
    });
    // Register document close listener
    let closeListener = vscode.workspace.onDidCloseTextDocument((document) => {
        diagnosticCollection.delete(document.uri);
        updateStatusBar();
    });
    // Register active editor change listener
    let activeEditorListener = vscode.window.onDidChangeActiveTextEditor(() => {
        updateStatusBar();
    });
    // Register save listener for auto-fix
    let saveListener = vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.languageId === 'python') {
            const config = vscode.workspace.getConfiguration('pythonLintFixer');
            if (config.get('autoFixOnSave', false)) {
                formatter.formatDocument(document);
            }
        }
    });
    // Initial status bar update
    updateStatusBar();
    context.subscriptions.push(fixFileCommand, fixWorkspaceCommand, changeListener, openListener, closeListener, activeEditorListener, saveListener, diagnosticCollection, statusBarItem);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map