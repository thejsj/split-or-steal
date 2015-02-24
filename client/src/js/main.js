/*jshint node:true */
/*global io:true, console:true, $:true */
'use strict';
var React = require('react');
var _ = require('lodash');
var MainView = require('./views/main-view');

window.socket = io.connect('http://' + window.config.url + ':' + window.config.ports.http);

var render = function () {
  React.render(
    <MainView users={ connectedUsers } user={ user }/>,
    document.getElementById('container')
  );
};
window.render = render;

// Publish user connection
$.get('http://' + window.config.url + ':' + window.config.ports.http + '/auth/user')
  .then(function (_user) {
    window.user = _user;
    socket.emit('connctedUser', user);
  });

// Listen to new Users
window.socket.on('userUpdate', function (_connectedUsers) {
  window.connectedUsers = _connectedUsers;
  render(connectedUsers, user, socket);
});

// Listen to Game Start
window.socket.on('gameStart', function () {

});

// Listen to New Round
window.socket.on('newRound', function (_roundId) {
  window.roundId = _roundId;
});


// Listen to New Round
window.socket.on('gameWinner', function (userID) {
  window.winner = _.findWhere(window.connectedUsers, { id: userID });
  alert(window.winner.login + ' is the winner');
  window.location.reload();
});
