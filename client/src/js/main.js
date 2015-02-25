/*jshint node:true */
/*global io:true, console:true, $:true */
'use strict';
var React = require('react');
var _ = require('lodash');
var MainView = require('./views/main-view');

(function () {

  var game = {
    socket: io.connect('http://' + window.config.url + ':' + window.config.ports.http),
    connectedUsers: [],
    thisUser: {},
    winner: null
  };
  window.game = game;

  var render = function (game) {
    console.log('render');
    React.render(
      <MainView
        users={ game.connectedUsers }
        thisUser={ game.thisUser }
        socket={ game.socket }
        roundId={ game.roundId }
      />,
      document.getElementById('container')
    );
  };
  // Render for the first time
  render(game);

  // Publish user connection
  $.get('http://' + window.config.url + ':' + window.config.ports.http + '/auth/user')
    .then(function (_user) {
      game.thisUser = _user;
      render(game);
      game.socket.emit('connctedUser', game.thisUser);
    });

  // Listen to new Users
  game.socket.on('userUpdate', function (_connectedUsers) {
    game.connectedUsers = _connectedUsers;
    render(game);
  });

  // Listen to Game Start
  game.socket.on('gameStart', function () {});

  // Listen to New Round
  game.socket.on('newRound', function (_roundId) {
    game.roundId = _roundId;
    render(game)
  });

  // Listen to Game Winner
  game.socket.on('gameWinner', function (userID) {
    game.winner = _.findWhere(game.connectedUsers, { id: userID });
    alert(game.winner.login + ' is the winner');
    game.location.reload();
  });

}());

