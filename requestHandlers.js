//libs
'use strict';
var fs = require('fs');
var path = require('path');
var makepdf = require('./makepdf');

class Line {
	constructor(text, x, y, size, face) {
		this.text = text;
		this.color = 'black';
	}
	set x(value){
    	this.xValue = value;
	}
	set y(value){
    	this.yValue = value;
	}
	set size(value){
    	this.sizeValue = value;
	}
	set face(value){
    	this.faceValue = value;
	}
	set text(value){
    	this.textValue = value;
	}
	set color(value){
    	this.colorValue = value;
	}
	
	get x(){
		return `${this.xValue}`;
	}
	get y(){
		return `${this.yValue}`;
	}
	get size(){
		return `${this.sizeValue}`;
	}
	get face(){
		return `${this.faceValue}`;
	}
	get text(){
		return `${this.textValue}`;
	}
	get color(){
		return `${this.colorValue}`;
	}
};
//function for download files from server
function download(handle, response, post, pathname) {
	console.log('Request handler "download" was called. Downloading ' + pathname);
	
	//request for index.html
	if (pathname === '' || pathname === '/' || pathname === undefined)
		pathname = '/html/index.html';
	var filePath = '.' + pathname;
	
	var statusCode = ''; //http status code
	
	//check file extension & declare content type
	var extname = path.extname(filePath);
	var contentType = '';
	switch (extname) {
		case '.html':
			contentType = 'text/html; charset=utf-8';
			break;
		case '.css':
			contentType = 'text/css';
			break;
		case '.pdf':
			contentType = 'application/pdf';
			break;			
	}
	//if file not exist
	if (!fs.existsSync(filePath) || (contentType === '')){
		console.log('Error. Cannot download file ' + pathname);
		filePath = './html/index.html';
		contentType = 'text/html; charset=utf-8';
		statusCode = 404;
	}
	//download file
	if (contentType === 'application/pdf') {
		var file = fs.createReadStream(filePath);
		var stat = fs.statSync(filePath);
		response.setHeader('Content-Length', stat.size);
		response.setHeader('Content-Type', 'application/pdf');
		response.setHeader('Content-Disposition', 'attachment; filename=output.pdf');
		file.pipe(response);
	} else {
		fs.readFile(filePath, function(error, content) {
			if (statusCode === '') {
				statusCode = 200;
			}
			response.writeHead(statusCode, { 'Content-Type': contentType});
			response.end(content, 'utf-8');
		});
	}	
}
//request to make pdf from POST-data
function make(handle, response, post) {
	console.log('Request handler "make" was called.');
	
	var input = isJson(post.dt);
	
	var jsonFile = fs.readFileSync('json/coor.json', 'utf8');
	var coor = isJson( JSON.parse(jsonFile) );
	
	if (input === false || coor === false) {
		if (coor === false) {
			console.log('Json from server is not valid');
			makeJson(handle, response, 'Json from server is not valid');
		}
		if (input === false) {
			console.log('Json is not valid');
			makeJson(handle, response, 'Json is not valid');
		}
	} else {
		var mas = [];
		var i = 0;
		var temp = '';
		for (var key in coor) {
			for (var key2 in coor[key]) {
				//create class object
				temp = check(input[key]);
				mas[i] = new Line(temp); 
				for (var key3 in coor[key][key2]) {
					//use set by key3 
					mas[i][key3] = coor[key][key2][key3];
				}
				i++;
			}
		}	
		//original file-name
		var randomSequence = Math.random().toString(36).substring(2);
		var dir = 'out/';
		makepdf.touchpdf(
			mas,
			dir + randomSequence,
			function (destination) {
				makeJson(handle, response, destination);
			}
		);
	}
}
//Json-answer
function makeJson(handle, response, data) {
	console.log('Request handler "makeJson" was called.');
	//in data - text of error
	var json;
	if (path.extname(data) != '.pdf') {
		json = '{"status":"Error","ext_status":"' + data + '","url":null}';
	} else {
		json = '{"status":"OK","ext_status":null,"url":"' + data + '"}';
	}	
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.write(json);
	response.end();
}
//replace notValid symbols
function check(str){
	var reg = /[^a-zа-яё\s\d\-_.,]+/ig;
    return str.replace(reg, '.');
}
function isJson(json){
	try {
		return JSON.parse(json);
    } catch (e) {
		return false;
	}
}
//export functions
exports.make = make;
exports.download = download;
