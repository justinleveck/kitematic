import React from 'react';
import Router from 'react-router';
import containerStore from '../stores/ContainerStore';
import ContainerList from './ContainerList.react';
import Header from './Header.react';
import ipc from 'ipc';
import remote from 'remote';
import metrics from '../utils/MetricsUtil';
import RetinaImage from 'react-retina-image';
import machine from '../utils/DockerMachineUtil';
import shell from 'shell';
import classNames from 'classnames';

export default React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState () {
    return containerStore.getState();
  },

  componentDidMount () {
    containerStore.listen(this.onChange);

    ipc.on('application:update-available', () => {
      this.setState({
        updateAvailable: true
      });
    });
    remote.require('auto-updater').checkForUpdates();
  },

  componentWillUnmount() {
    containerStore.unlisten(this.onChange);
  },

  onChange () {
    this.setState(containerStore.getState());
  },

  updateError: function (err) {
    this.setState({
      error: err
    });
  },

  handleScroll: function (e) {
    if (e.target.scrollTop > 0 && !this.state.sidebarOffset) {
      this.setState({
        sidebarOffset: e.target.scrollTop
      });
    } else if (e.target.scrollTop === 0 && this.state.sidebarOffset) {
      this.setState({
        sidebarOffset: 0
      });
    }
  },
  handleNewContainer: function () {
    this.context.router.transitionTo('new');
    metrics.track('Pressed New Container');
  },
  handleAutoUpdateClick: function () {
    metrics.track('Restarted to Update');
    ipc.send('application:quit-install');
  },
  handleClickPreferences: function () {
    this.context.router.transitionTo('preferences');
    metrics.track('Opened Preferences', {
      from: 'app'
    });
  },
  handleClickDockerTerminal: function () {
    machine.dockerTerminal();
    metrics.track('Opened Docker Terminal', {
      from: 'app'
    });
  },
  handleClickReportIssue: function () {
    shell.openExternal('https://github.com/kitematic/kitematic/issues/new');
    metrics.track('Opened Issue Reporter', {
      from: 'app'
    });
  },
  handleMouseEnterDockerTerminal: function () {
    this.setState({
      currentButtonLabel: 'Open terminal to use Docker command line.'
    });
  },
  handleMouseLeaveDockerTerminal: function () {
    this.setState({
      currentButtonLabel: ''
    });
  },
  handleMouseEnterReportIssue: function () {
    this.setState({
      currentButtonLabel: 'Report an issue or suggest feedback.'
    });
  },
  handleMouseLeaveReportIssue: function () {
    this.setState({
      currentButtonLabel: ''
    });
  },
  handleMouseEnterPreferences: function () {
    this.setState({
      currentButtonLabel: 'Change app preferences.'
    });
  },
  handleMouseLeavePreferences: function () {
    this.setState({
      currentButtonLabel: ''
    });
  },
  render: function () {
    var sidebarHeaderClass = classNames({
      'sidebar-header': true,
      'sep': this.state.sidebarOffset
    });

    var updateWidget;
    if (this.state.updateAvailable) {
      updateWidget = (
        <a className="btn btn-action small" onClick={this.handleAutoUpdateClick}>New Update</a>
      );
    }

    var container = this.context.router.getCurrentParams().name ? this.state.containers[this.context.router.getCurrentParams().name] : {};
    return (
      <div className="containers">
        <Header />
        <div className="containers-body">
          <div className="sidebar">
            <section className={sidebarHeaderClass}>
              <h4>Containers</h4>
              <div className="create">
                <a className="btn-new icon icon-add-3" onClick={this.handleNewContainer}></a>
              </div>
            </section>
            <section className="sidebar-containers" onScroll={this.handleScroll}>
              <ContainerList downloading={this.state.downloading} containers={this.state.containers} newContainer={this.state.newContainer} />
              <div className="sidebar-buttons">
                <div className="btn-label">{this.state.currentButtonLabel}</div>
                <span className="btn-sidebar" onClick={this.handleClickDockerTerminal} onMouseEnter={this.handleMouseEnterDockerTerminal} onMouseLeave={this.handleMouseLeaveDockerTerminal}><RetinaImage src="docker-terminal.png"/></span>
                <span className="btn-sidebar" onClick={this.handleClickReportIssue} onMouseEnter={this.handleMouseEnterReportIssue} onMouseLeave={this.handleMouseLeaveReportIssue}><RetinaImage src="report-issue.png"/></span>
                <span className="btn-sidebar" onClick={this.handleClickPreferences} onMouseEnter={this.handleMouseEnterPreferences} onMouseLeave={this.handleMouseLeavePreferences}><RetinaImage src="preferences.png"/></span>
                {updateWidget}
              </div>
              <div className="sidebar-buttons-padding"></div>
            </section>
          </div>
          <Router.RouteHandler container={container} error={this.state.error}/>
        </div>
      </div>
    );
  }
});
