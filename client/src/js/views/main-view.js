/*jshint node:true */
/*global io:true, console:true, $:true */
'use strict';
var React = require('react');
var HeaderView = require('./header-view');
var UserView = require('./user-view');

var MainView = React.createClass({
  render: function () {
    return (
      <div className='container main-view-container'>
        <HeaderView user={ this.props.user }/>
        <UserView users={ this.props.users }/>
      </div>
    );
  }
});

module.exports = MainView;