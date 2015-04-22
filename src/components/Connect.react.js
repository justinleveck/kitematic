var React = require('react/addons');
var Router = require('react-router');
var RetinaImage = require('react-retina-image');
var Header = require('./Header.react');
var metrics = require('./Metrics');

var Connect = React.createClass({
  mixins: [ Router.Navigation ],
  handleSkip: function () {
    metrics.track('Skipped Connect to Hub', {
      from: 'app'
    });
    this.context.router.transitionTo('containers');
  },
  renderStep: function () {
    return (
      <div className="setup">
        <Header />
        <div className="form-section">
          <RetinaImage src={'connect-to-hub.png'} checkIfRetinaImgExists={false}/>
          <form className="hub-signup-form" method="post">
            <input maxlength="30" name="username" placeholder="Username" type="text"/>
            <input name="email" placeholder="E-mail" type="text"/>
            <input name="password" placeholder="Password" type="password"/>
            <button className="btn btn-action" type="submit">Sign Up</button>
          </form>
        </div>
        <div className="desc">
          <div className="content">
            <h4>Step 5 out of 5</h4>
            <h1>Connect to Docker Hub</h1>
            <p>Sign up or login to the Docker Hub to create your own or your team’s private containers.</p>
            <a className="btn btn-action" onClick={this.handleSkip}>Skip</a>
          </div>
        </div>
      </div>
    );
  },
  render: function () {
    return this.renderStep();
  }
});

module.exports = Connect;
