import fs from 'fs';
import path from 'path';
import dockerode from 'dockerode';
import Promise from 'bluebird';
import registry from '../utils/RegistryUtil';
import _ from 'underscore';

var Docker = {
  _host: null,
  _client: null,
  setup: function(ip, name) {
    var certDir = path.join(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'], '.docker/machine/machines', name);
    if (!fs.existsSync(certDir)) {
      return;
    }
    this._host = ip;
    this._client = new dockerode({
      protocol: 'https',
      host: ip,
      port: 2376,
      ca: fs.readFileSync(path.join(certDir, 'ca.pem')),
      cert: fs.readFileSync(path.join(certDir, 'cert.pem')),
      key: fs.readFileSync(path.join(certDir, 'key.pem'))
    });
  },
  client: function () {
    return this._client;
  },
  host: function () {
    return this._host;
  },
  waitForConnection: Promise.coroutine(function * (tries, delay) {
    tries = tries || 10;
    delay = delay || 1000;
    var tryCount = 1;
    while (true) {
      try {
        yield new Promise((resolve, reject) => {
          this._client.listContainers((err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
        break;
      } catch (err) {
        tryCount += 1;
        yield Promise.delay(delay);
        if (tryCount > tries) {
          throw new Error('Cannot connect to the Docker Engine. Either the VM is not responding or the connection may be blocked (VPN or Proxy): ' + err.message);
        }
        continue;
      }
    }
  }),
  startContainer: function (name, containerData, callback) {
    var binds = containerData.Binds || [];
    var startopts = {
      Binds: binds
    };
    if (containerData.NetworkSettings && containerData.NetworkSettings.Ports) {
      startopts.PortBindings = containerData.NetworkSettings.Ports;
    } else {
      startopts.PublishAllPorts = true;
    }
    var container = this.client().getContainer(name);
    container.start(startopts, (err) => {
      if (err) {
        callback(err);
        return;
      }
      this.fetchContainer(name, callback);
    });
  },
  createContainer: function (name, containerData, callback) {
    var existing = this.client().getContainer(name);
    if (!containerData.name && containerData.Name) {
      containerData.name = containerData.Name;
    } else if (!containerData.name) {
      containerData.name = name;
    }
    if (containerData.Config && containerData.Config.Image) {
      containerData.Image = containerData.Config.Image;
    }
    if (!containerData.Env && containerData.Config && containerData.Config.Env) {
      containerData.Env = containerData.Config.Env;
    }
    existing.kill(() => {
      existing.remove(() => {
        this.client().createContainer(containerData, (err) => {
          if (err) {
            callback(err, null);
            return;
          }
          this.startContainer(name, containerData, callback);
        });
      });
    });
  },
  updateContainer: function (name, data, callback) {
    if (!data.name) {
      data.name = name;
    }
    this.createContainer(name, data, () => {
      this.emit(this.CLIENT_CONTAINER_EVENT, name);
      callback();
    });
  },
  run: function (repository, tag, name, callback, progressCallback, blockedCallback) {
    this.pullImage(repository, tag, (err) => {
      if (err) {
        callback(err);
        return;
      }
      this.createContainer(name, {Image: repository + ':' + tag}, (err) => {
        callback(err);
      });
    }, progressCallback, blockedCallback);
  },
  pullImage: function (repository, tag, callback, progressCallback, blockedCallback) {
    registry.layers(repository, tag, (err, layerSizes) => {

      // TODO (jeffdm): Support v2 registry API
      // TODO (jeffdm): clean this up- It's messy to work with pulls from both the v1 and v2 registry APIs
      // Use the per-layer pull progress % to update the total progress.
      this.client().listImages({all: 1}, (err, images) => {
        images = images || [];
        var existingIds = new Set(images.map(function (image) {
          return image.Id.slice(0, 12);
        }));
        var layersToDownload = layerSizes.filter(function (layerSize) {
          return !existingIds.has(layerSize.Id) && !isNaN(layerSize.size);
        });

        var totalBytes = layersToDownload.map(function (s) { return s.size; }).reduce(function (pv, sv) { return pv + sv; }, 0);
        this.client().pull(repository + ':' + tag, (err, stream) => {
          if (err) {
            callback(err);
            return;
          }
          stream.setEncoding('utf8');

          var layerProgress = layersToDownload.reduce(function (r, layer) {
            if (_.findWhere(images, {Id: layer.Id})) {
              r[layer.Id] = 100;
            } else {
              r[layer.Id] = 0;
            }
            return r;
          }, {});

          stream.on('data', str => {
            var data = JSON.parse(str);
            console.log(data);

            if (data.error) {
              return;
            }

            if (data.status && (data.status === 'Pulling dependent layers' || data.status.indexOf('already being pulled by another client') !== -1)) {
              blockedCallback();
              return;
            }

            if (data.status === 'Already exists') {
              layerProgress[data.id] = 1;
            } else if (data.status === 'Downloading') {
              var current = data.progressDetail.current;
              var total = data.progressDetail.total;
              if (total <= 0) {
                progressCallback(0);
                return;
              } else {
                layerProgress[data.id] = current / total;
              }

              var chunks = layersToDownload.map(function (s) {
                var progress = layerProgress[s.Id] || 0;
                return progress * s.size;
              });

              var totalReceived = chunks.reduce(function (pv, sv) {
                return pv + sv;
              }, 0);

              var totalProgress = totalReceived / totalBytes;
              progressCallback(totalProgress);
            }
          });
          stream.on('end', function () {
            callback();
          });
        });
      });
    });
  },
};

module.exports = Docker;
