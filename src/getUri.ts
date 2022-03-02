import { Uri, Webview } from "vscode";
import * as vscode from 'vscode';

export function getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}

export async function addComment() {
  let comment:string = await vscode.window.showInputBox({prompt:"Add a comment for the planned change", placeHolder:"Comment"})
  return comment
}
