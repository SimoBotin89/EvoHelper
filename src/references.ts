import * as vscode from 'vscode';

export class ReferencesProvider implements vscode.TreeDataProvider<File|Reference> {
  private _onDidChangeTreeData: vscode.EventEmitter<File | Reference | undefined | null | void> = new vscode.EventEmitter<File |Reference | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<File | Reference|undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
  
  constructor(private workspaceRoot: string) {}

  getTreeItem(element: File): vscode.TreeItem {
    return element;
  }

  getChildren(element?: File): Thenable<File[]|Reference[]> {
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

  public async getFile():Promise<File[]>{
    let files:File[] = []

    const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
		  return files;
		}
	  
    const references = await this.getReferences(activeEditor.document.uri,activeEditor.selection.active);
    if (references.length > 0){
      const duplicatedFiles = references.map((element) => element.uri.path)
      const uniqueFiles = duplicatedFiles.filter((item, pos) => duplicatedFiles.indexOf(item) == pos)
        
      uniqueFiles.map((element) => files.push(new File(element.substring(element.lastIndexOf('/') + 1),element,vscode.TreeItemCollapsibleState.Expanded,[])))
      references.map((element) => {files.filter(obj => {
                                                  return obj.path === element.uri.path
                                          })[0].children.push(new Reference('Line: '+(element.range.start.line+1),'Position: '+element.range.start.character,element,activeEditor.document.getText(element.range),false))
                                        }
                    )
    }
    return files
  }

  public async getTableItems():Promise<TableItem[]> {
    let tableItems:TableItem[] = []
    const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
		  return tableItems;
		}
	  //scrivere il nome per la referenza
    let cursorPosition = activeEditor.selection.start;
		let wordRange = activeEditor.document.getWordRangeAtPosition(cursorPosition);
		const name:string = activeEditor.document.getText(wordRange);
    const references = await this.getReferences(activeEditor.document.uri,activeEditor.selection.active);
    references.map((element) => tableItems.push(new TableItem(element.uri.path.substring(element.uri.path.lastIndexOf('/') + 1),element.range.start.line+1,element.range.start.character,element,name,'','',undefined)))
    return tableItems
  }

  public async getTableItemsFromReference(reference:Reference):Promise<TableItem[]> {
    let tableItems:TableItem[] = []
  	const references = await this.getReferences(reference.getUri(),reference.getPosition());
    references.map((element) => tableItems.push(new TableItem(element.uri.path.substring(element.uri.path.lastIndexOf('/') + 1),element.range.start.line+1,element.range.start.character,element,reference.name,'','',undefined)))
    return tableItems
  }

  public async getReferences(uri:vscode.Uri, position:vscode.Position):Promise<vscode.Location[]> {
    return vscode.commands.executeCommand<vscode.Location[]>(
		  'vscode.executeReferenceProvider',
		  uri,
		  position
		);
  }

}

export class File extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public path: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public children: Reference[]
  ){
    super(label, collapsibleState);
    this.tooltip = `${this.label} - ${this.path}`;
    this.description = this.path;
    
  }

  public checkSameReference(reference1:Reference,reference2:Reference):boolean {
    if (reference1.name===reference2.name && reference1.position===reference2.position && reference1.line===reference2.line)
      return true
    else
      return false
  }

}

export class Reference extends vscode.TreeItem{
  
  constructor(
    public line: string,
    public position: string,
    public path: vscode.Location|vscode.LocationLink,
    public name:string,
    public checked: boolean
  ){
    super(line, vscode.TreeItemCollapsibleState.None);
    this.tooltip = `${this.line} - ${this.position}`;
    this.description = this.position;

  }

  public getUri():vscode.Uri {
    if ('targetUri' in  this.path)
      return this.path.targetUri
    else
      return this.path.uri
  }

  public getPosition():vscode.Position {
    if ('targetUri' in  this.path)
      return this.path.targetRange.start
    else
      return this.path.range.start
  }

  public async gotoReference() {
    //console.log("I'm "+this.tooltip)
    if ('targetUri' in  this.path)
      vscode.commands.executeCommand('vscode.open', this.path.targetUri,{selection:this.path.targetRange, preview:false});
    else
      vscode.commands.executeCommand('vscode.open', this.path.uri,{selection:this.path.range, preview:false});
  };

  public setChecked() {
    this.checked = true;
  }

  public setUnchecked() {
    this.checked = false;
  }

  contextValue = 'reference';
}



export class TableItem {
  public readonly shortName:string;

  constructor(
    public file:string,
    public line: number,
    public position: number,
    public path: vscode.Location|vscode.LocationLink,
    public name:string,
    public state: string,
    public comment: string,
    public parent: TableItem|undefined
  ){
    this.shortName = name.substring(0,10);
  }


}
