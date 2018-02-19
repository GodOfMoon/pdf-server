//libraries
var http = require('http');
var url = require('url');
var qs = require('querystring');

//describe function of starting server
function start(route, handle) {
	var portToListen = 8080;
	
	//request response function
	function onRequest(request, response) {
		
		//parse url
		var pathname = url.parse(request.url).pathname;
		
		//add inf to console
		console.log('');
		console.log('Request for ' + pathname + ' received.');
		
		//add opportunity to work with post-data
		var postData = '';
		request.setEncoding('utf8');
		request.addListener('data', function(postDataChunk) {
			postData += postDataChunk;
		});
		request.addListener('end', function() {
			
			//parse post-data
			var post = qs.parse(postData);
			
			//send request to the router
			route(handle, pathname, response, post);
		});
	}
	
	//start server, listen a port
	http.createServer(onRequest).listen(portToListen);
	console.log('Server has started.');
}
//export functions
exports.start = start;