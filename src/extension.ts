import * as vscode from 'vscode';
import { workspace, ExtensionContext } from 'vscode';
import {ReferencesProvider,Reference,File,TableItem} from './references';
import {DefinitionProvider} from './definition';
import {LocalStorage} from "./localStorage";
import {addComment} from './getUri';
import { RippleWebViewProvider } from "./rippleWebViewProvider";

export function activate(context: ExtensionContext) {


	let storageManager = new LocalStorage(context.workspaceState);
	const webViewProvider = new RippleWebViewProvider(context.extensionUri,storageManager);

	context.subscriptions.push(
		  vscode.window.registerWebviewViewProvider(RippleWebViewProvider.viewType, webViewProvider));
	

	vscode.commands.registerCommand('references.gotoReference', (node: Reference) => node.gotoReference()
								);
	if (vscode.workspace.rootPath){
		const referencesProvider = new ReferencesProvider(vscode.workspace.rootPath);
		const defitionProvider = new DefinitionProvider(vscode.workspace.rootPath);
		vscode.window.registerTreeDataProvider('references', referencesProvider);
		vscode.window.registerTreeDataProvider('definition', defitionProvider);
		vscode.commands.registerCommand('references.refreshEntry', () =>{
											referencesProvider.refresh()
											defitionProvider.refresh()
											}	
										);
							
		vscode.commands.registerCommand('toBeChanged.add', async (node: Reference) => {
																	const comment = await addComment();
																	let toBeCheckedItems:TableItem[] = await referencesProvider.getTableItemsFromReference(node)
																	//console.log(toBeCheckedItems);
																	let toBeChangedItems:TableItem[] = await defitionProvider.getTableItemFromReference(node);
																	toBeCheckedItems = [...toBeCheckedItems, ...toBeChangedItems]
																	toBeChangedItems[0].comment = comment
																	toBeCheckedItems = toBeCheckedItems.map((element) => { return {...element, parent:toBeChangedItems[0]} })
																	webViewProvider.add('check',toBeCheckedItems)
																	webViewProvider.add('change',toBeChangedItems)
																	}
										);


		vscode.commands.registerCommand('toBeChanged.add_from_context', async () => {
					const itemType:string = 'Impacted'
					let {toBeCheckedItems, newTableItem} = await addItems(itemType)
					webViewProvider.add('check',toBeCheckedItems)
					webViewProvider.add('change',[newTableItem])
				}
		);

		vscode.commands.registerCommand('toBeChanged.add_from_contex_prop', async () => {
			const itemType:string = 'Propagating'
			let {toBeCheckedItems, newTableItem} = await addItems(itemType)
			webViewProvider.add('check',toBeCheckedItems)
			webViewProvider.add('change',[newTableItem])
			}
		);

		async function addItems (itemType:string):Promise<{toBeCheckedItems:TableItem[], newTableItem:TableItem|undefined }> {
			const editor = vscode.window.activeTextEditor;
			let toBeCheckedItems:TableItem[] = []
			let toBeChangedItems:TableItem[] = []
			let newTableItem:TableItem|undefined = undefined
			if (editor){
				let uri = editor.document.uri;
				let cursorPosition = editor.selection.start;
				let wordRange = editor.document.getWordRangeAtPosition(cursorPosition);
				let name:string = editor.document.getText(wordRange);
				const path: vscode.Location|vscode.LocationLink = new vscode.Location(uri,cursorPosition);
				const comment = await addComment();

				toBeCheckedItems = await referencesProvider.getTableItems();
				toBeChangedItems = await defitionProvider.getTableItem();
				toBeCheckedItems = [...toBeCheckedItems, ...toBeChangedItems]
				newTableItem = new TableItem(path.uri.path.substring(path.uri.path.lastIndexOf('/') + 1),path.range.start.line+1,path.range.start.character,path,name,itemType,comment,undefined)
			}
			return {toBeCheckedItems,newTableItem}
		}
	}

	
}

export function deactivate(): Thenable<void>[] | undefined {
	return
}
