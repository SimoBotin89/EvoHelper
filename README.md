# evohelper README

The aim of this thesis work is to develop a tool, usable in the greatest possible number of contexts, which actively and fully support the programmer in the activity of software maintenance and evolution. These requirements translate into developing a language independent tool, fully integrated in the world’s most used IDE: Visual Studio Code. EvoHelper (from Evolution Helper) is the name given to the VS Code extension, developed for this thesis work, which, using language servers to deliver the necessary language features, fulfils the requirements exposed above.
After helping the developer in the Concept Location stage, it guides him through the Impact Analysis phase, highlighting all the locations to be modified in order to implement the desired change. Therefore, EvoHelper avoids the introduction of new bugs when performing bug fixing activity or adding new feature to the software.
![Cattura](https://user-images.githubusercontent.com/72127636/159425344-9a947763-78e7-40e1-b378-486a8b8a0216.PNG)

## Features

EvoHelper directly supports all phases of the software changing process. The Concept Location phase makes an extended use of the language feature offered by the IDE. The two TreeView on top of the extension show the location of the definition and the references of the selected item in the editor, making it easy to search for the target item in the source code. When the concept has been successfully located, an entry can be added to the Impacted and Located Table, starting the Impact Analysis phase.
![Cattura1 - Copia (2)](https://user-images.githubusercontent.com/72127636/159425911-b88a8a2a-4079-48c2-a0ed-774bc4e42f72.PNG)

The developer is guided through the Impact Analysis phase through the tables provided by the WebView on the extension bottom. In order to complete the analysis, the developer has to check all entries placed in the second table, deciding if the corresponding piece of code need to be changed or not. Depending on the result of the analysis, the inspected item can be added to the first table, which at the end will contain all the references to the code that need to be modified in order to reach the desired changed. When a new item is added to the Impacted and Located Table, it is possible to add a comment to it, making it easier to perform the next phase of the changing process.
![Immagine](https://user-images.githubusercontent.com/72127636/159425940-5ecb17a3-79a0-4660-a988-b5690c331bb0.png)

Once the Impact Analysis has been performed, the developer is guided by EvoHelper through the Actualization phase. The coder has only to scroll the Impacted and Located Table and to implement the changes for every entry. The result of this phase is that the code has been modified consistently in every piece of code that needs to be changed.

When an item is has been successfully identified as needing modifications, EvoHelper offers the possibility to add a comment to it, making it easier to later perform the necessary changes to the code. The comment can store any useful information related to the change to be implemented, like the property to add to an object or the target value to insert in a variable. The pop up screen can also be closed without adding a comment, if this feature is not of interest by the developer.
![Cattura3](https://user-images.githubusercontent.com/72127636/159425552-b061ed8d-125d-416b-b528-c082a6b5b8d1.PNG)

As already said, the tool is based on the functionalities of the language servers, meaning that it can support every language for which a language server for VS Code is available. Many language servers are delivered as VS Code extension and so, in order to use the tool with a specific programming language, it is sufficient to find the correct extension that implements the specific language server. The IDE then, basing on the file extension, calls the correct language server for delivering the language features. For example, these are the seven most used language extensions for VS Code: “Python”, “C/C++”, “C#”, “Extension Pack for Java”, “Go”, “Dart” and “Ruby”. During the development of EvoHelper, the tool has been successfully tested with the following programming languages: JavaScript, Typescript, Java and Python, proving it can work with any programming language for which a language server is available.

The tool uses the workspace storage in order to persist the data of the analysis. For every VS Code project, a different storage is created, so that it is possible to work on the maintenance process of different software at the same time.

## Requirements

In order to run the Extension in debug mode, just open the project with VS Code and press F5.

## Known Issues

None

## Release Notes

This Extension has not been published jet in the VS Code Extension MarketPlace.

### 1.0.0

Initial release of EvoHelper

