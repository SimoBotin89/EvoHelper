import * as vscode from 'vscode';
import { getUri } from "./getUri";
import {LocalStorage} from "./localStorage";
import {TableItem} from './references';

const toBeCheckedStorage = "ToBeCheckedTableItems";
const toBeChangedStorage = "ToBeChangedTableItems";

const toBeCheckedType = 'refreshToBeChecked';
const toBeChangedType = 'refreshToBeChanged';
export class RippleWebViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'evoHelperWebView.main';

	private _view?: vscode.WebviewView|undefined;

	private itemsToBeChecked:TableItem[]=[]
	private itemsToBeChanged:TableItem[]=[]
	private storageManager:LocalStorage|undefined

	constructor(
		private readonly _extensionUri: vscode.Uri,
		passedstorageManager:LocalStorage
	) {
		this.storageManager=passedstorageManager
		//console.log(this.storageManager.getValue<TableItem[]>(toBeChangedStorage))
		if (!(this.storageManager.getValue<TableItem[]>(toBeChangedStorage)===[] ||
			this.storageManager.getValue<TableItem[]>(toBeChangedStorage) === null)){
		  	const items:TableItem[] = this.storageManager.getValue<TableItem[]>(toBeChangedStorage)
		  	items.forEach((element)=> {
									  this.itemsToBeChanged.push(restoreElement(element));
									 })
		}
		if (!(this.storageManager.getValue<TableItem[]>(toBeCheckedStorage)===[] ||
			this.storageManager.getValue<TableItem[]>(toBeCheckedStorage) === null)){
			const items:TableItem[] = this.storageManager.getValue<TableItem[]>(toBeCheckedStorage)
			items.forEach((element)=> {
								  this.itemsToBeChecked.push(restoreElement(element));
								 })
	}  

	 }

	add(table:string,element?: TableItem[]|undefined):void{
		switch (table){
			case 'change':
				//check if already present
				if (element && this.storageManager && this._view){
					if (element.some((newToCheck) => this.itemsToBeChanged.some((oldToCheck) => newToCheck.name === oldToCheck.name &&
					newToCheck.file === oldToCheck.file && newToCheck.line === oldToCheck.line && newToCheck.position === oldToCheck.position))){
						element = []
					}
					this.itemsToBeChanged= [...this.itemsToBeChanged,...element]
					this._view.webview.postMessage({type:toBeChangedType, data:this.itemsToBeChanged });
					this.storageManager.setValue<TableItem[]>(toBeChangedStorage,this.itemsToBeChanged)
				}
				//console.log(this.itemsToBeChanged)
				break;
			case 'check':
				if (element && this.storageManager && this._view){
				//check if already present
					if (element.some((newToCheck) => this.itemsToBeChecked.some((oldToCheck) => newToCheck.name === oldToCheck.name &&
					newToCheck.file === oldToCheck.file && newToCheck.line === oldToCheck.line && newToCheck.position === oldToCheck.position))){
						element = []
					}
					this.itemsToBeChecked = [...this.itemsToBeChecked,...element]
					this._view.webview.postMessage({type:toBeCheckedType, data:this.itemsToBeChecked });
					this.storageManager.setValue<TableItem[]>(toBeCheckedStorage,this.itemsToBeChecked)
					//console.log(this.itemsToBeChecked)
				}
				break;		
		}

	}

	update(table:string,element: TableItem):void{
		let index = -1;
		switch (table){
			case 'change':
				if (element && this.storageManager && this._view){
					index = this.itemsToBeChanged.findIndex( (item) => element.name === item.name &&
					element.file === item.file && element.line === item.line && element.position === item.position);
					if (index > -1) {
						this.itemsToBeChanged.splice(index, 1);
						this._view.webview.postMessage({type:toBeChangedType, data:this.itemsToBeChanged });
						this.storageManager.setValue<TableItem[]>(toBeChangedStorage,this.itemsToBeChanged)
					}
				}
				break;
			case 'check':
				if (element && this.storageManager && this._view){
					this.itemsToBeChecked = this.itemsToBeChecked.filter((item) => !(element.name === item.parent.name &&
					element.file === item.parent.file && element.line === item.parent.line && element.position === item.parent.position));
					this._view.webview.postMessage({type:toBeCheckedType,data:this.itemsToBeChecked });
					this.storageManager.setValue<TableItem[]>(toBeCheckedStorage,this.itemsToBeChecked)
				}
				break;		
		}

	}

	delete(table:string,element: TableItem):void{
		let index = -1;
		switch (table){
			case 'change':
				if (element && this.storageManager && this._view){
				//basta estrarre nome, file, riga e posizione e eliminare quello
					index = this.itemsToBeChanged.findIndex( (item) => element.name === item.name &&
					element.file === item.file && element.line === item.line && element.position === item.position);
					if (index > -1) {
						this.itemsToBeChanged.splice(index, 1);
						this._view.webview.postMessage({type:toBeChangedType, data:this.itemsToBeChanged });
						this.storageManager.setValue<TableItem[]>(toBeChangedStorage,this.itemsToBeChanged)
					}
				}
				break;
			case 'check':
				if (element && this.storageManager && this._view){
					this.itemsToBeChecked = this.itemsToBeChecked.filter((item) => !(element.name === item.parent.name &&
					element.file === item.parent.file && element.line === item.parent.line && element.position === item.parent.position));
					this._view.webview.postMessage({type:toBeCheckedType,data:this.itemsToBeChecked });
					this.storageManager.setValue<TableItem[]>(toBeCheckedStorage,this.itemsToBeChecked)
				}
				break;		
		}

	}

	public get(type:string):TableItem[]{
		switch (type){
			case 'change':
				return this.itemsToBeChanged;
			case 'check':
				return this.itemsToBeChecked;
		}
		return this.itemsToBeChanged
	}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getWebviewContent(webviewView.webview,this._extensionUri);
		
		webviewView.webview.postMessage({type:toBeChangedType, data:this.itemsToBeChanged });
		webviewView.webview.postMessage({type:toBeCheckedType, data:this.itemsToBeChecked });

		this._setWebviewMessageListener(webviewView.webview);

	}

	private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
		const toolkitUri = getUri(webview, extensionUri, [
		  "node_modules",
		  "@vscode",
		  "webview-ui-toolkit",
		  "dist",
		  "toolkit.js",
		]);
		const jqueryUri = getUri(webview, extensionUri, [
			"node_modules",
			"jquery",
			"dist",
			"jquery.js",
		  ]);

		const buttonClick = getUri(webview, extensionUri, ["src","webViewCode.js"]);
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


	  private _setWebviewMessageListener(webview: vscode.Webview) {
		webview.onDidReceiveMessage(
		  (message: any) => {
			const type = message.type;
			const data:TableItem = message.data as TableItem;
	
			switch (type) {
				case "ready":
					webview.postMessage({type:toBeChangedType, data:this.itemsToBeChanged });
					webview.postMessage({type:toBeCheckedType, data:this.itemsToBeChecked });
				break;
			  	case "goTo":
					gotoReference(data);
				break;
				case "delete":
					this.deleteItem(data);
				break;
				case "handelChecked":
					const state = message.state;
					this.handelChecked(data,state);
				break;

			}
		  },
		  undefined,
		);
	  }

	  private deleteItem(toBeChangedItem:TableItem) {
		this.delete('change',toBeChangedItem);
		this.delete('check',toBeChangedItem)	
	  };


	  private handelChecked(element:TableItem,state:boolean) {
		//this.update('change',toBeChangedItem);
		let index = -1
		index = this.itemsToBeChecked.findIndex((item) => (element.name === item.name &&
			element.file === item.file && element.line === item.line && element.position === item.position));
		if (index > -1 && this.storageManager) {
			if (state)
				this.itemsToBeChecked[index].state='checked'
			else
				this.itemsToBeChecked[index].state=''
			this.storageManager.setValue<TableItem[]>(toBeCheckedStorage,this.itemsToBeChecked)
		}	
	  };

	  private updateContent(){

	  }
}

