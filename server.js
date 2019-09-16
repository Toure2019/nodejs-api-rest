// Imports
var express = require('express');
var bodyParser = require('body-parser');
var apiRouter = require('./apiRouter').router;

// Instantiate server
var server = express();

// BodyParser Configuration
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

// Configure routes
server.get('/', function(req, res) {
    res.setHeader('Content-Content', 'text/html');
    res.status(200).send('<h1>Bonjour sur mon super Serveur !</h1>');
});

server.use('/api/', apiRouter);

server.listen(8080, function(){
    console.log('Serveur en écoute sur le port 8080');
})

// Launch server
