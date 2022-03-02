"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const references_1 = require("./references");
const definition_1 = require("./definition");
const localStorage_1 = require("./localStorage");
const getUri_1 = require("./getUri");
const rippleWebViewProvider_1 = require("./rippleWebViewProvider");
function activate(context) {
    let storageManager = new localStorage_1.LocalStorage(context.workspaceState);
    const webViewProvider = new rippleWebViewProvider_1.RippleWebViewProvider(context.extensionUri, storageManager);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(rippleWebViewProvider_1.RippleWebViewProvider.viewType, webViewProvider));
    vscode.commands.registerCommand('references.gotoReference', (node) => node.gotoReference());
    if (vscode.workspace.rootPath) {
        const referencesProvider = new references_1.ReferencesProvider(vscode.workspace.rootPath);
        const defitionProvider = new definition_1.DefinitionProvider(vscode.workspace.rootPath);
        vscode.window.registerTreeDataProvider('references', referencesProvider);
        vscode.window.registerTreeDataProvider('definition', defitionProvider);
        vscode.commands.registerCommand('references.refreshEntry', () => {
            referencesProvider.refresh();
            defitionProvider.refresh();
        });
        vscode.commands.registerCommand('toBeChanged.add', async (node) => {
            const comment = await (0, getUri_1.addComment)();
            let toBeCheckedItems = await referencesProvider.getTableItemsFromReference(node);
            //console.log(toBeCheckedItems);
            let toBeChangedItems = await defitionProvider.getTableItemFromReference(node);
            toBeCheckedItems = [...toBeCheckedItems, ...toBeChangedItems];
            toBeChangedItems[0].comment = comment;
            toBeCheckedItems = toBeCheckedItems.map((element) => { return { ...element, parent: toBeChangedItems[0] }; });
            webViewProvider.add('check', toBeCheckedItems);
            webViewProvider.add('change', toBeChangedItems);
        });
        vscode.commands.registerCommand('toBeChanged.add_from_context', async () => {
            const itemType = 'Impacted';
            let { toBeCheckedItems, newTableItem } = await addItems(itemType);
            webViewProvider.add('check', toBeCheckedItems);
            webViewProvider.add('change', [newTableItem]);
        });
        vscode.commands.registerCommand('toBeChanged.add_from_contex_prop', async () => {
            const itemType = 'Propagating';
            let { toBeCheckedItems, newTableItem } = await addItems(itemType);
            webViewProvider.add('check', toBeCheckedItems);
            webViewProvider.add('change', [newTableItem]);
        });
        async function addItems(itemType) {
            const editor = vscode.window.activeTextEditor;
            let toBeCheckedItems = [];
            let toBeChangedItems = [];
            let newTableItem = undefined;
            if (editor) {
                let uri = editor.document.uri;
                let cursorPosition = editor.selection.start;
                let wordRange = editor.document.getWordRangeAtPosition(cursorPosition);
                let name = editor.document.getText(wordRange);
                const path = new vscode.Location(uri, cursorPosition);
                const comment = await (0, getUri_1.addComment)();
                toBeCheckedItems = await referencesProvider.getTableItems();
                toBeChangedItems = await defitionProvider.getTableItem();
                toBeCheckedItems = [...toBeCheckedItems, ...toBeChangedItems];
                newTableItem = new references_1.TableItem(path.uri.path.substring(path.uri.path.lastIndexOf('/') + 1), path.range.start.line + 1, path.range.start.character, path, name, itemType, comment, undefined);
            }
            return { toBeCheckedItems, newTableItem };
        }
    }
}
exports.activate = activate;
function deactivate() {
    return;
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map