function gotoReference(tableItem:TableItem) {
	//console.log("I'm "+this.tooltip)
	tableItem.path = restoreLocation(tableItem)
    vscode.commands.executeCommand('vscode.open', tableItem.path.uri,{selection:tableItem.path.range, preview:false});
  };

function restoreElement(element:TableItem):TableItem {
	const file:string = element.file
	const line: number = element.line
    const position: number = element.position
	const path = restoreLocation(element)
	const name:string = element.name
	const comment: string = element.comment
	const state: string = element.state
	let parent :TableItem|undefined = undefined
	if (element.parent !== undefined)
		parent = restoreElement(element.parent)
	return new TableItem(file,line,position,path,name,state,comment,parent)
  }
  
  function restoreLocation(element:TableItem):vscode.Location {
	let path:vscode.Location|undefined = undefined
	let uri:vscode.Uri|undefined = undefined
	if ('targetUri' in  element.path){
	  if ('path' in  element.path.targetUri){
		uri = vscode.Uri.file(element.path.targetUri.path)
	  }
	  else{
		uri = vscode.Uri.file(element.path.targetUri.fsPath)
	  }
	  const range = new vscode.Range(element.path.targetRange[0].line,
			element.path.targetRange[0].character,element.path.targetRange[1].line,element.path.targetRange[1].character)
	  path = new vscode.Location(uri,range)
	}
	else{
	  const uri:vscode.Uri = vscode.Uri.file(element.path.uri.path)
	  const range:vscode.Range = new vscode.Range(element.path.range[0].line,
		element.path.range[0].character,element.path.range[1].line,element.path.range[1].character)
		path = new vscode.Location(uri,range)
	}
	return path
  }
  