"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableItem = exports.Reference = exports.File = exports.ReferencesProvider = void 0;
const vscode = require("vscode");
class ReferencesProvider {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('The workspace is empty');
            return Promise.resolve([]);
        }
        if (element) {
            return Promise.resolve(element.children);
        }
        else {
            return Promise.resolve(this.getFile());
        }
    }
    async getFile() {
        let files = [];
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return files;
        }
        const references = await this.getReferences(activeEditor.document.uri, activeEditor.selection.active);
        if (references.length > 0) {
            const duplicatedFiles = references.map((element) => element.uri.path);
            const uniqueFiles = duplicatedFiles.filter((item, pos) => duplicatedFiles.indexOf(item) == pos);
            uniqueFiles.map((element) => files.push(new File(element.substring(element.lastIndexOf('/') + 1), element, vscode.TreeItemCollapsibleState.Expanded, [])));
            references.map((element) => {
                files.filter(obj => {
                    return obj.path === element.uri.path;
                })[0].children.push(new Reference('Line: ' + (element.range.start.line + 1), 'Position: ' + element.range.start.character, element, activeEditor.document.getText(element.range), false));
            });
        }
        return files;
    }
    async getTableItems() {
        let tableItems = [];
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return tableItems;
        }
        //scrivere il nome per la referenza
        let cursorPosition = activeEditor.selection.start;
        let wordRange = activeEditor.document.getWordRangeAtPosition(cursorPosition);
        const name = activeEditor.document.getText(wordRange);
        const references = await this.getReferences(activeEditor.document.uri, activeEditor.selection.active);
        references.map((element) => tableItems.push(new TableItem(element.uri.path.substring(element.uri.path.lastIndexOf('/') + 1), element.range.start.line + 1, element.range.start.character, element, name, '', '', undefined)));
        return tableItems;
    }
    async getTableItemsFromReference(reference) {
        let tableItems = [];
        const references = await this.getReferences(reference.getUri(), reference.getPosition());
        references.map((element) => tableItems.push(new TableItem(element.uri.path.substring(element.uri.path.lastIndexOf('/') + 1), element.range.start.line + 1, element.range.start.character, element, reference.name, '', '', undefined)));
        return tableItems;
    }
    async getReferences(uri, position) {
        return vscode.commands.executeCommand('vscode.executeReferenceProvider', uri, position);
    }
}
exports.ReferencesProvider = ReferencesProvider;
class File extends vscode.TreeItem {
    constructor(label, path, collapsibleState, children) {
        super(label, collapsibleState);
        this.label = label;
        this.path = path;
        this.collapsibleState = collapsibleState;
        this.children = children;
        this.tooltip = `${this.label} - ${this.path}`;
        this.description = this.path;
    }
    checkSameReference(reference1, reference2) {
        if (reference1.name === reference2.name && reference1.position === reference2.position && reference1.line === reference2.line)
            return true;
        else
            return false;
    }
}
exports.File = File;
class Reference extends vscode.TreeItem {
    constructor(line, position, path, name, checked) {
        super(line, vscode.TreeItemCollapsibleState.None);
        this.line = line;
        this.position = position;
        this.path = path;
        this.name = name;
        this.checked = checked;
        this.contextValue = 'reference';
        this.tooltip = `${this.line} - ${this.position}`;
        this.description = this.position;
    }
    getUri() {
        if ('targetUri' in this.path)
            return this.path.targetUri;
        else
            return this.path.uri;
    }
    getPosition() {
        if ('targetUri' in this.path)
            return this.path.targetRange.start;
        else
            return this.path.range.start;
    }
    async gotoReference() {
        //console.log("I'm "+this.tooltip)
        if ('targetUri' in this.path)
            vscode.commands.executeCommand('vscode.open', this.path.targetUri, { selection: this.path.targetRange, preview: false });
        else
            vscode.commands.executeCommand('vscode.open', this.path.uri, { selection: this.path.range, preview: false });
    }
    ;
    setChecked() {
        this.checked = true;
    }
    setUnchecked() {
        this.checked = false;
    }
}
exports.Reference = Reference;
class TableItem {
    constructor(file, line, position, path, name, state, comment, parent) {
        this.file = file;
        this.line = line;
        this.position = position;
        this.path = path;
        this.name = name;
        this.state = state;
        this.comment = comment;
        this.parent = parent;
        this.shortName = name.substring(0, 10);
    }
}
exports.TableItem = TableItem;
//# sourceMappingURL=references.js.map