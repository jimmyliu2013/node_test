var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');

var BASE_URL = "http://10.0.2.2:3000";

app.set('port', process.env.PORT || 3000);

app.use(require('body-parser')());

var mongoose = require('mongoose');

//add connection here



var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("db open!");
});

var formidable = require('formidable');

var Item = require('./models/item.js');



app.get('/done',function(req,res){
	res.type('text/plain');
	res.send('Done!');
});

app.get('/error',function(req,res){
	res.type('text/plain');
	res.send('Error!');
});

app.get('/upload',function(req,res){
	res.sendFile(path.join(__dirname + "/html/forms.html"));
});


function saveToDatabase(res, upload_title, upload_description, files) {
	Item.find({})
	.sort({id:-1})
	.limit(1)
	.exec(function(err, items){
		if(err) {
			return -1;
		}
		var new_id = items[0].id + 1
		console.log("largest id: " + new_id)
		new Item({
			id: new_id,
			title: upload_title,
			description: upload_description,
			iconSrc: BASE_URL + "/icon/" + new_id.jpg,
			contentSrc: BASE_URL + "/html/" + new_id.html,
			soundSrc: BASE_URL + "/sound/" + new_id.mp3,
		}).save();

		var icon = files.icon;
		var dir1 = path.join(__dirname + "/icon");
		fs.renameSync(icon.path, dir1 + '/' + new_id + ".jpg");

		var content = files.content;
		var dir2 = path.join(__dirname + "/html");
		fs.renameSync(content.path, dir2 + '/' + new_id + ".html");

		var sound = files.sound;
		var dir3 = path.join(__dirname + "/sound");
		fs.renameSync(sound.path, dir3 + '/' + new_id + ".mp3");

		res.redirect(303, '/done');

	});
}


app.post('/upload', function(req, res){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		if(err) return res.redirect(303, '/error');
		console.log('received title:');
		console.log(fields.title);
		console.log('received files:');
		console.log(files.icon.path);

        saveToDatabase(res, fields.title, fields.description, files)
    });
});


app.get('/api/item/:skip/:count', function(req,res){

	console.log("get request here" + req.params.skip + "  " + req.params.count)

	Item.find({})
	.sort({id:1})
	.skip(Number(req.params.skip))
	.limit(Number(req.params.count))
	.exec(function(err, items){
		if(err) {
			console.log("error: " + err)
			return res.send(500, 'Error occurred: database error.');
		}
		
		res.json(items.map(function(a){
			return {
				id: a.id,
				title: a.title,
				description: a.description,
				iconSrc: a.iconSrc,
				contentSrc: a.contentSrc,
				soundSrc: a.soundSrc,
			}
		}));

	});
});


app.get('/html/:name', function(req, res) {
	console.log(req.params.name)
	console.log(__dirname)
	res.sendFile(path.join(__dirname + "/html/" + req.params.name));
});

app.get('/sound/:name', function(req, res) {
	console.log(req.params.name)
	console.log(__dirname)
	res.sendFile(path.join(__dirname + "/sound/" + req.params.name));
});

app.get('/icon/:name', function(req, res) {
	console.log(req.params.name)
	console.log(__dirname)
	res.sendFile(path.join(__dirname + "/icon/" + req.params.name));
});


app.get('/', function(req, res){
	res.type('text/plain');
	res.send('Hello World');
});


app.use(function(req, res){
	res.type('text/plain');
	res.status(404);
	res.send('404 - Not Found');
});

app.use(function(err, req, res, next){
	console.error(err.stack);
	res.type('text/plain');
	res.status(500);
	res.send('500 - Server Error');
});


app.listen(app.get('port'), function(){
	console.log( 'Express started on http://localhost:' +
		app.get('port') + '; press Ctrl-C to terminate.' );
});
