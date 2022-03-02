import * as vscode from 'vscode';
import {File , Reference, TableItem} from './references'

//class used for the definition treeview
export class DefinitionProvider implements vscode.TreeDataProvider<File|Reference> {
  private _onDidChangeTreeData: vscode.EventEmitter<File | Reference | undefined | null | void> = new vscode.EventEmitter<File |Reference | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<File | Reference|undefined | null | void> = this._onDidChangeTreeData.event;
  
  //used to update the treeview
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
  
  constructor(private workspaceRoot: string) {}

  //to return the treeview element
  getTreeItem(element: File): vscode.TreeItem {
    return element;
  }

  getChildren(element?: File): Thenable<File[]|Reference[]> {
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
  private async getFile():Promise<File[]>{
    let files:File[] = []

    const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
		  return files;
		}

    const name= this.getName(activeEditor)
	  const definition = await this.getDefinition(activeEditor.document.uri,activeEditor.selection.active);

    if (definition.length>0){
      if ('targetUri' in  definition[0] ){
        const duplicatedFiles:string[] = definition.map((element) => element.targetUri.path)
        const uniqueFiles = duplicatedFiles.filter((item, pos) => duplicatedFiles.indexOf(item) == pos)
          
        uniqueFiles.map((element) => files.push(new File(element.substring(element.lastIndexOf('/') + 1),element,vscode.TreeItemCollapsibleState.Expanded,[])))
        definition.map((element) => {files.filter(obj => {
                                                    return obj.path === element.targetUri.path
                                            })[0].children.push(new Reference('Line: '+(element.targetRange.start.line+1),'Position: '+element.targetRange.start.character,element,name,false))
                                          }
                      )
      }
      else if ('uri' in  definition[0]){
        const duplicatedFiles:string[] = definition.map((element) => element.uri.path)
        const uniqueFiles = duplicatedFiles.filter((item, pos) => duplicatedFiles.indexOf(item) == pos)
          
        uniqueFiles.map((element) => files.push(new File(element.substring(element.lastIndexOf('/') + 1),element,vscode.TreeItemCollapsibleState.Expanded,[])))
        definition.map((element) => {files.filter(obj => {
                                                    return obj.path === element.uri.path
                                            })[0].children.push(new Reference('Line: '+(element.range.start.line+1),'Position: '+element.range.start.character,element,name,false))
                                          }
                      )
      }
    }
    return files
  }



  public async getTableItem():Promise<TableItem[]>{
    let tableItems:TableItem[] = []

    const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
		  return tableItems;
		}

		const name= this.getName(activeEditor)
	  
    const definition = await this.getDefinition(activeEditor.document.uri,activeEditor.selection.active);
	  //const workspace = vscode.workspace
    
    if (definition.length>0){
      if ('targetUri' in  definition[0]){
        //const targetDocument:vscode.TextDocument = await workspace.openTextDocument(definition[0].targetUri)
        definition.map((element) => 
          tableItems.push(new TableItem(element.targetUri.path.substring(element.targetUri.path.lastIndexOf('/') + 1),element.targetRange.start.line+1,element.targetRange.start.character,element,name,'Located','',undefined))
        )
        
      }
      else if ('uri' in  definition[0]){
        //const targetDocument:vscode.TextDocument = await workspace.openTextDocument(definition[0].uri)
        definition.map((element) => tableItems.push(new TableItem(element.uri.path.substring(element.uri.path.lastIndexOf('/') + 1),element.range.start.line+1,element.range.start.character,element,name,'Located','',undefined)))
      }
    }
    return tableItems

  }

  public async getTableItemFromReference(reference:Reference):Promise<TableItem[]>{
    let tableItems:TableItem[] = []

    const definition = await this.getDefinition(reference.getUri(),reference.getPosition());

    if (definition.length>0){
      if ('targetUri' in  definition[0]){
        definition.map((element) => tableItems.push(new TableItem(element.targetUri.path.substring(element.targetUri.path.lastIndexOf('/') + 1),element.targetRange.start.line+1,element.targetRange.start.character,element,reference.name,'Located','',undefined)))
      }
      else if ('uri' in  definition[0]){
        definition.map((element) => tableItems.push(new TableItem(element.uri.path.substring(element.uri.path.lastIndexOf('/') + 1),element.range.start.line+1,element.range.start.character,element,reference.name,'Located','',undefined)))
      }
    }
    return tableItems

  }

  public async getDefinition(uri:vscode.Uri, position:vscode.Position):Promise<vscode.Location[]|vscode.LocationLink[]> {
    return vscode.commands.executeCommand<vscode.Location[]|vscode.LocationLink[]>(
		  'vscode.executeDefinitionProvider',
		  uri,
		  position
		);
  }

  public getName (activeEditor:vscode.TextEditor):string {
    let cursorPosition = activeEditor.selection.start;
		let wordRange = activeEditor.document.getWordRangeAtPosition(cursorPosition);
		return activeEditor.document.getText(wordRange);
  }

}


type TypeOfLocation = vscode.Location | vscode.LocationLink
function determineTypeLocation(toBeDetermined: TypeOfLocation): toBeDetermined is vscode.Location {
  if((toBeDetermined as vscode.Location).uri){
    return true
  }
  return false
}

function instanceOfA(object: any): object is vscode.Location{
  return 'uri' in object[0];
}