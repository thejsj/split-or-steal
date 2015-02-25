/*jshint node:true */
'use strict';

var config = require('config');
console.log(config);
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(server);

var auth = require('./auth');
var authRouter = require('./auth/authRouter');
var socketHandler = require('./socket-handler');
var clientConfigParser = require('./client-config-parser');

server.listen(config.get('ports').http);

// Middleware
app
  .use(bodyParser.urlencoded({
    extended: true
  }))
  .use(bodyParser.json())
  .use(session({
    secret: 'zfnzkwjehgweghw',
    resave: false,
    saveUninitialized: true
  }))
  .use(auth.initialize())
  .use(auth.session());

// Static Dirname
var cliendDirPath = __dirname + '/../client';
app
  .use('/config.js', clientConfigParser)
  .use('/auth', authRouter)
  .use(express.static(cliendDirPath))
  .use('*', function (req, res) {
    res.status(404).send('404 Not Found').end();
  });

io.on('connection', socketHandler.bind(null, io));