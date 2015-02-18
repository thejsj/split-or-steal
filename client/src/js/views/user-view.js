/*jshint node:true */
/*global io:true, console:true, $:true */
'use strict';
var React = require('react');
var _ = require('lodash');

var UserView = React.createClass({
  render: function() {
    var users = this.props.users;
    return (
      <div className='user-collection-container'>
        { _.map(users, function(item, i) {
          return (
            <div className='user'>
              <p>Login { item.login }</p>
            </div>
          );
        }, this)}
      </div>
    );
  }
});

module.exports = UserView;