/*jshint node:true */
/*global io:true, console:true, $:true */
'use strict';
var React = require('react');
require('react/addons');
var _ = require('lodash');

var UserSingleView = React.createClass({
  getInitialState: function() {
    return {
      betAmount: 100,
    };
  },
  updateBet: function (event) {
    this.setState({ betAmount: event.target.value });
  },
  lockBet: function () {
    window.socket.emit('placeBet', {
      userId: window.user.userId,
      betAmount: this.state.betAmount,
    });
  },
  render: function() {
    var cx = React.addons.classSet;
    var classes = cx({
      'locked': (this.props.user.bet !== undefined),
      'col-md-2': true,
      'user': true
    });
    var betBox = null;
    if (this.props.user.login === window.user.login) {
      betBox =
        <div className='bet-box '>
          <input type='number' onChange={ this.updateBet } value={ this.state.betAmount } />
          <button className='lock' onClick={ this.lockBet }>Lock Bet</button>
        </div>;
    }
    return (
      <div className={ classes }>
        <div className='lock-container'>
          <i className="fa fa-lock"></i>
        </div>
        <div className='content'>
          <img src={ this.props.user.avatarUrl } />
          { betBox }
          <h6 className='login-name'>{ this.props.user.login }</h6>
          <div className='score-box'>
            <h6 className='score'>1000</h6>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = UserSingleView;