const http = require('http');
const Path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const server = http.createServer();
var shellId = 0;

function login(req, res) {
	if(req.method == 'POST'){
		req.on('data', (data) => {
			console.log(data.toString());
			var pair = data.toString().split('\r\n');
			if(pair[0] == 'LuisHsu' && pair[1] == '123456'){
				var md5 = crypto.createHash('md5');
				md5.update(pair[0] + (new Date()).getTime().toString());
				res.statusCode = 200;
				res.end(md5.digest('hex'));
			}else {
				res.end('failed');
			}
		})
	}else{
		res.statusCode = 400;
		res.end("Bad request");
	}
}

function shell(req, res) {
	if(req.method == 'POST'){
		req.on('data', (data) => {
			res.statusCode = 200;
			res.end("success\r\n0\r\n<b style='color:rgb(130, 223, 80);'>LuisHsu@</b><b style='color:rgb(250, 249, 120);'>LuisHsu-SmallNote</b>:");
		})
	}else{
		res.statusCode = 400;
		res.end("Bad request");
	}
}

function command(req, res) {
	if(req.method == 'POST'){
		req.on('data', (data) => {
			res.statusCode = 200;
			res.end(data.toString());
		})
	}else{
		res.statusCode = 400;
		res.end("Bad request");
	}
}

server.on('request', (req, res) => {
	if(req.url.endsWith('/login')){
		login(req, res);
	}else if(req.url.endsWith('/shell')){
		shell(req, res);
	}else if(req.url.endsWith('/command')){
		command(req, res);
	}else{
		if(req.url.endsWith('/')){
			req.url += 'index.html';
		}
		var fin = fs.createReadStream(Path.resolve('../public', req.url.substr(1)));
		fin.on('error', (err) => {
			console.error(err.toString());
			res.statusCode = 404;
			res.end('Not found');
		})
		fin.pipe(res);
	}
})

server.listen(3000, () => {
	console.log(`WebDesktop server listening on ${server.address().port}`);
})
