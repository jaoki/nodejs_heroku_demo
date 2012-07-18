
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

app.get('/mytemplate/:p', function(req, res){
	var content = {
		title : "this is used in layout.ejs",
		param1: req.params.p, // passing a part of URI path
		param2: "hard coded",
	}
	res.render('mytemplate', content);
});


app.get('/jsonapi', function(req, res){
	var json ={
		name : "obama",
		job : "president",
	}
	res.send(json);
});

app.get('/jsonapi2', function(req, res){
	var json ={
		name : "obama",
		job : "president",
		salary: req.query['salary']==undefined?"unknown":req.query['salary'],
	}
	// res.send(JSON.stringify(json));
	res.send(json); // This sends w/ Content-Type: application/json
});


app.get('/add/:value', function(req, res){
	req.session.value = req.params.value;
	res.send("value:" + req.params.value);
});

app.get('/get', function(req, res){
	res.send("session.value is " + req.session.value);
});

var MysqlClient = require('mysql').Client;

app.get('/db_select/:id', function(req, res){

	var client = new MysqlClient();
	// Replace with your settings from 'heroku config'  command
	client.host = "us-cdbr-east.cleardb.com";
	client.database = "heroku_55b055f11ca67ed";
	client.user = "b2bf9c3b339180";
	client.password = "e2ef5665";

	client.query( 'SELECT * FROM table1 WHERE id = ?', [req.params.id],
		function(err, results, fields) {
			client.end();
			if (err) {
				throw err;
			}

			var content = "";
			content += "length: " + results.length + "<br/>"
			for(var i = 0; i < results.length; i++){
				content += "name : " + results[i].name + "<br/>"
				content += "age : " + results[i].age + "<br/>"
			}
			res.send(content);
		}
	);
});

app.get('/db_insert', function(req, res){

	var id = req.query['id'];
	var name = req.query['name'];
	var age = req.query['age'];

	var client = new MysqlClient();
	// Replace with your settings from 'heroku config'  command
	client.host = "us-cdbr-east.cleardb.com";
	client.database = "heroku_55b055f11ca67ed";
	client.user = "b2bf9c3b339180";
	client.password = "e2ef5665";

	client.query( 'INSERT INTO table1 VALUES (?, ?, ?)', [id, name, age],
		function(err, results, fields) {
			if (err) {
				client.end();
				throw err;
			}
			client.end();

			res.send("added (" + id + "," + name + "," + age + ")" );
		}
	);
});


var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
