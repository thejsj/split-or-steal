/*jshint node:true */
'use strict';

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(server);

var auth = require('./auth');
var authRouter = require('./auth/authRouter');

server.listen(8000);

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
  .use('/auth', authRouter)
  .use(express.static(cliendDirPath))
  .use('/', function (req, res) {
    if (req.user) {
      res.sendFile(path.join(cliendDirPath , '/game.html'));
      return;
    }
    res.sendFile(path.join(cliendDirPath, '/landing.html'));
  });

// io.on('connection', function (socket) {

// });