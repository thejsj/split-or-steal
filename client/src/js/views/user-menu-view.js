/*jshint node:true */
/*global io:true, console:true, $:true */
'use strict';
var React = require('react');

var UserMenuView = React.createClass({
  endGame: function () {
    console.log('End Game');
    this.props.socket.emit('endGame');
  },
  render: function () {
    if (!this.props.thisUser) return (null);
    return (
        <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
          <ul className="nav navbar-nav navbar-right">
            <li className="dropdown">
              <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">
                {this.props.thisUser.login} <span className="caret"></span>
              </a>
              <ul className="dropdown-menu" role="menu">
                <li><a href="#" onClick={ this.endGame }>End Game</a></li>
                <li><a href="/auth/logout">Logout</a></li>
              </ul>
            </li>
          </ul>
        </div>
    );
  }
});

module.exports = UserMenuView;