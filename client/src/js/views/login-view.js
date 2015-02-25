/*jshint node:true */
/*global io:true, console:true, $:true */
'use strict';
var React = require('react');

var LoginView = React.createClass({
  render: function () {
    return (
      <div className='container'>
        <a id='login-button' href='/auth/login'>Login</a>
        <div id='container'></div>
      </div>
    );
  }
});

module.exports = LoginView;