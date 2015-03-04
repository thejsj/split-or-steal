/*jshint node:true */
/*global io:true, console:true, $:true */
'use strict';
var React = require('react');
var UserMenuView = require('./user-menu-view');

var HeaderView = React.createClass({
  render: function () {
    return (
      <nav className="navbar navbar-default">
        <div className="container-fluid">
          <div className="navbar-header">
            <a className="navbar-brand" href="#">Split Or Steal</a>
          </div>
          <UserMenuView thisUser={ this.props.thisUser } socket={ this.props.socket} />
        </div>
      </nav>
    );
  }
});

module.exports = HeaderView;