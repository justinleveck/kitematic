var $ = require('jquery');
var React = require('react/addons');
var Router = require('react-router');
var RetinaImage = require('react-retina-image');
var Header = require('./Header.react');
var metrics = require('../utils/MetricsUtil');
var util = require('../utils/Util');
var validate = require('../utils/ValidationUtil');

var showFormErrors = function ($form, errors) {
  for (var name in errors) {
    if (errors.hasOwnProperty(name)) {
      var fieldError = errors[name][0];
      var queryName = 'input[name="' + name + '"]';
      var $field = $form.find(queryName);
      $field.addClass('error');
      var $errMsg = $field.next();
      $errMsg.html(fieldError);
      $errMsg.show();
    }
  }
};

var clearFormErrors = function ($form) {
  $form.find('input').removeClass('error');
  $form.find('.error-message').hide();
};

var validateSignUpForm = function ($form) {
  var errors = {};
  var usernameErrors = [];
  var emailErrors = [];
  var passwordErrors = [];
  var username = $form.find('input[name="username"]').val().trim();
  var email = $form.find('input[name="email"]').val().trim();
  var password = $form.find('input[name="password"]').val();
  if (validate.isBlank(username)) {
    usernameErrors.push('Username cannot be blank.');
  } else {
    if (username.length < 4) {
      usernameErrors.push('Username must be more than 3 characters.');
    }
    if (username.length > 30) {
      usernameErrors.push('Username must be less than 30 characters.');
    }
    if (!validate.isValidUsername(username)) {
      usernameErrors.push('Username must be lowercase letters and numbers.');
    }
  }
  if (validate.isBlank(email)) {
    emailErrors.push('E-mail address cannot be blank.');
  } else {
    if (!validate.isValidEmail(email)) {
      emailErrors.push('Please enter a valid e-mail address.');
    }
  }
  if (validate.isBlank(password)) {
    passwordErrors.push('Password cannot be blank.');
  } else {
    if (password.length < 5) {
      passwordErrors.push('For your security, your password has to be more than 5 characters.');
    }
  }
  if (usernameErrors.length > 0) {
    errors.username = usernameErrors;
  }
  if (emailErrors.length > 0) {
    errors.email = emailErrors;
  }
  if (passwordErrors.length > 0) {
    errors.password = passwordErrors;
  }
  return errors;
};

var validateLoginForm = function ($form) {
  var errors = {};
  var usernameErrors = [];
  var passwordErrors = [];
  var username = $form.find('input[name="username"]').val().trim();
  var password = $form.find('input[name="password"]').val();
  if (validate.isBlank(username)) {
    usernameErrors.push('Username cannot be blank.');
  }
  if (validate.isBlank(password)) {
    passwordErrors.push('Password cannot be blank.');
  }
  if (usernameErrors.length > 0) {
    errors.username = usernameErrors;
  }
  if (passwordErrors.length > 0) {
    errors.password = passwordErrors;
  }
  return errors;
};

var Connect = React.createClass({
  mixins: [ Router.Navigation ],
  getInitialState: function () {
    return {
      page: 'signup'
    };
  },
  componentDidMount: function () {
    this.refs.usernameInput.getDOMNode().focus();
    $(document.body).on('keydown', this.handleKeyDown);
  },
  componentDidUpdate: function () {
    this.refs.usernameInput.getDOMNode().focus();
  },
  componentWillUnMount: function() {
    $(document.body).off('keydown', this.handleKeyDown);
  },
  handleSkip: function () {
    metrics.track('Skipped Connect to Hub', {
      from: 'app',
      action: 'click'
    });
    this.context.router.transitionTo('containers');
  },
  handleGoToLogin: function () {
    var $form = $('.form-connect');
    clearFormErrors($form);
    $form.find('input[name="password"]').val('');
    $form.find('input[name="email"]').val('');
    metrics.track('Clicked Go to Login', {
      from: 'app'
    });
    this.setState({page: 'login'});
  },
  handleGoToSignUp: function () {
    var $form = $('.form-connect');
    clearFormErrors($form);
    $form.find('input[name="password"]').val('');
    $form.find('input[name="email"]').val('');
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
    var $form = $('.form-connect');
    var data = $form.serialize();
    data += '&subscribe=on';
    clearFormErrors($form);
    var formErrors = validateSignUpForm($form);
    if ($.isEmptyObject(formErrors)) {
      $.ajax({
        data: data,
        type: 'POST',
        url: 'https://hub.dev.docker.com/v2/users/easy_signup/',
        success: function (response) {
          console.log(response);
        },
        error: function (response) {
          var errors = response.responseJSON;
          console.log(errors);
          showFormErrors($form, errors);
        }
      });
    } else {
      showFormErrors($form, formErrors);
    }
  },
  handleSubmitLoginForm: function (e) {
    e.preventDefault();
    var $form = $('.form-connect');
    var data = $form.serialize();
    clearFormErrors($form);
    var formErrors = validateLoginForm($form);
    if ($.isEmptyObject(formErrors)) {
      $.ajax({
        data: data,
        type: 'POST',
        url: 'https://hub.dev.docker.com/v2/users/login/',
        success: function (response) {
          console.log(response);
        },
        error: function (response) {
          var errors = response.responseJSON;
          console.log(errors);
          showFormErrors($form, errors);
        }
      });
    } else {
      showFormErrors($form, formErrors);
    }
  },
  handleKeyDown: function(e) {
    var ESC = 27;
    if (e.keyCode === ESC) {
      metrics.track('Skipped Connect to Hub', {
        from: 'app',
        action: 'esc'
      });
      this.context.router.transitionTo('containers');
    }
  },
  render: function () {
    var userForm;
    if (this.state.page === 'signup') {
      userForm = (
        <form className="form-connect" method="post" onSubmit={this.handleSubmitSignUpForm}>
          <input ref="usernameInput" maxLength="30" name="username" placeholder="Username" type="text"/>
          <p className="error-message">Error message.</p>
          <input ref="emailInput" name="email" placeholder="E-mail" type="text"/>
          <p className="error-message">Error message.</p>
          <input ref="passwordInput" name="password" placeholder="Password" type="password"/>
          <p className="error-message">Error message.</p>
          <button className="btn btn-action" type="submit">Sign Up</button>
          <span className="extra">Already have an account? <a className="btn btn-action" onClick={this.handleGoToLogin}>Login</a></span>
        </form>
      );
    } else {
      userForm = (
        <form className="form-connect" method="post" onSubmit={this.handleSubmitLoginForm}>
          <input ref="usernameInput" name="username" placeholder="Username" type="text"/>
          <p className="error-message">Error message.</p>
          <input ref="passwordInput" name="password" placeholder="Password" type="password"/>
          <p className="error-message">Error message.</p>
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
            <a className="btn-skip" onClick={this.handleSkip}>Skip</a>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Connect;
