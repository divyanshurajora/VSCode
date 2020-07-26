const $ = require("jquery");
require("jstree");
const path = require("path");
const fs = require("fs");

$(document).ready(function(){
    let pPath = process.cwd();  //pPath - parent path
    let name = path.basename(pPath); // last name in the full path

    let data = [{
        id: pPath,
        parent: "#",
        text: name
    }]
    let childArr = addCh(pPath);

    data = [...data, ...childArr];
    
    $('#tree').jstree({
        "core" : {
            "check_callback" : true,
            "data": data
        }
    }).on("open_node.jstree",function (e, data) {  

        // let cNodePath = data.node.id;   // current node path - this gives the id(path) of the node which is selected
        // let cArr = createData(cNodePath);
        // for (let i = 0; i < cArr.length; i++) {
        //     console.log(cArr[i]);
        //     $('#tree').jstree().create_node(cNodePath, cArr[i], "last");

        // }
        let children = data.node.children;
        for (let i = 0; i < children.length; i++) {
            let gcArr = addCh(children[i]);
            for (let j = 0; j < gcArr.length; j++) {
                let doesExist = $('#tree').jstree(true).get_node(gcArr[j].id);
                if(doesExist){
                    return;
                }
                // create logic
                $("#tree").jstree().create_node(children[i], gcArr[j], "last");
            }
        }
    })
})

// { "id" : "ajson1", "parent" : "#", "text" : "Simple root node" }
function addCh(parentPath){
    let isDir = fs.lstatSync(parentPath).isDirectory();
    if (isDir == false) {
        return [];
    }
    let childrens = fs.readdirSync(parentPath);
    let cdata = [];
    for (let i = 0; i < childrens.length; i++) {
        let cPath = path.join(parentPath, childrens[i]);
        let obj = {
            id: cPath,
            parent: parentPath,
            text: childrens[i]
        };
        cdata.push(obj);
    }
    return cdata;
}