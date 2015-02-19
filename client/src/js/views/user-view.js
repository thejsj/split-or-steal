/*jshint node:true */
/*global io:true, console:true, $:true */
'use strict';
var React = require('react');
var _ = require('lodash');
var UserSingleView = require('./user-single-view');

var UserView = React.createClass({
  render: function() {
    return (
      <div className='user-collection-container'>
        { _.map(this.props.users, function(user, i) {
          return <UserSingleView key={ user.id } user={ user } />;
        }, this) }
      </div>
    );
  }
});

module.exports = UserView;