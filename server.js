var path = require('path');
var express = require('express');
var exhbs = require('express-handlebars');
var bodyParser = require('body-parser');
//var postData = require('./postData');
var MongoClient = require('mongodb').MongoClient;

var app = express();
var port = process.env.PORT || 5000;

// var mongoHost = "classmongo.engr.oregonstate.edu";
// var mongoPort = process.env.MONGO_PORT || 27017;
// var mongoUser="cs290_chenyuha";
// var mongoPassword="cs290_chenyuha";
// var mongoDBName="cs290_chenyuha";

// MongoDB Stuff //
var MongoClient = require('mongodb').MongoClient;
var mongoURL = 'mongodb://localhost:27017/test'; // For sake of time and other finals, we decided to stick with localhost using local user.
var mongoConnection = null;

// var mongoURL = 'mongodb://' + mongoUser + ':' + mongoPassword + '@' + mongoHost + ':' + mongoPort + '/' + mongoDBName;

var mongoConnection = null;

app.engine('handlebars', exhbs({
	defaultLayout: 'main'
}));
app.use(bodyParser.json());

app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
	console.log("== Root page called.")
	var postdatacollection = mongoConnection.collection('postData');
	postdatacollection.find({}).toArray(function (err, results) {
		res.status(200).render('homePage', {
			post: results
		});
	});
});

app.post('/addPost', function (req, res, next) {
	if (req.body) {
		var postdatacollection = mongoConnection.collection('postData');
		var postobj = {
			userName: req.body.userName,
			NumDislikes: req.body.NumDislikes,
			postTitle: req.body.postTitle,
			postContent: req.body.postContent,
			comments: []
		};
		postdatacollection.insertOne(postobj, function (err, result) {
			if (err) {
				res.status(500).send("Error fetching people from DB");
			} else {
				res.status(200).send("Success");
			}
		});

	} else {
		res.status(400).send("Request body needs required field.");
	}
});

app.post('/addcomment', function (req, res, next) {
	if (req.body) {
		var text = req.body.text;
		var postdatacollection = mongoConnection.collection('postData');
		var postobj = {
			commentUsername: req.body.commentUsername,
			commentContent: req.body.commentContent
		};
		postdatacollection.updateOne({
			postTitle: text
		}, {
			$push: {
				comments: postobj
			}
		}, function (err, result) {
			if (err) {
				res.status(500).send("Error fetching people from DB");
			} else {
				res.status(200).send("Success");
			}
		});

	} else {
		res.status(400).send("Request body needs required field.");
	}
});

app.use(express.static('public'));

app.get('*', function (req, res) {

	console.log("== 404 page called.")

	res.status(404).render('404Page');
});

MongoClient.connect(mongoURL, function (err, connection) {
	if (err) {
		throw err;
	}
	mongoConnection = connection;
	app.listen(port, function () {
		console.log("== Server listening on port:", port);
	});
});