/*jshint node:true */
/*global io:true, console:true, $:true */
'use strict';
var React = require('react');
var MainView = require('./views/main-view');

var socket = io.connect('http://localhost:8000');
var user;

var render = function (users, socket) {
  React.render(
    <MainView users={ users } socket={ socket }/>,
    document.getElementById('container')
  );
};

// Publish user connection
$.get('http://localhost:8000/auth/user')
  .then(function (res) {
    user = res;
    socket.emit('connectUser', user);
  });

// Listen
socket.on('userUpdate', function (connectedUsers) {
  console.log('userUpdate', connectedUsers);
  render(connectedUsers, socket);
});