const FileSaver = require('file-saver');
var OBJExporter = require('three-obj-exporter');

export function exportMeshAsJson(geometry){
    let json = geometry.toJSON();
    let string = JSON.stringify(json);
    let blob = new Blob([string], {type: "octet/stream"});
    FileSaver.saveAs(blob, randomName()+".json");
}

export function exportMeshAsObj(scene){
    var exporter = new OBJExporter();
    var result = exporter.parse(scene);
    var blob = new Blob([result], {type: 'text/plain'});
    FileSaver.saveAs(blob, randomName()+".obj");
}

function randomName(){
    var d = new Date();
    var n = d.getTime();
    return n;
}
