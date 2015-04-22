var React = require('react/addons');
var Router = require('react-router');
var RetinaImage = require('react-retina-image');
var Header = require('./Header.react');
var metrics = require('../utils/MetricsUtil');
var util = require('../utils/Util');

var Connect = React.createClass({
  mixins: [ Router.Navigation ],
  getInitialState: function () {
    return {
      page: 'signup'
    };
  },
  componentDidMount: function () {
    this.refs.usernameInput.getDOMNode().focus();
  },
  componentDidUpdate: function () {
    this.refs.usernameInput.getDOMNode().focus();
  },
  handleSkip: function () {
    metrics.track('Skipped Connect to Hub', {
      from: 'app'
    });
    this.context.router.transitionTo('containers');
  },
  handleGoToLogin: function () {
    metrics.track('Clicked Go to Login', {
      from: 'app'
    });
    this.setState({page: 'login'});
  },
  handleGoToSignUp: function () {
    metrics.track('Clicked Go to Sign Up', {
      from: 'app'
    });
    this.setState({page: 'signup'});
  },
  handleForgotPassword: function () {
    metrics.track('Opened Forgot Password', {
      from: 'app'
    });
    util.exec(['open', 'https://hub.docker.com/account/forgot-password/']);
  },
  handleSubmitSignUpForm: function (e) {
    e.preventDefault();
    console.log('SUBMITTED');
  },
  render: function () {
    var userForm;
    if (this.state.page === 'signup') {
      userForm = (
        <form className="form-signup" method="post" onSubmit={this.handleSubmitSignUpForm}>
          <input ref="usernameInput" maxlength="30" name="username" placeholder="Username" type="text"/>
          <input name="email" placeholder="E-mail" type="text"/>
          <input name="password" placeholder="Password" type="password"/>
          <button className="btn btn-action" type="submit">Sign Up</button>
          <span className="extra">Already have an account? <a className="btn btn-action" onClick={this.handleGoToLogin}>Login</a></span>
        </form>
      );
    } else {
      userForm = (
        <form className="form-login" method="post">
          <input ref="usernameInput" name="username" placeholder="Username" type="text"/>
          <input name="password" placeholder="Password" type="password"/>
          <a className="link" onClick={this.handleForgotPassword}>Forgot your password?</a>
          <button className="btn btn-action" type="submit">Login</button>
          <span className="extra">Don&#39;t have an account yet? <a className="btn btn-action" onClick={this.handleGoToSignUp}>Sign Up</a></span>
        </form>
      );
    }
    return (
      <div className="setup">
        <Header />
        <div className="form-section">
          <RetinaImage src={'connect-to-hub.png'} checkIfRetinaImgExists={false}/>
          {{ userForm }}
        </div>
        <div className="desc">
          <div className="content">
            <h4>Step 5 out of 5</h4>
            <h1>Connect to Docker Hub</h1>
            <p>Sign up or login to the Docker Hub to create your own or your team’s private containers.</p>
            <a className="btn btn-action btn-skip" onClick={this.handleSkip}>Skip</a>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Connect;
