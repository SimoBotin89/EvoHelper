const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {

  window.addEventListener('message',getData);
  vscode.postMessage({
    type: "ready",
  });
}

function goToReference(event) {
  vscode.postMessage({
    type: "goTo",
    data: event.data.tableItem,
  });
}

function deleteItem(event) {
  vscode.postMessage({
    type: "delete",
    data: event.data.tableItem,
  });
}

function handelChecked(event) {
  vscode.postMessage({
    type: "handelChecked",
    data: event.data.tableItem,
    state: event.target._checked
  });
}


function getData() {
  const message = event.data; // The JSON data our extension sent
  let header = '';
  switch (message.type) {
      case 'refreshToBeChanged':
        console.log('start refresh')
        $('#toBeChanged').empty();
        header = 	'<vscode-data-grid-row row-type="header">'+
                          '<vscode-data-grid-cell cell-type="columnheader" grid-column="1">Name</vscode-data-grid-cell>'+
                          '<vscode-data-grid-cell cell-type="columnheader" grid-column="2">File</vscode-data-grid-cell>'+
          //                '<vscode-data-grid-cell cell-type="columnheader" grid-column="3">Line</vscode-data-grid-cell>'+
                          '<vscode-data-grid-cell cell-type="columnheader" grid-column="3">Go To</vscode-data-grid-cell>'+
                          '<vscode-data-grid-cell cell-type="columnheader" grid-column="4">State</vscode-data-grid-cell>'+
                          '<vscode-data-grid-cell cell-type="columnheader" grid-column="5">Delete</vscode-data-grid-cell>'+
                        '</vscode-data-grid-row>';
        $('#toBeChanged').append(header);
        message.data.forEach((line) => {
          console.log(line)

          let referencebutton = '<vscode-button id='+line.line+line.position+' title="'+line.comment+'">-></vscode-button>'
          let deletebutton = '<vscode-button id="del-'+line.line+line.position+'">x</vscode-button>'
          const code = 
            '<vscode-data-grid-row>'+
              '<vscode-data-grid-cell grid-column="1" title="'+line.name+'">'+line.shortName+'</vscode-data-grid-cell>'+
              '<vscode-data-grid-cell grid-column="2">'+line.file+'</vscode-data-grid-cell>'+
              //'<vscode-data-grid-cell grid-column="3">'+line.line+'</vscode-data-grid-cell>'+
              '<vscode-data-grid-cell grid-column="3">'+referencebutton+'</vscode-data-grid-cell>'+
              '<vscode-data-grid-cell grid-column="4">'+line.state+'</vscode-data-grid-cell>'+             
              '<vscode-data-grid-cell grid-column="5">'+deletebutton+'</vscode-data-grid-cell>'+
            '</vscode-data-grid-row>';
          $('#toBeChanged').append(code);
          //OCCHIO AI PUNTI NELL'IDENTIFICATORE
          $('#'+line.line+line.position).on("click", null, {tableItem: line}, goToReference);
          $('#del-'+line.line+line.position).on("click", null, {tableItem: line}, deleteItem);
        });

        //console.log('#'+message.data[0].file+message.data[0].line+message.data[0].position);

        //$('#'+message.data[0].line+message.data[0].position).on( "click", null, { foo: "bar" }, myHandler );
        //$('#1').on( "click", null, { foo: "bar" }, myHandler );
        

        break;
      case 'refreshToBeChecked':
        console.log('start refresh tobechecked')
        $('#toBeChecked').empty();
        header = 	'<vscode-data-grid-row row-type="header">'+
                          '<vscode-data-grid-cell cell-type="columnheader" grid-column="1">Name</vscode-data-grid-cell>'+
                          '<vscode-data-grid-cell cell-type="columnheader" grid-column="2">File</vscode-data-grid-cell>'+
                   //       '<vscode-data-grid-cell cell-type="columnheader" grid-column="3">Line</vscode-data-grid-cell>'+
                          '<vscode-data-grid-cell cell-type="columnheader" grid-column="3">Go To</vscode-data-grid-cell>'+
                          '<vscode-data-grid-cell cell-type="columnheader" grid-column="4">Inspected</vscode-data-grid-cell>'+
                        '</vscode-data-grid-row>';
        $('#toBeChecked').append(header);
        message.data.forEach((line) => {
          console.log(line)
          let referencebutton = '<vscode-button id='+line.line+line.position+'>-></vscode-button>'
          let checkbox = '<vscode-checkbox id="checkbox-'+line.line+line.position+'"></vscode-checkbox>'
          const code = 
            '<vscode-data-grid-row>'+
              '<vscode-data-grid-cell grid-column="1" title="'+line.name+'">'+line.shortName+'</vscode-data-grid-cell>'+
              '<vscode-data-grid-cell grid-column="2">'+line.file+'</vscode-data-grid-cell>'+
            //  '<vscode-data-grid-cell grid-column="3">'+line.line+'</vscode-data-grid-cell>'+
              '<vscode-data-grid-cell grid-column="3">'+referencebutton+'</vscode-data-grid-cell>'+
              '<vscode-data-grid-cell grid-column="4">'+checkbox+'</vscode-data-grid-cell>'+
            '</vscode-data-grid-row>';
          $('#toBeChecked').append(code);
          $('#'+line.line+line.position).on("click", null, {tableItem: line}, goToReference);
          if (line.state === 'checked')
             $('#checkbox-'+line.line+line.position).prop('checked', true);
          $('#checkbox-'+line.line+line.position).on("change", null, {tableItem: line}, handelChecked);
        });
        break;
  }
}


