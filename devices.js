const config = require('./config')();
const mqttLight = require('./device-types/mqtt-light');
const mqttMediaPlayer = require('./device-types/mqtt-media-player');

if(!config || !config.devices){
    console.log('The key "devices" was not found at "config.yml"');
    process.exit(1);
}

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


module.exports = function (config) {
    return {
        devices: devices,
        lights: {
            powerOn: function (client) {
                return Promise.all(devices
                    .filter(d=>d.type === 'light')
                    .map(d=>function () {
                        return d.powerOn(client);
                    })
                );
            },
            powerOff: function (client) {
                return Promise.all(devices
                    .filter(d=>d.type === 'light')
                    .map(d=>function () {
                        return d.powerOff(client)
                    })
                );
            }
        },
        tv: devices.filter(d=>d.type === 'media-player')[0]
    };
};