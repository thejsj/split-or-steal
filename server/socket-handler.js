/*jshint node:true */
'use strict';

var allClients = [];

var socketHandler = function (io, socket) {
  console.log('New Connection');
  console.log(' ** Connected ** ');
  console.log(io.sockets.connected);

  socket.userId = req.

  allClients.push(socket);

  setTimeout(function () {
    io.sockets.emit('newConnection', { 'userId': Math.random() });
  });

  socket.on('disconnect', function() {
    console.log('Got disconnect!');
    var i = allClients.indexOf(socket);
    delete allClients[i];
   });
};

module.exports = socketHandler;