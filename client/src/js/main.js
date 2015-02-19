/*jshint node:true */
/*global io:true, console:true, $:true */
'use strict';
var React = require('react');
var MainView = require('./views/main-view');

window.socket = io.connect('http://127.0.0.1:8000');

var render = function () {
  React.render(
    <MainView users={ connectedUsers } user={ user }/>,
    document.getElementById('container')
  );
};

// Publish user connection
$.get('http://127.0.0.1:8000/auth/user')
  .then(function (_user) {
    window.user = _user;
    console.log('conntedUser!');
    socket.emit('connectUser', user);
  });

// Listen to new Users
window.socket.on('userUpdate', function (_connectedUsers) {
  window.connectedUsers = _connectedUsers;
  console.log('userUpdate', connectedUsers);
  render(connectedUsers, user, socket);
});

// Listen to Game Start
window.socket.on('gameStart', function () {

});

// Listen to New Round
window.socket.on('newRound', function (_roundId) {
  console.log('newRound');
  window.roundId = _roundId;
});
