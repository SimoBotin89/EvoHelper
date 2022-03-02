"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RippleWebViewProvider = void 0;
const vscode = require("vscode");
const getUri_1 = require("./getUri");
const references_1 = require("./references");
const toBeCheckedStorage = "ToBeCheckedTableItems";
const toBeChangedStorage = "ToBeChangedTableItems";
const toBeCheckedType = 'refreshToBeChecked';
const toBeChangedType = 'refreshToBeChanged';
class RippleWebViewProvider {
    constructor(_extensionUri, passedstorageManager) {
        this._extensionUri = _extensionUri;
        this.itemsToBeChecked = [];
        this.itemsToBeChanged = [];
        this.storageManager = passedstorageManager;
        //console.log(this.storageManager.getValue<TableItem[]>(toBeChangedStorage))
        if (!(this.storageManager.getValue(toBeChangedStorage) === [] ||
            this.storageManager.getValue(toBeChangedStorage) === null)) {
            const items = this.storageManager.getValue(toBeChangedStorage);
            items.forEach((element) => {
                this.itemsToBeChanged.push(restoreElement(element));
            });
        }
        if (!(this.storageManager.getValue(toBeCheckedStorage) === [] ||
            this.storageManager.getValue(toBeCheckedStorage) === null)) {
            const items = this.storageManager.getValue(toBeCheckedStorage);
            items.forEach((element) => {
                this.itemsToBeChecked.push(restoreElement(element));
            });
        }
    }
    add(table, element) {
        switch (table) {
            case 'change':
                //check if already present
                if (element && this.storageManager && this._view) {
                    if (element.some((newToCheck) => this.itemsToBeChanged.some((oldToCheck) => newToCheck.name === oldToCheck.name &&
                        newToCheck.file === oldToCheck.file && newToCheck.line === oldToCheck.line && newToCheck.position === oldToCheck.position))) {
                        element = [];
                    }
                    this.itemsToBeChanged = [...this.itemsToBeChanged, ...element];
                    this._view.webview.postMessage({ type: toBeChangedType, data: this.itemsToBeChanged });
                    this.storageManager.setValue(toBeChangedStorage, this.itemsToBeChanged);
                }
                //console.log(this.itemsToBeChanged)
                break;
            case 'check':
                if (element && this.storageManager && this._view) {
                    //check if already present
                    if (element.some((newToCheck) => this.itemsToBeChecked.some((oldToCheck) => newToCheck.name === oldToCheck.name &&
                        newToCheck.file === oldToCheck.file && newToCheck.line === oldToCheck.line && newToCheck.position === oldToCheck.position))) {
                        element = [];
                    }
                    this.itemsToBeChecked = [...this.itemsToBeChecked, ...element];
                    this._view.webview.postMessage({ type: toBeCheckedType, data: this.itemsToBeChecked });
                    this.storageManager.setValue(toBeCheckedStorage, this.itemsToBeChecked);
                    //console.log(this.itemsToBeChecked)
                }
                break;
        }
    }
    update(table, element) {
        let index = -1;
        switch (table) {
            case 'change':
                if (element && this.storageManager && this._view) {
                    index = this.itemsToBeChanged.findIndex((item) => element.name === item.name &&
                        element.file === item.file && element.line === item.line && element.position === item.position);
                    if (index > -1) {
                        this.itemsToBeChanged.splice(index, 1);
                        this._view.webview.postMessage({ type: toBeChangedType, data: this.itemsToBeChanged });
                        this.storageManager.setValue(toBeChangedStorage, this.itemsToBeChanged);
                    }
                }
                break;
            case 'check':
                if (element && this.storageManager && this._view) {
                    this.itemsToBeChecked = this.itemsToBeChecked.filter((item) => !(element.name === item.parent.name &&
                        element.file === item.parent.file && element.line === item.parent.line && element.position === item.parent.position));
                    this._view.webview.postMessage({ type: toBeCheckedType, data: this.itemsToBeChecked });
                    this.storageManager.setValue(toBeCheckedStorage, this.itemsToBeChecked);
                }
                break;
        }
    }
    delete(table, element) {
        let index = -1;
        switch (table) {
            case 'change':
                if (element && this.storageManager && this._view) {
                    //basta estrarre nome, file, riga e posizione e eliminare quello
                    index = this.itemsToBeChanged.findIndex((item) => element.name === item.name &&
                        element.file === item.file && element.line === item.line && element.position === item.position);
                    if (index > -1) {
                        this.itemsToBeChanged.splice(index, 1);
                        this._view.webview.postMessage({ type: toBeChangedType, data: this.itemsToBeChanged });
                        this.storageManager.setValue(toBeChangedStorage, this.itemsToBeChanged);
                    }
                }
                break;
            case 'check':
                if (element && this.storageManager && this._view) {
                    this.itemsToBeChecked = this.itemsToBeChecked.filter((item) => !(element.name === item.parent.name &&
                        element.file === item.parent.file && element.line === item.parent.line && element.position === item.parent.position));
                    this._view.webview.postMessage({ type: toBeCheckedType, data: this.itemsToBeChecked });
                    this.storageManager.setValue(toBeCheckedStorage, this.itemsToBeChecked);
                }
                break;
        }
    }
    get(type) {
        switch (type) {
            case 'change':
                return this.itemsToBeChanged;
            case 'check':
                return this.itemsToBeChecked;
        }
        return this.itemsToBeChanged;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };
        webviewView.webview.html = this._getWebviewContent(webviewView.webview, this._extensionUri);
        webviewView.webview.postMessage({ type: toBeChangedType, data: this.itemsToBeChanged });
        webviewView.webview.postMessage({ type: toBeCheckedType, data: this.itemsToBeChecked });
        this._setWebviewMessageListener(webviewView.webview);
    }
    _getWebviewContent(webview, extensionUri) {
        const toolkitUri = (0, getUri_1.getUri)(webview, extensionUri, [
            "node_modules",
            "@vscode",
            "webview-ui-toolkit",
            "dist",
            "toolkit.js",
        ]);
        const jqueryUri = (0, getUri_1.getUri)(webview, extensionUri, [
            "node_modules",
            "jquery",
            "dist",
            "jquery.js",
        ]);
        const buttonClick = (0, getUri_1.getUri)(webview, extensionUri, ["src", "webViewCode.js"]);
        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
		  <!DOCTYPE html>
		  <html lang="en">
			<head>
			  <meta charset="UTF-8">
			  <meta name="viewport" content="width=device-width, initial-scale=1.0">
			  <script type="module" src="${toolkitUri}"></script>
			  <script type="module" src="${jqueryUri}"></script>
			  <script type="module" src="${buttonClick}"></script>
			  <title>Hello World!</title>
			  <style>
				  #toBeChanged,#toBeChecked {display: flex;
								 justify-content: center}
					vscode-data-grid-cell {display: flex;
								 justify-content: center}
			  </style>
			</head>
			<body>
				<h3>Located/impacted items</h3>
				<vscode-data-grid id="toBeChanged" generate-header="none" aria-label="Basic" grid-template-columns="5fr 5fr 1fr 1fr 1fr"></vscode-data-grid>
				<vscode-divider></vscode-divider>
				<h3>Items to be inspected</h3>
				<vscode-data-grid id="toBeChecked" generate-header="none" aria-label="Basic" grid-template-columns="5fr 5fr 1fr 1fr"></vscode-data-grid>
			</body>
		  </html>
		`;
    }
    _setWebviewMessageListener(webview) {
        webview.onDidReceiveMessage((message) => {
            const type = message.type;
            const data = message.data;
            switch (type) {
                case "ready":
                    webview.postMessage({ type: toBeChangedType, data: this.itemsToBeChanged });
                    webview.postMessage({ type: toBeCheckedType, data: this.itemsToBeChecked });
                    break;
                case "goTo":
                    gotoReference(data);
                    break;
                case "delete":
                    this.deleteItem(data);
                    break;
                case "handelChecked":
                    const state = message.state;
                    this.handelChecked(data, state);
                    break;
            }
        }, undefined);
    }
    deleteItem(toBeChangedItem) {
        this.delete('change', toBeChangedItem);
        this.delete('check', toBeChangedItem);
    }
    ;
    handelChecked(element, state) {
        //this.update('change',toBeChangedItem);
        let index = -1;
        index = this.itemsToBeChecked.findIndex((item) => (element.name === item.name &&
            element.file === item.file && element.line === item.line && element.position === item.position));
        if (index > -1 && this.storageManager) {
            if (state)
                this.itemsToBeChecked[index].state = 'checked';
            else
                this.itemsToBeChecked[index].state = '';
            this.storageManager.setValue(toBeCheckedStorage, this.itemsToBeChecked);
        }
    }
    ;
    updateContent() {
    }
}
exports.RippleWebViewProvider = RippleWebViewProvider;
RippleWebViewProvider.viewType = 'evoHelperWebView.main';
function gotoReference(tableItem) {
    //console.log("I'm "+this.tooltip)
    tableItem.path = restoreLocation(tableItem);
    vscode.commands.executeCommand('vscode.open', tableItem.path.uri, { selection: tableItem.path.range, preview: false });
}
;
function restoreElement(element) {
    const file = element.file;
    const line = element.line;
    const position = element.position;
    const path = restoreLocation(element);
    const name = element.name;
    const comment = element.comment;
    const state = element.state;
    let parent = undefined;
    if (element.parent !== undefined)
        parent = restoreElement(element.parent);
    return new references_1.TableItem(file, line, position, path, name, state, comment, parent);
}
function restoreLocation(element) {
    let path = undefined;
    let uri = undefined;
    if ('targetUri' in element.path) {
        if ('path' in element.path.targetUri) {
            uri = vscode.Uri.file(element.path.targetUri.path);
        }
        else {
            uri = vscode.Uri.file(element.path.targetUri.fsPath);
        }
        const range = new vscode.Range(element.path.targetRange[0].line, element.path.targetRange[0].character, element.path.targetRange[1].line, element.path.targetRange[1].character);
        path = new vscode.Location(uri, range);
    }
    else {
        const uri = vscode.Uri.file(element.path.uri.path);
        const range = new vscode.Range(element.path.range[0].line, element.path.range[0].character, element.path.range[1].line, element.path.range[1].character);
        path = new vscode.Location(uri, range);
    }
    return path;
}
//# sourceMappingURL=rippleWebViewProvider.js.map