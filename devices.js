const Promise = require('bluebird');
const mqttLight = require('./device-types/mqtt-light');
const mqttMediaPlayer = require('./device-types/mqtt-media-player');

module.exports = function (config) {
    const devices = config.devices.map(device=> {
        if (device.type === 'light') {
            if (device.driver === 'mqtt-light') {
                return mqttLight(device, config.general);
            }
        }
        if (device.type === 'media-player') {
            if (device.driver === 'mqtt-media-player') {
                return mqttMediaPlayer(device, config.general);
            }
        }
        return {};
    });

    return {
        devices: devices,
        lights: {
            powerOn: function (client) {
                return Promise.all(devices
                    .filter(d=>d.type === 'light')
                    .map(d=>d.powerOn(client))
                );
            },
            powerOff: function (client) {
                return Promise.all(devices
                    .filter(d=>d.type === 'light')
                    .map(d=>d.powerOff(client))
                );
            }
        },
        tv: devices.filter(d=>d.type === 'media-player')[0]
    };
};