/*jshint node:true */
/*global io:true, console:true */
'use strict';
var React = require('react');
console.log('hello');

var socket = io.connect('http://localhost:8000');

socket.on('newConnection', function (data) {
  console.log('NEW CONNECTION', data);
});