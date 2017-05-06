// module
var http = require('http');
var url = require('url');
var fs = require('fs');
var qs = require('querystring');

// constant
const host="127.0.0.1";
const port=8080;
const dir=require('path').dirname(require.main.filename)+'/';
const kinds=['time','php',];
var tmp=[]; for(var x=0;x<kinds.length;x++) tmp[x]=dir+kinds[x]+'.txt';
const files=tmp;
const maxRecord=10;

// function
function readfileCallback(err,data){
	if (err) console.log("error: "+err['path']);// throw err;
	console.log(data);
	console.log("// callback$");
}

function chooseType(path){
	var rtv="";
	switch(path.slice(path.lastIndexOf('.')+1)){
		case 'htm':
		case 'html':
		case 'js':
			rtv="text/html";
			break;
		default:
			rtv="text/plain";
			break;
	}
	return rtv;
}

function readfile(path,response){
	fs.access(path,fs.R_OK || fs.constants.R_OK,function(err){
		if(err) response.writeHead(404);
		else {
			var type=chooseType(path);
			response.writeHead(200, {'Content-Type': type});
			response.write(fs.readFileSync(path));
		}
		response.end();
	},1);
}

function writeFile(path,data){
}

function writeRank(newData,resp){
	var cnt=files.length;
	fs.readFile(files[0],'utf8',function(err,data){
		if(!err){
			data=data.replace(/^\uFEFF/, '');
			var t=(data.length==0)?[]:JSON.parse(data);
			if(t.length!=undefined){
				var x=t.length;
				for(;x>0;x--) if(t[x-1].value<=newData.time) break; //
				if(x>=0 && x<maxRecord){
					for(var i=t.length;i>x;i--) t[i]=t[i-1];
					while(t.length>maxRecord) t.pop();
					t[x]={'name':newData.id,'value':newData.time}; //
					fs.writeFile(files[0],JSON.stringify(t),function(err){if(err)console.log("?"+err);console.log("write done:",files[0]);});
				}
			}
		}
		cnt--; if(cnt==0) resp.end();
	});
	fs.readFile(files[1],'utf8',function(err,data){
		if(!err){
			data=data.replace(/^\uFEFF/, '');
			var t=(data.length==0)?[]:JSON.parse(data);
			if(t.length!=undefined){
				var x=t.length;
				for(;x>0;x--) if(t[x-1].value>=newData.php) break; //
				if(x>=0 && x<maxRecord){
					for(var i=t.length;i>x;i--) t[i]=t[i-1];
					while(t.length>maxRecord) t.pop();
					t[x]={'name':newData.id,'value':newData.php}; //
					fs.writeFile(files[1],JSON.stringify(t),function(err){if(err)console.log("?"+err);console.log("write done",files[1]);});
				}
			}
		}
		cnt--; if(cnt==0) resp.end();
	});
}

function parsePath(urlReqPath){
	var rtv=urlReqPath.replace('\\','/');
	do{
		var pre=rtv;
		rtv=rtv.replace(/[^/]+\/\.\.\//,'');
		while(rtv.indexOf('../')==0) rtv=rtv.slice(3);
		if(pre==rtv && rtv.indexOf('/../')!=-1){ return rtv.replace('/../','/./'); }
	}while(rtv.indexOf('/../')!=-1);
	return rtv;
}

function hello() {
	http.createServer(function (req, resp) {
		var urlPath=url.parse(req['url']).pathname;
		var path=dir+parsePath(urlPath);
		var query=url.parse(req['url']).query;
		var queryd=url.parse(req['url'],1).query;
		var body="";
		const testData_time=[
			{'name':'tn11','value':'tv11'},
			{'name':'tn22','value':'tv22'},
			{'name':'tn33','value':'tv33'},
			{'name':'tn44','value':'tv44'},
		];
		const testData_php=[
			{'name':'pn11','value':'pv11'},
			{'name':'pn22','value':'pv22'},
			{'name':'pn33','value':'pv33'},
			{'name':'pn44','value':'pv44'},
		];
		console.log('');
		console.log('req recv');
		console.log('url: '+req['url']);
		console.log('url-path: '+urlPath);
		console.log('parsed path: '+path);
		req.on('data',function(data){body+=data;if(body.length > 1e6)req.connection.destroy();});
		req.on('end',function(){
			const commonHead={'Content-Type': 'text/plain','Access-Control-Allow-Origin':"*"};
			console.log(".query:",query);
			if(typeof query!="string") query="";
			switch(query.slice(0,6)){
			case 'debug':
				resp.writeHead(200, commonHead);
				resp.write(JSON.stringify({'time':testData_time,'php':testData_php}));
				resp.end();
				break;
			case 'getAll':
				resp.writeHead(200, commonHead);
				{
					var cnt=files.length;
					resp.write("{");
					for(var x=0;x<files.length;x++){
						(function(it){
							fs.readFile(files[it], 'utf8', function(err,data){
								if(!err) resp.write('"'+kinds[it]+'":'+data.replace(/^\uFEFF/, ''));
								cnt--; if(cnt==0){ resp.write('}'); resp.end(); }else resp.write(',');
							});
						})(x);
					}
				}
				break;
			case 'submit':
				resp.writeHead(200, commonHead);
				{
					var j;
					for(var i in url.parse("/?"+query.slice(6),1).query){
						j=JSON.parse(i);
						break;
					}
					if(j!=undefined && j.time!=undefined && j.php!=undefined){
						if(j.id==undefined) j.id=Math.random().toString();
						// for(var i in j) console.log(i,j[i]);
						writeRank(j,resp);
					}else resp.end();
					// console.log(j);
				}
				break;
			default:
				resp.writeHead(404, commonHead);
				resp.end();
				break;
			}
		});
	}).listen(port, host);
	console.log('server start');
}

exports.hello = hello;

hello();
