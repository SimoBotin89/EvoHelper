"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefinitionProvider = void 0;
const vscode = require("vscode");
const references_1 = require("./references");
//class used for the definition treeview
class DefinitionProvider {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    //used to update the treeview
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    //to return the treeview element
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        //check if a project is opened
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('The workspace is empty');
            return Promise.resolve([]);
        }
        //show nested level
        if (element) {
            return Promise.resolve(element.children);
        }
        //show first level
        else {
            return Promise.resolve(this.getFile());
        }
    }
    //used to retriev 
    async getFile() {
        let files = [];
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return files;
        }
        const name = this.getName(activeEditor);
        const definition = await this.getDefinition(activeEditor.document.uri, activeEditor.selection.active);
        if (definition.length > 0) {
            if ('targetUri' in definition[0]) {
                const duplicatedFiles = definition.map((element) => element.targetUri.path);
                const uniqueFiles = duplicatedFiles.filter((item, pos) => duplicatedFiles.indexOf(item) == pos);
                uniqueFiles.map((element) => files.push(new references_1.File(element.substring(element.lastIndexOf('/') + 1), element, vscode.TreeItemCollapsibleState.Expanded, [])));
                definition.map((element) => {
                    files.filter(obj => {
                        return obj.path === element.targetUri.path;
                    })[0].children.push(new references_1.Reference('Line: ' + (element.targetRange.start.line + 1), 'Position: ' + element.targetRange.start.character, element, name, false));
                });
            }
            else if ('uri' in definition[0]) {
                const duplicatedFiles = definition.map((element) => element.uri.path);
                const uniqueFiles = duplicatedFiles.filter((item, pos) => duplicatedFiles.indexOf(item) == pos);
                uniqueFiles.map((element) => files.push(new references_1.File(element.substring(element.lastIndexOf('/') + 1), element, vscode.TreeItemCollapsibleState.Expanded, [])));
                definition.map((element) => {
                    files.filter(obj => {
                        return obj.path === element.uri.path;
                    })[0].children.push(new references_1.Reference('Line: ' + (element.range.start.line + 1), 'Position: ' + element.range.start.character, element, name, false));
                });
            }
        }
        return files;
    }
    async getTableItem() {
        let tableItems = [];
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return tableItems;
        }
        const name = this.getName(activeEditor);
        const definition = await this.getDefinition(activeEditor.document.uri, activeEditor.selection.active);
        //const workspace = vscode.workspace
        if (definition.length > 0) {
            if ('targetUri' in definition[0]) {
                //const targetDocument:vscode.TextDocument = await workspace.openTextDocument(definition[0].targetUri)
                definition.map((element) => tableItems.push(new references_1.TableItem(element.targetUri.path.substring(element.targetUri.path.lastIndexOf('/') + 1), element.targetRange.start.line + 1, element.targetRange.start.character, element, name, 'Located', '', undefined)));
            }
            else if ('uri' in definition[0]) {
                //const targetDocument:vscode.TextDocument = await workspace.openTextDocument(definition[0].uri)
                definition.map((element) => tableItems.push(new references_1.TableItem(element.uri.path.substring(element.uri.path.lastIndexOf('/') + 1), element.range.start.line + 1, element.range.start.character, element, name, 'Located', '', undefined)));
            }
        }
        return tableItems;
    }
    async getTableItemFromReference(reference) {
        let tableItems = [];
        const definition = await this.getDefinition(reference.getUri(), reference.getPosition());
        if (definition.length > 0) {
            if ('targetUri' in definition[0]) {
                definition.map((element) => tableItems.push(new references_1.TableItem(element.targetUri.path.substring(element.targetUri.path.lastIndexOf('/') + 1), element.targetRange.start.line + 1, element.targetRange.start.character, element, reference.name, 'Located', '', undefined)));
            }
            else if ('uri' in definition[0]) {
                definition.map((element) => tableItems.push(new references_1.TableItem(element.uri.path.substring(element.uri.path.lastIndexOf('/') + 1), element.range.start.line + 1, element.range.start.character, element, reference.name, 'Located', '', undefined)));
            }
        }
        return tableItems;
    }
    async getDefinition(uri, position) {
        return vscode.commands.executeCommand('vscode.executeDefinitionProvider', uri, position);
    }
    getName(activeEditor) {
        let cursorPosition = activeEditor.selection.start;
        let wordRange = activeEditor.document.getWordRangeAtPosition(cursorPosition);
        return activeEditor.document.getText(wordRange);
    }
}
exports.DefinitionProvider = DefinitionProvider;
function determineTypeLocation(toBeDetermined) {
    if (toBeDetermined.uri) {
        return true;
    }
    return false;
}
function instanceOfA(object) {
    return 'uri' in object[0];
}
//# sourceMappingURL=definition.js.map