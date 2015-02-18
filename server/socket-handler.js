/*jshint node:true */
'use strict';
var _ = require('lodash');

var connectedUsers = {};

var socketHandler = function (io, socket) {

  socket.on('connectUser', function (user) {
    if (connectedUsers[user.userId] === undefined) {
      connectedUsers[user.userId] = user;
      connectedUsers[user.userId].socketId = socket.id;
      socket.emit('userUpdate', connectedUsers);
    }
  });

  socket.on('disconnect', function() {
    connectedUsers = _.filter(connectedUsers, function (user) {
      return user.socketId !== socket.id;
    });
    socket.emit('userUpdate', connectedUsers);
   });
};

module.exports = socketHandler;