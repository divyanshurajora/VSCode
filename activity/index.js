const $ = require("jquery");
require("jstree");
const path = require("path");
const fs = require("fs");
let myMonaco, editor;
let tabArr = {};

$(document).ready(async function(){
    editor = await createEditor();

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
    }).on("select_node.jstree", function (e, dataObj) {
        let fPath = dataObj.node.id;
        let isFile = fs.lstatSync(fPath).isFile();
        if (isFile) {
            setData(fPath);
            createTab(fPath)
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

// monaco editor implementation
function createEditor(){
        const amdLoader = require('./node_modules/monaco-editor/min/vs/loader.js');
		const amdRequire = amdLoader.require;
		const amdDefine = amdLoader.require.define;

		function uriFromPath(_path) {
			var pathName = path.resolve(_path).replace(/\\/g, '/');
			if (pathName.length > 0 && pathName.charAt(0) !== '/') {
				pathName = '/' + pathName;
			}
			return encodeURI('file://' + pathName);
		}

		amdRequire.config({
			baseUrl: './node_modules/monaco-editor/min'
		});

		// workaround monaco-css not understanding the environment
		self.module = undefined;
        return new Promise(function(resolve,reject){
            amdRequire(['vs/editor/editor.main'], function() {
                var editor = monaco.editor.create(document.getElementById('editor'), {
                    value: [
                        'function x() {',
                        '\tconsole.log("Hello world!");',
                        '}'
                    ].join('\n'),
                    language: 'javascript'
                });
                myMonaco = monaco;
                resolve(editor);
            });
        })
		
}

function setData(fPath){
    console.log(fPath);
    let content = fs.readFileSync(fPath, "utf-8");
    // console.log(content);
    editor.getModel().setValue(content);
    var model = editor.getModel();
    let ext = fPath.split(".").pop();
    if(ext == "js"){
        ext = "javascript";
    }
    myMonaco.editor.setModelLanguage(model,ext);
}

function createTab(fPath) {
    console.log(fPath);
    let fName = path.basename(fPath);
    if (!tabArr[fPath]) {
        $("#tabs-row").append(`<div class="tab">
        <div class="tab-name" id=${fPath} onclick=handleTab(this)>${fName}</div>
        <i class="fas fa-times" id=${fPath} onclick=handleClose(this)></i>
        </div>`);
        tabArr[fPath] = fName;
    }
}

function handleTab(elem) {
    let fPath = $(elem).attr("id");
    console.log(fPath);
    setData(fPath);
}

function handleClose(elem) {
    let fPath = $(elem).attr("id");
    delete tabArr[fPath];
    $(elem).parent().remove();
 fPath =$(".tab .tab-name").eq(0).attr("id");
 console.log("Handle Close "+fPath);
    if(fPath){
        setData(fPath);
    }
}