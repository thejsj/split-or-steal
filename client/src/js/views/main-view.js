/*jshint node:true */
/*global io:true, console:true, $:true */
'use strict';
var React = require('react');
var UserView = require('./user-view');

var MainView = React.createClass({
  render: function () {
    return (
      <div>
        <UserView users={ this.props.users }/>
      </div>
    );
  }
});

module.exports = MainView;