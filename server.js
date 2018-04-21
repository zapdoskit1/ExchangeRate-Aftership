http = require('http');

var express = require('express');
var app = express();
var APIKEY = "b1e7d1fe73ca4ff7b25a6995a05c71d7";  // signup at openexchangerates.org and obtain an API Key

var options = {
    host: 'openexchangerates.org',
    port: 80,
    path: '/api/',
    method: 'GET'
};

app.set('view engine', 'ejs');
//index
app.get('/', function(req,res) {
	res.render('index');
});
//latest
app.get('/latest', function(req,res){
	res.render('latest');
});
app.get('/latestResult', function(req,res){
	var base = req.query.base;
	var	symbols = req.query.symbols;
	base = base.toUpperCase();
	symbols = symbols.toUpperCase();
	console.log("Base: "+base)
	console.log("Symbols: "+symbols)
	options.path = "/api/latest.json?app_id="+APIKEY+"&base="+base+"&symbols="+symbols;
	if(base.toUpperCase()=="USD"){
		getResult(function(result){ 
			console.log(result);
			var ratesJsonObjVal = result.rates[symbols];
			console.log(ratesJsonObjVal);
			if(ratesJsonObjVal==undefined){
					res.status(400).send('Please enter existing 3-digit ISO code<br /><a href="/latest">Back</a>')
			}else{
				res.render('latestResult',{result,symbols:symbols,ratesJsonObjVal:ratesJsonObjVal})
			}
		}); 
	}else{
		res.status(403).send('Sorry! Please use USD for base.<br /><a href="/latest">Back</a>');
	}
});

//historical
app.get('/historical', function(req,res){
	res.render('historical');
});
app.get('/historicalResult', function(req,res){
	var historical = req.query.historical;
	var base = req.query.base;
	var	symbols = req.query.symbols;
	base = base.toUpperCase();
	symbols = symbols.toUpperCase();
	console.log("Historical: "+historical)
	console.log("Base: "+base)
	console.log("Symbols: "+symbols)
	options.path = "/api/historical/"+historical+".json?app_id="+APIKEY+"&base="+base+"&symbols="+symbols;
	if(base.toUpperCase()=="USD"){
		getResult(function(result){ 
			console.log(result);
			if(result.status==400){
				res.status(400).send('Invalid date<br /><a href="/historical">Back</a>')
			}else{
				var	ratesJsonObjVal = result.rates[symbols];
				console.log(ratesJsonObjVal);
				if(ratesJsonObjVal==undefined){
					res.status(400).send('Please enter existing 3-digit ISO code<br /><a href="/historical">Back</a>')
				}else{
					res.render('historicalResult',{result,symbols:symbols,ratesJsonObjVal:ratesJsonObjVal,historical:historical})
				}
			}
		}); 
	}else{
		res.status(403).send('Sorry! Please use USD for base.<br /><a href="/historical">Back</a>');
	}
});

function getResult(callback) {
	var base = "";
	var rates = "";
	var status = ""
	var wreq = http.request(options, function(wres,res) {
   		wres.setEncoding('utf8');

   		wres.on('data', function (chunk) {
   			var jsonObj = JSON.parse(chunk);
			console.log("JsonObj: "+JSON.stringify(jsonObj));
			base = jsonObj.base;		         
			rates = jsonObj.rates;
			status = jsonObj.status;
   		});

   		wres.on('error',function(e) {
   			console.log('Problem with request: ' + e.message);
   		});

		wres.on('end',function(chunk) {
			callback({base:base,rates:rates,status:status});
		});
   	}); //http.request
	
	wreq.end();
}
app.listen(process.env.PORT || 8099);
