const Promise = require('bluebird');
const mqttLight = require('./device-types/mqtt-light');
const mqttMediaPlayer = require('./device-types/mqtt-media-player');

const fs = require("fs");
const path = require("path");
const devicesTypes = require("./device-types");

function loadDevicesDefinitions() {
    return new Promise((resolve, reject) => {
        const folder = path.join(__dirname, 'device-types');
        fs.readdir(folder, (err, files) => {
            if (err) {
                return reject(err);
            }
            resolve(files.map(file => require(path.join(folder, file))));
        });
    })
}

hyphenCaseToCamelCase = (str) => str.replace(/-([a-z])/g, g => g[1].toUpperCase());

module.exports = function (config) {
    return loadDevicesDefinitions()
        .then(devicesDefinitions => {
            const devices = config.devices.map(device => {
                const definition = devicesDefinitions.find(d => d.type === device.type && d.driver === device.driver);
                if (definition) {
                    return definition.build(device, config.general);
                }
                return {};
            });

            Object.keys(devicesTypes.enum).forEach(key => {
                key = devicesTypes.enum[key];
                const commands = devicesTypes.commands[key];
                let item = {
                    type: key,
                    deviceId: 'all-' + key + 's'
                };
                commands.forEach(command => {
                    command = hyphenCaseToCamelCase(command);
                    item[command] = function (client) {
                        return Promise.all(devices
                            .filter(d => d.type === key)
                            .map(d => d[command](client))
                        );
                    }
                });
                devices.push(item)
            });
            return devices;
        });
};