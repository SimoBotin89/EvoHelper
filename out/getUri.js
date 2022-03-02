"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addComment = exports.getUri = void 0;
const vscode_1 = require("vscode");
const vscode = require("vscode");
function getUri(webview, extensionUri, pathList) {
    return webview.asWebviewUri(vscode_1.Uri.joinPath(extensionUri, ...pathList));
}
exports.getUri = getUri;
async function addComment() {
    let comment = await vscode.window.showInputBox({ prompt: "Add a comment for the planned change", placeHolder: "Comment" });
    return comment;
}
exports.addComment = addComment;
//# sourceMappingURL=getUri.js.map